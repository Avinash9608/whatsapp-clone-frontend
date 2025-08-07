import { useContext, useRef, useState, useEffect } from 'react';
import { ChatContext } from '../context/ChatContext';
import MessageBubble from './MessageBubble';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faPaperclip, faFaceSmile, faImage, faFile, faAddressBook, faTimes } from '@fortawesome/free-solid-svg-icons';
import EmojiPicker from 'emoji-picker-react';

const ChatWindow = () => {
  const { 
    messages, 
    selectedConversation, 
    conversations,
    handleSendMessage,
    handleSendImage,
    handleSendDocument,
    handleSendContact,
    loading,
    error
  } = useContext(ChatContext);
  
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const mediaOptionsRef = useRef(null);

  const selectedConversationData = conversations.find(
    c => c._id === selectedConversation
  );

  const handleSend = async () => {
    if (!messageInput.trim()) return;
    try {
      await handleSendMessage(messageInput);
      setMessageInput('');
      // Close any open pickers when sending a message
      setShowEmojiPicker(false);
      setShowMediaOptions(false);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessageInput(prev => prev + emojiData.emoji);
  };

  const handleMediaOptionClick = (type) => {
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    
    switch (type) {
      case 'image':
        fileInput.accept = 'image/*';
        fileInput.onchange = (e) => {
          if (e.target.files && e.target.files[0]) {
            const caption = prompt('Add a caption (optional):');
            handleSendImage(e.target.files[0], caption || '');
          }
        };
        break;
      case 'document':
        fileInput.accept = '.pdf,.doc,.docx,.txt,.xls,.xlsx';
        fileInput.onchange = (e) => {
          if (e.target.files && e.target.files[0]) {
            const caption = prompt('Add a caption (optional):');
            handleSendDocument(e.target.files[0], caption || '');
          }
        };
        break;
      case 'contact':
        // For demo purposes, we'll use a mock contact
        const contactName = prompt('Enter contact name:');
        const contactPhone = prompt('Enter contact phone number:');
        if (contactName && contactPhone) {
          handleSendContact({ name: contactName, phone: contactPhone });
        }
        return; // Skip file input click for contacts
      default:
        return;
    }
    
    // Trigger the file selection dialog
    fileInput.click();
    // Close the media options panel
    setShowMediaOptions(false);
  };
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) && 
          event.target.getAttribute('aria-label') !== 'Emoji') {
        setShowEmojiPicker(false);
      }
      if (mediaOptionsRef.current && !mediaOptionsRef.current.contains(event.target) && 
          event.target.getAttribute('aria-label') !== 'Attach') {
        setShowMediaOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Check if we're in mobile view by looking for the mobile-header class in the DOM
  const isMobileView = () => {
    return document.querySelector('.mobile-header') !== null;
  };

  return (
    <div className="chat-window">
      {selectedConversation ? (
        <>
          {/* Only show the header in desktop view */}
          {!isMobileView() && (
            <div className="chat-header">
              <div className="avatar">
                {selectedConversationData?.profile_name.charAt(0)}
              </div>
              <div className="header-info">
                <h2>{selectedConversationData?.profile_name}</h2>
                <p>Online</p>
              </div>
            </div>
          )}

          <div className="messages-container">
            {loading && messages.length === 0 ? (
              <div className="loading">Loading messages...</div>
            ) : (
              messages.map(message => (
                <MessageBubble 
                  key={message._id} 
                  message={message} 
                  isOutgoing={message.from !== message.wa_id} 
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="message-input">
            <div className="message-input-actions">
              <button 
                aria-label="Emoji" 
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowMediaOptions(false);
                }}
                className={showEmojiPicker ? 'active' : ''}
              >
                <FontAwesomeIcon icon={faFaceSmile} />
              </button>
              <button 
                aria-label="Attach" 
                onClick={() => {
                  setShowMediaOptions(!showMediaOptions);
                  setShowEmojiPicker(false);
                }}
                className={showMediaOptions ? 'active' : ''}
              >
                <FontAwesomeIcon icon={faPaperclip} />
              </button>
            </div>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message"
              disabled={loading}
            />
            <button 
              className="send-button" 
              onClick={handleSend} 
              disabled={loading || !messageInput.trim()}
              aria-label="Send message"
            >
              {loading ? 
                <span className="loading-indicator">...</span> : 
                <FontAwesomeIcon icon={faPaperPlane} />
              }
            </button>
            
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="emoji-picker-container" ref={emojiPickerRef}>
                <div className="emoji-picker-header">
                  <span>Emoji</span>
                  <button onClick={() => setShowEmojiPicker(false)}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                <EmojiPicker onEmojiClick={handleEmojiClick} width="100%" height="350px" />
              </div>
            )}
            
            {/* Media Options */}
            {showMediaOptions && (
              <div className="media-options-container" ref={mediaOptionsRef}>
                <div className="media-options-header">
                  <span>Send Media</span>
                  <button onClick={() => setShowMediaOptions(false)}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                <div className="media-options-grid">
                  <button onClick={() => handleMediaOptionClick('image')} className="media-option">
                    <FontAwesomeIcon icon={faImage} />
                    <span>Image</span>
                  </button>
                  <button onClick={() => handleMediaOptionClick('document')} className="media-option">
                    <FontAwesomeIcon icon={faFile} />
                    <span>Document</span>
                  </button>
                  <button onClick={() => handleMediaOptionClick('contact')} className="media-option">
                    <FontAwesomeIcon icon={faAddressBook} />
                    <span>Contact</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="no-chat-selected">
          {conversations.length === 0 
            ? 'No conversations available' 
            : 'Select a conversation to start chatting'}
        </div>
      )}
    </div>
  );
};

export default ChatWindow;