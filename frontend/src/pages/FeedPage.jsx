import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StoriesBar from '../components/feed/StoriesBar';
import CreatePost from '../components/feed/CreatePost';
import PostCard from '../components/feed/PostCard';
import { PostSkeleton } from '../components/common/LoadingSkeleton';
import { Sparkles, MessageSquareDashed, Flame, Users, Compass, RefreshCw } from 'lucide-react';

const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('forYou'); // 'forYou' | 'following' | 'popular'

  const fetchFeed = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const { data } = await api.get('/api/posts/feed');
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
      if (showRefreshing) setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Filtered and sorted posts
  const displayedPosts = useMemo(() => {
    if (activeTab === 'popular') {
      return [...posts].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    }
    if (activeTab === 'following' && user?.following?.length) {
      const followingIds = user.following.map((f) => (typeof f === 'string' ? f : f._id));
      const filtered = posts.filter((p) => followingIds.includes(p.author?._id));
      return filtered.length > 0 ? filtered : posts;
    }
    return posts;
  }, [posts, activeTab, user?.following]);

  return (
    <div className="feed-page">
      {/* Welcome Header */}
      <div className="welcome-header glass-card-flat" style={{ padding: '1.35rem 1.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-dark)', marginBottom: 3 }}>
              {getGreeting()},{' '}
              <span className="gradient-text">{user?.fullName ? user.fullName.split(' ')[0] : 'Creator'}</span>
            </h1>
            <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', margin: 0 }}>
              See what your creative network is crafting today.
            </p>
          </div>
          <button
            type="button"
            className="btn-icon-subtle"
            onClick={() => fetchFeed(true)}
            title="Refresh feed"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(118, 85, 232, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              border: 'none',
              transition: 'transform 0.25s, background 0.2s',
            }}
          >
            <RefreshCw size={18} className={isRefreshing ? 'spin-animation' : ''} />
          </button>
        </div>
      </div>

      {/* Stories Section */}
      <StoriesBar />

      {/* Post Composer */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Feed Filter Tab Bar */}
      <div
        className="feed-filter-bar glass-card-flat"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.4rem 0.6rem',
          marginBottom: '1.25rem',
          borderRadius: 'var(--radius-pill)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            className={`feed-tab-btn ${activeTab === 'forYou' ? 'active' : ''}`}
            onClick={() => setActiveTab('forYou')}
          >
            <Compass size={15} />
            <span>For You</span>
          </button>
          <button
            type="button"
            className={`feed-tab-btn ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            <Users size={15} />
            <span>Following</span>
          </button>
          <button
            type="button"
            className={`feed-tab-btn ${activeTab === 'popular' ? 'active' : ''}`}
            onClick={() => setActiveTab('popular')}
          >
            <Flame size={15} />
            <span>Popular</span>
          </button>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', paddingRight: '0.75rem', fontWeight: 600 }}>
          {displayedPosts.length} {displayedPosts.length === 1 ? 'post' : 'posts'}
        </div>
      </div>

      {/* Posts Stream */}
      {loading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : displayedPosts.length === 0 ? (
        <div className="glass-card empty-state" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <MessageSquareDashed size={48} style={{ opacity: 0.35, color: 'var(--color-primary)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>
            No posts in your feed yet
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', maxWidth: 360, margin: '0 auto' }}>
            Be the first to share an update or follow other creators to fill your feed!
          </p>
        </div>
      ) : (
        <div className="posts-stream" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {displayedPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedPage;

