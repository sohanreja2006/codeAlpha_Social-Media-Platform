import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Bookmark,
  BadgeCheck,
  Maximize2,
  X,
  Sparkles,
  Copy,
  ExternalLink,
  Send,
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Avatar from '../common/Avatar';
import CommentSection from './CommentSection';
import ConfirmationModal from '../common/ConfirmationModal';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffInSec = Math.floor((now - date) / 1000);

  if (diffInSec < 60) return 'just now';
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const PostCard = ({ post, onPostDeleted }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const author = post.author || {};
  const isOwnPost = user && (author._id === user._id || author.id === user._id);

  // Likes state
  const initialLiked = post.likes
    ? post.likes.some((id) => (typeof id === 'string' ? id === user?._id : id?._id === user?._id))
    : false;
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(post.likes ? post.likes.length : 0);
  const [likeAnimating, setLikeAnimating] = useState(false);

  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentsCount, setCommentsCount] = useState(post.comments ? post.comments.length : 0);

  // Bookmarked state
  const [bookmarked, setBookmarked] = useState(false);

  // Share popover state
  const [shareOpen, setShareOpen] = useState(false);

  // Floating heart burst animation
  const [floatingHearts, setFloatingHearts] = useState([]);

  // Lightbox full image modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Like toggle
  const handleLike = async () => {
    if (!user) {
      addToast('Please log in to like posts', 'info');
      return;
    }

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    if (nextLiked) {
      setLikeAnimating(true);
      // Spawn 3 floating hearts
      const newHearts = [
        { id: Date.now() + 1, left: 20 },
        { id: Date.now() + 2, left: 35 },
        { id: Date.now() + 3, left: 10 },
      ];
      setFloatingHearts(newHearts);
      setTimeout(() => setFloatingHearts([]), 750);
    }

    try {
      const { data } = await api.post(`/api/posts/${post._id}/like`);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (err) {
      console.error('Like toggle failed:', err);
      setLiked(!nextLiked);
      setLikesCount((prev) => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
      addToast('Could not update like', 'error');
    } finally {
      setTimeout(() => setLikeAnimating(false), 500);
    }
  };

  // Delete post
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/posts/${post._id}`);
      addToast('Post deleted successfully', 'info');
      if (onPostDeleted) {
        onPostDeleted(post._id);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      addToast(err.response?.data?.message || 'Could not delete post', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Share post
  const handleShare = () => {
    const postUrl = `${window.location.origin}/#post-${post._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postUrl);
      addToast('Post link copied to clipboard! 📋', 'success');
    } else {
      addToast('Post link ready to share!', 'info');
    }
  };

  // Bookmark toggle
  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    addToast(bookmarked ? 'Removed from bookmarks' : 'Saved to your bookmarks! 🔖', 'info');
  };

  // Double-click media to like
  const handleMediaDoubleClick = (e) => {
    e.stopPropagation();
    if (!liked) {
      handleLike();
    }
  };

  // Render text with clickable #hashtags and @mentions
  const renderFormattedContent = (text) => {
    if (!text) return null;
    const parts = text.split(/([#@][a-zA-Z0-9_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        const cleanTag = part.slice(1);
        return (
          <span
            key={index}
            className="post-hashtag"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/explore?tag=${encodeURIComponent(cleanTag)}`);
            }}
            title={`Explore #${cleanTag}`}
          >
            {part}
          </span>
        );
      }
      if (part.startsWith('@')) {
        return (
          <Link
            key={index}
            to={`/profile/${part.slice(1)}`}
            className="post-mention"
            onClick={(e) => e.stopPropagation()}
            title={`View @${part.slice(1)}`}
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  const imageSrc = post.image
    ? post.image.startsWith('http') || post.image.startsWith('data:')
      ? post.image
      : post.image.startsWith('/')
      ? post.image
      : `/${post.image}`
    : null;

  return (
    <>
      <article className="glass-card post-card" id={`post-${post._id}`}>
        {/* Header */}
        <div className="post-header">
          <Link to={`/profile/${author._id || author.username}`} className="post-author-link">
            <div style={{ position: 'relative' }}>
              <Avatar
                src={author.profilePicture}
                name={author.fullName || author.username}
                size="md"
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="post-author-name">{author.fullName || 'Anonymous'}</span>
                <BadgeCheck size={16} className="verified-badge-icon" />
              </div>
              <div className="post-author-meta">
                <span>@{author.username || 'user'}</span>
                <span className="dot-sep">•</span>
                <span>{formatTime(post.createdAt)}</span>
              </div>
            </div>
          </Link>

          {isOwnPost && (
            <button
              className="btn-icon-subtle"
              onClick={() => setShowDeleteModal(true)}
              title="Delete post"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="post-body">
          <p className="post-text">{renderFormattedContent(post.content)}</p>

          {imageSrc && (
            <div
              className="post-media-container"
              onClick={() => setLightboxOpen(true)}
              onDoubleClick={handleMediaDoubleClick}
              title="Click to expand (Double-click to like ❤️)"
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <img
                src={imageSrc}
                alt="Post visual"
                className="post-media-img"
                loading="lazy"
              />
              <div className="expand-overlay-hint">
                <Maximize2 size={16} />
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="post-actions" style={{ position: 'relative' }}>
          {/* Floating Heart Particles */}
          {floatingHearts.map((h) => (
            <span
              key={h.id}
              className="floating-heart-particle"
              style={{ left: h.left, bottom: 25 }}
            >
              ❤️
            </span>
          ))}

          {/* Like */}
          <button
            type="button"
            className={`action-btn ${liked ? 'active-like' : ''} ${likeAnimating ? 'pulse-heart' : ''}`}
            onClick={handleLike}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            <span>{likesCount}</span>
          </button>

          {/* Comment */}
          <button
            type="button"
            className={`action-btn ${showComments ? 'active-comment' : ''}`}
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={18} fill={showComments ? 'currentColor' : 'none'} />
            <span>{commentsCount}</span>
          </button>

          {/* Share */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className={`action-btn ${shareOpen ? 'active-comment' : ''}`}
              onClick={() => setShareOpen(!shareOpen)}
              title="Share post"
            >
              <Share2 size={18} />
            </button>

            {/* Share Popover Sheet */}
            {shareOpen && (
              <div
                className="share-popover-card"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="share-popover-item"
                  onClick={() => {
                    handleShare();
                    setShareOpen(false);
                  }}
                >
                  <Copy size={15} color="var(--color-primary)" />
                  <span>Copy Direct Link</span>
                </button>

                <button
                  type="button"
                  className="share-popover-item"
                  onClick={() => {
                    navigate('/messages');
                    setShareOpen(false);
                  }}
                >
                  <Send size={15} color="var(--color-primary)" />
                  <span>Send in Messages</span>
                </button>

                <button
                  type="button"
                  className="share-popover-item"
                  onClick={() => {
                    const postUrl = `${window.location.origin}/#post-${post._id}`;
                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        post.content ? post.content.slice(0, 100) + '... via @Socialy' : 'Check out this post on SOCIALY!'
                      )}&url=${encodeURIComponent(postUrl)}`,
                      '_blank'
                    );
                    setShareOpen(false);
                  }}
                >
                  <ExternalLink size={15} color="var(--color-primary)" />
                  <span>Share on Twitter / X</span>
                </button>
              </div>
            )}
          </div>

          {/* Bookmark */}
          <button
            type="button"
            className={`action-btn ${bookmarked ? 'active-bookmark' : ''}`}
            onClick={handleBookmark}
            title="Save post"
            style={{ marginLeft: 'auto' }}
          >
            <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Expandable Comments */}
        {showComments && (
          <CommentSection
            postId={post._id}
            initialComments={comments}
            onCommentAdded={(newComment) => {
              setComments((prev) => [...prev, newComment]);
              setCommentsCount((prev) => prev + 1);
            }}
            onCommentDeleted={(deletedId) => {
              setComments((prev) => prev.filter((c) => c._id !== deletedId));
              setCommentsCount((prev) => Math.max(0, prev - 1));
            }}
          />
        )}

        {/* Delete confirmation modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Post?"
          message="Are you sure you want to permanently delete this post? All likes and comments on it will also be removed."
          confirmText="Delete"
          loading={deleting}
        />
      </article>

      {/* Image Lightbox Preview Modal */}
      {lightboxOpen && imageSrc && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="lightbox-close-btn"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={22} />
          </button>
          <img
            src={imageSrc}
            alt="Full size preview"
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default PostCard;
