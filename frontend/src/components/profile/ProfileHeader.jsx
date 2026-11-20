import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Edit3, MapPin, Sparkles, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import FollowButton from '../common/FollowButton';
import EditProfileModal from './EditProfileModal';
import FollowListModal from './FollowListModal';

const formatJoinDate = (dateStr) => {
  if (!dateStr) return 'Joined recently';
  const d = new Date(dateStr);
  return `Joined ${d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`;
};

const ProfileHeader = ({ profileUser, onProfileUpdated }) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [followModalType, setFollowModalType] = useState(null); // 'followers' | 'following' | null

  if (!profileUser) return null;

  const isOwnProfile =
    currentUser &&
    (currentUser._id === profileUser._id || currentUser.username === profileUser.username);

  const followersCount = profileUser.followers ? profileUser.followers.length : 0;
  const followingCount = profileUser.following ? profileUser.following.length : 0;
  const postsCount = profileUser.postsCount !== undefined ? profileUser.postsCount : 0;

  return (
    <>
      <div className="glass-card profile-card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
        {/* Cover Image Banner */}
        <div
          className="profile-cover-banner"
          style={{
            height: 180,
            background: profileUser.coverImage
              ? `url(${profileUser.coverImage.startsWith('http') || profileUser.coverImage.startsWith('/') ? profileUser.coverImage : `/${profileUser.coverImage}`}) center/cover no-repeat`
              : 'linear-gradient(135deg, #7655E8 0%, #A5B4FC 100%)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))',
            }}
          />
        </div>

        {/* Profile Content Details */}
        <div style={{ padding: '0 1.5rem 1.5rem', position: 'relative' }}>
          {/* Top Row: Avatar & Action Button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: -55,
              marginBottom: '1rem',
            }}
          >
            <div style={{ border: '4px solid #fff', borderRadius: '50%', boxShadow: 'var(--shadow-glass)' }}>
              <Avatar
                src={profileUser.profilePicture}
                name={profileUser.fullName || profileUser.username}
                size="2xl"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {isOwnProfile ? (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Edit3}
                  onClick={() => setShowEditModal(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    size="md"
                    icon={MessageSquare}
                    onClick={() => navigate(`/messages?user=${profileUser._id}`)}
                  >
                    Message
                  </Button>
                  <FollowButton
                    userId={profileUser._id}
                    initialFollowing={
                      profileUser.followers
                        ? profileUser.followers.some((f) =>
                            typeof f === 'string'
                              ? f === currentUser?._id
                              : f._id === currentUser?._id
                          )
                        : false
                    }
                    size="md"
                    onFollowToggle={(isNowFollowing) => {
                      if (onProfileUpdated) {
                        const updatedFollowers = isNowFollowing
                          ? [...(profileUser.followers || []), currentUser?._id]
                          : (profileUser.followers || []).filter((f) =>
                              typeof f === 'string'
                                ? f !== currentUser?._id
                                : f._id !== currentUser?._id
                            );
                        onProfileUpdated({
                          ...profileUser,
                          followers: updatedFollowers,
                        });
                      }
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* User Names & Bio */}
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-dark)', marginBottom: 2 }}>
              {profileUser.fullName}
            </h2>
            <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '0.75rem' }}>
              @{profileUser.username}
            </div>

            {profileUser.bio && (
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-dark)', lineHeight: 1.6, maxWidth: 640 }}>
                {profileUser.bio}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                fontSize: '0.82rem',
                color: 'var(--color-text-light)',
                marginTop: '0.85rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={14} />
                <span>{formatJoinDate(profileUser.createdAt)}</span>
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(118, 85, 232, 0.1)',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                }}
              >
                <Sparkles size={12} />
                Verified Creator
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                }}
              >
                ● Active Creator
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(108, 63, 197, 0.08)',
            }}
          >
            <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text-dark)' }}>
                {postsCount}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Posts</span>
            </div>

            <button
              type="button"
              onClick={() => setFollowModalType('followers')}
              style={{
                display: 'flex',
                gap: 6,
                alignItems: 'baseline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                {followersCount}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Followers</span>
            </button>

            <button
              type="button"
              onClick={() => setFollowModalType('following')}
              style={{
                display: 'flex',
                gap: 6,
                alignItems: 'baseline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                {followingCount}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Following</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={profileUser}
          onProfileUpdated={(updated) => {
            if (onProfileUpdated) onProfileUpdated(updated);
          }}
        />
      )}

      {/* Followers / Following Modal */}
      {followModalType && (
        <FollowListModal
          isOpen={!!followModalType}
          onClose={() => setFollowModalType(null)}
          userId={profileUser._id}
          type={followModalType}
        />
      )}
    </>
  );
};

export default ProfileHeader;

