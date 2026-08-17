import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="z-auth-page">
      <motion.div
        className="z-auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="z-auth-header">
          <div className="z-auth-brand">
            <div className="z-auth-brand__icon">
              <FaHome />
            </div>
            <span>Prestige<strong>Realty</strong></span>
          </div>
          <h1 className="z-auth-title">Welcome to Prestige Realty</h1>
        </div>

        {/* Tab Switcher: Sign In | New Account */}
        <div className="z-auth-tabs">
          <button type="button" className="z-auth-tab active">
            Sign in
          </button>
          <Link to="/register" className="z-auth-tab">
            New account
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="z-auth-form" noValidate>
          <div className="z-form-group">
            <label className="z-form-label">Email Address *</label>
            <input
              type="email"
              className="z-form-input"
              placeholder="Enter email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              required
            />
          </div>

          <div className="z-form-group">
            <label className="z-form-label">Password *</label>
            <div className="z-input-toggle-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                className="z-form-input"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="z-toggle-btn"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="z-submit-btn" disabled={loading}>
            {loading ? <span className="spinner-sm" /> : 'Sign In'}
          </button>
        </form>

        <p className="z-legal-notice">
          By signing in, I accept Prestige Realty's <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
        </p>

      </motion.div>
    </div>
  );
}
