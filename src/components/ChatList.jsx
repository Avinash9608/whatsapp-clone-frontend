import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

const ChatList = () => {
  const { 
    conversations, 
    selectedConversation, 
    setSelectedConversation,
    loading 
  } = useContext(ChatContext);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && conversations.length === 0) {
    return <div className="loading">Loading conversations...</div>;
  }

  if (conversations.length === 0) {
    return <div className="no-conversations">No conversations found</div>;
  }

  return (
    <div className="chat-list">
      {conversations.map(conversation => (
        <div
          key={conversation._id}
          className={`chat-item ${selectedConversation === conversation._id ? 'active' : ''}`}
          onClick={() => setSelectedConversation(conversation._id)}
        >
          <div className="avatar">{conversation.profile_name.charAt(0)}</div>
          <div className="chat-info">
            <h3>{conversation.profile_name}</h3>
            <p className="last-message">
              {conversation.last_message?.length > 30 
                ? `${conversation.last_message.substring(0, 30)}...` 
                : conversation.last_message}
            </p>
          </div>
          <div className="chat-meta">
            <span className="time">{formatTime(conversation.last_message_time)}</span>
            {conversation.unread_count > 0 && (
              <span className="unread-count">{conversation.unread_count}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;