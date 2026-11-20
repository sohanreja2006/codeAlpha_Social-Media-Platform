import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Sparkles,
  UserPlus,
  Lock,
  Mail,
  User,
  AtSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/common/Button';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Live username availability state
  const [usernameStatus, setUsernameStatus] = useState(null); // 'checking' | 'available' | 'taken' | 'invalid' | null
  const [usernameMessage, setUsernameMessage] = useState('');
  const checkTimeoutRef = useRef(null);

  // Debounced real-time username validation
  useEffect(() => {
    const raw = username.trim();
    if (!raw) {
      setUsernameStatus(null);
      setUsernameMessage('');
      return;
    }

    const clean = raw.toLowerCase().replace(/\s+/g, '_');

    // Format validation
    const validFormat = /^[a-zA-Z0-9_]{3,30}$/.test(clean);
    if (!validFormat) {
      setUsernameStatus('invalid');
      setUsernameMessage('Username must be 3-30 characters (letters, numbers, _ only)');
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('Checking availability...');

    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/api/auth/check-username?username=${encodeURIComponent(clean)}`);
        if (data.available) {
          setUsernameStatus('available');
          setUsernameMessage(`@${clean} is available!`);
        } else {
          setUsernameStatus('taken');
          setUsernameMessage(`@${clean} is already taken. Please choose another.`);
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
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (usernameStatus === 'taken') {
      setError('This username is already taken. Please choose another username.');
      return;
    }

    if (usernameStatus === 'invalid') {
      setError('Please enter a valid username (3-30 characters, letters, numbers, _ only).');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
    const result = await register({
      fullName: fullName.trim(),
      username: cleanUsername,
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const getUsernameBorderColor = () => {
    if (usernameStatus === 'available') return '#10b981';
    if (usernameStatus === 'taken') return '#ef4444';
    if (usernameStatus === 'invalid') return '#f59e0b';
    return undefined;
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card">
        {/* Brand Logo */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Sparkles size={24} />
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Join the creators and engineers shaping the future on SOCIALY
          </p>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-light)',
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Elena Rostova"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ paddingLeft: 42 }}
                required
              />
            </div>
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
              <AtSign
                size={18}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color:
                    usernameStatus === 'available'
                      ? '#10b981'
                      : usernameStatus === 'taken'
                      ? '#ef4444'
                      : 'var(--color-text-light)',
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="elena_ui"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  paddingLeft: 42,
                  paddingRight: 36,
                  borderColor: getUsernameBorderColor(),
                  boxShadow:
                    usernameStatus === 'taken'
                      ? '0 0 0 3px rgba(239, 68, 68, 0.12)'
                      : usernameStatus === 'available'
                      ? '0 0 0 3px rgba(16, 185, 129, 0.12)'
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
                  <Loader2 size={16} color="var(--color-primary)" className="spinner" />
                )}
                {usernameStatus === 'available' && <CheckCircle2 size={17} color="#10b981" />}
                {usernameStatus === 'taken' && <XCircle size={17} color="#ef4444" />}
                {usernameStatus === 'invalid' && <AlertCircle size={17} color="#f59e0b" />}
              </div>
            </div>

            {/* Live Helper / Error Message */}
            {usernameMessage && (
              <div
                style={{
                  fontSize: '0.76rem',
                  marginTop: '0.35rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  color:
                    usernameStatus === 'available'
                      ? '#10b981'
                      : usernameStatus === 'taken'
                      ? '#ef4444'
                      : usernameStatus === 'invalid'
                      ? '#f59e0b'
                      : 'var(--color-text-muted)',
                }}
              >
                {usernameStatus === 'taken' && <XCircle size={13} style={{ flexShrink: 0 }} />}
                {usernameStatus === 'available' && <CheckCircle2 size={13} style={{ flexShrink: 0 }} />}
                {usernameStatus === 'invalid' && <AlertCircle size={13} style={{ flexShrink: 0 }} />}
                <span>{usernameMessage}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-light)',
                }}
              />
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: 42 }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-light)',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 42, paddingRight: 42 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-light)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            icon={UserPlus}
            className="auth-submit-btn"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={usernameStatus === 'taken'}
          >
            Create Account
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
