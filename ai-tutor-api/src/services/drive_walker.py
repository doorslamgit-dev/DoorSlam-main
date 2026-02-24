# ai-tutor-api/src/services/drive_walker.py
# Google Drive API integration — recursively walk folders and discover files.

import logging
from dataclasses import dataclass, field

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

from ..config import settings

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]

# Supported file MIME types for ingestion
SUPPORTED_MIMES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
}


@dataclass
class DriveFile:
    """A file discovered in Google Drive."""

    file_id: str
    name: str
    mime_type: str
    size: int
    path: str  # Full folder path from the root
    parents: list[str] = field(default_factory=list)


def _get_service():
    """Create an authenticated Google Drive API service."""
    if not settings.google_service_account_file:
        raise ValueError("GOOGLE_SERVICE_ACCOUNT_FILE not configured")

    credentials = service_account.Credentials.from_service_account_file(
        settings.google_service_account_file, scopes=SCOPES
    )
    return build("drive", "v3", credentials=credentials)


def walk_drive(root_folder_id: str) -> list[DriveFile]:
    """Recursively traverse a Google Drive folder and return all supported files.

    Args:
        root_folder_id: The Google Drive folder ID to start from.

    Returns:
        Flat list of DriveFile objects with full path metadata.
    """
    service = _get_service()
    files: list[DriveFile] = []
    _walk_recursive(service, root_folder_id, "", files)
    logger.info("Discovered %d files in Drive folder %s", len(files), root_folder_id)
    return files


def _walk_recursive(
    service, folder_id: str, current_path: str, results: list[DriveFile]
) -> None:
    """Recursively list files and subfolders."""
    page_token = None

    while True:
        response = (
            service.files()
            .list(
                q=f"'{folder_id}' in parents and trashed = false",
                fields="nextPageToken, files(id, name, mimeType, size, parents)",
                pageSize=100,
                pageToken=page_token,
            )
            .execute()
        )

        for item in response.get("files", []):
            item_path = f"{current_path}/{item['name']}" if current_path else item["name"]

            if item["mimeType"] == "application/vnd.google-apps.folder":
                _walk_recursive(service, item["id"], item_path, results)
            elif item["mimeType"] in SUPPORTED_MIMES:
                results.append(
                    DriveFile(
                        file_id=item["id"],
                        name=item["name"],
                        mime_type=item["mimeType"],
                        size=int(item.get("size", 0)),
                        path=item_path,
                        parents=item.get("parents", []),
                    )
                )

        page_token = response.get("nextPageToken")
        if not page_token:
            break


def download_file(file_id: str) -> bytes:
    """Download a file's content from Google Drive.

    Args:
        file_id: The Google Drive file ID.

    Returns:
        File content as bytes.
    """
    import io

    service = _get_service()
    request = service.files().get_media(fileId=file_id)
    buffer = io.BytesIO()
    downloader = MediaIoBaseDownload(buffer, request)

    done = False
    while not done:
        _, done = downloader.next_chunk()

    return buffer.getvalue()
