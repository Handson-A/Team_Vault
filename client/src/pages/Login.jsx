import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Lock, ShieldCheck, Zap, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/teams" replace />;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/teams');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Split Card Hero Side */}
        <div className="auth-hero">
          <div className="auth-hero-header">
            <div className="brand-title">
              <Lock size={24} color="var(--primary-light)" strokeWidth={2.2} />
              <span>Team Vault</span>
            </div>
            <p className="brand-subtitle">
              Secure, role-governed secrets storage and encrypted communication for engineering and operations teams.
            </p>
          </div>

          <div className="auth-hero-features">
            <div className="feature-item">
              <div className="feature-icon">
                <ShieldCheck size={16} color="var(--accent)" strokeWidth={2} />
              </div>
              <span>End-to-end team scoped access control</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Zap size={16} color="var(--accent)" strokeWidth={2} />
              </div>
              <span>Instant secret masking and one-click copying</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Users size={16} color="var(--accent)" strokeWidth={2} />
              </div>
              <span>Collaborative workspaces with join codes</span>
            </div>
          </div>

          <div className="auth-hero-footer">
            &copy; {new Date().getFullYear()} Team Vault Enterprise. All rights reserved.
          </div>
        </div>

        {/* Auth Form Side */}
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h2>Welcome Back</h2>
            <p>Enter your credentials to access your team vaults</p>
          </div>

          {error && (
            <div className="auth-error-alert">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ width: '100%', marginTop: '10px' }}
            >
              {submitting ? 'Signing in...' : 'Sign In to Vault'}
            </button>
          </form>

          <div className="auth-footer-prompt">
            Don't have an account? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;