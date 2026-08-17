import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaSearch, FaHome, FaBuilding, FaMapMarkerAlt, FaStar,
  FaArrowRight, FaChevronRight, FaRegHeart
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

const DIRECTORY_DATA = {
  real_estate: [
    { title: 'Dhaka Real Estate', link: '/properties?city=Dhaka' },
    { title: 'Chittagong Real Estate', link: '/properties?city=Chittagong' },
    { title: 'Sylhet Real Estate', link: '/properties?city=Sylhet' },
    { title: 'Cox\'s Bazar Real Estate', link: '/properties?city=Cox%27s+Bazar' },
    { title: 'Rajshahi Real Estate', link: '/properties?city=Rajshahi' },
    { title: 'Khulna Real Estate', link: '/properties?city=Khulna' },
    { title: 'Gulshan Penthouses', link: '/properties?search=Gulshan' },
    { title: 'Dhanmondi Apartments', link: '/properties?search=Dhanmondi' },
    { title: 'Baridhara Luxury Villas', link: '/properties?search=Baridhara' },
    { title: 'Uttara Family Homes', link: '/properties?search=Uttara' },
    { title: 'Motijheel Commercial Spaces', link: '/properties?search=Motijheel' },
    { title: 'Banani Modern Flats', link: '/properties?search=Banani' },
  ],
  rentals: [
    { title: 'Apartments for Rent in Dhaka', link: '/properties?type=rent&city=Dhaka' },
    { title: 'Flats for Rent in Banani', link: '/properties?type=rent&search=Banani' },
    { title: 'Furnished Studios in Bashundhara', link: '/properties?type=rent&search=Bashundhara' },
    { title: 'Houses for Rent in Sylhet', link: '/properties?type=rent&city=Sylhet' },
    { title: 'Office Space for Rent in Motijheel', link: '/properties?type=rent&search=Motijheel' },
    { title: 'Apartments for Rent in Chittagong', link: '/properties?type=rent&city=Chittagong' },
    { title: 'Affordable Studios in Khulna', link: '/properties?type=rent&city=Khulna' },
    { title: 'Commercial Rentals in Dhaka', link: '/properties?type=rent&property_type=commercial' },
  ],
  popular_searches: [
    { title: 'Luxury Penthouses with City View', link: '/properties?search=Penthouse' },
    { title: 'Homes with 3+ Bedrooms', link: '/properties?min_bedrooms=3' },
    { title: 'Beachfront Properties', link: '/properties?search=Beachfront' },
    { title: 'Villas with Private Pool', link: '/properties?property_type=villa' },
    { title: 'Agricultural Land & Plots', link: '/properties?property_type=land' },
    { title: 'Brand New Construction', link: '/properties?ordering=-created_at' },
  ]
};

export default function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Zillow Search State
  const [activeTab, setActiveTab] = useState('sale');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDirectoryTab, setActiveDirectoryTab] = useState('real_estate');

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
    navigate(`/properties?${params.toString()}`);
  };

  const handleCityClick = (cityName) => {
    const params = new URLSearchParams();
    if (activeTab) params.set('type', activeTab);
    params.set('city', cityName);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="z-home">

      {/* ── 1. Exact Zillow Hero Section ────────────── */}
      <section className="z-hero">
        <div className="z-hero__bg" />
        <div className="container z-hero__container">
          
          <h1 className="z-hero__title">
            Find your place.
          </h1>

          {/* Zillow Sleek Floating Search Bar */}
          <div className="z-search-wrapper">
            
            {/* Tabs: Buy | Rent | Sold */}
            <div className="z-search-tabs">
              <button
                type="button"
                className={`z-search-tab ${activeTab === 'sale' ? 'active' : ''}`}
                onClick={() => setActiveTab('sale')}
              >
                Buy
              </button>
              <button
                type="button"
                className={`z-search-tab ${activeTab === 'rent' ? 'active' : ''}`}
                onClick={() => setActiveTab('rent')}
              >
                Rent
              </button>
              <button
                type="button"
                className={`z-search-tab ${activeTab === '' ? 'active' : ''}`}
                onClick={() => setActiveTab('')}
              >
                All Homes
              </button>
            </div>

            {/* Pure Zillow Single-Pill Search Form */}
            <form onSubmit={handleSearch} className="z-search-pill-form">
              <input
                type="text"
                className="z-search-pill-input"
                placeholder={
                  activeTab === 'rent'
                    ? "Enter an address, neighborhood, city, or ZIP code"
                    : "Enter an address, neighborhood, city, or ZIP code"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="z-search-pill-btn" aria-label="Search">
                <FaSearch />
              </button>
            </form>

            {/* Popular City Chips */}
            <div className="z-hero-chips">
              <span className="z-hero-chips__title">Explore:</span>
              {CITIES.map(c => (
                <button
                  key={c.name}
                  type="button"
                  className="z-hero-chip"
                  onClick={() => handleCityClick(c.name)}
                >
                  {c.name}
                </button>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ── 2. Homes For You (Featured Listings) ────── */}
      <section className="z-section container">
        <div className="z-section__header">
          <div>
            <h2 className="z-section__title">Homes For You</h2>
            <p className="z-section__subtitle">Based on homes you might like in Bangladesh</p>
          </div>
          <Link to="/properties?type=sale" className="z-section__link">
            See all homes <FaArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="z-loading">
            <div className="spinner" />
            <p>Loading homes...</p>
          </div>
        ) : featured.length > 0 ? (
          <div className="z-grid">
            {featured.slice(0, 8).map(prop => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        ) : (
          <p className="z-empty">No featured properties found.</p>
        )}
      </section>

      {/* ── 3. Trending Rentals Section ──────────────── */}
      {rentals.length > 0 && (
        <section className="z-section z-section--alt">
          <div className="container">
            <div className="z-section__header">
              <div>
                <h2 className="z-section__title">Trending Rental Properties</h2>
                <p className="z-section__subtitle">Explore luxury apartments and flats for rent</p>
              </div>
              <Link to="/properties?type=rent" className="z-section__link">
                See all rentals <FaArrowRight size={12} />
              </Link>
            </div>

            <div className="z-grid">
              {rentals.map(prop => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. Zillow's 3 Iconic Action Cards ────────── */}
      <section className="z-section container">
        <div className="z-action-cards-grid">
          
          {/* Card 1: Buy a Home */}
          <div className="z-action-card">
            <div className="z-action-card__img-wrap">
              <img
                src="https://www.zillowstatic.com/bedrock/app/vUID/v4/static-assets/Buy_a_home.png"
                alt="Buy a home"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            <h3 className="z-action-card__title">Buy a home</h3>
            <p className="z-action-card__desc">
              Find your place with an immersive photo experience and the most listings, including things you won't find anywhere else.
            </p>
            <Link to="/properties?type=sale" className="z-action-card__outline-btn">
              Browse homes
            </Link>
          </div>

          {/* Card 2: Rent a Home */}
          <div className="z-action-card">
            <div className="z-action-card__img-wrap">
              <img
                src="https://www.zillowstatic.com/bedrock/app/vUID/v4/static-assets/Rent_a_home.png"
                alt="Rent a home"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            <h3 className="z-action-card__title">Rent a home</h3>
            <p className="z-action-card__desc">
              We're creating a seamless online experience – from shopping on the largest rental network, to applying, to connecting with top agents.
            </p>
            <Link to="/properties?type=rent" className="z-action-card__outline-btn">
              Find rentals
            </Link>
          </div>

          {/* Card 3: Sell / List a Home */}
          <div className="z-action-card">
            <div className="z-action-card__img-wrap">
              <img
                src="https://www.zillowstatic.com/bedrock/app/vUID/v4/static-assets/Sell_a_home.png"
                alt="Sell a home"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            <h3 className="z-action-card__title">List your home</h3>
            <p className="z-action-card__desc">
              No matter what path you take to sell or rent your property, Prestige Realty connects you with qualified buyers and trusted licensed brokers.
            </p>
            <Link to="/properties/new" className="z-action-card__outline-btn">
              See your options
            </Link>
          </div>

        </div>
      </section>

      {/* ── 5. Real Estate Directory Explorer ───────── */}
      <section className="z-directory-section">
        <div className="container">
          <div className="z-directory-card">
            
            {/* Directory Navigation Tabs */}
            <div className="z-directory-tabs">
              <button
                type="button"
                className={`z-directory-tab ${activeDirectoryTab === 'real_estate' ? 'active' : ''}`}
                onClick={() => setActiveDirectoryTab('real_estate')}
              >
                Real Estate
              </button>
              <button
                type="button"
                className={`z-directory-tab ${activeDirectoryTab === 'rentals' ? 'active' : ''}`}
                onClick={() => setActiveDirectoryTab('rentals')}
              >
                Rentals
              </button>
              <button
                type="button"
                className={`z-directory-tab ${activeDirectoryTab === 'popular_searches' ? 'active' : ''}`}
                onClick={() => setActiveDirectoryTab('popular_searches')}
              >
                Popular Searches
              </button>
            </div>

            {/* Links Grid */}
            <div className="z-directory-links-grid">
              {DIRECTORY_DATA[activeDirectoryTab]?.map((item, idx) => (
                <Link key={idx} to={item.link} className="z-directory-link">
                  {item.title}
                </Link>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── 6. Trust & Stats Bar ────────────────────── */}
      <section className="z-stats-bar">
        <div className="container z-stats-bar__inner">
          <div className="z-stats-bar__item">
            <strong>12,000+</strong>
            <span>Verified Bangladesh Listings</span>
          </div>
          <div className="z-stats-bar__item">
            <strong>8,500+</strong>
            <span>Happy Homeowners & Renters</span>
          </div>
          <div className="z-stats-bar__item">
            <strong>100%</strong>
            <span>Legal Title Checked</span>
          </div>
          <div className="z-stats-bar__item">
            <strong>24/7</strong>
            <span>Licensed Agent Advisory</span>
          </div>
        </div>
      </section>

    </div>
  );
}
