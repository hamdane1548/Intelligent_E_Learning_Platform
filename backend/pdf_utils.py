import fitz


def extract_text_from_pdf(pdf_path: str) -> str:
    text = ""

    document = fitz.open(pdf_path)

    for page in document:
        text += page.get_text()

    document.close()

    return text
