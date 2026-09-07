import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaSearch, FaMapMarkerAlt, FaBuilding, FaUsers,
  FaShieldAlt, FaStar, FaPhone, FaCheckCircle, FaArrowRight,
  FaCalculator, FaChartLine, FaFileAlt, FaCheck, FaHandshake, FaChevronDown
} from 'react-icons/fa';
import { propertiesApi } from '../api/client';
import PropertyCard from '../components/PropertyCard';
import './HomePage.css';

/* ─── Static Data ─────────────────────────────────────────── */
const AREAS = [
  {
    name: 'Gulshan',
    city: 'Dhaka',
    listings: 412,
    trend: '6.4%',
    avgSqft: '৳ 26,500',
    rent2Bed: '৳ 78,000',
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80',
  },
  {
    name: 'Banani',
    city: 'Dhaka',
    listings: 356,
    trend: '5.1%',
    avgSqft: '৳ 22,000',
    rent2Bed: '৳ 62,000',
    img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80',
  },
  {
    name: 'Dhanmondi',
    city: 'Dhaka',
    listings: 488,
    trend: '4.2%',
    avgSqft: '৳ 18,500',
    rent2Bed: '৳ 45,000',
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80',
  },
  {
    name: 'Uttara',
    city: 'Dhaka',
    listings: 623,
    trend: '8.7%',
    avgSqft: '৳ 11,800',
    rent2Bed: '৳ 28,000',
    img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80',
  },
  {
    name: 'Bashundhara R/A',
    city: 'Dhaka',
    listings: 574,
    trend: '11.3%',
    avgSqft: '৳ 13,200',
    rent2Bed: '৳ 32,000',
    img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80',
  },
  {
    name: 'Mirpur DOHS',
    city: 'Dhaka',
    listings: 211,
    trend: '7.2%',
    avgSqft: '৳ 12,500',
    rent2Bed: '৳ 30,000',
    img: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&q=80',
  },
];

const TOOLS = [
  {
    icon: <FaChartLine />,
    title: 'What is my property worth?',
    desc: 'Get an instant estimate from area rates, size, floor and building age — the same inputs a licensed valuer uses.',
    link: '/valuation',
    cta: 'Estimate my property',
    badgeColor: 'brand',
  },
  {
    icon: <FaCalculator />,
    title: 'Home loan & EMI calculator',
    desc: 'Compare live rates from DBH, City Bank, BRAC, EBL, IDLC and Standard Chartered side by side.',
    link: '/loan',
    cta: 'Calculate my EMI',
    badgeColor: 'gold',
  },
  {
    icon: <FaFileAlt />,
    title: 'Area price reports',
    desc: 'Per-sqft rates, rent levels and year-on-year movement for 68 neighbourhoods across Bangladesh.',
    link: '/properties',
    cta: 'Browse areas',
    badgeColor: 'emerald',
  },
];

const HOW_STEPS = [
  {
    num: '1',
    icon: <FaSearch />,
    title: 'Search with real filters',
    desc: 'Filter by sqft, floor, facing, parking and service charge — not just price and bedrooms.',
  },
  {
    num: '2',
    icon: <FaShieldAlt />,
    title: 'We verify the papers',
    desc: 'Our legal team checks the title deed, mutation and RAJUK/CDA approval before a listing gets the verified badge.',
  },
  {
    num: '3',
    icon: <FaPhone />,
    title: 'Talk to the actual agent',
    desc: 'One listing, one accountable agent. No chain of middlemen adding a commission markup at every step.',
  },
  {
    num: '4',
    icon: <FaHandshake />,
    title: 'Close with support',
    desc: 'We assist with the bank loan documentation, sub-registry stamp duty estimate, and key handover checklist.',
  },
];

const AGENTS = [
  {
    name: 'Tanvir Ahmed',
    agency: 'Prestige Property Consultants',
    area: 'Gulshan, Banani, Baridhara',
    rating: '4.9',
    reviews: 187,
    deals: 240,
    years: 12,
    phone: '+8801711204588',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    name: 'Nusrat Jahan',
    agency: 'Shelter Line Realty',
    area: 'Dhanmondi, Lalmatia, Mohammadpur',
    rating: '4.8',
    reviews: 143,
    deals: 176,
    years: 9,
    phone: '+8801819330711',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  },
  {
    name: 'Rafiqul Islam',
    agency: 'Uttara Homes BD',
    area: 'Uttara, Nikunja, Airport',
    rating: '4.7',
    reviews: 121,
    deals: 198,
    years: 14,
    phone: '+8801912776450',
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
  },
  {
    name: 'Farhana Kabir',
    agency: 'Bashundhara Estate Partners',
    area: 'Bashundhara R/A, Aftabnagar, Badda',
    rating: '4.8',
    reviews: 96,
    deals: 132,
    years: 7,
    phone: '+8801755902314',
    img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
  },
];

const TESTIMONIALS = [
  {
    quote: 'The listing showed the real carpet area, not the inflated super built-up one. That alone saved me from two bad deals I nearly signed elsewhere.',
    name: 'Kamrul Hasan',
    sub: 'Bought in Uttara Sector 7',
  },
  {
    quote: 'The service charge was stated transparently on the listing page. Every other property site made me find that out on the day I visited in person.',
    name: 'Rehana Chowdhury',
    sub: 'Rented in Dhanmondi',
  },
  {
    quote: 'I bought from London on power of attorney. The agent sent video walkthroughs and the full paper trail before I transferred a single taka.',
    name: 'Aminul Haque',
    sub: 'NRB buyer, London',
  },
];

const STATS = [
  { value: '12,480+', label: 'Verified listings', icon: <FaBuilding /> },
  { value: '1,340+', label: 'Active agents', icon: <FaUsers /> },
  { value: '68+', label: 'Areas covered', icon: <FaMapMarkerAlt /> },
  { value: '3,120+', label: 'Deals closed', icon: <FaHandshake /> },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchTab, setSearchTab] = useState('buy'); // 'buy' | 'rent' | 'sell' | 'loan'
  const [searchQuery, setSearchQuery] = useState('');
  const [propType, setPropType] = useState('');
  const [cityFilter, setCityFilter] = useState('all'); // 'all' | 'dhaka' | 'chattogram' | 'sylhet'
  const [listTypeFilter, setListTypeFilter] = useState('all'); // 'all' | 'sale' | 'rent'

  const [featuredProps, setFeaturedProps] = useState([]);
  const [rentProps, setRentProps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [featRes, rentRes] = await Promise.allSettled([
          propertiesApi.getFeatured(),
          propertiesApi.list({ listing_type: 'rent', page_size: 8 }),
        ]);

        let featList = [];
        if (featRes.status === 'fulfilled' && featRes.value?.data) {
          const data = featRes.value.data;
          featList = data.results || (Array.isArray(data) ? data : []);
        }

        // If no featured returned from API, fetch initial general properties
        if (!featList.length) {
          try {
            const fallbackRes = await propertiesApi.list({ page_size: 12 });
            const fbData = fallbackRes.data;
            featList = fbData.results || (Array.isArray(fbData) ? fbData : []);
          } catch (_) {}
        }

        if (isMounted) {
          setFeaturedProps(featList);

          if (rentRes.status === 'fulfilled' && rentRes.value?.data) {
            const rData = rentRes.value.data;
            const rList = rData.results || (Array.isArray(rData) ? rData : []);
            setRentProps(rList.slice(0, 4));
          } else {
            // Filter rent from featList if available
            setRentProps(featList.filter(p => p.listing_type === 'rent').slice(0, 4));
          }
        }
      } catch (_) {
        /* silent fallback */
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  const handleTabClick = (tab) => {
    if (tab === 'sell') {
      navigate('/sell');
      return;
    }
    if (tab === 'loan') {
      navigate('/loan');
      return;
    }
    setSearchTab(tab);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (propType) params.set('property_type', propType);
    params.set('listing_type', searchTab === 'rent' ? 'rent' : 'sale');
    navigate(`/properties?${params.toString()}`);
  };

  // Filter featured properties by City and Type
  const filteredFeatured = useMemo(() => {
    return featuredProps.filter((p) => {
      // City filter
      if (cityFilter !== 'all') {
        const pCity = (p.city || '').toLowerCase();
        if (!pCity.includes(cityFilter)) return false;
      }
      // Type filter
      if (listTypeFilter === 'sale' && p.listing_type !== 'sale') return false;
      if (listTypeFilter === 'rent' && p.listing_type !== 'rent') return false;
      return true;
    });
  }, [featuredProps, cityFilter, listTypeFilter]);

  return (
    <div className="hp">

      {/* ══════════════════ 1. HERO ══════════════════ */}
      <section className="hp-hero">
        <div className="hp-hero__overlay" />
        <div className="hp-wrap hp-hero__inner">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="hp-hero__content"
          >
            {/* Sparkles verified badge */}
            <div className="hp-hero__badge">
              <span className="hp-hero__badge-sparkle">✦</span>
              <span>Every listing checked against RAJUK &amp; CDA papers</span>
            </div>

            <h1 className="hp-hero__h1">
              Find your next address in Bangladesh
            </h1>
            <p className="hp-hero__sub">
              Verified flats, plots and commercial space across Dhaka, Chattogram and Sylhet — with real prices, real papers and agents who answer.
            </p>

            {/* Search Console */}
            <div className="hp-console">
              <div className="hp-console__tabs">
                <button
                  type="button"
                  className={`hp-console__tab ${searchTab === 'buy' ? 'active' : ''}`}
                  onClick={() => handleTabClick('buy')}
                >
                  Buy
                </button>
                <button
                  type="button"
                  className={`hp-console__tab ${searchTab === 'rent' ? 'active' : ''}`}
                  onClick={() => handleTabClick('rent')}
                >
                  Rent
                </button>
                <button
                  type="button"
                  className="hp-console__tab"
                  onClick={() => handleTabClick('sell')}
                >
                  Sell
                </button>
                <button
                  type="button"
                  className="hp-console__tab"
                  onClick={() => handleTabClick('loan')}
                >
                  Home loan
                </button>
              </div>

              <form className="hp-console__form" onSubmit={handleSearch}>
                {/* Search query input */}
                <div className="hp-console__field hp-console__field--grow">
                  <FaMapMarkerAlt className="hp-console__icon" />
                  <input
                    type="text"
                    placeholder="Try “Gulshan”, “Uttara Sector 7” or “Bashundhara”"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="hp-console__input"
                    aria-label="Location search"
                  />
                </div>

                {/* Property type dropdown */}
                <div className="hp-console__field hp-console__field--select">
                  <select
                    className="hp-console__select"
                    value={propType}
                    onChange={(e) => setPropType(e.target.value)}
                    aria-label="Property type"
                  >
                    <option value="">Any type</option>
                    <option value="apartment">Apartment</option>
                    <option value="duplex">Duplex</option>
                    <option value="house">House</option>
                    <option value="land">Land / plot</option>
                    <option value="commercial">Commercial</option>
                    <option value="office">Office</option>
                  </select>
                  <FaChevronDown className="hp-console__select-arrow" />
                </div>

                {/* Submit button */}
                <button type="submit" className="hp-console__btn">
                  <FaSearch />
                  <span>Search</span>
                </button>
              </form>
            </div>

            {/* Popular quick links */}
            <div className="hp-hero__areas">
              <span className="hp-hero__areas-label">Popular:</span>
              {['Gulshan', 'Banani', 'Dhanmondi', 'Uttara', 'Bashundhara R/A'].map((name) => (
                <button
                  key={name}
                  type="button"
                  className="hp-hero__area-chip"
                  onClick={() => navigate(`/properties?search=${encodeURIComponent(name)}`)}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Assurance line */}
            <p className="hp-hero__assurance">
              <FaShieldAlt className="text-gold-400" />
              <span>No paid boosting on unverified listings — ever.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ 2. TRUST STATS BAR ══════════════════ */}
      <section className="hp-stats">
        <div className="hp-wrap">
          <div className="hp-stats__grid">
            {STATS.map((s, i) => (
              <div key={i} className="hp-stats__item">
                <div className="hp-stats__icon-wrap">
                  {s.icon}
                </div>
                <div className="hp-stats__meta">
                  <span className="hp-stats__value">{s.value}</span>
                  <span className="hp-stats__label">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. FEATURED PROPERTIES ══════════════════ */}
      <section className="hp-section hp-section--white">
        <div className="hp-wrap">
          <div className="hp-section__head">
            <div>
              <h2 className="hp-section__title">Featured properties</h2>
              <p className="hp-section__sub">Hand-picked listings our team has visited and verified this month</p>
            </div>
            <Link to="/properties?type=sale" className="hp-section__view-all">
              <span>View all</span>
              <FaArrowRight />
            </Link>
          </div>

          {/* City Filter Pills */}
          <div className="hp-city-tabs">
            {[
              { id: 'all', label: 'All cities' },
              { id: 'dhaka', label: 'Dhaka' },
              { id: 'chattogram', label: 'Chattogram' },
              { id: 'sylhet', label: 'Sylhet' },
            ].map((city) => (
              <button
                key={city.id}
                type="button"
                className={`hp-city-tab ${cityFilter === city.id ? 'active' : ''}`}
                onClick={() => setCityFilter(city.id)}
              >
                {city.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="hp-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="hp-skeleton-card">
                  <div className="hp-skeleton-img" />
                  <div className="hp-skeleton-body">
                    <div className="hp-skeleton-line hp-skeleton-line--short" />
                    <div className="hp-skeleton-line" />
                    <div className="hp-skeleton-line hp-skeleton-line--med" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFeatured.length > 0 ? (
            <div className="hp-grid">
              {filteredFeatured.slice(0, 6).map((p, i) => (
                <PropertyCard key={p.id} property={p} fallbackIndex={i} />
              ))}
            </div>
          ) : (
            <div className="hp-empty">
              <p>No verified properties match the selected city. <button type="button" onClick={() => setCityFilter('all')}>Show all cities</button></p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════ 4. EXPLORE BY AREA ══════════════════ */}
      <section className="hp-section hp-section--sand">
        <div className="hp-wrap">
          <div className="hp-section__head">
            <div>
              <h2 className="hp-section__title">Explore by area</h2>
              <p className="hp-section__sub">Average prices, rent levels and what each neighbourhood is actually like</p>
            </div>
            <Link to="/properties" className="hp-section__view-all">
              <span>View all</span>
              <FaArrowRight />
            </Link>
          </div>

          <div className="hp-areas-grid">
            {AREAS.map((area, i) => (
              <div
                key={i}
                className="hp-area-card"
                onClick={() => navigate(`/properties?search=${encodeURIComponent(area.name)}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/properties?search=${encodeURIComponent(area.name)}`); }}
              >
                <div className="hp-area-card__img-wrap">
                  <img src={area.img} alt={area.name} className="hp-area-card__img" loading="lazy" />
                  <div className="hp-area-card__overlay" />
                </div>
                <div className="hp-area-card__body">
                  <div className="hp-area-card__header-row">
                    <div>
                      <h3 className="hp-area-card__name">{area.name}</h3>
                      <p className="hp-area-card__location">{area.city} · {area.listings} listings</p>
                    </div>
                    <span className="hp-area-card__trend">
                      ▲ {area.trend}
                    </span>
                  </div>
                  <div className="hp-area-card__stats-row">
                    <span>Avg <b>{area.avgSqft}</b>/sqft</span>
                    <span>2-bed rent <b>{area.rent2Bed}</b></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. TOOLS THAT DO THE MATHS ══════════════════ */}
      <section className="hp-section hp-section--white">
        <div className="hp-wrap">
          <h2 className="hp-section__title">Tools that do the maths for you</h2>
          <div className="hp-tools-grid">
            {TOOLS.map((t, i) => (
              <Link key={i} to={t.link} className={`hp-tool-card hp-tool-card--${t.badgeColor}`}>
                <span className="hp-tool-card__icon">{t.icon}</span>
                <h3 className="hp-tool-card__title">{t.title}</h3>
                <p className="hp-tool-card__desc">{t.desc}</p>
                <span className="hp-tool-card__cta">
                  {t.cta}
                  <FaArrowRight />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 6. AVAILABLE FOR RENT NOW ══════════════════ */}
      {(rentProps.length > 0 || loading) && (
        <section className="hp-section hp-section--sand">
          <div className="hp-wrap">
            <div className="hp-section__head">
              <div>
                <h2 className="hp-section__title">Available for rent now</h2>
                <p className="hp-section__sub">Move-in ready flats with the service charge stated up front</p>
              </div>
              <Link to="/properties?type=rent" className="hp-section__view-all">
                <span>View all</span>
                <FaArrowRight />
              </Link>
            </div>
            {loading ? (
              <div className="hp-grid hp-grid--4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="hp-skeleton-card">
                    <div className="hp-skeleton-img" />
                    <div className="hp-skeleton-body">
                      <div className="hp-skeleton-line hp-skeleton-line--short" />
                      <div className="hp-skeleton-line" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="hp-grid hp-grid--4">
                {rentProps.map((p, i) => (
                  <PropertyCard key={p.id} property={p} fallbackIndex={i + 12} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════════════ 7. HOW IT WORKS ══════════════════ */}
      <section className="hp-section hp-section--sand">
        <div className="hp-wrap">
          <h2 className="hp-section__title">How Zennor works</h2>
          <div className="hp-steps-grid">
            {HOW_STEPS.map((s, i) => (
              <div key={i} className="hp-step">
                <span className="hp-step__num-bg">{s.num}</span>
                <div className="hp-step__icon">{s.icon}</div>
                <h3 className="hp-step__title">{s.title}</h3>
                <p className="hp-step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. TALK TO A VERIFIED AGENT ══════════════════ */}
      <section className="hp-section hp-section--white">
        <div className="hp-wrap">
          <div className="hp-section__head">
            <div>
              <h2 className="hp-section__title">Talk to a verified agent</h2>
              <p className="hp-section__sub">Every agent on this page is licence-checked and rated by past clients</p>
            </div>
            <Link to="/agents" className="hp-section__view-all">
              <span>View all</span>
              <FaArrowRight />
            </Link>
          </div>

          <div className="hp-agents-grid">
            {AGENTS.map((ag, i) => (
              <article key={i} className="hp-agent-card">
                <div className="hp-agent-card__top">
                  <img src={ag.img} alt={ag.name} className="hp-agent-card__avatar" loading="lazy" />
                  <div className="hp-agent-card__meta">
                    <h3 className="hp-agent-card__name">
                      <span>{ag.name}</span>
                      <FaCheckCircle className="text-brand-600 ml-1 text-sm" />
                    </h3>
                    <p className="hp-agent-card__agency">{ag.agency}</p>
                    <p className="hp-agent-card__rating">
                      <FaStar className="text-gold-400" />
                      <b>{ag.rating}</b>
                      <span>({ag.reviews})</span>
                    </p>
                  </div>
                </div>

                <p className="hp-agent-card__areas">
                  <FaMapMarkerAlt className="text-ink-500 mr-1 flex-shrink-0" />
                  <span>{ag.area}</span>
                </p>

                <div className="hp-agent-card__stats-box">
                  <div>
                    <p className="hp-agent-stat__num">{ag.deals}</p>
                    <p className="hp-agent-stat__label">Deals</p>
                  </div>
                  <div className="border-x">
                    <p className="hp-agent-stat__num">{ag.years}</p>
                    <p className="hp-agent-stat__label">Years</p>
                  </div>
                  <div>
                    <p className="hp-agent-stat__num">{ag.reviews}</p>
                    <p className="hp-agent-stat__label">Reviews</p>
                  </div>
                </div>

                <div className="hp-agent-card__actions">
                  <a href={`tel:${ag.phone}`} className="hp-agent-card__btn hp-agent-card__btn--call">
                    <FaPhone className="text-xs mr-1" /> Call
                  </a>
                  <Link
                    to={`/properties?search=${encodeURIComponent(ag.name.split(' ')[0])}`}
                    className="hp-agent-card__btn hp-agent-card__btn--listings"
                  >
                    Listings
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 9. WHAT BUYERS SAY ══════════════════ */}
      <section className="hp-section hp-section--dark">
        <div className="hp-wrap">
          <h2 className="hp-section__title hp-section__title--white">What buyers say</h2>
          <div className="hp-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <figure key={i} className="hp-testimonial">
                <span className="hp-testimonial__quote-mark">“</span>
                <blockquote className="hp-testimonial__quote">
                  {t.quote}
                </blockquote>
                <div className="hp-testimonial__stars">
                  {'★★★★★'}
                </div>
                <figcaption className="hp-testimonial__author">
                  <strong>{t.name}</strong>
                  <span>{t.sub}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 10. FOR AGENTS & DEVELOPERS ══════════════════ */}
      <section className="hp-section hp-section--white">
        <div className="hp-wrap">
          <div className="hp-banner-dev">
            <div className="hp-banner-dev__content">
              <span className="hp-banner-dev__pill">For agents &amp; developers</span>
              <h2 className="hp-banner-dev__title">Run your whole property business from one dashboard</h2>
              <p className="hp-banner-dev__desc">
                Listings, leads, visits and invoices in one place — built for how brokerages in Dhaka actually work, and priced in taka.
              </p>
              <ul className="hp-banner-dev__list">
                <li><FaCheck className="text-brand-600" /> Publish 25 listings from one dashboard</li>
                <li><FaCheck className="text-brand-600" /> Every enquiry lands in your lead inbox</li>
                <li><FaCheck className="text-brand-600" /> Pay monthly with bKash or Nagad</li>
                <li><FaCheck className="text-brand-600" /> Cancel any month, no lock-in</li>
              </ul>
              <div className="hp-banner-dev__btns">
                <Link to="/pricing" className="hp-banner-btn hp-banner-btn--primary">
                  <span>See plans from ৳ 2,500/mo</span>
                  <FaArrowRight />
                </Link>
                <Link to="/dashboard" className="hp-banner-btn hp-banner-btn--secondary">
                  Try the live demo
                </Link>
              </div>
            </div>

            <div className="hp-banner-dev__visual">
              <div className="hp-banner-dev__img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80"
                  alt="Zennor Agent Dashboard"
                  className="hp-banner-dev__img"
                  loading="lazy"
                />
                <div className="hp-banner-dev__stat-card">
                  <p className="hp-stat-card__label">Leads this month</p>
                  <p className="hp-stat-card__value">142 <span className="hp-stat-card__change">+38%</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

