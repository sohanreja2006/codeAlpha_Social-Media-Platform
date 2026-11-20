import React, { useState, useRef } from 'react';
import { Image, Link2, Send, X, Sparkles, Smile, Tag } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef(null);

  const maxChars = 400;
  const charsLeft = maxChars - content.length;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast('Please select a valid image file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        addToast('Image size should be less than 5MB', 'error');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUrl('');
    }
  };

  const handleUrlAdd = () => {
    if (imageUrl.trim()) {
      setImagePreview(imageUrl.trim());
      setImageFile(null);
      setShowUrlInput(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageFile && !imageUrl) {
      addToast('Please write some content or attach an image', 'error');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (imageFile) {
        const formData = new FormData();
        formData.append('content', content.trim());
        formData.append('image', imageFile);
        res = await api.post('/api/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/api/posts', {
          content: content.trim(),
          image: imageUrl.trim() || undefined,
        });
      }

      addToast('Post published to your network! ✨', 'success');
      setContent('');
      handleRemoveImage();
      setShowUrlInput(false);

      if (onPostCreated) {
        onPostCreated(res.data);
      }
    } catch (err) {
      console.error('Failed to create post:', err);
      addToast(err.response?.data?.message || 'Failed to publish post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`glass-card create-post-card ${isFocused ? 'create-post-focused' : ''}`}
      style={{ padding: '1.25rem 1.35rem', marginBottom: '1.5rem', transition: 'all 0.25s ease' }}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '0.95rem', alignItems: 'flex-start' }}>
          <Avatar
            src={user?.profilePicture}
            name={user?.fullName || 'You'}
            size="md"
          />

          <div style={{ flex: 1 }}>
            <textarea
              className="create-post-textarea"
              placeholder={`What's on your mind, ${user?.fullName ? user.fullName.split(' ')[0] : 'creator'}?`}
              value={content}
              maxLength={maxChars}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              rows={isFocused || content.length > 50 ? 4 : 2}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                resize: 'none',
                outline: 'none',
                fontSize: '0.98rem',
                fontFamily: 'var(--font-main)',
                color: 'var(--color-text-dark)',
                lineHeight: 1.6,
                transition: 'all 0.2s ease',
              }}
            />

            {/* Image Preview */}
            {imagePreview && (
              <div
                style={{
                  position: 'relative',
                  marginTop: '0.75rem',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  maxHeight: 300,
                  boxShadow: 'var(--shadow-card)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                }}
              >
                <img
                  src={imagePreview}
                  alt="Attachment preview"
                  style={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(0, 0, 0, 0.65)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 30,
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(6px)',
                  }}
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* URL Input Bar */}
            {showUrlInput && !imagePreview && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: '0.75rem',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid rgba(108, 63, 197, 0.2)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                }}
              >
                <input
                  type="url"
                  placeholder="Paste high-res image URL (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '0.86rem',
                    fontFamily: 'var(--font-main)',
                  }}
                />
                <Button size="sm" variant="secondary" onClick={handleUrlAdd}>
                  Add
                </Button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(108, 63, 197, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                <button
                  type="button"
                  className="post-action-tool"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach Photo"
                >
                  <Image size={17} color="var(--color-primary)" />
                  <span className="tool-label">Photo</span>
                </button>

                <button
                  type="button"
                  className="post-action-tool"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  title="Attach by URL"
                >
                  <Link2 size={17} color="var(--color-secondary)" />
                  <span className="tool-label">Link</span>
                </button>

                <button
                  type="button"
                  className="post-action-tool"
                  onClick={() => setContent((prev) => prev + ' #Glassmorphism')}
                  title="Add trending tag"
                >
                  <Tag size={16} color="#10b981" />
                  <span className="tool-label">#Tag</span>
                </button>

                <button
                  type="button"
                  className="post-action-tool"
                  onClick={() => setContent((prev) => prev + ' ✨')}
                  title="Add sparkle"
                >
                  <Sparkles size={16} color="#f59e0b" />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                {content.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="24" height="24" style={{ transform: 'rotate(-90deg)' }}>
                      <circle
                        cx="12"
                        cy="12"
                        r={9}
                        fill="none"
                        stroke="rgba(118, 85, 232, 0.15)"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r={9}
                        fill="none"
                        stroke={charsLeft < 20 ? '#ef4444' : charsLeft < 60 ? '#f59e0b' : 'var(--color-primary)'}
                        strokeWidth="2.5"
                        strokeDasharray={2 * Math.PI * 9}
                        strokeDashoffset={2 * Math.PI * 9 - (Math.min(100, (content.length / maxChars) * 100) / 100) * (2 * Math.PI * 9)}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.15s ease, stroke 0.2s' }}
                      />
                    </svg>
                    {charsLeft <= 50 && (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: charsLeft < 20 ? '#ef4444' : '#f59e0b',
                        }}
                      >
                        {charsLeft}
                      </span>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={loading}
                  disabled={!content.trim() && !imageFile && !imageUrl}
                  icon={Send}
                  style={{
                    padding: '0.5rem 1.25rem',
                    boxShadow: '0 4px 14px rgba(108, 63, 197, 0.3)',
                  }}
                >
                  Publish
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
