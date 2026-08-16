import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaPlus, FaHome, FaEnvelope, FaEye, FaEdit, FaTrash,
  FaCheckCircle, FaTimesCircle, FaChartBar, FaBell
} from 'react-icons/fa'
import { propertiesApi, inquiriesApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatPrice, timeAgo, getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'
import './DashboardPage.css'

export default function DashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('listings')
  const [listings, setListings] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [listingsLoading, setListingsLoading] = useState(true)
  const [inquiriesLoading, setInquiriesLoading] = useState(false)

  // Fetch agent's listings on mount
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await propertiesApi.getMyListings()
        setListings(res.data.results || [])
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally { setListingsLoading(false) }
    }
    fetchListings()
  }, [])

  // Fetch inquiries when tab selected
  useEffect(() => {
    if (activeTab !== 'inquiries') return
    const fetchInquiries = async () => {
      setInquiriesLoading(true)
      try {
        const res = await inquiriesApi.getReceived()
        setInquiries(res.data.results || res.data || [])
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally { setInquiriesLoading(false) }
    }
    fetchInquiries()
  }, [activeTab])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing permanently? This cannot be undone.')) return
    try {
      await propertiesApi.delete(id)
      setListings(prev => prev.filter(l => l.id !== id))
      toast.success('Listing deleted.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleMarkRead = async (inquiryId) => {
    try {
      await inquiriesApi.markRead(inquiryId)
      setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, is_read: true } : i))
    } catch { /* silent */ }
  }

  // Stats derived from listings
  const stats = {
    total: listings.length,
    published: listings.filter(l => l.is_published).length,
    featured: listings.filter(l => l.is_featured).length,
    unreadInquiries: inquiries.filter(i => !i.is_read).length,
  }

  const TABS = [
    { id: 'listings', label: 'My Listings', icon: <FaHome /> },
    { id: 'inquiries', label: 'Inquiries', icon: <FaEnvelope /> },
  ]

  return (
    <main className="dashboard page-wrapper">
      <div className="container">
        <div className="dashboard__header">
          <div>
            <h1>Dashboard</h1>
            <p className="text-slate">Welcome back, {user?.full_name?.split(' ')[0]}</p>
          </div>
          <Link to="/properties/new" className="btn btn-primary">
            <FaPlus /> New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="dashboard__stats">
          {[
            { icon: <FaHome />, value: stats.total, label: 'Total Listings' },
            { icon: <FaChartBar />, value: stats.published, label: 'Published' },
            { icon: <FaCheckCircle />, value: stats.featured, label: 'Featured' },
            { icon: <FaBell />, value: stats.unreadInquiries, label: 'Unread Inquiries' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="stat-box glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <span className="stat-box__icon">{s.icon}</span>
              <span className="stat-box__value">{s.value}</span>
              <span className="stat-box__label">{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`profile-tab ${activeTab === tab.id ? 'profile-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {listingsLoading ? (
              <div className="dashboard__listing-list">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="dashboard__empty">
                <FaHome className="dashboard__empty-icon" />
                <p>No listings yet. Create your first property!</p>
                <Link to="/properties/new" className="btn btn-primary mt-md">
                  <FaPlus /> Create Listing
                </Link>
              </div>
            ) : (
              <div className="dashboard__listing-list">
                {listings.map(listing => (
                  <motion.div
                    key={listing.id}
                    className="listing-row glass-card"
                    whileHover={{ y: -2 }}
                  >
                    <div className="listing-row__thumb">
                      {(listing.primary_image_url || listing.images?.[0]?.image_url)
                        ? <img src={listing.primary_image_url || listing.images[0].image_url} alt={listing.title} />
                        : <FaHome />
                      }
                    </div>
                    <div className="listing-row__info">
                      <div className="listing-row__title">{listing.title}</div>
                      <div className="listing-row__meta">
                        {listing.city}, {listing.state} ·{' '}
                        <span className={listing.is_published ? 'text-success' : 'text-slate'}>
                          {listing.is_published ? '● Published' : '○ Draft'}
                        </span>
                        {listing.is_featured && <span className="badge badge-gold" style={{marginLeft:8}}>Featured</span>}
                      </div>
                    </div>
                    <div className="listing-row__price">{formatPrice(listing.price, listing.listing_type)}</div>
                    <div className="listing-row__date">{timeAgo(listing.created_at)}</div>
                    <div className="listing-row__actions">
                      <Link to={`/properties/${listing.id}`} className="btn btn-secondary btn-sm" title="View">
                        <FaEye />
                      </Link>
                      <Link to={`/properties/${listing.id}/edit`} className="btn btn-secondary btn-sm" title="Edit">
                        <FaEdit />
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(listing.id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Inquiries Tab */}
        {activeTab === 'inquiries' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {inquiriesLoading ? (
              <div className="dashboard__listing-list">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />
                ))}
              </div>
            ) : inquiries.length === 0 ? (
              <div className="dashboard__empty">
                <FaEnvelope className="dashboard__empty-icon" />
                <p>No inquiries received yet.</p>
              </div>
            ) : (
              <div className="dashboard__listing-list">
                {inquiries.map(inq => (
                  <div
                    key={inq.id}
                    className={`inquiry-row glass-card ${!inq.is_read ? 'inquiry-row--unread' : ''}`}
                  >
                    <div className="inquiry-row__header">
                      <div>
                        <strong>{inq.name}</strong>
                        <span className="text-slate" style={{marginLeft:8, fontSize:'0.8rem'}}>{inq.email}</span>
                        {inq.phone && <span className="text-slate" style={{marginLeft:8, fontSize:'0.8rem'}}> · {inq.phone}</span>}
                      </div>
                      <div className="inquiry-row__meta">
                        <span className="text-slate" style={{fontSize:'0.8rem'}}>{timeAgo(inq.created_at)}</span>
                        {inq.is_read
                          ? <FaCheckCircle className="text-success" title="Read" />
                          : (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleMarkRead(inq.id)}
                              title="Mark as read"
                            >
                              <FaTimesCircle /> Mark Read
                            </button>
                          )
                        }
                      </div>
                    </div>
                    <p className="inquiry-row__property">
                      Re: <Link to={`/properties/${inq.property_id}`} className="link-gold">
                        {inq.property_title}
                      </Link>
                    </p>
                    <p className="inquiry-row__message">{inq.message}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  )
}
