import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Avatar from '../common/Avatar';
import FollowButton from '../common/FollowButton';
import { Users, BadgeCheck, Sparkles } from 'lucide-react';

const SuggestedUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = async () => {
    try {
      const { data } = await api.get('/api/users/suggestions');
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div className="skeleton skeleton-circle" style={{ width: 18, height: 18 }} />
          <div className="skeleton skeleton-line" style={{ width: '40%', height: 16 }} />
        </div>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
            <div className="skeleton skeleton-circle skeleton-avatar" style={{ width: 38, height: 38 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-line" style={{ width: '60%', height: 12 }} />
              <div className="skeleton skeleton-line" style={{ width: '40%', height: 10 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div className="glass-card widget-card" style={{ padding: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-dark)' }}>
          <Users size={18} color="var(--color-primary)" />
          <span>Visionary Creators</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600 }}>
          Suggested
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {users.map((u) => (
          <div
            key={u._id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <Link
              to={`/profile/${u._id || u.username}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                minWidth: 0,
                flex: 1,
                textDecoration: 'none',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Avatar src={u.profilePicture} name={u.fullName || u.username} size="sm" />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    color: 'var(--color-text-dark)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <span>{u.fullName}</span>
                  <BadgeCheck size={13} className="verified-badge-icon" />
                </div>
                <div
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  @{u.username}
                </div>
              </div>
            </Link>

            <FollowButton
              userId={u._id}
              initialFollowing={false}
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedUsers;
