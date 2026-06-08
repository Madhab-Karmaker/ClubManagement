import React, { useEffect, useState } from "react";
import notificationService, { type NotificationDto } from "../../services/notification.service";
import "./NotificationsPage.css";

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {}
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="ntf-page">
        <div className="ntf-loading"><div className="spinner" /><p>Loading notifications...</p></div>
      </div>
    );
  }

  return (
    <div className="ntf-page">
      <div className="ntf-header">
        <div className="ntf-header-left">
          <h1>Notifications</h1>
          {unreadCount > 0 && <span className="ntf-unread-badge">{unreadCount} unread</span>}
        </div>
        {unreadCount > 0 && (
          <button className="ntf-btn ntf-btn-ghost" onClick={handleMarkAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="ntf-error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="ntf-list">
        {notifications.length === 0 ? (
          <div className="ntf-empty">
            <span className="ntf-empty-icon">🔔</span>
            <h3>No notifications</h3>
            <p>You&apos;re all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`ntf-item ${!n.isRead ? "ntf-unread" : ""}`}>
              <div className="ntf-item-left">
                {!n.isRead && <div className="ntf-dot" />}
                <div className="ntf-item-content">
                  <p className="ntf-item-message">{n.message}</p>
                  <div className="ntf-item-meta">
                    <span className="ntf-time">{timeAgo(n.createdAt || n.created_at)}</span>
                    {n.type && <span className="ntf-type">{n.type}</span>}
                  </div>
                </div>
              </div>
              <div className="ntf-item-actions">
                {!n.isRead && (
                  <button className="ntf-btn-sm" onClick={() => handleMarkRead(n.id)} title="Mark as read">
                    ✓
                  </button>
                )}
                <button className="ntf-btn-sm ntf-btn-sm-danger" onClick={() => handleDelete(n.id)} title="Delete">
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
