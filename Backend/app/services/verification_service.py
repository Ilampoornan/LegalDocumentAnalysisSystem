import json
from sqlalchemy.orm import Session
from ..models.document import Document
from ..blockchain.ethereum import verify_document_on_blockchain
from .document_service import calculate_hash

def verify_document(db: Session, file_content):
    """Verify document against database and blockchains"""
    # Calculate hash
    doc_hash = calculate_hash(file_content)
    
    # Check if document exists in database
    db_document = db.query(Document).filter(Document.hash == doc_hash).first()
    
    #get id from database if exists
    if db_document:
        doc_id = db_document.id
    else:
        doc_id = None
    
    # Verify on Ethereum blockchain
    eth_result = verify_document_on_blockchain(doc_hash)
    
    
    # Document is verified on Ethereum blockchain
    verified = eth_result.get("verified", False)
    
    # Get metadata from database if available
    metadata = None
    timestamp = None
    
    if db_document:
        try:
            metadata = json.loads(db_document.doc_metadata)
            timestamp = int(db_document.timestamp.timestamp())
        except:
            pass
    
    return {
        "verified": verified,
        "hash": doc_hash,
        "metadata": metadata,
        "timestamp": timestamp,
        "blockchain_info": {
            "ethereum": eth_result,
        },
        "in_database": db_document is not None
    }