import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, LogIn, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const handleQuickDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card">
        {/* Brand Logo */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Sparkles size={24} />
          </div>
          <h1 className="auth-title">Welcome to SOCIALY</h1>
          <p className="auth-subtitle">
            Sign in to experience next-generation glassmorphic social networking
          </p>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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
                placeholder="name@socialy.io"
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
                placeholder="••••••••"
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
            icon={LogIn}
            className="auth-submit-btn"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Sign In
          </Button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="demo-login-box">
          <div className="demo-login-title">Quick Demo Logins (Click to autofill):</div>
          <div className="demo-badges">
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleQuickDemo('elena@socialy.io')}
            >
              Elena (Designer)
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleQuickDemo('marcus@socialy.io')}
            >
              Marcus (Engineer)
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleQuickDemo('sophia@socialy.io')}
            >
              Sophia (AI)
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account yet?{' '}
          <Link to="/register" className="auth-link">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

