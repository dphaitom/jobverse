// src/contexts/NotificationContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await authAPI.get('/v1/notifications?size=10');
      setNotifications(response.data?.content || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await authAPI.get('/v1/notifications/unread-count');
      setUnreadCount(response.data || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated]);

  // Handle incoming WebSocket notification
  const handleNewNotification = useCallback((notification) => {
    console.log('📨 New notification received:', notification);

    // Add to notifications list
    setNotifications((prev) => [notification, ...prev]);

    // Increment unread count
    setUnreadCount((prev) => prev + 1);

    // Show toast notification
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full glass-card rounded-xl shadow-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <span className="text-2xl">
                  {notification.type === 'APPLICATION' ? '📬' :
                   notification.type === 'STATUS_UPDATE' ? '🔔' :
                   notification.type === 'MESSAGE' ? '💬' : '📢'}
                </span>
              </div>
              <div className="flex-1 ml-3">
                <p className="text-sm font-medium text-white">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  {notification.content}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-700">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex items-center justify-center w-full p-4 text-sm font-medium border border-transparent rounded-none rounded-r-xl text-violet-400 hover:text-violet-300"
            >
              Đóng
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  }, []);

  // WebSocket connection
  const { connected, error: wsError } = useWebSocket(user, handleNewNotification);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await authAPI.put(`/v1/notifications/${notificationId}/read`);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );

      // Decrement unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await authAPI.put('/v1/notifications/read-all');

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );

      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Lỗi khi đánh dấu đã đọc');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await authAPI.delete(`/v1/notifications/${notificationId}`);

      // Remove from local state
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      toast.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Lỗi khi xóa thông báo');
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    connected: connected && isAuthenticated,
    wsError,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
