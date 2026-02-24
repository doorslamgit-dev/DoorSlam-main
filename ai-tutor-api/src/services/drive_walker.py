# ai-tutor-api/src/services/drive_walker.py
# Google Drive API integration — recursively walk folders and discover files.

import logging
from dataclasses import dataclass, field

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

from ..config import settings

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
TOKEN_URI = "https://oauth2.googleapis.com/token"

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
    md5_checksum: str | None = None  # Drive-provided MD5 for change detection
    modified_time: str | None = None  # ISO 8601 timestamp from Drive


def _get_service():
    """Create an authenticated Google Drive API service using OAuth2 refresh token."""
    if not settings.google_refresh_token:
        raise ValueError(
            "GOOGLE_REFRESH_TOKEN not configured. "
            "Run scripts/google_oauth.py to obtain a refresh token."
        )

    credentials = Credentials(
        token=None,
        refresh_token=settings.google_refresh_token,
        token_uri=TOKEN_URI,
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        scopes=SCOPES,
    )
    return build("drive", "v3", credentials=credentials)


def walk_drive(root_folder_id: str, root_path: str = "") -> list[DriveFile]:
    """Recursively traverse a Google Drive folder and return all supported files.

    Args:
        root_folder_id: The Google Drive folder ID to start from.
        root_path: Optional path prefix for ancestor folders above the start folder.
            e.g., "AQA/GCSE/Biology(8461)/spec" when starting from a spec subfolder.
            This ensures the path parser can extract board/qual/subject from the path.

    Returns:
        Flat list of DriveFile objects with full path metadata.
    """
    service = _get_service()
    files: list[DriveFile] = []
    _walk_recursive(service, root_folder_id, root_path, files)
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
                fields="nextPageToken, files(id, name, mimeType, size, parents, md5Checksum, modifiedTime)",
                pageSize=100,
                pageToken=page_token,
                supportsAllDrives=True,
                includeItemsFromAllDrives=True,
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
                        md5_checksum=item.get("md5Checksum"),
                        modified_time=item.get("modifiedTime"),
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
