# ai-tutor-api/src/services/parser.py
# Document text extraction — PDF, DOCX, Markdown, plain text.

from dataclasses import dataclass, field


@dataclass
class ParsedDocument:
    """Result of parsing a document into text."""

    text: str
    page_texts: list[str] = field(default_factory=list)
    page_count: int = 0
    metadata: dict = field(default_factory=dict)


def parse_document(file_bytes: bytes, filename: str) -> ParsedDocument:
    """Extract text from a document based on its file extension.

    Supports: .pdf, .docx, .md, .txt
    """
    lower = filename.lower()

    if lower.endswith(".pdf"):
        return _parse_pdf(file_bytes)
    elif lower.endswith(".docx"):
        return _parse_docx(file_bytes)
    elif lower.endswith((".md", ".txt")):
        return _parse_text(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {filename}")


def _parse_pdf(file_bytes: bytes) -> ParsedDocument:
    """Extract text from PDF using PyMuPDF."""
    import pymupdf

    doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    page_texts = []
    for page in doc:
        page_texts.append(page.get_text())

    full_text = "\n\n".join(page_texts)
    page_count = len(page_texts)
    doc.close()

    return ParsedDocument(
        text=full_text,
        page_texts=page_texts,
        page_count=page_count,
        metadata={"format": "pdf"},
    )


def _parse_docx(file_bytes: bytes) -> ParsedDocument:
    """Extract text from DOCX using python-docx."""
    import io

    from docx import Document

    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    full_text = "\n\n".join(paragraphs)

    return ParsedDocument(
        text=full_text,
        page_texts=[full_text],
        page_count=1,
        metadata={"format": "docx", "paragraph_count": len(paragraphs)},
    )


def _parse_text(file_bytes: bytes) -> ParsedDocument:
    """Parse plain text or markdown files."""
    text = file_bytes.decode("utf-8", errors="replace")

    return ParsedDocument(
        text=text,
        page_texts=[text],
        page_count=1,
        metadata={"format": "text"},
    )
