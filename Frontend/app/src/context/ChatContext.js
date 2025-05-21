import React, { createContext, useState, useContext, useEffect } from 'react';

const ChatContext = createContext();

export const useChatContext = () => useContext(ChatContext);

export const ChatContextProvider = ({ children }) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const token = localStorage.getItem("authToken");

  // Fetch chat history when component mounts
  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      setIsFetchingHistory(true);
      const response = await fetch('/chat/');
      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }
      const data = await response.json();
      console.log(data)
      setChatHistory(data);
      setIsFetchingHistory(false);
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setError('Failed to load chat history');
      setIsFetchingHistory(false);
    }
  };

  const loadChatById = async (chatId) => {
    try {
      setIsLoading(true);
      // Find the chat in history or fetch from backend if needed
      const chat = chatHistory.find(chat => chat.id === chatId);
      
      if (chat) {
        // Convert the chat history item to message format
        const userMessage = {
          id: chat.id + '-question',
          text: chat.question,
          isUser: true,
          timestamp: chat.timestamp
        };
        
        const botMessage = {
          id: chat.id + '-response',
          text: chat.response,
          isUser: false,
          timestamp: chat.timestamp
        };
        
        setMessages([userMessage, botMessage]);
      } else {
        // If not in cached history, could fetch from backend
        setError('Chat not found');
      }
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load chat');
      setIsLoading(false);
    }
  };

  // ...existing code...

const sendMessage = async (text, attachment = null) => {
  try {
    // Add user message
    const userMessage = { 
      id: Date.now(), 
      text, 
      isUser: true, 
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // If there's an attachment, upload it first
    let documentId = null;
    if (attachment) {
      const formData = new FormData();
      formData.append('file', attachment);
      
      const uploadResponse = await fetch(`${API_URL}/chat/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Document upload error:', errorText);
        throw new Error(`Document upload failed with status ${uploadResponse.status}`);
      }
      
      const uploadData = await uploadResponse.json();
      documentId = uploadData.document_id;
      
      // Add system message about successful upload
      const systemMessage = {
        id: Date.now() + 0.5,
        text: `Document "${attachment.name}" uploaded successfully. You can now ask questions about it.`,
        isUser: false,
        isSystem: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, systemMessage]);
    }
    
    // Now send the actual query, including document_id if available
    const queryBody = documentId 
      ? { question: text, document_id: documentId }
      : { question: text };
    
    const response = await fetch(`${API_URL}/chat/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(queryBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Server responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    const botMessage = {
      id: Date.now() + 1,
      text: data.response,
      isUser: false,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, botMessage]);
    
    // Refresh chat history to include new chat
    fetchChatHistory();
    
    setIsLoading(false);
  } catch (err) {
    console.error('Error sending message:', err);
    
    // Add error message to chat
    const errorMessage = {
      id: Date.now() + 1,
      text: `Error: ${err.message || 'Failed to get response'}`,
      isUser: false,
      isError: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, errorMessage]);
    setError('Failed to get response');
    setIsLoading(false);
  }
};
  
  const clearChat = () => setMessages([]);

  return (
    <ChatContext.Provider value={{ 
      messages, 
      isLoading, 
      error, 
      sendMessage,
      clearChat,
      chatHistory,
      isFetchingHistory,
      loadChatById
    }}>
      {children}
    </ChatContext.Provider>
  );
};