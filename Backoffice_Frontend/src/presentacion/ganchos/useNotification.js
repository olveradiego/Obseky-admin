import { useState, useCallback, useRef, useEffect } from "react";

export const useNotification = () => {
  const [notification, setNotification] = useState(null); // { message: '', type: 'success' | 'error' | 'info' }
  const notificationTimeoutRef = useRef(null);

  const showNotification = useCallback((message, type = "info", duration = 5000) => {
    // Clear any existing timeout to avoid premature clearing
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ message, type });
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, duration);
  }, []);

  const clearNotification = useCallback(() => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }
    setNotification(null);
  }, []);

  // Clear notification on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  return { notification, showNotification, clearNotification };
};