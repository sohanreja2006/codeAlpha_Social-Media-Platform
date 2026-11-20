import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  Home,
  Compass,
  Users,
  Bell,
  MessageSquare,
  Bookmark,
  User,
  Settings,
  LogOut,
  Sparkles,
  PlusCircle,
  PenTool,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import ConfirmationModal from '../common/ConfirmationModal';

const LeftSidebar = ({ onOpenCreatePost }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Poll for real unread counts across accounts
  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      try {
        const [notifRes, msgRes] = await Promise.all([
          api.get('/api/notifications/unread-count'),
          api.get('/api/messages/unread-count'),
        ]);
        setUnreadNotifs(notifRes.data.count || 0);
        setUnreadMessages(msgRes.data.count || 0);
      } catch {
        /* ignore */
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Discover', path: '/discover', icon: Users },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: unreadNotifs > 0 ? unreadNotifs : null,
    },
    {
      label: 'Messages',
      path: '/messages',
      icon: MessageSquare,
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    { label: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    {
      label: 'Profile',
      path: user ? `/profile/${user._id || user.username}` : '/login',
      icon: User,
    },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      <aside className="sidebar-left glass-card-flat">
        {/* Brand Header */}
        <Link to="/" className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Sparkles size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="sidebar-logo-text">SOCIALY</span>
            <span style={{ fontSize: '0.62rem', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--color-text-light)', fontWeight: 700 }}>
              Spatial Glass
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">
                  <Icon size={20} />
                </span>
                <span className="nav-label">{item.label}</span>
                {item.badge ? (
                  <span className="badge nav-badge pulse-badge">{item.badge}</span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Post Action in Sidebar */}
        <div style={{ padding: '0.75rem 0.25rem', marginBottom: '0.5rem' }}>
          <Button
            variant="primary"
            size="md"
            icon={PenTool}
            onClick={onOpenCreatePost}
            style={{
              width: '100%',
              borderRadius: 'var(--radius-pill)',
              padding: '0.75rem 1rem',
              boxShadow: '0 8px 24px rgba(118, 85, 232, 0.35)',
            }}
          >
            Create Post
          </Button>
        </div>

        {/* User Mini Profile & Logout */}
        {user && (
          <div className="sidebar-footer">
            <Link
              to={`/profile/${user._id || user.username}`}
              className="sidebar-user"
              title="View your profile"
            >
              <div style={{ position: 'relative' }}>
                <Avatar
                  src={user.profilePicture}
                  name={user.fullName || user.username}
                  size="sm"
                />
                <span className="online-status-dot" />
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.fullName}</div>
                <div className="sidebar-user-handle">@{user.username}</div>
              </div>
            </Link>

            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Midnight Glass' : 'Switch to Spatial Light'}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="#f59e0b" />}
              <span>{theme === 'light' ? 'Midnight Glass' : 'Light Glass'}</span>
            </button>

            <button
              className="logout-btn"
              onClick={() => setShowLogoutConfirm(true)}
              title="Log out of SOCIALY"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Logout confirmation dialog */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Log out of Socialy?"
        message="Are you sure you want to log out? You will need to sign in again to interact with posts."
        confirmText="Log Out"
        confirmVariant="danger"
      />
    </>
  );
};

export default LeftSidebar;
