import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHeart, FaShareAlt, FaMapMarkerAlt, FaBed, FaBath,
  FaRulerCombined, FaCalendarAlt, FaCar, FaBuilding,
  FaPhone, FaEnvelope, FaUser, FaStar, FaEdit, FaTrash,
  FaCheckCircle, FaArrowLeft, FaShieldAlt, FaChartLine
} from 'react-icons/fa';
import { propertiesApi, inquiriesApi, favoritesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatPrice, timeAgo, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

// New Rich Zillow Components
import ScheduleTourWidget from '../components/ScheduleTourWidget';
import MortgageCalculator from '../components/MortgageCalculator';
import NeighborhoodMap from '../components/NeighborhoodMap';
import PriceHistorySection from '../components/PriceHistorySection';

import './PropertyDetailPage.css';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  // Favorite state
  const [isFav, setIsFav] = useState(false);
  const [favId, setFavId] = useState(null);
  const [favLoading, setFavLoading] = useState(false);

  // Inquiry form state
  const [inquiry, setInquiry] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: '',
  });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await propertiesApi.getById(id);
        setProperty(res.data);
        setIsFav(res.data.is_favorited || false);
        setFavId(res.data.favorite_id || null);
        setInquiry(prev => ({
          ...prev,
          name: user?.full_name || prev.name,
          email: user?.email || prev.email,
          phone: user?.phone || prev.phone,
          message: `I am interested in ${res.data.title} (${res.data.city}). Please contact me with more information.`,
        }));
      } catch (err) {
        toast.error('Could not load property details.');
        navigate('/properties');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, navigate, user]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save properties.');
      navigate('/login');
      return;
    }
    setFavLoading(true);
    try {
      if (isFav && favId) {
        await favoritesApi.remove(favId);
        setIsFav(false);
        setFavId(null);
        toast.success('Removed from saved homes.');
      } else {
        const res = await favoritesApi.add(property.id);
        setIsFav(true);
        setFavId(res.data.id);
        toast.success('Saved to your homes!');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setFavLoading(false);
    }
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!inquiry.name || !inquiry.email || !inquiry.message) {
      toast.error('Please complete all required fields.');
      return;
    }
    setInquiryLoading(true);
    try {
      await inquiriesApi.send({
        property: property.id,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        message: inquiry.message,
      });
      toast.success('Message sent directly to the listing agent!');
      setInquiry(prev => ({
        ...prev,
        message: `I am interested in ${property.title}. Please contact me.`,
      }));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await propertiesApi.delete(id);
      toast.success('Listing deleted.');
      navigate('/properties');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Property link copied to clipboard!');
  };

  if (loading) {
    return (
      <main className="pd-page page-wrapper">
        <div className="pd-loading container">
          <div className="spinner" />
          <p>Loading home details...</p>
        </div>
      </main>
    );
  }

  if (!property) return null;

  const images = property.images || [];
  const isOwnerOrAdmin = user?.id === property.agent?.id || isAdmin;
  const isRent = property.listing_type === 'rent';

  // Price per sqft estimate
  const pricePerSqft = property.area_sqft > 0 ? Math.round(property.price / property.area_sqft) : null;

  return (
    <main className="pd-page page-wrapper">
      <div className="container pd-container">

        {/* ── 1. Top Action Header ───────────────────────── */}
        <div className="pd-top-bar">
          <Link to="/properties" className="pd-back-link">
            <FaArrowLeft /> Back to all homes
          </Link>
          <div className="pd-top-actions">
            <button className="btn btn-outline btn-sm" onClick={handleShare}>
              <FaShareAlt /> Share
            </button>
            <button
              className={`btn btn-sm ${isFav ? 'btn-danger pd-fav-active' : 'btn-secondary'}`}
              onClick={handleFavorite}
              disabled={favLoading}
            >
              <FaHeart style={{ color: isFav ? '#e02424' : 'inherit' }} />
              {isFav ? 'Saved' : 'Save Home'}
            </button>
            {isOwnerOrAdmin && (
              <>
                <Link to={`/properties/${id}/edit`} className="btn btn-outline btn-sm">
                  <FaEdit /> Edit
                </Link>
                <button className="btn btn-outline btn-sm text-red" onClick={handleDelete} disabled={deleting}>
                  <FaTrash /> {deleting ? '…' : 'Delete'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── 2. Zillow-Style Hero Gallery ───────────────── */}
        <div className="pd-gallery">
          <div className="pd-gallery__main">
            {(images.length > 0 && (images[activeImg]?.image_url || property.primary_image_url)) ? (
              <motion.img
                key={activeImg}
                src={images[activeImg]?.image_url || property.primary_image_url}
                alt={images[activeImg]?.alt_text || property.title}
                className="pd-gallery__main-img"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const ph = document.getElementById('pd-gallery-fallback');
                  if (ph) ph.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              id="pd-gallery-fallback"
              className="pd-gallery__placeholder"
              style={{ display: (images.length > 0 && (images[activeImg]?.image_url || property.primary_image_url)) ? 'none' : 'flex' }}
            >
              <FaBuilding size={48} />
              <span>No Images Available</span>
            </div>

            {/* Badges */}
            <div className="pd-gallery__badges">
              <span className={`badge ${isRent ? 'badge-rent' : 'badge-sale'}`}>
                {isRent ? 'For Rent' : 'For Sale'}
              </span>
              {property.is_featured && (
                <span className="badge badge-featured">
                  <FaStar size={10} /> Featured
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className="pd-gallery__thumbs">
              {images.map((img, i) => (
                <button
                  key={img.id || i}
                  className={`pd-gallery__thumb ${i === activeImg ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img.image_url} alt={img.alt_text || `View ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── 3. Main Two-Column Layout ──────────────────── */}
        <div className="pd-layout">

          {/* Left Column: Facts, Overview, Calculator, Neighborhood, Price History */}
          <div className="pd-main-col">

            {/* Price & Title Card */}
            <div className="pd-card">
              <div className="pd-price-row">
                <h1 className="pd-price">
                  {formatPrice(property.price)}
                  {isRent && <span className="pd-price-period">/mo</span>}
                </h1>
              </div>

              {/* Specs Strip */}
              <div className="pd-specs-strip">
                {property.bedrooms > 0 && (
                  <div className="pd-spec-box">
                    <strong>{property.bedrooms}</strong>
                    <span>Beds</span>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="pd-spec-box">
                    <strong>{property.bathrooms}</strong>
                    <span>Baths</span>
                  </div>
                )}
                {property.area_sqft > 0 && (
                  <div className="pd-spec-box">
                    <strong>{property.area_sqft?.toLocaleString()}</strong>
                    <span>Sq Ft</span>
                  </div>
                )}
                <div className="pd-spec-box">
                  <strong style={{ textTransform: 'capitalize' }}>{property.property_type_display || property.property_type}</strong>
                  <span>Home Type</span>
                </div>
              </div>

              {/* Address */}
              <div className="pd-address-row">
                <FaMapMarkerAlt className="pd-address-icon" />
                <span>
                  {property.address ? `${property.address}, ` : ''}{property.city}, {property.state} {property.zip_code}
                </span>
              </div>
            </div>

            {/* Overview & Description */}
            <div className="pd-card">
              <h2 className="pd-card__title">Overview</h2>
              <p className="pd-description">{property.description}</p>
            </div>

            {/* Facts & Features */}
            <div className="pd-card">
              <h2 className="pd-card__title">Facts & Features</h2>
              
              <div className="pd-facts-grid">
                <div className="pd-fact-item">
                  <span className="pd-fact-label">Type:</span>
                  <span className="pd-fact-value">{property.property_type_display || property.property_type}</span>
                </div>
                <div className="pd-fact-item">
                  <span className="pd-fact-label">Year Built:</span>
                  <span className="pd-fact-value">{property.year_built || '2022'}</span>
                </div>
                <div className="pd-fact-item">
                  <span className="pd-fact-label">Garage / Parking:</span>
                  <span className="pd-fact-value">{property.garage ? `${property.garage} spaces` : 'Available'}</span>
                </div>
                <div className="pd-fact-item">
                  <span className="pd-fact-label">Status:</span>
                  <span className="pd-fact-value text-green font-bold">Active</span>
                </div>
                <div className="pd-fact-item">
                  <span className="pd-fact-label">Listed:</span>
                  <span className="pd-fact-value">{timeAgo(property.created_at)}</span>
                </div>
              </div>

              {/* Amenities checklist */}
              {property.features && (
                <div className="pd-amenities">
                  <h3 className="pd-amenities__title">Amenities & Highlights</h3>
                  <div className="pd-amenities__list">
                    {property.features.split(',').map((f, idx) => (
                      <div key={idx} className="pd-amenity-chip">
                        <FaCheckCircle className="text-blue" />
                        <span>{f.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Mortgage Calculator (Zillow Standard) */}
            {!isRent && <MortgageCalculator propertyPrice={property.price} />}

            {/* 5. Neighborhood Map & Scores */}
            <NeighborhoodMap property={property} />

            {/* 6. Price History & Public Records Table */}
            <PriceHistorySection property={property} />

          </div>

          {/* Right Column: Schedule Tour & Sticky Contact Agent */}
          <div className="pd-sidebar-col">
            
            {/* Schedule a Tour Widget */}
            <ScheduleTourWidget propertyTitle={property.title} />

            {/* Contact Agent Card */}
            <div className="pd-agent-card">
              <h2 className="pd-agent-card__title">Contact Agent</h2>
              
              <div className="pd-agent-profile">
                <div className="pd-agent-avatar">
                  {property.agent?.avatar_url ? (
                    <img src={property.agent.avatar_url} alt={property.agent.full_name} />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div className="pd-agent-meta">
                  <strong>{property.agent?.full_name || 'Prestige Realty Agent'}</strong>
                  <span className="pd-agent-badge">Licensed Broker</span>
                  <span className="pd-agent-company">Prestige Realty Bangladesh</span>
                </div>
              </div>

              {property.agent?.phone && (
                <a href={`tel:${property.agent.phone}`} className="btn btn-secondary btn-sm pd-agent-phone-btn">
                  <FaPhone /> {property.agent.phone}
                </a>
              )}

              <form onSubmit={handleInquiry} className="pd-inquiry-form">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Your Full Name *"
                    className="form-control"
                    value={inquiry.name}
                    onChange={e => setInquiry({ ...inquiry, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Your Email Address *"
                    className="form-control"
                    value={inquiry.email}
                    onChange={e => setInquiry({ ...inquiry, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="tel"
                    placeholder="Phone Number (optional)"
                    className="form-control"
                    value={inquiry.phone}
                    onChange={e => setInquiry({ ...inquiry, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <textarea
                    rows={3}
                    placeholder={`I am interested in ${property.title}...`}
                    className="form-control"
                    value={inquiry.message}
                    onChange={e => setInquiry({ ...inquiry, message: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full" disabled={inquiryLoading}>
                  {inquiryLoading ? 'Sending...' : 'Send Message to Agent'}
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
