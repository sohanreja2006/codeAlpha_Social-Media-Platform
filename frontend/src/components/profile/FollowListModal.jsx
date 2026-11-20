import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import FollowButton from '../common/FollowButton';
import api from '../../api/axios';

const FollowListModal = ({ isOpen, onClose, userId, type = 'followers' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/users/${userId}/${type}`);
        setUsers(data || []);
      } catch (err) {
        console.error(`Failed to fetch ${type}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userId, type]);

  const title = type === 'followers' ? 'Followers' : 'Following';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={440}>
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)' }}>
          No {type} yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
          {users.map((u) => (
            <div key={u._id} className="user-list-item">
              <Link
                to={`/profile/${u._id || u.username}`}
                onClick={onClose}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, textDecoration: 'none' }}
              >
                <Avatar src={u.profilePicture} name={u.fullName || u.username} size="sm" />
                <div className="user-list-info">
                  <div className="user-list-name">{u.fullName}</div>
                  <div className="user-list-username">@{u.username}</div>
                </div>
              </Link>
              <FollowButton userId={u._id} initialFollowing={true} size="sm" />
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default FollowListModal;

