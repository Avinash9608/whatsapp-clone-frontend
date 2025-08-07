import { createContext, useState, useEffect, useRef } from 'react';
import { fetchConversations, fetchMessages, sendMessage } from '../services/api';
import { io } from 'socket.io-client';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Create a ref for the socket connection
  const socketRef = useRef(null);

  // Load all conversations
  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await fetchConversations();
      setConversations(data);
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]._id);
      }
    } catch (err) {
      setError('Failed to load conversations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a specific conversation
  const loadMessages = async (wa_id) => {
    if (!wa_id) return;
    setLoading(true);
    try {
      const data = await fetchMessages(wa_id);
      setMessages(data);
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const handleSendMessage = async (messageText, messageType = 'text', mediaData = null) => {
    if ((!messageText || !messageText.trim()) && !mediaData && messageType === 'text') return;
    if (!selectedConversation) return;
    
    const conversation = conversations.find(c => c._id === selectedConversation);
    if (!conversation) return;

    try {
      let newMessage = {
        wa_id: selectedConversation,
        profile_name: conversation.profile_name,
        from: '918329446654', // Business number
        type: messageType
      };

      // Add appropriate content based on message type
      switch (messageType) {
        case 'text':
          newMessage.body = messageText;
          break;
        case 'image':
          newMessage.media = mediaData;
          newMessage.caption = messageText || '';
          break;
        case 'document':
          newMessage.document = mediaData;
          newMessage.caption = messageText || '';
          break;
        case 'contact':
          newMessage.contacts = mediaData;
          break;
        default:
          newMessage.body = messageText;
      }

      const sentMessage = await sendMessage(newMessage);
      setMessages(prev => [...prev, sentMessage]);
      
      // Update conversation list with new message
      const displayText = messageType === 'text' ? messageText : 
                          messageType === 'image' ? '📷 Image' : 
                          messageType === 'document' ? '📄 Document' : 
                          messageType === 'contact' ? '👤 Contact' : 'Message';
                          
      setConversations(prev => prev.map(conv => 
        conv._id === selectedConversation 
          ? { 
              ...conv, 
              last_message: displayText, 
              last_message_time: sentMessage.timestamp,
              // Don't increment unread_count for messages sent by the user
              unread_count: conv.unread_count || 0
            }
          : conv
      ));
      
      return sentMessage;
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
      throw err;
    }
  };
  
  // Handle sending an image
  const handleSendImage = async (imageFile, caption = '') => {
    try {
      // In a real app, you would upload the image to a server here
      // For this demo, we'll simulate it with a mock URL
      const mockImageUrl = URL.createObjectURL(imageFile);
      return await handleSendMessage(caption, 'image', {
        url: mockImageUrl,
        filename: imageFile.name,
        mimetype: imageFile.type
      });
    } catch (err) {
      setError('Failed to send image');
      console.error(err);
      throw err;
    }
  };
  
  // Handle sending a document
  const handleSendDocument = async (documentFile, caption = '') => {
    try {
      // In a real app, you would upload the document to a server here
      return await handleSendMessage(caption, 'document', {
        filename: documentFile.name,
        mimetype: documentFile.type,
        size: documentFile.size
      });
    } catch (err) {
      setError('Failed to send document');
      console.error(err);
      throw err;
    }
  };
  
  // Handle sending a contact
  const handleSendContact = async (contactData) => {
    try {
      return await handleSendMessage('', 'contact', contactData);
    } catch (err) {
      setError('Failed to send contact');
      console.error(err);
      throw err;
    }
  };

  // Initialize Socket.IO connection and set up event listeners
  useEffect(() => {
    // Initialize socket connection using environment variable or fallback to localhost
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(socketUrl);
    
    // Listen for new messages
    socketRef.current.on('new_message', (newMessage) => {
      // If the message is for the currently selected conversation, add it to messages
      if (newMessage.wa_id === selectedConversation) {
        setMessages(prev => [...prev, newMessage]);
      }
      // Update the conversations list
      loadConversations();
    });
    
    // Listen for messages being read
    socketRef.current.on('messages_read', ({ wa_id }) => {
      // If this is the current conversation, update message statuses
      if (wa_id === selectedConversation) {
        setMessages(prev => prev.map(msg => 
          msg.from === wa_id && msg.status !== 'read' 
            ? { ...msg, status: 'read' } 
            : msg
        ));
      }
      // Update conversations list to reflect new unread counts
      loadConversations();
    });
    
    // Listen for general conversation updates
    socketRef.current.on('update_conversations', () => {
      loadConversations();
    });
    
    // Load initial conversations
    loadConversations();
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Load messages when conversation changes and join the conversation room
  useEffect(() => {
    if (selectedConversation) {
      // Join the conversation room for real-time updates
      if (socketRef.current) {
        socketRef.current.emit('join_conversation', selectedConversation);
      }
      
      // Load messages for this conversation
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        selectedConversation,
        loading,
        error,
        setSelectedConversation,
        handleSendMessage,
        handleSendImage,
        handleSendDocument,
        handleSendContact
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};