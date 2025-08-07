import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons';

const StatusIndicator = ({ status }) => {
  const getIcon = () => {
    switch (status) {
      case 'sent':
        return <FontAwesomeIcon icon={faCheck} />;
      case 'delivered':
        return <FontAwesomeIcon icon={faCheckDouble} />;
      case 'read':
        return <FontAwesomeIcon icon={faCheckDouble} className="read" />;
      default:
        return '';
    }
  };

  return (
    <span className={`status-indicator ${status || 'pending'}`}>
      {getIcon()}
    </span>
  );
};

export default StatusIndicator;