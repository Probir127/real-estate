import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaEye, FaEyeSlash, FaUserTie, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Tab: 'login' or 'register'
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  );

  const from = location.state?.from?.pathname || '/';

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
    is_agent: false,
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(loginForm);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerForm.full_name || !registerForm.email || !registerForm.password) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (registerForm.password !== registerForm.password2) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register(registerForm);
      toast.success('Account created successfully! Logging you in...');
      // Automatically log in with the new credentials
      await login({
        email: registerForm.email,
        password: registerForm.password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Quick One-Click Demo Logins
  const handleQuickLogin = async (email, password) => {
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Signed in successfully!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Could not sign in with demo credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="z-auth-page">
      <motion.div
        className="z-auth-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
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
          <button
            type="button"
            className={`z-auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`z-auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            New account
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'login' ? (
            <motion.form
              key="login"
              onSubmit={handleLoginSubmit}
              className="z-auth-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="z-form-group">
                <label className="z-form-label">Email Address *</label>
                <input
                  type="email"
                  className="z-form-input"
                  placeholder="Enter email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
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
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="z-toggle-btn"
                    onClick={() => setShowPass(!showPass)}
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="z-submit-btn" disabled={loading}>
                {loading ? <span className="spinner-sm" /> : 'Sign In'}
              </button>

              {/* 1-Click Quick Demo Sign-Ins */}
              <div className="z-quick-logins">
                <div className="z-quick-logins__divider">
                  <span>or quick sign in with</span>
                </div>
                <div className="z-quick-logins__grid">
                  <button
                    type="button"
                    className="z-quick-btn"
                    onClick={() => handleQuickLogin('agent@prestigerealty.bd', 'Password123!')}
                    disabled={loading}
                  >
                    <FaUserTie className="text-blue" />
                    <span>Demo Agent</span>
                  </button>
                  <button
                    type="button"
                    className="z-quick-btn"
                    onClick={() => handleQuickLogin('admin@realestate.com', 'admin1234')}
                    disabled={loading}
                  >
                    <FaUser className="text-navy" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              onSubmit={handleRegisterSubmit}
              className="z-auth-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="z-form-group">
                <label className="z-form-label">Full Name *</label>
                <input
                  type="text"
                  className="z-form-input"
                  placeholder="e.g. Shakib Al Hasan"
                  value={registerForm.full_name}
                  onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="z-form-group">
                <label className="z-form-label">Email Address *</label>
                <input
                  type="email"
                  className="z-form-input"
                  placeholder="Enter email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="z-form-group">
                <label className="z-form-label">Phone Number</label>
                <input
                  type="tel"
                  className="z-form-input"
                  placeholder="+880 1700 000000"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                />
              </div>

              <div className="z-form-group">
                <label className="z-form-label">Password *</label>
                <input
                  type="password"
                  className="z-form-input"
                  placeholder="At least 8 characters"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
              </div>

              <div className="z-form-group">
                <label className="z-form-label">Confirm Password *</label>
                <input
                  type="password"
                  className="z-form-input"
                  placeholder="Repeat your password"
                  value={registerForm.password2}
                  onChange={(e) => setRegisterForm({ ...registerForm, password2: e.target.value })}
                  required
                />
              </div>

              <div className="z-checkbox-group">
                <label className="z-checkbox-label">
                  <input
                    type="checkbox"
                    checked={registerForm.is_agent}
                    onChange={(e) => setRegisterForm({ ...registerForm, is_agent: e.target.checked })}
                  />
                  <span>I am a licensed real estate agent / broker</span>
                </label>
              </div>

              <button type="submit" className="z-submit-btn" disabled={loading}>
                {loading ? <span className="spinner-sm" /> : 'Create Account'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="z-legal-notice">
          By signing in, I accept Prestige Realty's <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
        </p>

      </motion.div>
    </div>
  );
}
