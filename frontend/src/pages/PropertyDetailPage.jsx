import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaBed, FaBath, FaRulerCombined, FaCar, FaCalendar,
  FaMapMarkerAlt, FaHeart, FaUser, FaPhone, FaEnvelope,
  FaArrowLeft, FaEdit, FaTrash, FaStar, FaCheckCircle
} from 'react-icons/fa'
import { propertiesApi, inquiriesApi, favoritesApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatPrice, timeAgo, getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'
import './PropertyDetailPage.css'

export default function PropertyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isAgent, user } = useAuth()

  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [isFav, setIsFav] = useState(false)
  const [favId, setFavId] = useState(null)   // stores Favorite record ID for DELETE
  const [favLoading, setFavLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Inquiry form state
  const [inquiry, setInquiry] = useState({ name: '', email: '', phone: '', message: '' })
  const [inquiryLoading, setInquiryLoading] = useState(false)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await propertiesApi.getById(id)
        setProperty(res.data)
        setIsFav(res.data.is_favorited || false)
        setFavId(res.data.favorite_id || null)  // store the Favorite PK for deletion
        // Pre-fill inquiry with user's info
        if (user) setInquiry(prev => ({ ...prev, name: user.full_name, email: user.email }))
      } catch {
        toast.error('Property not found.')
        navigate('/properties')
      } finally {
        setLoading(false)
      }
    }
    fetchProperty()
  }, [id])

  const handleFavorite = async () => {
    if (!isAuthenticated) { toast.error('Sign in to save properties.'); return }
    setFavLoading(true)
    try {
      if (isFav && favId) {
        await favoritesApi.remove(favId)   // DELETE /api/favorites/{favId}/ — correct!
        setIsFav(false)
        setFavId(null)
        toast.success('Removed from favorites.')
      } else {
        const res = await favoritesApi.add(property.id)
        setIsFav(true)
        setFavId(res.data?.id || null)    // store new favorite's ID
        toast.success('Added to favorites!')
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally { setFavLoading(false) }
  }

  const handleInquiry = async (e) => {
    e.preventDefault()
    if (!inquiry.name || !inquiry.email || !inquiry.message) {
      toast.error('Please fill in all required fields.'); return
    }
    setInquiryLoading(true)
    try {
      await inquiriesApi.send({ ...inquiry, property_id: property.id })
      toast.success('Your message has been sent to the agent!')
      setInquiry(prev => ({ ...prev, message: '' }))
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally { setInquiryLoading(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing permanently?')) return
    setDeleting(true)
    try {
      await propertiesApi.delete(id)
      toast.success('Listing deleted.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="loading-wrapper page-wrapper"><div className="spinner" /></div>
  )

  if (!property) return null

  const images = property.images || []
  const isOwner = user?.id === property.agent?.id

  return (
    <main className="property-detail page-wrapper">
      <div className="container">
        {/* Back */}
        <Link to="/properties" className="back-link">
          <FaArrowLeft /> Back to Properties
        </Link>

        {/* Image Gallery */}
        <div className="gallery">
          <div className="gallery__main">
            {(images.length > 0 && (images[activeImg]?.image_url || property.primary_image_url)) ? (
              <motion.img
                key={activeImg}
                src={images[activeImg]?.image_url || property.primary_image_url}
                alt={images[activeImg]?.alt_text || property.title}
                className="gallery__main-img"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const ph = document.getElementById('gallery-fallback-placeholder');
                  if (ph) ph.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              id="gallery-fallback-placeholder"
              className="gallery__placeholder"
              style={{ display: (images.length > 0 && (images[activeImg]?.image_url || property.primary_image_url)) ? 'none' : 'flex' }}
            >
              <FaBuilding />
              <span>No Images Available</span>
            </div>
            <div className="gallery__badges">
              <span className={`badge ${property.listing_type === 'rent' ? 'badge-blue' : 'badge-gold'}`}>
                {property.listing_type_display}
              </span>
              {property.is_featured && <span className="badge badge-gold"><FaStar size={10} /> Featured</span>}
              <span className={`badge ${property.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                {property.status_display}
              </span>
            </div>
          </div>
          {images.length > 1 && (
            <div className="gallery__thumbs">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  className={`gallery__thumb ${i === activeImg ? 'gallery__thumb--active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img.image_url} alt={img.alt_text || `View ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="property-detail__body">
          {/* Left: Details */}
          <div className="property-detail__main">
            {/* Title + Actions */}
            <div className="property-detail__title-row">
              <div>
                <h1>{property.title}</h1>
                <div className="property-detail__location">
                  <FaMapMarkerAlt />
                  <span>{property.address}, {property.city}, {property.state} {property.zip_code}</span>
                </div>
              </div>
              <div className="property-detail__actions">
                <button
                  className={`btn btn-secondary btn-icon ${isFav ? 'active-fav' : ''}`}
                  onClick={handleFavorite} disabled={favLoading}
                  aria-label="Toggle favorite"
                >
                  <FaHeart />
                </button>
                {isOwner && (
                  <>
                    <Link to={`/properties/${id}/edit`} className="btn btn-secondary btn-sm">
                      <FaEdit /> Edit
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                      <FaTrash /> {deleting ? '…' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="property-detail__price">
              {formatPrice(property.price, property.listing_type)}
            </div>

            {/* Stats Grid */}
            <div className="property-detail__stats">
              {[
                { icon: <FaBed />, value: property.bedrooms, label: 'Bedrooms' },
                { icon: <FaBath />, value: property.bathrooms, label: 'Bathrooms' },
                { icon: <FaRulerCombined />, value: `${property.area_sqft?.toLocaleString()} sqft`, label: 'Area' },
                { icon: <FaCar />, value: property.garage, label: 'Garage' },
              ].map(s => (
                <div key={s.label} className="stat-pill glass-card">
                  <span className="stat-pill__icon">{s.icon}</span>
                  <span className="stat-pill__value">{s.value}</span>
                  <span className="stat-pill__label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="property-detail__section">
              <h3>About This Property</h3>
              <p>{property.description}</p>
            </div>

            {/* Details Table */}
            <div className="property-detail__section">
              <h3>Property Details</h3>
              <div className="details-grid">
                {[
                  { label: 'Type', value: property.property_type_display },
                  { label: 'Status', value: property.status_display },
                  { label: 'Year Built', value: property.year_built || 'N/A' },
                  { label: 'Listing Type', value: property.listing_type_display },
                  { label: 'Listed', value: timeAgo(property.created_at) },
                  { label: 'Property ID', value: `#${property.id}` },
                ].map(d => (
                  <div key={d.label} className="detail-row">
                    <span className="detail-row__label">{d.label}</span>
                    <span className="detail-row__value">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {property.features_list?.length > 0 && (
              <div className="property-detail__section">
                <h3>Features & Amenities</h3>
                <div className="features-list">
                  {property.features_list.map(f => (
                    <span key={f} className="feature-tag">
                      <FaCheckCircle className="text-gold" /> {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Agent + Inquiry */}
          <div className="property-detail__sidebar">
            {/* Agent Card */}
            {property.agent && (
              <div className="agent-card glass-card">
                <div className="agent-card__header">
                  <div className="agent-card__avatar">
                    {property.agent.avatar_url
                      ? <img src={property.agent.avatar_url} alt={property.agent.full_name} />
                      : <FaUser />
                    }
                  </div>
                  <div>
                    <div className="agent-card__name">{property.agent.full_name}</div>
                    <div className="agent-card__role">Licensed Agent</div>
                  </div>
                </div>
                <div className="agent-card__contacts">
                  {property.agent.phone && (
                    <a href={`tel:${property.agent.phone}`} className="agent-contact-link">
                      <FaPhone /> {property.agent.phone}
                    </a>
                  )}
                  <a href={`mailto:${property.agent.email}`} className="agent-contact-link">
                    <FaEnvelope /> {property.agent.email}
                  </a>
                </div>
              </div>
            )}

            {/* Inquiry Form */}
            <div className="inquiry-card glass-card">
              <h3>Send a Message</h3>
              <form onSubmit={handleInquiry} className="inquiry-form">
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input type="text" className="form-input" value={inquiry.name}
                    onChange={e => setInquiry({...inquiry, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-input" value={inquiry.email}
                    onChange={e => setInquiry({...inquiry, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="tel" className="form-input" value={inquiry.phone}
                    onChange={e => setInquiry({...inquiry, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea className="form-textarea" rows={4} value={inquiry.message}
                    onChange={e => setInquiry({...inquiry, message: e.target.value})}
                    placeholder="I'm interested in this property…"
                    required />
                </div>
                <button type="submit" className="btn btn-primary w-full" disabled={inquiryLoading}>
                  {inquiryLoading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
