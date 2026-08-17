import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaEye, FaEyeSlash, FaBuilding, FaHome } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
    is_agent: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (form.password !== form.password2) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value })
  });

  return (
    <div className="z-auth-page">
      <motion.div
        className="z-auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header with Zillow styling */}
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
          <Link to="/login" className="z-auth-tab">
            Sign in
          </Link>
          <button type="button" className="z-auth-tab active">
            New account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="z-auth-form" noValidate>
          
          <div className="z-form-group">
            <label className="z-form-label">Full Name *</label>
            <input
              type="text"
              className="z-form-input"
              placeholder="e.g. Shakib Al Hasan"
              {...f('full_name')}
              autoComplete="name"
              required
            />
          </div>

          <div className="z-form-group">
            <label className="z-form-label">Email Address *</label>
            <input
              type="email"
              className="z-form-input"
              placeholder="Enter email"
              {...f('email')}
              autoComplete="email"
              required
            />
          </div>

          <div className="z-form-group">
            <label className="z-form-label">Phone Number</label>
            <input
              type="tel"
              className="z-form-input"
              placeholder="+880 1700-000000"
              {...f('phone')}
              autoComplete="tel"
            />
          </div>

          <div className="z-form-group">
            <label className="z-form-label">Password *</label>
            <div className="z-input-toggle-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                className="z-form-input"
                placeholder="At least 8 characters"
                {...f('password')}
                autoComplete="new-password"
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

          <div className="z-form-group">
            <label className="z-form-label">Confirm Password *</label>
            <input
              type={showPass ? 'text' : 'password'}
              className="z-form-input"
              placeholder="Re-enter password"
              {...f('password2')}
              autoComplete="new-password"
              required
            />
          </div>

          {/* Agent Checkbox */}
          <label className="z-checkbox-label">
            <input
              type="checkbox"
              checked={form.is_agent}
              onChange={(e) => setForm({ ...form, is_agent: e.target.checked })}
            />
            <span>I am a licensed real estate agent or property manager</span>
          </label>

          <button type="submit" className="z-submit-btn" disabled={loading}>
            {loading ? <span className="spinner-sm" /> : 'Submit'}
          </button>
        </form>

        {/* Legal notice */}
        <p className="z-legal-notice">
          By submitting, I accept Prestige Realty's <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
        </p>

      </motion.div>
    </div>
  );
}
