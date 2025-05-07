import json
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_upload_document():
    """Test document upload functionality only"""

    # Unique content to avoid hash collision
    unique_content = f"Sample contract content - {uuid.uuid4()}"
    test_file = ("contract.pdf", unique_content.encode("utf-8"), "application/pdf")
    
    metadata = {
        "title": "Employment Agreement",
        "docType": "contract",
        "parties": ["Company", "Employee"],
        "tags": ["HR", "Agreement"],
        "caseNumber": "C123456"
    }

    response = client.post(
        "/documents/upload",
        files={"file": test_file},
        data={"metadata": json.dumps(metadata)}
    )

    if response.status_code != 200:
        print(f"Upload failed: {response.status_code}")
        print(response.json())
        assert False, "Upload failed - see output above"

    data = response.json()
    print(f"Upload successful. Document ID: {data['id']}")

    assert "id" in data
    
