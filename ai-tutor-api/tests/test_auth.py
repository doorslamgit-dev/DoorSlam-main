# ai-tutor-api/tests/test_auth.py
# Tests for JWT authentication — the security boundary.

import time

import jwt
import pytest
from fastapi import HTTPException

from src.auth import get_current_user
from tests.conftest import TEST_JWT_SECRET


# Use a fixed secret for tests — patch settings in each test.
JWT_PAYLOAD = {
    "sub": "00000000-0000-0000-0000-000000000099",
    "role": "authenticated",
    "email": "testuser@example.com",
    "aud": "authenticated",
    "exp": int(time.time()) + 3600,
    "iat": int(time.time()),
}


def _make_token(payload: dict | None = None, secret: str = TEST_JWT_SECRET) -> str:
    """Encode a JWT for testing."""
    return jwt.encode(payload or JWT_PAYLOAD, secret, algorithm="HS256")


@pytest.fixture(autouse=True)
def _patch_jwt_secret(monkeypatch):
    """Point settings.supabase_jwt_secret to the test secret."""
    monkeypatch.setattr("src.auth.settings.supabase_jwt_secret", TEST_JWT_SECRET)


# ── Happy path ───────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_valid_jwt_returns_user_dict():
    """A well-formed JWT should return {user_id, role, email}."""
    token = _make_token()
    result = await get_current_user(f"Bearer {token}")

    assert result["user_id"] == JWT_PAYLOAD["sub"]
    assert result["role"] == "authenticated"
    assert result["email"] == "testuser@example.com"


@pytest.mark.asyncio
async def test_valid_jwt_without_role_defaults():
    """If the JWT has no 'role' claim, default to 'authenticated'."""
    payload = {**JWT_PAYLOAD}
    del payload["role"]
    token = _make_token(payload)
    result = await get_current_user(f"Bearer {token}")

    assert result["role"] == "authenticated"


# ── Error cases ──────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_missing_bearer_prefix_returns_401():
    """Authorization header without 'Bearer ' prefix → 401."""
    token = _make_token()
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(token)  # No "Bearer " prefix

    assert exc_info.value.status_code == 401
    assert "Invalid authorization header" in exc_info.value.detail


@pytest.mark.asyncio
async def test_malformed_token_returns_401():
    """A garbled token string → 401 Invalid token."""
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user("Bearer not-a-valid-jwt")

    assert exc_info.value.status_code == 401
    assert "Invalid token" in exc_info.value.detail


@pytest.mark.asyncio
async def test_expired_jwt_returns_401():
    """An expired JWT → 401 Token expired."""
    payload = {**JWT_PAYLOAD, "exp": int(time.time()) - 3600}
    token = _make_token(payload)

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(f"Bearer {token}")

    assert exc_info.value.status_code == 401
    assert "Token expired" in exc_info.value.detail


@pytest.mark.asyncio
async def test_wrong_audience_returns_401():
    """JWT with wrong audience claim → 401 Invalid token."""
    payload = {**JWT_PAYLOAD, "aud": "wrong-audience"}
    token = _make_token(payload)

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(f"Bearer {token}")

    assert exc_info.value.status_code == 401
    assert "Invalid token" in exc_info.value.detail


@pytest.mark.asyncio
async def test_wrong_secret_returns_401():
    """JWT signed with wrong secret → 401 Invalid token."""
    token = _make_token(secret="wrong-secret")

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(f"Bearer {token}")

    assert exc_info.value.status_code == 401
    assert "Invalid token" in exc_info.value.detail
