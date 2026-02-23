# ai-tutor-api/src/auth.py

from fastapi import Header, HTTPException
import jwt

from .config import settings


async def get_current_user(authorization: str = Header(...)) -> dict:
    """Validate Supabase JWT and return user payload.

    Returns dict with at least: user_id (str), role (str).
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.removeprefix("Bearer ")

    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    return {
        "user_id": payload["sub"],
        "role": payload.get("role", "authenticated"),
        "email": payload.get("email"),
    }
