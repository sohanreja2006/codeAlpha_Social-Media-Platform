import React from 'react';
import { TrendingUp, Hash, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const topics = [
  { rank: '01', tag: 'Glassmorphism', posts: '14.2K posts', category: 'Design Trend', hot: true },
  { rank: '02', tag: 'React19', posts: '8.7K posts', category: 'Technology', hot: true },
  { rank: '03', tag: 'SpatialDesign', posts: '5.1K posts', category: 'UI / UX', hot: false },
  { rank: '04', tag: 'WebDevNext', posts: '12.4K posts', category: 'Engineering', hot: false },
  { rank: '05', tag: 'AIEthics', posts: '9.3K posts', category: 'Artificial Intelligence', hot: false },
];

const TrendingTopics = () => {
  const navigate = useNavigate();

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
          <TrendingUp size={18} color="var(--color-primary)" />
          <span>Trending in Network</span>
        </div>
        <Flame size={16} color="#ef4444" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {topics.map((t) => (
          <div
            key={t.tag}
            onClick={() => navigate(`/explore?tag=${t.tag}`)}
            className="trending-topic-row"
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '6px 8px',
              borderRadius: '12px',
              transition: 'all 0.18s ease',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--color-text-light)',
                fontVariantNumeric: 'tabular-nums',
                width: 18,
              }}
            >
              {t.rank}
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  {t.category}
                </span>
                {t.hot && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: '#ef4444',
                      background: 'rgba(239, 68, 68, 0.08)',
                      padding: '1px 6px',
                      borderRadius: '10px',
                    }}
                  >
                    HOT
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--color-text-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Hash size={13} color="var(--color-primary-light)" />
                <span>{t.tag}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>
                {t.posts}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopics;
