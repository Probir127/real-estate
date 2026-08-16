import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FaSearch, FaHome, FaBuilding, FaMapMarkerAlt, FaStar,
  FaUsers, FaHandshake, FaShieldAlt, FaAward, FaPhoneAlt,
  FaArrowRight, FaPlay, FaCheck
} from 'react-icons/fa'
import { propertiesApi } from '../api/client'
import PropertyCard from '../components/PropertyCard'
import { getErrorMessage } from '../utils/helpers'
import './HomePage.css'

const STATS = [
  { icon: <FaHome />, value: '১২,০০০+', label: 'Properties Listed' },
  { icon: <FaUsers />, value: '৮,৫০০+', label: 'Happy Clients' },
  { icon: <FaHandshake />, value: '৪,২০০+', label: 'Deals Closed' },
  { icon: <FaStar />, value: '৯৮%', label: 'Satisfaction Rate' },
]

const PROPERTY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
]

const CITIES = [
  { name: 'Dhaka', count: '4,200+', emoji: '🏙️' },
  { name: 'Chittagong', count: '1,800+', emoji: '⚓' },
  { name: 'Sylhet', count: '950+', emoji: '🍃' },
  { name: 'Rajshahi', count: '620+', emoji: '🌿' },
  { name: 'Khulna', count: '540+', emoji: '🌊' },
]

const WHY_US = [
  {
    icon: <FaAward />,
    title: 'Verified Listings',
    desc: 'Every property is physically verified by our team before going live on the platform.',
  },
  {
    icon: <FaShieldAlt />,
    title: 'Secure Transactions',
    desc: 'Fully compliant with Bangladesh property law. All documents verified by legal experts.',
  },
  {
    icon: <FaPhoneAlt />,
    title: '24/7 Expert Support',
    desc: 'Our agents are available round the clock to guide you through every step of the process.',
  },
]

function useInView(ref) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref])
  return inView
}

function AnimatedSection({ children, className, delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref)
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState({ city: '', property_type: '', listing_type: '' })
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100)
    const fetchFeatured = async () => {
      try {
        const res = await propertiesApi.getFeatured()
        setFeatured(res.data.results || res.data || [])
      } catch (err) {
        console.error('Failed to load featured properties:', getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.city) params.set('city', search.city)
    if (search.property_type) params.set('property_type', search.property_type)
    if (search.listing_type) params.set('listing_type', search.listing_type)
    navigate(`/properties?${params.toString()}`)
  }

  return (
    <main className="homepage">

      {/* ═══ HERO ═══════════════════════════════════════════ */}
      <section className="hero">
        {/* Background layers */}
        <div className="hero__bg" />
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />
        <div className="hero__grid" />
        <div className="hero__particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="hero__particle" style={{ '--i': i }} />
          ))}
        </div>

        <div className="container hero__content" style={{
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 1s ease, transform 1s ease',
        }}>
          {/* Badge */}
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            বাংলাদেশের #১ প্রিমিয়াম রিয়েল এস্টেট প্ল্যাটফর্ম
          </div>

          {/* Title */}
          <h1 className="hero__title">
            Find Your Dream<br />
            <span className="hero__title-gold">Home in Bangladesh</span>
          </h1>

          <p className="hero__subtitle">
            Premium apartments, villas & commercial spaces across Dhaka, Chittagong, Sylhet and 64 districts.
            Trusted by <strong style={{ color: 'var(--gold-400)' }}>8,500+</strong> happy families.
          </p>

          {/* Trust badges */}
          <div className="hero__trust">
            {['Verified Listings', 'Legal Documentation', 'Instant Support'].map(t => (
              <span key={t} className="hero__trust-badge">
                <FaCheck style={{ color: 'var(--gold-500)', fontSize: '0.65rem' }} /> {t}
              </span>
            ))}
          </div>

          {/* Search Bar */}
          <form className="hero__search" onSubmit={handleSearch}>
            <div className="hero__search-field">
              <FaMapMarkerAlt className="hero__search-icon" />
              <input
                type="text"
                placeholder="Search by city or area (e.g. Gulshan, Dhanmondi)…"
                value={search.city}
                onChange={(e) => setSearch({ ...search, city: e.target.value })}
                className="hero__search-input"
              />
            </div>
            <div className="hero__search-divider" />
            <select
              value={search.property_type}
              onChange={(e) => setSearch({ ...search, property_type: e.target.value })}
              className="hero__search-select"
            >
              {PROPERTY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <div className="hero__search-divider" />
            <select
              value={search.listing_type}
              onChange={(e) => setSearch({ ...search, listing_type: e.target.value })}
              className="hero__search-select"
            >
              <option value="">Buy or Rent</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
            <button type="submit" className="btn btn-primary hero__search-btn">
              <FaSearch /> Search
            </button>
          </form>

          {/* Quick stats */}
          <div className="hero__quick-stats">
            {[
              { value: '৳৫০ লাখ', label: 'Starting Price' },
              { value: '৬৪+', label: 'Districts Covered' },
              { value: '২০০+', label: 'Verified Agents' },
            ].map((s, i) => (
              <div
                key={s.label}
                className="hero__quick-stat"
                style={{ transitionDelay: `${0.4 + i * 0.1}s` }}
              >
                <span className="hero__quick-stat-value gradient-text">{s.value}</span>
                <span className="hero__quick-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero__scroll-indicator">
          <div className="hero__scroll-mouse">
            <div className="hero__scroll-wheel" />
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* ═══ STATS BAND ═══════════════════════════════════ */}
      <div className="stats-band">
        <div className="container">
          <div className="stats-band__grid">
            {STATS.map((stat, i) => (
              <AnimatedSection key={stat.label} className="stat-item" delay={i * 0.1}>
                <div className="stat-item__icon">{stat.icon}</div>
                <div className="stat-item__value">{stat.value}</div>
                <div className="stat-item__label">{stat.label}</div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ FEATURED PROPERTIES ══════════════════════════ */}
      <section className="section featured">
        <div className="container">
          <AnimatedSection className="section-header">
            <span className="label">✦ Hand-Picked For You</span>
            <h2>Featured <span className="gradient-text">Properties</span></h2>
            <div className="gold-line" />
            <p style={{ marginTop: '1rem' }}>
              Explore our curated selection of premium properties across Bangladesh's prime locations.
            </p>
          </AnimatedSection>

          {loading ? (
            <div className="featured__grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 400, borderRadius: 18 }} />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="featured__grid">
              {featured.map((property, i) => (
                <AnimatedSection key={property.id} delay={i * 0.08} style={{ height: '100%' }}>
                  <PropertyCard property={property} />
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">🏠</div>
              <h3>No Featured Properties Yet</h3>
              <p>Check back soon or browse all available listings.</p>
              <button onClick={() => navigate('/properties')} className="btn btn-outline mt-md">
                Browse All Properties
              </button>
            </div>
          )}

          {featured.length > 0 && (
            <AnimatedSection className="featured__cta">
              <Link to="/properties" className="btn btn-outline btn-lg">
                Browse All Properties <FaArrowRight style={{ marginLeft: 8 }} />
              </Link>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* ═══ POPULAR CITIES ═══════════════════════════════ */}
      <section className="section locations">
        <div className="container">
          <AnimatedSection className="section-header">
            <span className="label">✦ Explore By Location</span>
            <h2>Popular <span className="gradient-text">Cities</span></h2>
            <div className="gold-line" />
          </AnimatedSection>
          <div className="locations__grid">
            {CITIES.map((city, i) => (
              <AnimatedSection
                key={city.name}
                className="location-card"
                delay={i * 0.1}
              >
                <div
                  className="location-card__inner"
                  onClick={() => navigate(`/properties?city=${city.name}`)}
                >
                  <div className="location-card__emoji">{city.emoji}</div>
                  <div className="location-card__name">{city.name}</div>
                  <div className="location-card__count">{city.count} properties</div>
                  <div className="location-card__arrow"><FaArrowRight /></div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY US ═══════════════════════════════════════ */}
      <section className="section why-us">
        <div className="container">
          <AnimatedSection className="section-header">
            <span className="label">✦ Why Choose Us</span>
            <h2>The Smarter Way to <span className="gradient-text">Buy &amp; Sell</span></h2>
            <div className="gold-line" />
          </AnimatedSection>
          <div className="grid-3">
            {WHY_US.map((item, i) => (
              <AnimatedSection key={item.title} className="why-card glass-card" delay={i * 0.15}>
                <div className="why-card__icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══════════════════════════════════ */}
      <div className="container">
        <AnimatedSection className="cta-banner">
          <div className="cta-banner__glow" />
          <span className="label" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>✦ Get Started Today</span>
          <h2>Ready to <span className="gradient-text">List Your Property?</span></h2>
          <p>
            Join thousands of sellers who trust Prestige Realty to connect them with
            verified buyers across Bangladesh.
          </p>
          <div className="cta-banner__actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
            <Link to="/properties" className="btn btn-outline btn-lg">
              Browse Listings
            </Link>
          </div>
        </AnimatedSection>
      </div>

    </main>
  )
}
