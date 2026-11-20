import React, { useState } from 'react';
import { Settings, Shield, Bell, Moon, User, Check, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';

const SettingsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);

  const handleSave = () => {
    addToast('Settings preferences saved! ✨', 'success');
  };

  return (
    <div className="settings-page">
      <div className="glass-card-flat" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
            }}
          >
            <Settings size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>
              Settings & Preferences
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Manage your experience, privacy, and account settings.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Account Info Card */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={18} color="var(--color-primary)" />
            Account Overview
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>Full Name</div>
              <div style={{ fontWeight: 600 }}>{user?.fullName || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>Username</div>
              <div style={{ fontWeight: 600 }}>@{user?.username || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>Email Address</div>
              <div style={{ fontWeight: 600 }}>{user?.email || '—'}</div>
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={18} color="var(--color-primary)" />
            Notifications
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email Notifications</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Receive weekly highlights and direct replies.
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Browser Push Alerts</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Notify immediately when someone follows or likes.
                </div>
              </div>
              <input
                type="checkbox"
                checked={pushAlerts}
                onChange={(e) => setPushAlerts(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
              />
            </label>
          </div>
        </div>

        {/* Design System Spec Card */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Palette size={18} color="var(--color-primary)" />
            Design System Spec
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
            SOCIALY is powered by an Apple-inspired glassmorphic design token system with translucent frosted surfaces, soft lavender gradients, and 60fps micro-interactions.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span className="chip" style={{ background: '#7655E8', color: '#fff' }}>Primary #7655E8</span>
            <span className="chip" style={{ background: '#A5B4FC', color: '#1a1a2e' }}>Secondary #A5B4FC</span>
            <span className="chip" style={{ background: '#202033', color: '#fff' }}>Navy #202033</span>
            <span className="chip" style={{ background: 'rgba(255,255,255,0.7)', color: '#1a1a2e', border: '1px solid rgba(0,0,0,0.1)' }}>Glass Blur 16px</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={handleSave} icon={Check}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

