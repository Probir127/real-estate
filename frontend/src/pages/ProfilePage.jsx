import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaUser, FaEnvelope, FaPhone, FaCamera, FaSave, FaLock } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { authApi, favoritesApi } from '../api/client'
import PropertyCard from '../components/PropertyCard'
import { getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({
    full_name: '', phone: '', bio: '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // Password change
  const [passForm, setPassForm] = useState({ old_password: '', new_password: '', new_password2: '' })
  const [passLoading, setPassLoading] = useState(false)

  // Favorites
  const [favorites, setFavorites] = useState([])
  const [favsLoading, setFavsLoading] = useState(false)

  // Load profile from API on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await authApi.getProfile()
        const p = res.data
        setProfileForm({ full_name: p.full_name || '', phone: p.phone || '', bio: p.bio || '' })
        if (p.avatar_url) setAvatarPreview(p.avatar_url)
      } catch {
        // silently fallback to user context
        setProfileForm({ full_name: user?.full_name || '', phone: '', bio: '' })
      }
    }
    loadProfile()
  }, [])

  // Load favorites when tab switches
  useEffect(() => {
    if (activeTab !== 'favorites') return
    const loadFavs = async () => {
      setFavsLoading(true)
      try {
        const res = await favoritesApi.list()
        setFavorites(res.data.results || res.data || [])
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally { setFavsLoading(false) }
    }
    loadFavs()
  }, [activeTab])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB.'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const fd = new FormData()
      fd.append('full_name', profileForm.full_name)
      fd.append('phone', profileForm.phone)
      fd.append('bio', profileForm.bio)
      if (avatarFile) fd.append('avatar', avatarFile)
      const res = await authApi.updateProfile(fd)
      updateUser({ full_name: res.data.full_name })
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally { setProfileLoading(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passForm.new_password !== passForm.new_password2) {
      toast.error('New passwords do not match.'); return
    }
    setPassLoading(true)
    try {
      await authApi.changePassword(passForm)
      toast.success('Password changed successfully.')
      setPassForm({ old_password: '', new_password: '', new_password2: '' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally { setPassLoading(false) }
  }

  const TABS = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'favorites', label: 'Saved Properties' },
  ]

  return (
    <main className="profile-page page-wrapper">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {avatarPreview
                ? <img src={avatarPreview} alt="Avatar" />
                : <FaUser />
              }
            </div>
            <label className="profile-avatar-edit" title="Change photo">
              <FaCamera />
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} hidden />
            </label>
          </div>
          <div>
            <h1>{user?.full_name}</h1>
            <p className="text-slate">{user?.email}</p>
            {user?.is_agent && <span className="badge badge-gold" style={{ marginTop: 8 }}>Agent</span>}
          </div>
        </div>

        {/* Tab nav */}
        <div className="profile-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`profile-tab ${activeTab === tab.id ? 'profile-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            className="profile-card glass-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3>Personal Information</h3>
            <form onSubmit={handleProfileSave}>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-icon-wrap">
                    <FaUser className="input-icon" />
                    <input type="text" className="form-input" style={{ paddingLeft: '2.5rem' }}
                      value={profileForm.full_name}
                      onChange={e => setProfileForm({...profileForm, full_name: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <div className="input-icon-wrap">
                    <FaPhone className="input-icon" />
                    <input type="tel" className="form-input" style={{ paddingLeft: '2.5rem' }}
                      value={profileForm.phone}
                      onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email (read-only)</label>
                <div className="input-icon-wrap">
                  <FaEnvelope className="input-icon" />
                  <input type="email" className="form-input" style={{ paddingLeft: '2.5rem' }}
                    value={user?.email || ''} readOnly disabled />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" rows={3} placeholder="Tell us about yourself…"
                  value={profileForm.bio}
                  onChange={e => setProfileForm({...profileForm, bio: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                <FaSave /> {profileLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <motion.div
            className="profile-card glass-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              {['old_password', 'new_password', 'new_password2'].map((field, i) => (
                <div key={field} className="form-group">
                  <label className="form-label">
                    {field === 'old_password' ? 'Current Password'
                      : field === 'new_password' ? 'New Password'
                      : 'Confirm New Password'}
                  </label>
                  <div className="input-icon-wrap">
                    <FaLock className="input-icon" />
                    <input type="password" className="form-input" style={{ paddingLeft: '2.5rem' }}
                      value={passForm[field]}
                      onChange={e => setPassForm({...passForm, [field]: e.target.value})}
                      required />
                  </div>
                </div>
              ))}
              <button type="submit" className="btn btn-primary" disabled={passLoading}>
                {passLoading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {favsLoading ? (
              <div className="favs-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 380, borderRadius: 16 }} />
                ))}
              </div>
            ) : favorites.length > 0 ? (
              <div className="favs-grid">
                {favorites.map(fav => (
                  <PropertyCard
                    key={fav.id}
                    property={{ ...fav.property_detail, is_favorited: true, favorite_id: fav.id }}
                    onFavoriteToggle={() => setFavorites(prev => prev.filter(f => f.id !== fav.id))}
                  />
                ))}
              </div>
            ) : (
              <div className="profile-empty">
                <p>You haven't saved any properties yet.</p>
                <Link to="/properties" className="btn btn-primary mt-md">Browse Properties</Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  )
}
