import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaSearch, FaHome, FaBuilding, FaMapMarkerAlt, FaStar,
  FaArrowRight, FaKey, FaHandshake, FaShieldAlt, FaCheckCircle
} from 'react-icons/fa';
import { propertiesApi } from '../api/client';
import PropertyCard from '../components/PropertyCard';
import { getErrorMessage } from '../utils/helpers';
import './HomePage.css';

const CITIES = [
  { name: 'Dhaka', count: '4,200+ homes' },
  { name: 'Chittagong', count: '1,800+ homes' },
  { name: 'Sylhet', count: '950+ homes' },
  { name: 'Cox\'s Bazar', count: '420+ homes' },
  { name: 'Rajshahi', count: '620+ homes' },
  { name: 'Khulna', count: '540+ homes' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search State with Zillow Tabs: 'sale' | 'rent' | ''
  const [activeTab, setActiveTab] = useState('sale');
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [featRes, rentRes] = await Promise.allSettled([
          propertiesApi.getFeatured(),
          propertiesApi.list({ listing_type: 'rent', page_size: 4 })
        ]);

        if (featRes.status === 'fulfilled') {
          setFeatured(featRes.value.data.results || featRes.value.data || []);
        }
        if (rentRes.status === 'fulfilled') {
          setRentals(rentRes.value.data.results || rentRes.value.data || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (activeTab) params.set('type', activeTab);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (propertyType) params.set('property_type', propertyType);
    navigate(`/properties?${params.toString()}`);
  };

  const handleCityClick = (cityName) => {
    const params = new URLSearchParams();
    if (activeTab) params.set('type', activeTab);
    params.set('city', cityName);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="home-page">

      {/* ── Zillow-Style Hero Section ──────────────── */}
      <section className="home-hero">
        <div className="home-hero__overlay" />
        <div className="container home-hero__content">
          <h1 className="home-hero__title">
            Find your place.
          </h1>
          <p className="home-hero__subtitle">
            Explore homes for sale, luxury apartments for rent, and verified properties across Bangladesh.
          </p>

          {/* Floating Search Card */}
          <div className="home-search-card">
            
            {/* Buy / Rent / All Tabs */}
            <div className="home-search-card__tabs">
              <button
                type="button"
                className={`home-search-card__tab ${activeTab === 'sale' ? 'active' : ''}`}
                onClick={() => setActiveTab('sale')}
              >
                Buy
              </button>
              <button
                type="button"
                className={`home-search-card__tab ${activeTab === 'rent' ? 'active' : ''}`}
                onClick={() => setActiveTab('rent')}
              >
                Rent
              </button>
              <button
                type="button"
                className={`home-search-card__tab ${activeTab === '' ? 'active' : ''}`}
                onClick={() => setActiveTab('')}
              >
                All Homes
              </button>
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleSearch} className="home-search-card__form">
              <div className="home-search-card__input-wrap">
                <FaSearch className="home-search-card__icon" />
                <input
                  type="text"
                  className="home-search-card__input"
                  placeholder={
                    activeTab === 'rent'
                      ? "Enter city, neighborhood, or address to rent..."
                      : "Enter city, neighborhood, or address to buy..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="home-search-card__select"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">Home Type</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
              </select>

              <button type="submit" className="btn btn-primary home-search-card__submit">
                <FaSearch /> Search
              </button>
            </form>

            {/* City Quick Pills */}
            <div className="home-search-card__cities">
              <span className="home-search-card__cities-label">Popular Locations:</span>
              <div className="home-search-card__chips">
                {CITIES.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    className="home-search-card__chip"
                    onClick={() => handleCityClick(c.name)}
                  >
                    <FaMapMarkerAlt size={10} /> {c.name}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Featured "Homes For You" Section ──────── */}
      <section className="home-section container">
        <div className="home-section__header">
          <div>
            <h2 className="home-section__title">Homes For You</h2>
            <p className="home-section__subtitle">Based on homes you might like in Bangladesh</p>
          </div>
          <Link to="/properties?type=sale" className="home-section__see-all">
            See all homes <FaArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="home-section__loading">
            <div className="spinner" />
            <p>Loading homes...</p>
          </div>
        ) : featured.length > 0 ? (
          <div className="home-grid">
            {featured.slice(0, 6).map(prop => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        ) : (
          <p className="home-section__empty">No featured properties found.</p>
        )}
      </section>

      {/* ── Trending Rentals Section ───────────────── */}
      {rentals.length > 0 && (
        <section className="home-section home-section--alt">
          <div className="container">
            <div className="home-section__header">
              <div>
                <h2 className="home-section__title">Trending Rental Properties</h2>
                <p className="home-section__subtitle">Explore luxury apartments and modern homes for rent</p>
              </div>
              <Link to="/properties?type=rent" className="home-section__see-all">
                See all rentals <FaArrowRight size={12} />
              </Link>
            </div>

            <div className="home-grid">
              {rentals.map(prop => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Zillow-Style Action Cards (Buy / Rent / Sell) */}
      <section className="home-section container">
        <div className="home-section__header home-section__header--center">
          <h2 className="home-section__title">See how Prestige Realty can help</h2>
          <p className="home-section__subtitle">Guiding your real estate journey with trust and verified listings</p>
        </div>

        <div className="home-cards-grid">
          {/* Card 1: Buy */}
          <div className="home-action-card">
            <div className="home-action-card__icon-wrap home-action-card__icon-wrap--blue">
              <FaHome />
            </div>
            <h3 className="home-action-card__title">Buy a home</h3>
            <p className="home-action-card__text">
              Find your place with an immersive photo experience and verified listings, including luxury penthouses, villas, and family residences.
            </p>
            <Link to="/properties?type=sale" className="btn btn-secondary btn-sm">
              Browse homes
            </Link>
          </div>

          {/* Card 2: Rent */}
          <div className="home-action-card">
            <div className="home-action-card__icon-wrap home-action-card__icon-wrap--green">
              <FaKey />
            </div>
            <h3 className="home-action-card__title">Rent a home</h3>
            <p className="home-action-card__text">
              We provide a seamless rental discovery experience — from browsing verified apartments to contacting top agents directly.
            </p>
            <Link to="/properties?type=rent" className="btn btn-secondary btn-sm">
              Find rentals
            </Link>
          </div>

          {/* Card 3: Sell */}
          <div className="home-action-card">
            <div className="home-action-card__icon-wrap home-action-card__icon-wrap--amber">
              <FaHandshake />
            </div>
            <h3 className="home-action-card__title">List your property</h3>
            <p className="home-action-card__text">
              Reach thousands of qualified buyers and tenants across Bangladesh with our premium real estate marketing network.
            </p>
            <Link to="/properties/new" className="btn btn-secondary btn-sm">
              Post a listing
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust & Stats Banner ───────────────────── */}
      <section className="home-trust-banner">
        <div className="container home-trust-banner__inner">
          <div className="home-trust-banner__item">
            <strong>12,000+</strong>
            <span>Verified Listings</span>
          </div>
          <div className="home-trust-banner__divider" />
          <div className="home-trust-banner__item">
            <strong>8,500+</strong>
            <span>Happy Homeowners</span>
          </div>
          <div className="home-trust-banner__divider" />
          <div className="home-trust-banner__item">
            <strong>100%</strong>
            <span>Legal Title Checked</span>
          </div>
          <div className="home-trust-banner__divider" />
          <div className="home-trust-banner__item">
            <strong>24/7</strong>
            <span>Licensed Agent Support</span>
          </div>
        </div>
      </section>

    </div>
  );
}
