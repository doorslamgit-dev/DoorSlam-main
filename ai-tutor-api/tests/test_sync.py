# tests/test_sync.py
# Unit tests for the sync orchestrator's classification logic.

from src.services.drive_walker import DriveFile
from src.services.sync import _classify_files


def _make_drive_file(
    file_id: str = "df1",
    name: str = "test.pdf",
    md5: str = "abc123",
    modified: str = "2026-01-01T00:00:00Z",
) -> DriveFile:
    return DriveFile(
        file_id=file_id,
        name=name,
        mime_type="application/pdf",
        size=1024,
        path=f"AQA/GCSE/Biology/{name}",
        md5_checksum=md5,
        modified_time=modified,
    )


def _make_db_doc(
    doc_id: str = "doc-1",
    drive_file_id: str = "df1",
    md5: str = "abc123",
    status: str = "completed",
) -> dict:
    return {
        "id": doc_id,
        "drive_file_id": drive_file_id,
        "drive_md5_checksum": md5,
        "content_hash": "sha256-placeholder",
        "status": status,
        "subject_id": None,
        "topic_id": None,
        "exam_board_id": None,
        "file_key": None,
    }


class TestClassifyFiles:
    def test_new_file_detected(self):
        """A Drive file not in DB is classified as new."""
        drive_files = [_make_drive_file(file_id="new-file")]
        db_docs: dict[str, dict] = {}

        to_ingest, to_update, to_delete, unchanged = _classify_files(
            drive_files, db_docs,
        )

        assert len(to_ingest) == 1
        assert to_ingest[0].file_id == "new-file"
        assert len(to_update) == 0
        assert len(to_delete) == 0
        assert unchanged == 0

    def test_modified_file_detected(self):
        """A Drive file with different md5 is classified as modified."""
        drive_files = [_make_drive_file(file_id="df1", md5="new-hash")]
        db_docs = {"df1": _make_db_doc(drive_file_id="df1", md5="old-hash")}

        to_ingest, to_update, to_delete, unchanged = _classify_files(
            drive_files, db_docs,
        )

        assert len(to_ingest) == 0
        assert len(to_update) == 1
        assert to_update[0][0].file_id == "df1"
        assert to_update[0][1]["id"] == "doc-1"
        assert len(to_delete) == 0
        assert unchanged == 0

    def test_unchanged_file_skipped(self):
        """A Drive file with same md5 is classified as unchanged."""
        drive_files = [_make_drive_file(file_id="df1", md5="same-hash")]
        db_docs = {"df1": _make_db_doc(drive_file_id="df1", md5="same-hash")}

        to_ingest, to_update, to_delete, unchanged = _classify_files(
            drive_files, db_docs,
        )

        assert len(to_ingest) == 0
        assert len(to_update) == 0
        assert len(to_delete) == 0
        assert unchanged == 1

    def test_deleted_file_detected(self):
        """A DB doc whose drive_file_id is not in Drive is classified as deleted."""
        drive_files: list[DriveFile] = []
        db_docs = {"df1": _make_db_doc(drive_file_id="df1", status="completed")}

        to_ingest, to_update, to_delete, unchanged = _classify_files(
            drive_files, db_docs,
        )

        assert len(to_ingest) == 0
        assert len(to_update) == 0
        assert len(to_delete) == 1
        assert to_delete[0]["id"] == "doc-1"
        assert unchanged == 0

    def test_already_deleted_not_re_deleted(self):
        """A DB doc already marked 'deleted' is not classified for deletion again."""
        drive_files: list[DriveFile] = []
        db_docs = {"df1": _make_db_doc(drive_file_id="df1", status="deleted")}

        _to_ingest, _to_update, to_delete, _unchanged = _classify_files(
            drive_files, db_docs,
        )

        assert len(to_delete) == 0

    def test_mixed_classification(self):
        """Multiple files with different statuses classified correctly."""
        drive_files = [
            _make_drive_file(file_id="new", md5="aaa"),
            _make_drive_file(file_id="existing-same", md5="bbb"),
            _make_drive_file(file_id="existing-changed", md5="new-ccc"),
        ]
        db_docs = {
            "existing-same": _make_db_doc(
                doc_id="d2", drive_file_id="existing-same", md5="bbb",
            ),
            "existing-changed": _make_db_doc(
                doc_id="d3", drive_file_id="existing-changed", md5="old-ccc",
            ),
            "removed": _make_db_doc(
                doc_id="d4", drive_file_id="removed", md5="ddd",
            ),
        }

        to_ingest, to_update, to_delete, unchanged = _classify_files(
            drive_files, db_docs,
        )

        assert len(to_ingest) == 1  # "new"
        assert len(to_update) == 1  # "existing-changed"
        assert len(to_delete) == 1  # "removed"
        assert unchanged == 1  # "existing-same"

    def test_empty_drive_and_db(self):
        """No files on Drive, no docs in DB — nothing to do."""
        to_ingest, to_update, to_delete, unchanged = _classify_files([], {})

        assert len(to_ingest) == 0
        assert len(to_update) == 0
        assert len(to_delete) == 0
        assert unchanged == 0
