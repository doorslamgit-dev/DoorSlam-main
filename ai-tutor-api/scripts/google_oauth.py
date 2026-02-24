#!/usr/bin/env python3
"""One-time OAuth2 flow to obtain a Google Drive refresh token.

Usage:
    cd ai-tutor-api
    ./venv/bin/python scripts/google_oauth.py

Prerequisites:
    1. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
    2. Enable the Google Drive API in Google Cloud Console
    3. Add http://localhost:8080/ as an authorized redirect URI

The script opens a browser for Google consent, exchanges the auth code
for tokens, and prints the refresh token to paste into .env.
"""

import os
import sys

from dotenv import load_dotenv
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]


def main() -> None:
    load_dotenv()

    client_id = os.getenv("GOOGLE_CLIENT_ID", "")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")

    if not client_id or not client_secret:
        print("Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env")
        sys.exit(1)

    client_config = {
        "installed": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost:8080/"],
        }
    }

    flow = InstalledAppFlow.from_client_config(client_config, scopes=SCOPES)
    credentials = flow.run_local_server(port=8080, prompt="consent")

    print("\n" + "=" * 60)
    print("OAuth2 flow complete!")
    print("=" * 60)
    print(f"\nRefresh token:\n{credentials.refresh_token}")
    print("\nAdd this to your ai-tutor-api/.env file:")
    print(f"GOOGLE_REFRESH_TOKEN={credentials.refresh_token}")
    print("=" * 60)


if __name__ == "__main__":
    main()
