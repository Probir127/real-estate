import { useState } from 'react';
import {
  FaMapMarkerAlt, FaWalking, FaBus, FaGraduationCap,
  FaUtensils, FaShoppingCart, FaShieldAlt
} from 'react-icons/fa';
import './NeighborhoodMap.css';

const CITY_COORDS = {
  Dhaka: { lat: 23.8103, lng: 90.4125 },
  Chittagong: { lat: 22.3569, lng: 91.7832 },
  Sylhet: { lat: 24.8949, lng: 91.8687 },
  "Cox's Bazar": { lat: 21.4272, lng: 92.0058 },
  Rajshahi: { lat: 24.3745, lng: 88.6042 },
  Khulna: { lat: 22.8456, lng: 89.5403 },
};

const NEARBY_AMENITIES = {
  all: [
    { name: 'Scholastica International School', type: 'Schools', distance: '0.4 mi', score: '9/10' },
    { name: 'BRT Express Transit Terminal', type: 'Transit', distance: '0.2 mi', score: 'Direct' },
    { name: 'Unimart Gourmet Superstore', type: 'Groceries', distance: '0.6 mi', score: 'Open' },
    { name: 'The Grove Cafe & Bistro', type: 'Restaurants', distance: '0.3 mi', score: '4.8 ★' },
    { name: 'Apollo / Evercare Specialized Hospital', type: 'Healthcare', distance: '1.2 mi', score: '24/7' },
  ],
  schools: [
    { name: 'Scholastica International School', type: 'Schools', distance: '0.4 mi', score: '9/10' },
    { name: 'Mastermind English Medium', type: 'Schools', distance: '0.8 mi', score: '8/10' },
    { name: 'North South University Campus', type: 'Schools', distance: '1.5 mi', score: 'University' },
  ],
  transit: [
    { name: 'BRT Express Transit Terminal', type: 'Transit', distance: '0.2 mi', score: 'Direct' },
    { name: 'Airport Rail Station', type: 'Transit', distance: '1.4 mi', score: 'Intercity' },
  ],
  food: [
    { name: 'The Grove Cafe & Bistro', type: 'Restaurants', distance: '0.3 mi', score: '4.8 ★' },
    { name: 'Unimart Gourmet Food Court', type: 'Restaurants', distance: '0.6 mi', score: '4.7 ★' },
    { name: 'Gloria Jean\'s Coffees', type: 'Restaurants', distance: '0.5 mi', score: '4.6 ★' },
  ],
};

export default function NeighborhoodMap({ property }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const city = property?.city || 'Dhaka';
  const coords = CITY_COORDS[city] || CITY_COORDS['Dhaka'];
  const lat = property?.latitude || coords.lat;
  const lng = property?.longitude || coords.lng;

  // OpenStreetMap embed URL
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.015}%2C${lat - 0.01}%2C${lng + 0.015}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;

  const currentList = NEARBY_AMENITIES[activeCategory] || NEARBY_AMENITIES.all;

  return (
    <div className="z-neighborhood-card">
      <div className="z-neighborhood__header">
        <div>
          <h3 className="z-neighborhood__title">
            <FaMapMarkerAlt className="text-blue" /> Neighborhood & Local Amenities
          </h3>
          <p className="z-neighborhood__subtitle">
            {property?.address ? `${property.address}, ` : ''}{property?.city}, Bangladesh
          </p>
        </div>

        {/* Scores */}
        <div className="z-scores-wrap">
          <div className="z-score-pill">
            <FaWalking className="text-green" />
            <div>
              <strong>88</strong>
              <small>Walk Score®</small>
            </div>
          </div>
          <div className="z-score-pill">
            <FaBus className="text-blue" />
            <div>
              <strong>74</strong>
              <small>Transit Score®</small>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map Frame */}
      <div className="z-map-frame-wrap">
        <iframe
          title="Property Location Map"
          className="z-map-frame"
          src={mapEmbedUrl}
          loading="lazy"
        />
        <div className="z-map-overlay-badge">
          <FaMapMarkerAlt /> {property?.title || 'Property Location'}
        </div>
      </div>

      {/* Nearby Places Section */}
      <div className="z-nearby-places">
        <div className="z-nearby-tabs">
          <button
            type="button"
            className={`z-nearby-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Nearby
          </button>
          <button
            type="button"
            className={`z-nearby-tab ${activeCategory === 'schools' ? 'active' : ''}`}
            onClick={() => setActiveCategory('schools')}
          >
            <FaGraduationCap /> Schools
          </button>
          <button
            type="button"
            className={`z-nearby-tab ${activeCategory === 'transit' ? 'active' : ''}`}
            onClick={() => setActiveCategory('transit')}
          >
            <FaBus /> Transit
          </button>
          <button
            type="button"
            className={`z-nearby-tab ${activeCategory === 'food' ? 'active' : ''}`}
            onClick={() => setActiveCategory('food')}
          >
            <FaUtensils /> Dining & Groceries
          </button>
        </div>

        <div className="z-nearby-list">
          {currentList.map((item, idx) => (
            <div key={idx} className="z-nearby-item">
              <div className="z-nearby-item__left">
                <strong>{item.name}</strong>
                <span className="z-nearby-item__type">{item.type}</span>
              </div>
              <div className="z-nearby-item__right">
                <span className="z-nearby-item__dist">{item.distance}</span>
                <span className="z-nearby-item__score">{item.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
