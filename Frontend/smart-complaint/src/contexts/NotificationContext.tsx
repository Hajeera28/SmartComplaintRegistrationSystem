import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getNotificationsByOfficer, getNotificationsByCitizen, type Notification } from '../api/notification.api';
import { tokenstore } from '../auth/tokenstore';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  removeNotification: (id: number) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = async () => {
    try {
      const userId = tokenstore.getUserId();
      const userRole = tokenstore.getRole();
      if (!userId) return;
      
      let data: Notification[] = [];
      if (userRole === 'Officer' || userRole === 'Admin') {
        data = await getNotificationsByOfficer(userId);
      } else if (userRole === 'Citizen') {
        data = await getNotificationsByCitizen(userId);
      }
      // Filter unread notifications on frontend
      const unreadData = data.filter(n => !n.isRead);
      setNotifications(unreadData);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // Reduced to 1 minute
    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    unreadCount: notifications.length,
    refreshNotifications: loadNotifications,
    removeNotification: (id: number) => setNotifications(prev => prev.filter(n => n.notificationId !== id)),
    clearAllNotifications: () => setNotifications([])
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}