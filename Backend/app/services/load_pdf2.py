import os
import uuid
from fastapi import UploadFile
from pathlib import Path
import fitz  # PyMuPDF
from typing import Tuple

UPLOAD_DIR = "assets/uploads"
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

def extract_text_from_upload(file: UploadFile) -> str:
    """Extract text from in-memory UploadFile using PyMuPDF."""
    # Read file contents into memory
    file_bytes = file.file.read()
    print("hi")
    
    # Open with fitz from memory
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        text = ""
        for page in doc:
            text += page.get_text()
    return text.strip()

def save_pdf_to_assets(file: UploadFile, user_id: str) -> str:
    """Save uploaded PDF to assets/uploads/{user_id}/{uuid}.pdf and return file path."""
    user_folder = os.path.join(UPLOAD_DIR, user_id)
    os.makedirs(user_folder, exist_ok=True)

    filename = f"{uuid.uuid4()}.pdf"
    file_path = os.path.join(user_folder, filename)

    # Reset file pointer and save to disk
    file.file.seek(0)
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    return file_path

