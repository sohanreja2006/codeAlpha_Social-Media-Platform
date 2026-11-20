import React from 'react';
import { Compass, Sparkles, Layers, ShieldCheck } from 'lucide-react';

const CommunityDiscovery = () => {
  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
          fontWeight: 700,
          fontSize: '0.95rem',
          color: 'var(--color-text-dark)',
        }}
      >
        <Compass size={18} color="var(--color-primary)" />
        <span>Featured Communities</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7655E8 0%, #A5B4FC 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            <Layers size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-dark)' }}>
              UI Designers Club
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              18.4K members • Active now
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f8ef7 0%, #6c63ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            <Sparkles size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-dark)' }}>
              Fullstack Makers
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              24.1K members • 92 online
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(108, 63, 197, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.72rem',
          color: 'var(--color-text-light)',
        }}
      >
        <ShieldCheck size={14} color="var(--color-primary-light)" />
        <span>Verified Glassmorphism Platform</span>
      </div>
    </div>
  );
};

export default CommunityDiscovery;

