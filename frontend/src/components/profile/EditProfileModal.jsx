import React, { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { Camera, Upload, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const EditProfileModal = ({ isOpen, onClose, user, onProfileUpdated }) => {
  const { updateCurrentUser } = useAuth();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilePicture || '');
  const [coverImageUrl, setCoverImageUrl] = useState(user?.coverImage || '');

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.profilePicture || '');

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(user?.coverImage || '');

  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [usernameMessage, setUsernameMessage] = useState('');
  const checkTimeoutRef = useRef(null);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Check username if changed from original
  useEffect(() => {
    const raw = username.trim().toLowerCase().replace(/\s+/g, '_');
    if (!raw || raw === user?.username?.toLowerCase()) {
      setUsernameStatus(null);
      setUsernameMessage('');
      return;
    }

    const validFormat = /^[a-zA-Z0-9_]{3,30}$/.test(raw);
    if (!validFormat) {
      setUsernameStatus('invalid');
      setUsernameMessage('Username must be 3-30 characters (letters, numbers, _ only)');
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('Checking availability...');

    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);

    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/api/auth/check-username?username=${encodeURIComponent(raw)}`);
        if (data.available) {
          setUsernameStatus('available');
          setUsernameMessage(`@${raw} is available!`);
        } else {
          setUsernameStatus('taken');
          setUsernameMessage(`@${raw} is already taken.`);
        }
      } catch (err) {
        if (err.response?.data?.message) {
          setUsernameStatus('taken');
          setUsernameMessage(err.response.data.message);
        } else {
          setUsernameStatus(null);
          setUsernameMessage('');
        }
      }
    }, 280);

    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, [username, user?.username]);

  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) {
      addToast('Full name and username are required', 'error');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (avatarFile || coverFile) {
        const formData = new FormData();
        formData.append('fullName', fullName.trim());
        formData.append('username', username.trim());
        formData.append('bio', bio.trim());
        if (avatarFile) formData.append('profilePicture', avatarFile);
        else if (profilePictureUrl) formData.append('profilePicture', profilePictureUrl);

        if (coverFile) formData.append('coverImage', coverFile);
        else if (coverImageUrl) formData.append('coverImage', coverImageUrl);

        res = await api.put('/api/users/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.put('/api/users/profile', {
          fullName: fullName.trim(),
          username: username.trim(),
          bio: bio.trim(),
          profilePicture: profilePictureUrl,
          coverImage: coverImageUrl,
        });
      }

      updateCurrentUser(res.data);
      if (onProfileUpdated) {
        onProfileUpdated(res.data);
      }
      addToast('Profile updated successfully! ✨', 'success');
      onClose();
    } catch (err) {
      console.error('Failed to update profile:', err);
      addToast(err.response?.data?.message || 'Could not update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth={540}>
      <form onSubmit={handleSubmit}>
        {/* Cover image editor */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>
            Cover Banner
          </label>
          <div
            style={{
              position: 'relative',
              height: 120,
              borderRadius: '12px',
              overflow: 'hidden',
              background: coverPreview
                ? `url(${coverPreview}) center/cover no-repeat`
                : 'linear-gradient(135deg, #7655E8 0%, #A5B4FC 100%)',
              border: '1px solid var(--color-glass-border)',
            }}
          >
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverFile}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                background: 'rgba(0, 0, 0, 0.6)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backdropFilter: 'blur(4px)',
                cursor: 'pointer',
              }}
            >
              <Camera size={14} /> Change Cover
            </button>
          </div>
        </div>

        {/* Avatar editor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarFile}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <div style={{ position: 'relative' }}>
            <Avatar src={avatarPreview} name={fullName} size="xl" />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: 'var(--color-primary)',
                color: '#fff',
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #fff',
                cursor: 'pointer',
              }}
              title="Upload avatar"
            >
              <Upload size={14} />
            </button>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-dark)' }}>
              Profile Photo
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Recommended 400x400px. JPG, PNG or WEBP.
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Username</span>
            {usernameStatus === 'available' && (
              <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={13} /> Available
              </span>
            )}
            {usernameStatus === 'taken' && (
              <span style={{ fontSize: '0.74rem', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <XCircle size={13} /> Already exists
              </span>
            )}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              style={{
                borderColor:
                  usernameStatus === 'available'
                    ? '#10b981'
                    : usernameStatus === 'taken'
                    ? '#ef4444'
                    : undefined,
              }}
              required
            />
            <div
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {usernameStatus === 'checking' && (
                <Loader2 size={15} color="var(--color-primary)" className="spinner" />
              )}
              {usernameStatus === 'available' && <CheckCircle2 size={16} color="#10b981" />}
              {usernameStatus === 'taken' && <XCircle size={16} color="#ef4444" />}
            </div>
          </div>
          {usernameMessage && (
            <div
              style={{
                fontSize: '0.75rem',
                marginTop: '0.3rem',
                fontWeight: 600,
                color: usernameStatus === 'taken' ? '#ef4444' : '#10b981',
              }}
            >
              {usernameMessage}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Tell the community about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={usernameStatus === 'taken'}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;

