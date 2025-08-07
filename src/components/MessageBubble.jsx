import StatusIndicator from './StatusIndicator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faUser, faDownload } from '@fortawesome/free-solid-svg-icons';

const MessageBubble = ({ message, isOutgoing }) => {
  const formatTime = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = () => {
    const type = message.type || 'text';
    
    switch (type) {
      case 'image':
        return (
          <div className="media-message image-message">
            <img src={message.media?.url} alt="Image" />
            {message.caption && <p className="caption">{message.caption}</p>}
          </div>
        );
      case 'document':
        return (
          <div className="media-message document-message">
            <div className="document-icon">
              <FontAwesomeIcon icon={faFile} />
            </div>
            <div className="document-info">
              <p className="document-name">{message.document?.filename}</p>
              <p className="document-meta">
                {message.document?.mimetype} · {(message.document?.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button className="download-button">
              <FontAwesomeIcon icon={faDownload} />
            </button>
          </div>
        );
      case 'contact':
        return (
          <div className="media-message contact-message">
            <div className="contact-icon">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className="contact-info">
              <p className="contact-name">{message.contacts?.name}</p>
              <p className="contact-number">{message.contacts?.phone}</p>
            </div>
          </div>
        );
      case 'text':
      default:
        return <p className="message-text">{message.body}</p>;
    }
  };

  return (
    <div className={`message-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`}>
      <div className="bubble-content">
        {renderMessageContent()}
        <div className="message-meta">
          <span className="time">{formatTime(message.timestamp)}</span>
          {isOutgoing && <StatusIndicator status={message.status} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;