from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.schemas import VerificationResult
from ..services.verification_service import verify_document

router = APIRouter(prefix="/verification", tags=["verification"])

@router.post("/verify", response_model=VerificationResult)
async def verify_document_api(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Verify a document against the blockchain"""
    try:
        # Read the file content
        content = await file.read()
        
        # Verify document
        result = verify_document(db, content)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))