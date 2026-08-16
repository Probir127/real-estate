import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaHome } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'
import './AuthPages.css'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill in all fields.'); return }
    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page page-wrapper">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-card__header">
          <Link to="/" className="auth-card__logo">
            <FaHome className="auth-card__logo-icon" />
            Prestige<span className="text-gold">Realty</span>
          </Link>
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="input-icon-wrap">
              <FaEnvelope className="input-icon" />
              <input
                id="email" type="email" className="form-input input-icon-pad"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                autoComplete="email" required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-icon-wrap">
              <FaLock className="input-icon" />
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="form-input input-icon-pad input-icon-pad-right"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                autoComplete="current-password" required
              />
              <button type="button" className="input-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="spinner-sm" /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-card__footer">
          Don't have an account?{' '}
          <Link to="/register" className="link-gold">Create one free</Link>
        </div>
      </motion.div>
    </div>
  )
}
