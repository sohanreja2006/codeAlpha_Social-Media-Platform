import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Home,
  Compass,
  Users,
  Bell,
  MessageSquare,
  Bookmark,
  User,
  Settings,
  PenTool,
  Sun,
  Moon,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import Avatar from './Avatar';

const CommandPalette = ({ isOpen, onClose, onOpenCreatePost }) => {
  const [query, setQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const defaultActions = [
    { id: 'home', label: 'Go to Home Feed', icon: Home, action: () => navigate('/') },
    { id: 'explore', label: 'Explore Trending Posts', icon: Compass, action: () => navigate('/explore') },
    { id: 'discover', label: 'Discover Creators', icon: Users, action: () => navigate('/discover') },
    { id: 'messages', label: 'Direct Messages', icon: MessageSquare, action: () => navigate('/messages') },
    { id: 'notifications', label: 'View Notifications', icon: Bell, action: () => navigate('/notifications') },
    { id: 'bookmarks', label: 'Saved Bookmarks', icon: Bookmark, action: () => navigate('/bookmarks') },
    { id: 'profile', label: 'View My Profile', icon: User, action: () => navigate(user ? `/profile/${user._id}` : '/login') },
    { id: 'settings', label: 'Settings & Appearance', icon: Settings, action: () => navigate('/settings') },
    {
      id: 'post',
      label: 'Create New Post',
      icon: PenTool,
      action: () => {
        if (onOpenCreatePost) onOpenCreatePost();
      },
    },
    {
      id: 'theme',
      label: theme === 'light' ? 'Switch to Midnight Glass' : 'Switch to Spatial Light',
      icon: theme === 'light' ? Moon : Sun,
      action: toggleTheme,
    },
  ];

  // Auto focus on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setUserResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Live user search when query has 2+ characters
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setUserResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/api/users/search?q=${encodeURIComponent(q)}`);
        setUserResults(data || []);
      } catch {
        setUserResults([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Filter actions by query
  const filteredActions = defaultActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation inside palette
  const totalItems = userResults.length + filteredActions.length;

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (totalItems || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (totalItems || 1)) % (totalItems || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < userResults.length) {
        const u = userResults[selectedIndex];
        navigate(`/profile/${u._id}`);
        onClose();
      } else {
        const actionIdx = selectedIndex - userResults.length;
        if (filteredActions[actionIdx]) {
          filteredActions[actionIdx].action();
          onClose();
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="command-palette-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
    >
      <div
        className="glass-card command-palette-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 580,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
          background: 'var(--color-glass-strong)',
          border: '1px solid var(--color-glass-border)',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(118, 85, 232, 0.1)',
            gap: 12,
          }}
        >
          <Search size={20} color="var(--color-primary)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '1.05rem',
              color: 'var(--color-text-dark)',
              fontFamily: 'var(--font-main)',
              fontWeight: 500,
            }}
          />
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '6px',
              background: 'rgba(118, 85, 232, 0.1)',
              color: 'var(--color-primary)',
            }}
          >
            ESC
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '0.6rem 0.5rem' }}>
          {/* User Search Results */}
          {userResults.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  padding: '4px 12px',
                  letterSpacing: '0.6px',
                }}
              >
                People
              </div>
              {userResults.map((u, i) => {
                const isSelected = selectedIndex === i;
                return (
                  <div
                    key={u._id}
                    onClick={() => {
                      navigate(`/profile/${u._id}`);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '0.55rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(118, 85, 232, 0.12)' : 'transparent',
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-text-dark)',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <Avatar src={u.profilePicture} name={u.fullName} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        @{u.username}
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ opacity: isSelected ? 1 : 0.4 }} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions / Navigation */}
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                padding: '4px 12px',
                letterSpacing: '0.6px',
              }}
            >
              Navigation & Actions
            </div>
            {filteredActions.length === 0 && userResults.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                No commands found for "{query}"
              </div>
            ) : (
              filteredActions.map((item, i) => {
                const Icon = item.icon;
                const itemIndex = userResults.length + i;
                const isSelected = selectedIndex === itemIndex;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(118, 85, 232, 0.12)' : 'transparent',
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-text-dark)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.9rem',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <Icon size={17} color={isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <ArrowRight size={14} style={{ opacity: isSelected ? 1 : 0.3 }} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer shortcuts helper */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 1.25rem',
            background: 'rgba(118, 85, 232, 0.05)',
            borderTop: '1px solid rgba(118, 85, 232, 0.08)',
            fontSize: '0.72rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span style={{ fontWeight: 600 }}>SOCIALY Spatial</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
