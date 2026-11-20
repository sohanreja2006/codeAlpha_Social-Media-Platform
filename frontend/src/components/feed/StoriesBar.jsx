import React, { useState, useEffect } from 'react';
import Avatar from '../common/Avatar';
import { Plus, X, Heart, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const demoStories = [
  {
    id: 's1',
    name: 'Elena',
    fullName: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    storyImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    caption: 'Exploring modern glass token elevation tiers in our design sprint! 🎨✨',
    time: '2h ago',
    hasUnseen: true,
  },
  {
    id: 's2',
    name: 'Marcus',
    fullName: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    storyImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    caption: 'Zero latency database queries with WiredTiger engine. Beautiful code! 💻⚡',
    time: '4h ago',
    hasUnseen: true,
  },
  {
    id: 's3',
    name: 'Sophia',
    fullName: 'Sophia Chen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    storyImage: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80',
    caption: 'Sunset research on conversational UI architectures. 🌅',
    time: '6h ago',
    hasUnseen: true,
  },
  {
    id: 's4',
    name: 'Julian',
    fullName: 'Julian Hayes',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    storyImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    caption: 'CSS custom properties are the future of adaptive design systems. 🚀',
    time: '8h ago',
    hasUnseen: false,
  },
  {
    id: 's5',
    name: 'Liam',
    fullName: 'Liam Miller',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    storyImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
    caption: 'Tactile interaction feedback on modern touch screens. 💜',
    time: '12h ago',
    hasUnseen: false,
  },
];

const StoriesBar = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeStory, setActiveStory] = useState(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [replyText, setReplyText] = useState('');

  // Auto-progress timer for active story
  useEffect(() => {
    if (!activeStory) {
      setStoryProgress(0);
      return;
    }

    setStoryProgress(0);
    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setActiveStory(null);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStory]);

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addToast(`Reply sent to ${activeStory.name}! ✨`, 'success');
    setReplyText('');
    setActiveStory(null);
  };

  return (
    <>
      <div className="stories-bar glass-card" style={{ padding: '0.95rem 1.15rem', marginBottom: '1.35rem' }}>
        <div style={{ display: 'flex', gap: '1.1rem', overflowX: 'auto', paddingBottom: 4 }}>
          {/* Your Story (+) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onClick={() => addToast('Story creator is ready! Tap create post to share.', 'info')}
          >
            <div style={{ position: 'relative' }}>
              <div className="story-ring story-ring-self">
                <Avatar
                  src={user?.profilePicture}
                  name={user?.fullName || 'You'}
                  size="lg"
                />
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                  boxShadow: '0 2px 6px rgba(108, 63, 197, 0.4)',
                }}
              >
                <Plus size={13} strokeWidth={3} />
              </div>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--color-text-dark)' }}>
              Your Story
            </span>
          </div>

          {/* Creator Stories */}
          {demoStories.map((story) => (
            <div
              key={story.id}
              onClick={() => setActiveStory(story)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <div
                className={`story-ring ${story.hasUnseen ? 'story-ring-active' : 'story-ring-viewed'}`}
              >
                <Avatar src={story.avatar} name={story.name} size="lg" />
              </div>
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--color-text-dark)' }}>
                {story.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Story Viewer Modal */}
      {activeStory && (
        <div
          className="story-modal-overlay"
          onClick={() => setActiveStory(null)}
        >
          <div
            className="story-modal-card glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top segmented progress bar */}
            <div className="story-progress-bar-bg">
              <div
                className="story-progress-bar-fill"
                style={{ width: `${storyProgress}%` }}
              />
            </div>

            {/* Author bar */}
            <div className="story-author-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar src={activeStory.avatar} name={activeStory.name} size="sm" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>
                    {activeStory.fullName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {activeStory.time}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="story-close-btn"
                onClick={() => setActiveStory(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Visual content */}
            <div className="story-media-container">
              <img
                src={activeStory.storyImage}
                alt="Story media"
                className="story-img"
              />
              <div className="story-caption-overlay">
                <p>{activeStory.caption}</p>
              </div>
            </div>

            {/* Bottom response input */}
            <form onSubmit={handleSendReply} className="story-reply-form">
              <input
                type="text"
                placeholder={`Reply to ${activeStory.name}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="story-reply-input"
              />
              <button type="submit" className="story-reply-send">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default StoriesBar;
