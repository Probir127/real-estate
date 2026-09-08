import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useSiteContent from '../hooks/useSiteContent';
import {
  FaSearch, FaCheckCircle, FaStar, FaMapMarkerAlt, FaPhoneAlt
} from 'react-icons/fa';
import './AgentsPage.css';

const AGENTS = [
  {
    id: 'a1',
    name: 'Tanvir Ahmed',
    agency: 'Zennor Property Consultants',
    rating: 4.9,
    reviews: 187,
    city: 'Dhaka',
    areas: 'Gulshan, Banani, Baridhara',
    deals: 240,
    years: 12,
    phone: '+8801711204588',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    id: 'a2',
    name: 'Nusrat Jahan',
    agency: 'Shelter Line Realty',
    rating: 4.8,
    reviews: 143,
    city: 'Dhaka',
    areas: 'Dhanmondi, Lalmatia, Mohammadpur',
    deals: 176,
    years: 9,
    phone: '+8801819330711',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  },
  {
    id: 'a3',
    name: 'Rafiqul Islam',
    agency: 'Uttara Homes BD',
    rating: 4.7,
    reviews: 121,
    city: 'Dhaka',
    areas: 'Uttara, Nikunja, Airport',
    deals: 198,
    years: 14,
    phone: '+8801912776450',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
  },
  {
    id: 'a4',
    name: 'Farhana Kabir',
    agency: 'Bashundhara Estate Partners',
    rating: 4.8,
    reviews: 96,
    city: 'Dhaka',
    areas: 'Bashundhara R/A, Aftabnagar, Badda',
    deals: 132,
    years: 7,
    phone: '+8801755902314',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
  },
  {
    id: 'a5',
    name: 'Shahriar Kabir',
    agency: 'Port City Realty',
    rating: 4.9,
    reviews: 88,
    city: 'Chattogram',
    areas: 'Khulshi, Nasirabad, Panchlaish',
    deals: 119,
    years: 11,
    phone: '+8801833441029',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  },
  {
    id: 'a6',
    name: 'Mahmuda Akter',
    agency: 'Surma Valley Properties',
    rating: 4.7,
    reviews: 64,
    city: 'Sylhet',
    areas: 'Uposhohor, Zindabazar, Shahjalal Upashahar',
    deals: 91,
    years: 8,
    phone: '+8801717655903',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
  },
  {
    id: 'a7',
    name: 'Imran Hossain',
    agency: 'Mirpur Nest',
    rating: 4.6,
    reviews: 110,
    city: 'Dhaka',
    areas: 'Mirpur DOHS, Pallabi, Shewrapara',
    deals: 165,
    years: 10,
    phone: '+8801621338877',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
  },
  {
    id: 'a8',
    name: 'Sadia Rahman',
    agency: 'Zennor Property Consultants',
    rating: 4.9,
    reviews: 79,
    city: 'Dhaka',
    areas: 'Baridhara DOHS, Baridhara, Niketan',
    deals: 104,
    years: 6,
    phone: '+8801788120043',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
  },
];

const CITIES = ['All cities', 'Dhaka', 'Chattogram', 'Sylhet'];

export default function AgentsPage() {
  const [selectedCity, setSelectedCity] = useState('All cities');
  const [searchQuery, setSearchQuery] = useState('');
  const content = useSiteContent('agents', {
    title: 'Find a verified agent near you',
    subtitle: 'We check every agent’s trade licence and past deals before they can list. Ratings come from clients who actually closed.',
    agents: AGENTS,
    cities: CITIES,
    labels: { found: 'agents found', deals: 'Deals', years: 'Years', reviews: 'Reviews', call: 'Call', listings: 'Listings' },
  });
  const agents = Array.isArray(content.agents) ? content.agents : AGENTS;
  const cities = Array.isArray(content.cities) ? content.cities : CITIES;
  const labels = content.labels || {};

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchCity = selectedCity === 'All cities' || agent.city.toLowerCase() === selectedCity.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        agent.name.toLowerCase().includes(q) ||
        agent.agency.toLowerCase().includes(q) ||
        agent.areas.toLowerCase().includes(q);
      return matchCity && matchQuery;
    });
  }, [agents, selectedCity, searchQuery]);

  return (
    <div className="z-agents-page">
      {/* ── 1. Hero ────────────────────────────────────────────── */}
      <section className="z-agents-hero">
        <div className="container-page">
          <h1 className="z-agents-hero__title">{content.title}</h1>
          <p className="z-agents-hero__sub">
            {content.subtitle}
          </p>

          <div className="z-agents-search-bar">
            <div className="z-agents-input-wrap">
              <FaSearch className="z-agents-search-icon" />
              <input
                type="text"
                placeholder="Name, agency or area"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="z-agents-input"
              />
            </div>

            <div className="z-agents-cities">
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`z-city-btn ${selectedCity === city ? 'active' : ''}`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Agents Grid ─────────────────────────────────────── */}
      <div className="container-page z-agents-container">
        <p className="z-agents-count">{filteredAgents.length} {labels.found || 'agents found'}</p>

        <div className="z-agents-grid">
          {filteredAgents.map((agent) => (
            <article key={agent.id} className="z-agent-card">
              <div className="z-agent-header">
                <div className="z-agent-avatar-wrap">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="z-agent-avatar"
                    loading="lazy"
                  />
                </div>
                <div className="z-agent-meta">
                  <h3 className="z-agent-name">
                    <span>{agent.name}</span>
                    <FaCheckCircle className="z-agent-verified-icon" title="Verified Agent" />
                  </h3>
                  <p className="z-agent-agency">{agent.agency}</p>
                  <p className="z-agent-rating">
                    <FaStar className="z-star-icon" />
                    <span>{agent.rating}</span>
                    <span className="z-agent-rev-count">({agent.reviews})</span>
                  </p>
                </div>
              </div>

              <p className="z-agent-areas">
                <FaMapMarkerAlt className="z-pin-icon" />
                <span className="line-clamp-1">{agent.areas}</span>
              </p>

              <div className="z-agent-stats">
                <div className="z-stat-item">
                  <p className="z-stat-num">{agent.deals}</p>
                  <p className="z-stat-lbl">{labels.deals || 'Deals'}</p>
                </div>
                <div className="z-stat-item border-x">
                  <p className="z-stat-num">{agent.years}</p>
                  <p className="z-stat-lbl">{labels.years || 'Years'}</p>
                </div>
                <div className="z-stat-item">
                  <p className="z-stat-num">{agent.reviews}</p>
                  <p className="z-stat-lbl">{labels.reviews || 'Reviews'}</p>
                </div>
              </div>

              <div className="z-agent-actions">
                <a href={`tel:${agent.phone}`} className="z-agent-call-btn">
                  <FaPhoneAlt className="mr-1.5 text-xs" />
                  {labels.call || 'Call'}
                </a>
                <Link to={`/search?q=${encodeURIComponent(agent.name)}`} className="z-agent-listings-btn">
                  {labels.listings || 'Listings'}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
