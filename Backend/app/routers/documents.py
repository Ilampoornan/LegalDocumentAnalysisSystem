from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Response, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.schemas import DocumentMetadata, VerificationResult, DocumentResponse
from ..services.document_service import store_document, get_document_by_id, get_decrypted_content
import json

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
async def upload_document(
    metadata: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and register a document on the blockchain"""
    try:
        metadata_obj = DocumentMetadata.parse_raw(metadata)
        # Read the file content
        content = await file.read()
        
        # Store document
        result = store_document(db, content, file.filename, metadata_obj)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document_metadata(doc_id: str, db: Session = Depends(get_db)):
    """Get document metadata by ID"""
    document = get_document_by_id(db, doc_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Parse metadata JSON
    metadata = document.doc_metadata if isinstance(document.doc_metadata, str) else json.dumps(document.doc_metadata)
    
    return {
        "id": document.id,
        "filename": document.filename,
        "hash": document.hash,
        "metadata": json.loads(metadata),
        "timestamp": document.timestamp,
    }

@router.get("/download/{doc_id}")
def download_document(doc_id: str, db: Session = Depends(get_db)):
    """Download document by ID"""
    document = get_document_by_id(db, doc_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Decrypt content
    content = get_decrypted_content(document)
    
    # Return file
    return Response(
        content=content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={document.filename}"}
    )