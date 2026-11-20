import React from 'react';

export const PostSkeleton = () => (
  <div className="skeleton-card">
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div className="skeleton skeleton-circle skeleton-avatar" />
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-line" style={{ width: '35%', height: 16 }} />
        <div className="skeleton skeleton-line" style={{ width: '20%', height: 12 }} />
      </div>
    </div>
    <div className="skeleton skeleton-line" style={{ width: '90%' }} />
    <div className="skeleton skeleton-line" style={{ width: '95%' }} />
    <div className="skeleton skeleton-line" style={{ width: '60%', marginBottom: 16 }} />
    <div className="skeleton" style={{ width: '100%', height: 220, borderRadius: 12 }} />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
    <div className="skeleton" style={{ height: 160, borderRadius: 16, marginBottom: 40 }} />
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', marginTop: -60, padding: '0 20px', marginBottom: 20 }}>
      <div className="skeleton skeleton-circle" style={{ width: 90, height: 90, border: '4px solid white' }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-line" style={{ width: '30%', height: 20 }} />
        <div className="skeleton skeleton-line" style={{ width: '15%', height: 14 }} />
      </div>
    </div>
    <div style={{ padding: '0 20px' }}>
      <div className="skeleton skeleton-line" style={{ width: '80%', height: 14 }} />
      <div className="skeleton skeleton-line" style={{ width: '60%', height: 14 }} />
    </div>
  </div>
);

