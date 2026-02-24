# tests/test_ingestion_api.py
# Integration tests for ingestion API endpoints (batch, sync, cleanup, job status).

import pytest
from httpx import ASGITransport, AsyncClient
from unittest.mock import AsyncMock, MagicMock, patch

from src.config import settings
from src.main import app

SERVICE_KEY = settings.supabase_service_role_key
AUTH_HEADER = {"Authorization": f"Bearer {SERVICE_KEY}"}


@pytest.fixture()
def _mock_ingest_from_drive(monkeypatch):
    """Mock ingest_from_drive to return a fake job ID immediately."""
    mock = AsyncMock(return_value="job-batch-123")
    monkeypatch.setattr("src.api.ingestion.ingest_from_drive", mock)
    return mock


@pytest.fixture()
def _mock_sync_from_drive(monkeypatch):
    """Mock sync_from_drive to return a fake job ID immediately."""
    mock = AsyncMock(return_value="job-sync-456")
    monkeypatch.setattr("src.api.ingestion.sync_from_drive", mock)
    return mock


@pytest.fixture()
def _mock_cleanup(monkeypatch):
    """Mock cleanup_deleted_documents to return a count."""
    mock = MagicMock(return_value=3)
    monkeypatch.setattr("src.api.ingestion.cleanup_deleted_documents", mock)
    return mock


class TestBatchEndpoint:
    @pytest.mark.anyio
    async def test_requires_service_key(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/ingestion/batch",
                json={"root_folder_id": "abc"},
                headers={"Authorization": "Bearer wrong-key"},
            )
        assert resp.status_code == 403

    @pytest.mark.anyio
    async def test_starts_job(self, _mock_ingest_from_drive):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/ingestion/batch",
                json={"root_folder_id": "folder-id-123"},
                headers=AUTH_HEADER,
            )
        assert resp.status_code == 200
        data = resp.json()
        assert data["job_id"] == "job-batch-123"
        _mock_ingest_from_drive.assert_called_once()


class TestSyncEndpoint:
    @pytest.mark.anyio
    async def test_requires_service_key(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/ingestion/sync",
                json={"root_folder_id": "abc"},
                headers={"Authorization": "Bearer wrong-key"},
            )
        assert resp.status_code == 403

    @pytest.mark.anyio
    async def test_starts_sync_job(self, _mock_sync_from_drive):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/ingestion/sync",
                json={"root_folder_id": "folder-id-123", "root_path": "AQA/GCSE"},
                headers=AUTH_HEADER,
            )
        assert resp.status_code == 200
        data = resp.json()
        assert data["job_id"] == "job-sync-456"
        _mock_sync_from_drive.assert_called_once()


class TestCleanupEndpoint:
    @pytest.mark.anyio
    async def test_requires_service_key(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/ingestion/cleanup",
                json={},
                headers={"Authorization": "Bearer wrong-key"},
            )
        assert resp.status_code == 403

    @pytest.mark.anyio
    async def test_cleanup_returns_count(self, _mock_cleanup):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/ingestion/cleanup",
                json={"older_than_days": 7},
                headers=AUTH_HEADER,
            )
        assert resp.status_code == 200
        data = resp.json()
        assert data["deleted_count"] == 3
        _mock_cleanup.assert_called_once_with(older_than_days=7)

    @pytest.mark.anyio
    async def test_cleanup_default_days(self, _mock_cleanup):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/ingestion/cleanup",
                json={},
                headers=AUTH_HEADER,
            )
        assert resp.status_code == 200
        _mock_cleanup.assert_called_once_with(older_than_days=30)
