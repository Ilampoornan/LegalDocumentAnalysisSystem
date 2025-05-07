from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_verify_document_success(monkeypatch):
    mock_result = {
        "verified": True,
        "hash": "9c2bcdc3-8bc2-4a8b-949a-78737e97f547",  # Must include a string representing the document hash
        "metadata": {},  # Optional field, but it can be included as an empty dictionary
        "timestamp": 1234567890,  # Optional field, example timestamp value
        "blockchain_info": {}  # Optional field, can be included as an empty dictionary
    }

    
    monkeypatch.setattr("app.routers.verification.verify_document", lambda db, content: mock_result)

    file_data = ("test.pdf", b"dummy content", "application/pdf")
    response = client.post(
        "/verification/verify",
        files={"file": file_data}
    )

    assert response.status_code == 200
    assert response.json() == mock_result
