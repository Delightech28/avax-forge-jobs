import React, { createContext, useContext, useState, useEffect } from 'react';

interface NotificationContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  setUnreadCount: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    // Load initial count from localStorage
    const count = parseInt(window.localStorage.getItem('unreadCount') || '0', 10);
    setUnreadCount(count);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('unreadCount', String(unreadCount));
  }, [unreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
