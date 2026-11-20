import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Compass, Sparkles, Filter } from 'lucide-react';
import api from '../api/axios';
import PostCard from '../components/feed/PostCard';
import { PostSkeleton } from '../components/common/LoadingSkeleton';

const categories = ['All', 'Glassmorphism', 'React19', 'SpatialDesign', 'WebDevNext', 'AIEthics', 'UI/UX'];

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const tagParam = searchParams.get('tag') || '';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(queryParam || tagParam || '');
  const [activeCategory, setActiveCategory] = useState(tagParam || 'All');

  const fetchExplorePosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/posts/explore');
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to load explore feed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExplorePosts();
  }, [fetchExplorePosts]);

  useEffect(() => {
    if (tagParam) {
      setActiveCategory(tagParam);
      setSearchQuery(tagParam);
    } else if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [tagParam, queryParam]);

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      setSearchQuery('');
      setSearchParams({});
    } else {
      setSearchQuery(cat);
      setSearchParams({ tag: cat });
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const contentMatch = p.content?.toLowerCase().includes(q);
    const authorMatch =
      p.author?.fullName?.toLowerCase().includes(q) ||
      p.author?.username?.toLowerCase().includes(q);
    return contentMatch || authorMatch;
  });

  return (
    <div className="explore-page">
      {/* Header */}
      <div className="glass-card-flat" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7655E8 0%, #A5B4FC 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Compass size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>
              Explore Socialy
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Discover innovative ideas, trending topics, and visionary makers.
            </p>
          </div>
        </div>

        {/* Search input inside header */}
        <div style={{ position: 'relative', marginTop: '0.75rem' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-light)',
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search keywords, topics, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: 42,
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(255, 255, 255, 0.85)',
            }}
          />
        </div>

        {/* Category Pills */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingTop: '0.85rem',
            paddingBottom: '0.25rem',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className="chip"
              style={{
                background:
                  activeCategory === cat
                    ? 'var(--color-primary)'
                    : 'rgba(108, 63, 197, 0.08)',
                color: activeCategory === cat ? '#fff' : 'var(--color-primary)',
                fontWeight: 600,
                border: 'none',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : filteredPosts.length === 0 ? (
        <div className="glass-card empty-state">
          <Filter size={48} />
          <h3>No matching posts found</h3>
          <p>Try searching for a different keyword or topic tag.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;

