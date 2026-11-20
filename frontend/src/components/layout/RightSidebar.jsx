import React, { useState } from 'react';
import { Search, X, Hash, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SuggestedUsers from '../widgets/SuggestedUsers';
import TrendingTopics from '../widgets/TrendingTopics';
import CommunityDiscovery from '../widgets/CommunityDiscovery';

const popularKeywords = ['Glassmorphism', 'React19', 'Elena', 'Marcus', 'Sophia'];

const RightSidebar = ({ onOpenPalette }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsFocused(false);
    }
  };

  const handleSelectKeyword = (kw) => {
    setSearchTerm(kw);
    navigate(`/explore?q=${encodeURIComponent(kw)}`);
    setIsFocused(false);
  };

  return (
    <aside className="sidebar-right">
      {/* Search Bar */}
      <div style={{ position: 'relative' }}>
        <form onSubmit={handleSearchSubmit} className="search-bar-wrap">
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: isFocused ? 'var(--color-primary)' : 'var(--color-text-light)',
                transition: 'color 0.2s',
              }}
            />
            <input
              type="text"
              placeholder="Search creators, topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className="form-input"
              style={{
                paddingLeft: 40,
                paddingRight: searchTerm ? 36 : 48,
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255, 255, 255, 0.75)',
                border: isFocused ? '1.5px solid var(--color-primary)' : '1.5px solid rgba(118, 85, 232, 0.15)',
                boxShadow: isFocused ? '0 0 0 3px rgba(118, 85, 232, 0.14)' : 'none',
              }}
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-light)',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                <X size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenPalette}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(118, 85, 232, 0.08)',
                  border: '1px solid rgba(118, 85, 232, 0.18)',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  letterSpacing: '0.5px',
                }}
                title="Open Command Palette (⌘K)"
              >
                ⌘K
              </button>
            )}
          </div>
        </form>

        {/* Quick Search Preview Popover */}
        {isFocused && (
          <div className="search-popover glass-card">
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 8 }}>
              Popular searches
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {popularKeywords.map((kw) => (
                <div
                  key={kw}
                  onMouseDown={() => handleSelectKeyword(kw)}
                  className="search-popover-item"
                >
                  <Hash size={13} color="var(--color-primary-light)" />
                  <span>{kw}</span>
                  <ArrowRight size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggested Users */}
      <SuggestedUsers />

      {/* Trending Topics */}
      <TrendingTopics />

      {/* Community Discovery */}
      <CommunityDiscovery />
    </aside>
  );
};

export default RightSidebar;
