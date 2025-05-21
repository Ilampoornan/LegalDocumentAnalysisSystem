import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, IconButton, 
  Divider, Button, CircularProgress, Card,  Chip,
  Avatar,  List, ListItem, ListItemText, ListItemAvatar,
  Drawer, ListItemButton, Tooltip, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle
} from '@mui/material';
import { 
  Send, Mic, MicOff, AttachFile, Person, SmartToy, 
  History,  Delete,  Close, ChatBubble, Info, Error
} from '@mui/icons-material';
import { useChatContext } from '../context/ChatContext';

const ChatInterface = () => {
  // const theme = useTheme();
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearChat, 
    chatHistory,
    isFetchingHistory,
    loadChatById
  } = useChatContext();
  
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [file, setFile] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (input.trim() || file) {
      sendMessage(input, file);
      setInput('');
      setFile(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording logic would go here
      // For demo, simulate speech-to-text after delay
      setTimeout(() => {
        setInput('What are the key components of a valid contract?');
        setIsRecording(false);
      }, 2000);
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleLoadChat = (chatId) => {
    loadChatById(chatId);
    setDrawerOpen(false);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleClearConfirm = () => {
    clearChat();
    setConfirmClearOpen(false);
  };
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format the timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Truncate text for preview
  const truncateText = (text, maxLength = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Suggested queries
  const suggestions = [
    "What makes a contract legally binding?",
    "Explain force majeure clauses",
    "What are the GDPR requirements?",
    "Define fiduciary duty",
    "Explain implied warranty"
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Legal Assistant
        </Typography>
        
        <Box>
          <Tooltip title="Chat History">
            <IconButton onClick={toggleDrawer} color="primary">
              <History />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Clear Current Chat">
            <IconButton 
              onClick={() => setConfirmClearOpen(true)}
              color="primary"
              disabled={messages.length === 0}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Paper 
        elevation={0} 
        sx={{ 
          flex: 1, 
          mb: 3, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'background.subtle',
        }}
      >
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          display: 'flex',
          flexDirection: 'column',
          p: 2
        }}>
          {messages.length === 0 ? (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                height: '100%',
                gap: 3,
                py: 6
              }}
            >
              <Avatar sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: 'primary.dark',
                mb: 2
              }}>
                <SmartToy sx={{ fontSize: 34 }} />
              </Avatar>
              
              <Typography variant="h5" fontWeight="600" sx={{ mb: 1 }}>
                Welcome to Legal Assistant
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                I can help answer questions about contracts, regulations, and legal documents. 
                You can also upload documents for analysis.
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 4, mb: 2, fontWeight: 500 }}>
                Try asking about:
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'center',
                maxWidth: 700,
                gap: 1
              }}>
                {suggestions.map((suggestion, index) => (
                  <Chip 
                    key={index}
                    label={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                    }}
                    color="primary"
                    variant="outlined"
                    clickable
                    sx={{ 
                      borderRadius: 2,
                      py: 2.5,
                      px: 1,
                      '&:hover': {
                        bgcolor: 'background.subtle',
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          ) : (
            messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                  mb: 3,
                  px: 1,
                }}
              >
                {!msg.isUser && (
                  <Avatar
                    sx={{
                      bgcolor: msg.isSystem ? 'info.dark' : msg.isError ? 'error.dark' : 'primary.dark',
                      width: 38,
                      height: 38,
                      mr: 1.5,
                      mt: 0.5,
                    }}
                  >
                    {msg.isSystem ? <Info fontSize="small" /> : 
                    msg.isError ? <Error fontSize="small" /> : 
                    <SmartToy fontSize="small" />}
                  </Avatar>
                )}
                
                <Card
                  elevation={0}
                  sx={{
                    maxWidth: '75%',
                    p: 2,
                    backgroundColor: msg.isUser 
                      ? 'primary.dark' 
                      : msg.isSystem 
                        ? 'info.dark' 
                        : msg.isError 
                          ? 'error.dark' 
                          : 'background.subtle',
                    color: (msg.isUser || msg.isSystem || msg.isError) ? 'white' : 'text.primary',
                    borderRadius: 3,
                    border: msg.isUser ? 'none' : '1px solid',
                    borderColor: msg.isUser ? 'transparent' : 'background.subtle',
                  }}
                >
                  <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    mt: 1.5, 
                    display: 'block',
                    color: (msg.isUser || msg.isSystem || msg.isError) ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                    fontSize: '0.7rem'
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Typography>
                </Card>
                
                {msg.isUser && (
                  <Avatar
                    sx={{
                      bgcolor: 'secondary.dark',
                      width: 38,
                      height: 38,
                      ml: 1.5,
                      mt: 0.5,
                    }}
                  >
                    <Person fontSize="small" />
                  </Avatar>
                )}
              </Box>
            ))
          )}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2, px: 1 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.dark',
                  width: 38,
                  height: 38,
                  mr: 1.5,
                  mt: 0.5,
                }}
              >
                <SmartToy fontSize="small" />
              </Avatar>
              <Card 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'background.subtle',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'background.subtle',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      className="typing-dot" 
                      sx={{ 
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        margin: '0 2px',
                        animation: 'typing 1.4s infinite both',
                        '&:nth-of-type(2)': {
                          animationDelay: '0.2s',
                        },
                        '&:nth-of-type(3)': {
                          animationDelay: '0.4s',
                        },
                        '@keyframes typing': {
                          '0%': { opacity: 0.3, transform: 'scale(0.7)' },
                          '50%': { opacity: 1, transform: 'scale(1)' },
                          '100%': { opacity: 0.3, transform: 'scale(0.7)' },
                        }
                      }} 
                    />
                    <Box className="typing-dot" sx={{ 
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      margin: '0 2px',
                      animation: 'typing 1.4s infinite both',
                      animationDelay: '0.2s',
                      '@keyframes typing': {
                        '0%': { opacity: 0.3, transform: 'scale(0.7)' },
                        '50%': { opacity: 1, transform: 'scale(1)' },
                        '100%': { opacity: 0.3, transform: 'scale(0.7)' },
                      }
                    }} />
                    <Box className="typing-dot" sx={{ 
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      margin: '0 2px',
                      animation: 'typing 1.4s infinite both',
                      animationDelay: '0.4s',
                      '@keyframes typing': {
                        '0%': { opacity: 0.3, transform: 'scale(0.7)' },
                        '50%': { opacity: 1, transform: 'scale(1)' },
                        '100%': { opacity: 0.3, transform: 'scale(0.7)' },
                      }
                    }} />
                  </Box>
                </Box>
              </Card>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
      </Paper>
      
      <Paper 
        sx={{ 
          p: 2, 
          bgcolor: 'background.paper', 
          border: '1px solid',
          borderColor: 'background.subtle',
        }}
      >
        {file && (
          <Box sx={{ 
            mb: 2, 
            p: 1, 
            bgcolor: 'background.subtle', 
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <Typography variant="body2">{file.name}</Typography>
            <Button size="small" color="error" onClick={() => setFile(null)}>
              Remove
            </Button>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="primary" 
            onClick={() => fileInputRef.current.click()} 
            sx={{ mr: 1 }}
          >
            <AttachFile />
          </IconButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
            sx={{ 
              mr: 1,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.subtle',
                border: 'none',
              }
            }}
          />
          
          <IconButton 
            color={isRecording ? "error" : "primary"} 
            onClick={toggleRecording}
            sx={{ 
              mr: 1,
              bgcolor: isRecording ? 'error.dark' : 'background.subtle',
              '&:hover': {
                bgcolor: isRecording ? 'error.dark' : 'background.subtle',
              }
            }}
          >
            {isRecording ? <MicOff /> : <Mic />}
          </IconButton>
          
          <IconButton 
            color="primary" 
            onClick={handleSend}
            disabled={!input.trim() && !file}
            sx={{ 
              bgcolor: (input.trim() || file) ? 'primary.main' : 'background.subtle',
              '&:hover': {
                bgcolor: (input.trim() || file) ? 'primary.dark' : 'background.subtle',
              },
              '& .MuiSvgIcon-root': {
                color: (input.trim() || file) ? 'white' : 'text.disabled',
              }
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Paper>

      {/* Chat History Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{ 
          '& .MuiDrawer-paper': { 
            width: { xs: '100%', sm: 350 },
            padding: 2
          } 
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Chat History</Typography>
            <IconButton onClick={toggleDrawer}>
              <Close />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {isFetchingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={30} />
            </Box>
          ) : chatHistory.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">No chat history found</Typography>
            </Box>
          ) : (
            <List>
              {chatHistory.map((chat) => (
                <ListItem 
                  key={chat.id} 
                  disablePadding 
                  sx={{ mb: 1 }}
                >
                  <ListItemButton 
                    onClick={() => handleLoadChat(chat.id)}
                    sx={{ 
                      borderRadius: 2,
                      '&:hover': { bgcolor: 'background.subtle' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.dark' }}>
                        <ChatBubble />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={truncateText(chat.question, 30)}
                      secondary={formatTimestamp(chat.timestamp)}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>

      {/* Confirm Clear Dialog */}
      <Dialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
      >
        <DialogTitle>Clear current chat?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will clear the current conversation. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClearOpen(false)}>Cancel</Button>
          <Button onClick={handleClearConfirm} color="error">Clear</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatInterface;