import { ChatProvider, ChatContext } from './context/ChatContext';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import './App.css';
import { useState, useContext, useEffect } from 'react';
// Font Awesome for icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEllipsisVertical, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showChatList, setShowChatList] = useState(true);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowChatList(true); // Always show chat list in desktop view
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Custom component to handle mobile navigation
  const MobileApp = () => {
    const { selectedConversation, setSelectedConversation, conversations } = useContext(ChatContext);
    
    // Effect to handle chat selection in mobile view
    useEffect(() => {
      if (selectedConversation && isMobile) {
        setShowChatList(false);
      }
    }, [selectedConversation]);
    
    const handleBackClick = () => {
      setShowChatList(true);
      // Clear the selected conversation when going back to the list
      setSelectedConversation(null);
    };
    
    const selectedConversationData = conversations.find(c => c._id === selectedConversation);
    
    return (
      <div className="app-container mobile">
        {showChatList ? (
          // Chat List View
          <div className="sidebar mobile-full-width">
            <div className="chat-list-header">
              <h2>WhatsApp</h2>
              <div className="chat-list-actions">
                <button aria-label="Search">
                  <FontAwesomeIcon icon={faSearch} />
                </button>
                <button aria-label="Menu">
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </button>
              </div>
            </div>
            <ChatList />
          </div>
        ) : (
          // Chat Window View
          <div className="main-content mobile-full-width">
            <div className="chat-header mobile-header">
              <button className="back-button" onClick={handleBackClick} aria-label="Back to chat list">
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <div className="avatar">
                {selectedConversationData?.profile_name.charAt(0)}
              </div>
              <div className="header-info">
                <h2>{selectedConversationData?.profile_name}</h2>
                <p>Online</p>
              </div>
            </div>
            <ChatWindow />
          </div>
        )}
      </div>
    );
  };
  
  // Desktop layout
  const DesktopApp = () => (
    <div className="app-container">
      <div className="sidebar">
        <div className="chat-list-header">
          <h2>WhatsApp</h2>
          <div className="chat-list-actions">
            <button aria-label="Search">
              <FontAwesomeIcon icon={faSearch} />
            </button>
            <button aria-label="Menu">
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>
          </div>
        </div>
        <ChatList />
      </div>
      <div className="main-content">
        <ChatWindow />
      </div>
    </div>
  );
  
  return (
    <ChatProvider>
      {isMobile ? <MobileApp /> : <DesktopApp />}
    </ChatProvider>
  );
}

export default App;