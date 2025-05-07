from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv
import base64

load_dotenv()

# Get or generate encryption key
def get_encryption_key():
    key = os.getenv("ENCRYPTION_KEY")
    if not key:
        key = Fernet.generate_key().decode()
        # In a real app, you would save this key securely
        print(f"Generated new encryption key: {key}")
        print("Add this to your .env file as ENCRYPTION_KEY")
    else:
        # Ensure key is properly formatted
        if isinstance(key, str):
            try:
                key = key.encode()
            except:
                key = base64.urlsafe_b64encode(key.encode())
                
    return key

# Initialize Fernet cipher with the key
cipher_suite = Fernet(get_encryption_key())

def encrypt_file(file_content):
    """Encrypt file content using Fernet symmetric encryption"""
    if isinstance(file_content, str):
        file_content = file_content.encode()
    return cipher_suite.encrypt(file_content)

def decrypt_file(encrypted_content):
    """Decrypt file content using Fernet symmetric encryption"""
    return cipher_suite.decrypt(encrypted_content)