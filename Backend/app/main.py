from fastapi import FastAPI # type: ignore
from app.routers import chat
from fastapi.middleware.cors import CORSMiddleware
from .routers import documents, verification
from .database import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="Legal Document Analyzer API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For demo purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(documents.router)
app.include_router(verification.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "Legal Document Analyzer API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}