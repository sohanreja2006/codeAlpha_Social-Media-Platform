import React, { useState, useEffect } from 'react';
import { Bookmark, Sparkles, FolderArchive } from 'lucide-react';
import api from '../api/axios';
import PostCard from '../components/feed/PostCard';
import { PostSkeleton } from '../components/common/LoadingSkeleton';

const BookmarksPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For bookmarks, we can fetch recent explore posts as bookmarked or let the user save
    const fetchBookmarks = async () => {
      try {
        const { data } = await api.get('/api/posts/explore');
        // show first 2 as bookmarked for preview demo
        setPosts(data ? data.slice(0, 2) : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  return (
    <div className="bookmarks-page">
      <div className="glass-card-flat" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
            <Bookmark size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>
              Bookmarks
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Posts and resources you have saved for later.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <PostSkeleton />
      ) : posts.length === 0 ? (
        <div className="glass-card empty-state">
          <FolderArchive size={48} />
          <h3>No bookmarks saved</h3>
          <p>Tap the bookmark icon on any post to save it here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {posts.map((post) => (
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

export default BookmarksPage;

