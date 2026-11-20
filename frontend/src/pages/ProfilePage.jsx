import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/profile/ProfileHeader';
import PostCard from '../components/feed/PostCard';
import CreatePost from '../components/feed/CreatePost';
import { PostSkeleton, ProfileSkeleton } from '../components/common/LoadingSkeleton';
import { Grid, Image as ImageIcon, MessageSquareDashed } from 'lucide-react';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'media'

  const targetId = id || currentUser?._id;

  const fetchProfileAndPosts = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const [userRes, postsRes] = await Promise.all([
        api.get(`/api/users/${targetId}`),
        api.get(`/api/users/${targetId}/posts`),
      ]);
      setProfileUser(userRes.data);
      setPosts(postsRes.data || []);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    fetchProfileAndPosts();
  }, [fetchProfileAndPosts]);

  const isOwnProfile =
    currentUser &&
    profileUser &&
    (currentUser._id === profileUser._id || currentUser.username === profileUser.username);

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
    setProfileUser((prev) => ({
      ...prev,
      postsCount: Math.max(0, (prev?.postsCount || 1) - 1),
    }));
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setProfileUser((prev) => ({
      ...prev,
      postsCount: (prev?.postsCount || 0) + 1,
    }));
  };

  if (loading) {
    return (
      <div className="profile-page">
        <ProfileSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="glass-card empty-state" style={{ margin: '2rem 0' }}>
        <h3>User not found</h3>
        <p>The profile you are looking for does not exist or may have been deleted.</p>
      </div>
    );
  }

  const mediaPosts = posts.filter((p) => !!p.image);

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <ProfileHeader
        profileUser={profileUser}
        onProfileUpdated={(updated) => setProfileUser(updated)}
      />

      {/* If own profile, provide post composer option */}
      {isOwnProfile && <CreatePost onPostCreated={handlePostCreated} />}

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid rgba(108, 63, 197, 0.1)',
          paddingBottom: '0.5rem',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            color: activeTab === 'posts' ? '#fff' : 'var(--color-text-muted)',
            backgroundColor: activeTab === 'posts' ? 'var(--color-primary)' : 'transparent',
            transition: 'all 0.2s',
          }}
        >
          <Grid size={16} />
          <span>All Posts ({posts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('media')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            color: activeTab === 'media' ? '#fff' : 'var(--color-text-muted)',
            backgroundColor: activeTab === 'media' ? 'var(--color-primary)' : 'transparent',
            transition: 'all 0.2s',
          }}
        >
          <ImageIcon size={16} />
          <span>Photos & Media ({mediaPosts.length})</span>
        </button>
      </div>

      {/* Content Stream */}
      {activeTab === 'posts' ? (
        posts.length === 0 ? (
          <div className="glass-card empty-state">
            <MessageSquareDashed size={48} />
            <h3>No posts yet</h3>
            <p>{profileUser.fullName} has not published any posts.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostDeleted={handlePostDeleted}
              />
            ))}
          </div>
        )
      ) : mediaPosts.length === 0 ? (
        <div className="glass-card empty-state">
          <ImageIcon size={48} />
          <h3>No media uploaded</h3>
          <p>Photos shared in posts will appear in this gallery.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {mediaPosts.map((post) => (
            <div
              key={post._id}
              className="glass-card"
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                aspectRatio: '1 / 1',
                position: 'relative',
              }}
            >
              <img
                src={
                  post.image.startsWith('http') || post.image.startsWith('data:')
                    ? post.image
                    : post.image.startsWith('/')
                    ? post.image
                    : `/${post.image}`
                }
                alt="Media thumbnail"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

