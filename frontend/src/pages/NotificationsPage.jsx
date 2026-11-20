import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Heart, MessageCircle, UserPlus, MessageSquare, CheckCheck, Sparkles } from 'lucide-react';
import api from '../api/axios';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async (isBackground = false) => {
    try {
      const { data } = await api.get('/api/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling every 4 seconds for real incoming notifications from other accounts
  useEffect(() => {
    const timer = setInterval(() => {
      fetchNotifications(true);
    }, 4000);

    return () => clearInterval(timer);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      addToast('All notifications marked as read', 'info');
    } catch {
      addToast('Failed to mark notifications as read', 'error');
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      try {
        await api.put(`/api/notifications/${n._id}/read`);
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, read: true } : item))
        );
      } catch {
        /* ignore */
      }
    }

    if (n.type === 'message' && n.sender?._id) {
      navigate(`/messages?user=${n.sender._id}`);
    } else if (n.type === 'follow' && n.sender?._id) {
      navigate(`/profile/${n.sender._id}`);
    } else if ((n.type === 'like' || n.type === 'comment') && currentUser?._id) {
      navigate(`/profile/${currentUser._id}`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart size={14} color="#ef4444" fill="#ef4444" />;
      case 'comment':
        return <MessageCircle size={14} color="var(--color-primary)" fill="var(--color-primary)" />;
      case 'follow':
        return <UserPlus size={14} color="#10b981" />;
      case 'message':
        return <MessageSquare size={14} color="#7655E8" fill="#7655E8" />;
      default:
        return <Bell size={14} color="var(--color-primary)" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notifications-page">
      {/* Header Card */}
      <div
        className="glass-card-flat"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7655E8 0%, #A5B4FC 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(118, 85, 232, 0.3)',
            }}
          >
            <Bell size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-dark)', margin: 0 }}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="badge pulse-badge" style={{ fontSize: '0.72rem' }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0, marginTop: 2 }}>
              Live real-time activity across all accounts
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" icon={CheckCheck} onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 0.75rem' }} />
          <span style={{ fontSize: '0.85rem' }}>Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-xl)',
            color: 'var(--color-text-muted)',
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'rgba(118, 85, 232, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--color-primary)',
            }}
          >
            <Sparkles size={26} />
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text)' }}>
            No notifications yet
          </div>
          <p style={{ fontSize: '0.84rem', marginTop: '0.35rem', maxWidth: 360, margin: '0.35rem auto 0' }}>
            When another user likes your post, comments, follows you, or sends you a direct message, it will appear right here in real time!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {notifications.map((n) => {
            const senderName = n.sender?.fullName || n.sender?.username || 'Someone';

            return (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className="glass-card"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-xl)',
                  background: n.read ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0.95)',
                  borderLeft: n.read
                    ? '1px solid var(--color-glass-border)'
                    : '4px solid var(--color-primary)',
                  boxShadow: n.read ? 'none' : '0 4px 18px rgba(118, 85, 232, 0.12)',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar
                    src={n.sender?.profilePicture}
                    name={senderName}
                    size="md"
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getIcon(n.type)}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', color: 'var(--color-text-dark)', lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 700 }}>{senderName}</span>{' '}
                    <span style={{ color: 'var(--color-text-muted)' }}>{n.text}</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-light)', marginTop: 2 }}>
                    {formatRelativeTime(n.createdAt)}
                  </div>
                </div>

                {!n.read && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
