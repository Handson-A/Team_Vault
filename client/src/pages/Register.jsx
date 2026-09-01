import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Lock, KeyRound, Rocket, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/teams');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
              Set up your account to start managing sensitive API keys, credentials, and team secrets securely.
            </p>
          </div>

          <div className="auth-hero-features">
            <div className="feature-item">
              <div className="feature-icon">
                <Lock size={16} color="var(--accent)" strokeWidth={2} />
              </div>
              <span>Encrypted vaults isolated by team</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <KeyRound size={16} color="var(--accent)" strokeWidth={2} />
              </div>
              <span>Role-based controls & member permissions</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Rocket size={16} color="var(--accent)" strokeWidth={2} />
              </div>
              <span>Quick onboard via team join codes</span>
            </div>
          </div>

          <div className="auth-hero-footer">
            &copy; {new Date().getFullYear()} Team Vault Enterprise. All rights reserved.
          </div>
        </div>

        {/* Auth Form Side */}
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h2>Create Account</h2>
            <p>Get started with Team Vault in seconds</p>
          </div>

          {error && (
            <div className="auth-error-alert">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="alice_dev"
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="alice@company.com"
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
                placeholder="Minimum 6 characters"
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-type your password"
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ width: '100%', marginTop: '10px' }}
            >
              {submitting ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>

          <div className="auth-footer-prompt">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;