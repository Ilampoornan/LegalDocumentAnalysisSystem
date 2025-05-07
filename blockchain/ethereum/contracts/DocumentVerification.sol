// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentVerification {
    address public owner;
    
    // Struct to store document information
    struct Document {
        address uploader;
        uint256 timestamp;
        bool exists;
        string metadata; // Additional information like document type, case number, etc.
    }
    
    // Mapping from document hash to Document struct
    mapping(bytes32 => Document) public documents;
    
    // Events
    event DocumentAdded(bytes32 indexed documentHash, address indexed uploader, uint256 timestamp);
    event DocumentVerified(bytes32 indexed documentHash, bool verified);
    
    constructor() {
        owner = msg.sender;
    }
    
    // Function to add a new document to the blockchain
    function addDocument(bytes32 documentHash, string memory metadata) public {
        require(!documents[documentHash].exists, "Document already exists");
        
        documents[documentHash] = Document({
            uploader: msg.sender,
            timestamp: block.timestamp,
            exists: true,
            metadata: metadata
        });
        
        emit DocumentAdded(documentHash, msg.sender, block.timestamp);
    }
    
    // Function to verify if a document exists and who uploaded it
    function verifyDocument(bytes32 documentHash) public returns (bool exists, address uploader, uint256 timestamp, string memory metadata) {
        Document memory doc = documents[documentHash];
        
        emit DocumentVerified(documentHash, doc.exists);
        
        return (doc.exists, doc.uploader, doc.timestamp, doc.metadata);
    }
    
    // Function to check if a document exists (view function, doesn't emit events)
    function documentExists(bytes32 documentHash) public view returns (bool) {
        return documents[documentHash].exists;
    }
    
    // Function to get document details
    function getDocumentDetails(bytes32 documentHash) public view returns (address uploader, uint256 timestamp, bool exists, string memory metadata) {
        Document memory doc = documents[documentHash];
        return (doc.uploader, doc.timestamp, doc.exists, doc.metadata);
    }
}