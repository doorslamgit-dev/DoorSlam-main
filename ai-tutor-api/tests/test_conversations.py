# ai-tutor-api/tests/test_conversations.py

import pytest
from httpx import ASGITransport, AsyncClient

from src.main import app
from src.auth import get_current_user


MOCK_USER = {
    "user_id": "00000000-0000-0000-0000-000000000001",
    "role": "authenticated",
    "email": "test@example.com",
}


@pytest.fixture(autouse=True)
def override_auth():
    """Override JWT auth for all tests in this module."""
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER
    yield
    app.dependency_overrides.pop(get_current_user, None)


@pytest.mark.asyncio
async def test_list_conversations_returns_200():
    """GET /conversations should return 200 with a list."""
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport, base_url="http://test", follow_redirects=True
    ) as client:
        response = await client.get("/conversations")

    assert response.status_code == 200
    data = response.json()
    assert "conversations" in data
    assert "has_more" in data
    assert isinstance(data["conversations"], list)


@pytest.mark.asyncio
async def test_list_conversations_without_auth_returns_422():
    """GET /conversations without auth header should fail."""
    # Remove the auth override so the real dependency runs
    app.dependency_overrides.pop(get_current_user, None)

    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport, base_url="http://test", follow_redirects=True
    ) as client:
        response = await client.get("/conversations")

    # FastAPI returns 422 when required header is missing
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_messages_not_found():
    """GET /conversations/{id}/messages for non-existent conversation."""
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport, base_url="http://test", follow_redirects=True
    ) as client:
        response = await client.get(
            "/conversations/00000000-0000-0000-0000-000000000000/messages"
        )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_not_found():
    """DELETE /conversations/{id} for non-existent conversation."""
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport, base_url="http://test", follow_redirects=True
    ) as client:
        response = await client.delete(
            "/conversations/00000000-0000-0000-0000-000000000000"
        )

    assert response.status_code == 404
