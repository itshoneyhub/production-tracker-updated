import React, { useEffect, useState } from 'react';
import './AlertMessage.css'; // We'll create this CSS file next

const AlertMessage = ({ message, type, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) {
        setTimeout(() => onDismiss(), 500); // Allow fade-out animation to complete
      }
    }, 3000); // Message visible for 3 seconds

    return () => clearTimeout(timer);
  }, [message, type, onDismiss]);

  if (!message || !isVisible) return null;

  return (
    <div className={`alert-message ${type} ${isVisible ? 'fade-in' : 'fade-out'}`}>
      {message}
    </div>
  );
};

export default AlertMessage;
