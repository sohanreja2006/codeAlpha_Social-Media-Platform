import React, { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from './Button';
import { UserCheck, UserPlus } from 'lucide-react';

const FollowButton = ({
  userId,
  initialFollowing = false,
  onFollowToggle,
  size = 'sm',
  className = '',
}) => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Don't show follow button for self
  if (!userId || (currentUser && currentUser._id === userId)) {
    return null;
  }

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      const { data } = await api.post(`/api/users/${userId}/follow`);
      const newState = data.following;
      setFollowing(newState);
      if (onFollowToggle) {
        onFollowToggle(newState);
      }
      addToast(data.message || (newState ? 'Followed user' : 'Unfollowed user'), 'info');
    } catch (err) {
      console.error('Follow toggle error:', err);
      addToast(err.response?.data?.message || 'Could not update follow status', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={following ? (isHovered ? 'danger' : 'secondary') : 'primary'}
      size={size}
      loading={loading}
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`follow-btn ${className}`}
      style={{ minWidth: 96, transition: 'all 0.2s ease' }}
    >
      {following ? (
        isHovered ? (
          'Unfollow'
        ) : (
          <>
            <UserCheck size={14} style={{ marginRight: 4 }} />
            Following
          </>
        )
      ) : (
        <>
          <UserPlus size={14} style={{ marginRight: 4 }} />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;

