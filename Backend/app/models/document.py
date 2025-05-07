from sqlalchemy import Column, String, LargeBinary, DateTime, Boolean, Text
from sqlalchemy.sql import func
from ..database import Base

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True)
    filename = Column(String, nullable=False)
    content = Column(LargeBinary, nullable=False)  # Encrypted PDF content
    hash = Column(String, nullable=False, unique=True)
    doc_metadata = Column(Text, nullable=False)  # JSON metadata
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    verified = Column(Boolean, default=False)
    ethereum_tx = Column(String, nullable=True)  # Ethereum transaction hash
    hyperledger_tx = Column(String, nullable=True)  # Hyperledger transaction ID