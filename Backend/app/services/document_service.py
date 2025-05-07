import hashlib
import json
import uuid
from sqlalchemy.orm import Session
from ..models.document import Document
from ..models.schemas import DocumentMetadata
from ..models.schemas import VerificationResult
from ..services.encryption_service import encrypt_file, decrypt_file
from ..blockchain.ethereum import add_document_to_blockchain

def calculate_hash(content):
    """Calculate SHA-256 hash of file content"""
    if isinstance(content, bytes):
        return hashlib.sha256(content).hexdigest()
    return hashlib.sha256(content.encode()).hexdigest()

def store_document(db: Session, file_content, filename, metadata: DocumentMetadata):
    """Store document in database and register on blockchains"""
    # Calculate document hash
    doc_hash = calculate_hash(file_content)
    
    # Generate document ID
    doc_id = str(uuid.uuid4())
    
    # Encrypt file content
    encrypted_content = encrypt_file(file_content)
    
    # Convert metadata to JSON string
    metadata_json = json.dumps(metadata.dict())
    
    # Register on Ethereum blockchain
    eth_result = add_document_to_blockchain(doc_hash, metadata.dict())
    
    # Create database record
    db_document = Document(
        id=doc_id,
        filename=filename,
        content=encrypted_content,
        hash=doc_hash,
        doc_metadata=metadata_json,
        verified=True,
        ethereum_tx=eth_result.get("tx_hash"),
    )
    
    # Add and commit to database
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    return {
        "id": doc_id,
        "hash": doc_hash,
        "filename": filename,
        "timestamp": int(db_document.timestamp.timestamp()) if db_document.timestamp else None,
        "blockchain_info": {
            "ethereum": eth_result,
        }
    }

def get_document_by_hash(db: Session, doc_hash: str):
    """Get document by hash"""
    return db.query(Document).filter(Document.hash == doc_hash).first()

def get_document_by_id(db: Session, doc_id: str):
    """Get document by ID"""
    return db.query(Document).filter(Document.id == doc_id).first()

def get_decrypted_content(document: Document):
    """Get decrypted content of document"""
    if not document:
        return None
    
    return decrypt_file(document.content)