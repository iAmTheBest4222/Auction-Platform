import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer,
  IconButton,
  TextField,
  Box,
  Typography,
  Paper,
  Fab,
  CircularProgress,
  Avatar,
  Tooltip,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isAI?: boolean;
  usingFallback?: boolean;
}

interface AIResponse {
  success: true;
  reply: string;
  messageId: string;
  isAI: boolean;
  usingFallback?: boolean;
}

interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;

    try {
      setIsLoading(true);
      setError(null);
      const newMessage = { 
        role: 'user' as const, 
        content: message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage('');

      const token = localStorage.getItem('token');
      const response = await axios.post<AIResponse | ErrorResponse>(
        'http://localhost:5001/api/ai/chat',
        {
          message,
          conversationHistory: messages.map(({ role, content }) => ({ role, content })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;
      if (!data.success) {
        throw new Error(data.message);
      }

      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: data.reply,
          timestamp: new Date(),
          isAI: data.isAI,
          usingFallback: data.usingFallback
        },
      ]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (msg: Message, index: number) => {
    const isUser = msg.role === 'user';
    return (
      <Box
        key={index}
        sx={{
          display: 'flex',
          flexDirection: isUser ? 'row-reverse' : 'row',
          gap: 2,
          mb: 3,
          px: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: isUser ? 'primary.main' : (msg.usingFallback ? 'info.light' : 'primary.main'),
            width: 40,
            height: 40,
            boxShadow: 1,
          }}
        >
          {isUser ? currentUser?.username?.[0]?.toUpperCase() : 'AI'}
        </Avatar>
        <Box sx={{ maxWidth: '75%', position: 'relative' }}>
          {!isUser && msg.usingFallback && (
            <Tooltip title="Using fallback response system due to AI service unavailability">
              <InfoIcon 
                color="info" 
                sx={{ 
                  position: 'absolute',
                  top: -12,
                  left: -12,
                  fontSize: 20,
                  bgcolor: 'background.paper',
                  borderRadius: '50%'
                }}
              />
            </Tooltip>
          )}
          <Paper
            elevation={2}
            sx={{
              p: 2.5,
              minWidth: '20%',
              bgcolor: isUser ? 'primary.light' : (msg.usingFallback ? 'info.50' : 'primary.50'),
              color: isUser ? 'primary.contrastText' : 'text.primary',
              position: 'relative',
              borderRadius: 2,
              borderLeft: msg.usingFallback ? '4px solid' : 'none',
              borderColor: 'info.main',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '8px',
                borderColor: 'transparent',
                ...(isUser
                  ? {
                      right: '-16px',
                      borderLeftColor: 'primary.light',
                    }
                  : {
                      left: '-16px',
                      borderRightColor: msg.usingFallback ? 'info.50' : 'primary.50',
                    }),
                top: '12px',
              },
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                mb: 1
              }}
            >
              {msg.content}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                textAlign: isUser ? 'left' : 'right',
                opacity: 0.7,
                mt: 1
              }}
            >
              {formatTimestamp(msg.timestamp)}
            </Typography>
          </Paper>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Tooltip title="AI Assistant">
        <Fab
          color="primary"
          aria-label="AI Assistant"
          onClick={() => setIsOpen(true)}
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            '&:hover': {
              transform: 'scale(1.1)',
            },
            transition: 'transform 0.2s'
          }}
        >
          <SmartToyIcon />
        </Fab>
      </Tooltip>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { 
            width: { xs: '100%', sm: 450, md: 500 },
            bgcolor: 'background.default'
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          bgcolor: 'background.default'
        }}>
          <Box sx={{ 
            p: 3, 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: 1
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToyIcon color="primary" />
                <Typography variant="h6">AI Assistant</Typography>
              </Box>
              <IconButton 
                onClick={() => setIsOpen(false)}
                size="small"
                sx={{ 
                  '&:hover': { 
                    bgcolor: 'rgba(0,0,0,0.04)' 
                  } 
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ 
            flexGrow: 1, 
            p: 3, 
            overflowY: 'auto',
            bgcolor: 'background.default'
          }}>
            {messages.length === 0 && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: 2,
                  opacity: 0.7
                }}
              >
                <SmartToyIcon sx={{ fontSize: 48 }} color="disabled" />
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  align="center"
                >
                  Ask me anything about auctions, bidding strategies, or item valuations!
                </Typography>
              </Box>
            )}
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ 
            p: 3, 
            borderTop: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0px -2px 4px rgba(0,0,0,0.05)'
          }}>
            {error && (
              <Typography 
                variant="body2" 
                color="error" 
                sx={{ mb: 2 }}
              >
                {error}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask me anything about auctions..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={!currentUser || isLoading}
                multiline
                maxRows={4}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'background.default'
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!message.trim() || !currentUser || isLoading}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: 48,
                  height: 48,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                  }
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            </Box>
            {!currentUser && (
              <Typography 
                variant="caption" 
                color="error" 
                sx={{ 
                  mt: 2, 
                  display: 'block',
                  textAlign: 'center' 
                }}
              >
                Please log in to use the AI Assistant
              </Typography>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default AIAssistant;