import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLock, FaUser, FaPhone, FaEye, FaEyeSlash, FaBuilding } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'
import './AuthPages.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    password: '', password2: '', is_agent: false,
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.password) {
      toast.error('Please fill in all required fields.'); return
    }
    if (form.password !== form.password2) {
      toast.error('Passwords do not match.'); return
    }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      const msg = getErrorMessage(err)
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const f = (key) => ({
    value: form[key],
    onChange: e => setForm({...form, [key]: e.target.value})
  })

  return (
    <div className="auth-page page-wrapper">
      <motion.div
        className="auth-card auth-card--wide glass-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-card__header">
          <h1>Create Account</h1>
          <p>Join Prestige Realty — free forever</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="full_name" className="form-label">Full Name *</label>
              <div className="input-icon-wrap">
                <FaUser className="input-icon" />
                <input id="full_name" type="text" className="form-input input-icon-pad"
                  placeholder="John Smith" {...f('full_name')} autoComplete="name" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone</label>
              <div className="input-icon-wrap">
                <FaPhone className="input-icon" />
                <input id="phone" type="tel" className="form-input input-icon-pad"
                  placeholder="+1 555 000 0000" {...f('phone')} autoComplete="tel" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">Email Address *</label>
            <div className="input-icon-wrap">
              <FaEnvelope className="input-icon" />
              <input id="reg-email" type="email" className="form-input input-icon-pad"
                placeholder="you@example.com" {...f('email')} autoComplete="email" required />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="reg-pass" className="form-label">Password *</label>
              <div className="input-icon-wrap">
                <FaLock className="input-icon" />
                <input id="reg-pass"
                  type={showPass ? 'text' : 'password'}
                  className="form-input input-icon-pad input-icon-pad-right"
                  placeholder="••••••••" {...f('password')} autoComplete="new-password" required />
                <button type="button" className="input-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="reg-pass2" className="form-label">Confirm Password *</label>
              <div className="input-icon-wrap">
                <FaLock className="input-icon" />
                <input id="reg-pass2"
                  type={showPass ? 'text' : 'password'}
                  className="form-input input-icon-pad"
                  placeholder="••••••••" {...f('password2')} autoComplete="new-password" required />
              </div>
            </div>
          </div>

          {/* Register as agent toggle */}
          <label className="agent-toggle">
            <input
              type="checkbox"
              checked={form.is_agent}
              onChange={e => setForm({...form, is_agent: e.target.checked})}
            />
            <div className="agent-toggle__box">
              <FaBuilding />
              <div>
                <strong>Register as Agent</strong>
                <span>List and manage properties</span>
              </div>
            </div>
          </label>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="spinner-sm" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-card__footer">
          Already have an account?{' '}
          <Link to="/login" className="link-gold">Sign in</Link>
        </div>
      </motion.div>
    </div>
  )
}
