import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Trash2, BadgeCheck } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Avatar from '../common/Avatar';
import ConfirmationModal from '../common/ConfirmationModal';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffInSec = Math.floor((now - date) / 1000);

  if (diffInSec < 60) return 'just now';
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const quickEmojis = ['❤️', '🔥', '👏', '🚀', '✨', '💡', '💜'];

const CommentSection = ({ postId, initialComments = [], onCommentAdded, onCommentDeleted }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post('/api/comments', {
        postId,
        content: content.trim(),
      });
      setComments((prev) => [...prev, data]);
      setContent('');
      if (onCommentAdded) {
        onCommentAdded(data);
      }
      addToast('Comment added!', 'success');
    } catch (err) {
      console.error('Failed to post comment:', err);
      addToast(err.response?.data?.message || 'Could not post comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/comments/${commentToDelete._id}`);
      setComments((prev) => prev.filter((c) => c._id !== commentToDelete._id));
      if (onCommentDeleted) {
        onCommentDeleted(commentToDelete._id);
      }
      addToast('Comment deleted', 'info');
      setCommentToDelete(null);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      addToast(err.response?.data?.message || 'Could not delete comment', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddEmoji = (emoji) => {
    setContent((prev) => prev + emoji);
  };

  return (
    <div className="comment-section" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(108, 63, 197, 0.08)' }}>
      {/* List of comments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem' }}>
        {comments.map((comment) => {
          const author = comment.author || {};
          const isOwn = user && (author._id === user._id || author.id === user._id);

          return (
            <div key={comment._id} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
              <Link to={`/profile/${author._id || author.username}`}>
                <Avatar src={author.profilePicture} name={author.fullName || author.username} size="xs" />
              </Link>

              <div
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '14px',
                  padding: '0.65rem 0.95rem',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Link
                    to={`/profile/${author._id || author.username}`}
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--color-text-dark)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <span>{author.fullName || author.username}</span>
                    <BadgeCheck size={13} className="verified-badge-icon" />
                  </Link>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>

                <p style={{ fontSize: '0.86rem', color: 'var(--color-text-dark)', margin: 0, wordBreak: 'break-word', lineHeight: 1.5 }}>
                  {comment.content}
                </p>

                {isOwn && (
                  <button
                    type="button"
                    onClick={() => setCommentToDelete(comment)}
                    style={{
                      position: 'absolute',
                      right: 8,
                      bottom: 6,
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-light)',
                      cursor: 'pointer',
                      padding: 2,
                    }}
                    title="Delete comment"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Emoji Reaction Pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '0.5rem', paddingLeft: 34 }}>
        {quickEmojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleAddEmoji(emoji)}
            className="emoji-quick-btn"
            title="Quick reaction"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input row */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Avatar src={user?.profilePicture} name={user?.fullName || 'You'} size="xs" />
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Add a constructive thought..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
            className="form-input"
            style={{
              padding: '0.55rem 2.5rem 0.55rem 0.95rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(255, 255, 255, 0.75)',
            }}
          />
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            style={{
              position: 'absolute',
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--gradient-primary)',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: content.trim() ? 'pointer' : 'default',
              opacity: content.trim() ? 1 : 0.4,
              transition: 'all 0.2s',
            }}
          >
            <Send size={13} />
          </button>
        </div>
      </form>

      {/* Delete comment confirmation modal */}
      <ConfirmationModal
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        onConfirm={handleDeleteComment}
        title="Delete Comment?"
        message="Are you sure you want to delete this comment? This cannot be reversed."
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
};

export default CommentSection;
