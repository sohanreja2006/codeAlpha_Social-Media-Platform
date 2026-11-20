import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, UserPlus, TrendingUp, Sparkles, X } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import FollowButton from '../components/common/FollowButton';

/* ─── Skeleton card ─────────────────────────────────────── */
const UserCardSkeleton = () => (
  <div className="discover-user-card skeleton-card">
    <div className="skeleton skeleton-avatar-lg" />
    <div style={{ flex: 1 }}>
      <div className="skeleton skeleton-line" style={{ width: '55%', marginBottom: '0.4rem' }} />
      <div className="skeleton skeleton-line" style={{ width: '35%', marginBottom: '0.6rem' }} />
      <div className="skeleton skeleton-line" style={{ width: '80%' }} />
    </div>
    <div className="skeleton" style={{ width: 88, height: 36, borderRadius: 'var(--radius-pill)' }} />
  </div>
);

/* ─── Single user card ───────────────────────────────────── */
const UserCard = ({ user, currentUserId }) => {
  const navigate = useNavigate();
  const isMe = user._id === currentUserId;

  return (
    <div className="discover-user-card glass-card-flat">
      {/* clickable avatar / info area */}
      <button
        className="discover-user-info"
        onClick={() => navigate(`/profile/${user._id}`)}
        title={`Visit @${user.username}'s profile`}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar
            src={user.profilePicture}
            name={user.fullName || user.username}
            size="lg"
          />
          {/* online indicator (decorative) */}
          <span
            style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'var(--color-success)',
              border: '2px solid white',
            }}
          />
        </div>

        <div className="discover-user-text">
          <div className="discover-user-name">{user.fullName || user.username}</div>
          <div className="discover-user-handle">@{user.username}</div>
          {user.bio && (
            <div className="discover-user-bio">{user.bio}</div>
          )}
          <div className="discover-user-stats">
            <span>
              <strong>{user.followers?.length ?? 0}</strong> followers
            </span>
            <span style={{ margin: '0 0.4rem', opacity: 0.3 }}>·</span>
            <span>
              <strong>{user.following?.length ?? 0}</strong> following
            </span>
          </div>
        </div>
      </button>

      {/* follow button */}
      {!isMe && (
        <FollowButton
          userId={user._id}
          initialFollowing={user.isFollowing ?? false}
          size="sm"
        />
      )}
      {isMe && (
        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
          That's you!
        </span>
      )}
    </div>
  );
};

/* ─── Discover Page ──────────────────────────────────────── */
const DiscoverPage = () => {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  /* load suggested users on mount */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/users/suggestions');
        setSuggestions(data);
      } catch {
        /* ignore */
      } finally {
        setSuggestionsLoading(false);
      }
    })();
  }, []);

  /* debounced search */
  const handleQueryChange = useCallback((e) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/api/users/search?q=${encodeURIComponent(val.trim())}`);
        setResults(data);
        setHasSearched(true);
      } catch {
        setResults([]);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const isSearching = query.trim().length > 0;

  return (
    <div className="discover-page">
      {/* ── Page Header ── */}
      <div className="discover-header glass-card-flat">
        <div className="discover-header-top">
          <div>
            <h1 className="discover-title">
              <Users size={24} style={{ marginRight: '0.5rem', color: 'var(--color-primary)' }} />
              Discover People
            </h1>
            <p className="discover-subtitle">
              Find and connect with amazing people on SOCIALY
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.9rem',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(118, 85, 232, 0.08)',
              fontSize: '0.8rem',
              color: 'var(--color-primary)',
              fontWeight: 700,
            }}
          >
            <TrendingUp size={14} />
            Live search
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="discover-search-wrap">
          <Search size={18} className="discover-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="discover-search-input"
            placeholder="Search by name or username…"
            value={query}
            onChange={handleQueryChange}
            autoFocus
          />
          {query && (
            <button className="discover-clear-btn" onClick={clearSearch} title="Clear">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Results area ── */}
      {isSearching ? (
        <section className="discover-section">
          <div className="discover-section-header">
            <h2 className="discover-section-title">
              <Search size={16} />
              {loading ? 'Searching…' : `Results for "${query}"`}
            </h2>
            {!loading && hasSearched && (
              <span className="discover-count-badge">
                {results.length} {results.length === 1 ? 'person' : 'people'}
              </span>
            )}
          </div>

          <div className="discover-list">
            {loading && [1, 2, 3].map((k) => <UserCardSkeleton key={k} />)}

            {!loading && hasSearched && results.length === 0 && (
              <div className="discover-empty">
                <div className="discover-empty-icon">🔍</div>
                <div className="discover-empty-title">No users found</div>
                <div className="discover-empty-sub">
                  Try a different name or username
                </div>
              </div>
            )}

            {!loading &&
              results.map((u) => (
                <UserCard key={u._id} user={u} currentUserId={currentUser?._id} />
              ))}
          </div>
        </section>
      ) : (
        /* ── Suggested people (default view) ── */
        <section className="discover-section">
          <div className="discover-section-header">
            <h2 className="discover-section-title">
              <Sparkles size={16} />
              People you might know
            </h2>
            {!suggestionsLoading && (
              <span className="discover-count-badge">{suggestions.length} suggestions</span>
            )}
          </div>

          <div className="discover-list">
            {suggestionsLoading && [1, 2, 3, 4].map((k) => <UserCardSkeleton key={k} />)}

            {!suggestionsLoading && suggestions.length === 0 && (
              <div className="discover-empty">
                <div className="discover-empty-icon">🌐</div>
                <div className="discover-empty-title">You're following everyone!</div>
                <div className="discover-empty-sub">
                  Search above to find even more people
                </div>
              </div>
            )}

            {!suggestionsLoading &&
              suggestions.map((u) => (
                <UserCard
                  key={u._id}
                  user={{ ...u, isFollowing: false }}
                  currentUserId={currentUser?._id}
                />
              ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default DiscoverPage;

