from web3 import Web3
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Ethereum settings
ETHEREUM_NODE_URL = os.getenv("ETHEREUM_NODE_URL")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")

# Load contract ABI
try:
    with open("blockchain/ethereum/contract_address.json") as f:
        contract_json = json.load(f)
        CONTRACT_ABI = contract_json["abi"]
except:
    # Fallback ABI for demo purposes
    CONTRACT_ABI = [
        {
            "inputs": [{"internalType": "bytes32", "name": "documentHash", "type": "bytes32"}, {"internalType": "string", "name": "metadata", "type": "string"}],
            "name": "addDocument",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "bytes32", "name": "documentHash", "type": "bytes32"}],
            "name": "verifyDocument",
            "outputs": [{"internalType": "bool", "name": "exists", "type": "bool"}, {"internalType": "address", "name": "uploader", "type": "address"}, {"internalType": "uint256", "name": "timestamp", "type": "uint256"}, {"internalType": "string", "name": "metadata", "type": "string"}],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]

def connect_to_ethereum():
    """Connect to Ethereum network and return Web3 and contract instances"""
    try:
        # Connect to Ethereum node
        w3 = Web3(Web3.HTTPProvider(ETHEREUM_NODE_URL))
        
        # Check if connected
        if not w3.is_connected():
            print("Warning: Not connected to Ethereum node")
            return None, None
            
        # Load contract
        if CONTRACT_ADDRESS:
            contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
            return w3, contract
        else:
            print("Warning: No contract address provided")
            return w3, None
    except Exception as e:
        print(f"Error connecting to Ethereum: {e}")
        return None, None

def add_document_to_blockchain(doc_hash, metadata):
    """Add document hash to Ethereum blockchain"""
    w3, contract = connect_to_ethereum()
    
    if not w3 or not contract:
        print("Using mock Ethereum for demo")
        return {"status": "success", "tx_hash": "0x" + "0" * 64, "message": "Mock transaction (Ethereum not connected)"}
    
    try:
        # Convert hash string to bytes32
        if isinstance(doc_hash, str) and doc_hash.startswith("0x"):
            doc_hash = Web3.to_bytes(hexstr=doc_hash)
        elif isinstance(doc_hash, str):
            doc_hash = Web3.to_bytes(hexstr="0x" + doc_hash)
            
        # Get default account
        w3.eth.default_account = w3.eth.accounts[0]
        
        # Add document to blockchain
        tx_hash = contract.functions.addDocument(doc_hash, json.dumps(metadata)).transact()
        
        # Wait for transaction receipt
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return {
            "status": "success" if tx_receipt["status"] == 1 else "failed",
            "tx_hash": tx_hash.hex(),
            "block_number": tx_receipt["blockNumber"]
        }
    except Exception as e:
        print(f"Error adding document to Ethereum: {e}")
        return {"status": "error", "message": str(e)}

def verify_document_on_blockchain(doc_hash):
    """Verify document hash on Ethereum blockchain"""
    w3, contract = connect_to_ethereum()
    
    if not w3 or not contract:
        print("Using mock Ethereum for demo")
        return {"verified": False, "message": "Mock verification (Ethereum not connected)"}
    
    try:
        # Convert hash string to bytes32
        if isinstance(doc_hash, str) and doc_hash.startswith("0x"):
            doc_hash = Web3.to_bytes(hexstr=doc_hash)
        elif isinstance(doc_hash, str):
            doc_hash = Web3.to_bytes(hexstr="0x" + doc_hash)
            
        # Verify document on blockchain
        result = contract.functions.verifyDocument(doc_hash).call()
        
        return {
            "verified": result[0],  # exists
            "uploader": result[1],  # address
            "timestamp": result[2],  # timestamp
            "metadata": json.loads(result[3]) if result[3] else {}  # metadata
        }
    except Exception as e:
        print(f"Error verifying document on Ethereum: {e}")
        return {"verified": False, "message": str(e)}