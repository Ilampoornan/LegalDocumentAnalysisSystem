from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class DocumentMetadata(BaseModel):
    title: str
    docType: str
    caseNumber: Optional[str] = None
    parties: Optional[List[str]] = []
    tags: Optional[List[str]] = []

class VerificationResult(BaseModel):
    verified: bool
    hash: str
    metadata: Optional[Dict[str, Any]] = None
    timestamp: Optional[int] = None
    blockchain_info: Optional[Dict[str, Any]] = None

class DocumentResponse(BaseModel):
    id: str
    filename: str
    hash: str
    metadata: Dict[str, Any]
    timestamp: datetime
    verified: bool
    
    class Config:
        orm_mode = True