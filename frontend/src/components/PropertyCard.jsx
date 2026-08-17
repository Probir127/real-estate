import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBed, FaBath, FaRulerCombined, FaHeart, FaMapMarkerAlt,
  FaStar, FaHome, FaBuilding, FaCity, FaStore, FaTree
} from 'react-icons/fa';
import { formatPrice, truncate } from '../utils/helpers';
import { favoritesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './PropertyCard.css';

const TYPE_ICONS = {
  apartment: FaBuilding,
  house: FaHome,
  villa: FaCity,
  commercial: FaStore,
  land: FaTree,
  condo: FaBuilding,
  townhouse: FaHome,
};

export default function PropertyCard({ property, onFavoriteToggle }) {
  const { isAuthenticated } = useAuth();
  const [isFav, setIsFav] = useState(property.is_favorited || false);
  const [favLoading, setFavLoading] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please sign in to save properties.');
      return;
    }
    setFavLoading(true);
    try {
      if (isFav) {
        let deleteId = property.favorite_id;
        if (!deleteId) {
          const res = await favoritesApi.list();
          const favList = res.data.results || res.data || [];
          const match = favList.find(f => (f.property_detail?.id || f.property_id) === property.id);
          if (match) deleteId = match.id;
        }
        if (deleteId) {
          await favoritesApi.remove(deleteId);
          property.favorite_id = null;
        }
        setIsFav(false);
        toast.success('Removed from saved homes.');
      } else {
        const res = await favoritesApi.add(property.id);
        setIsFav(true);
        property.favorite_id = res?.data?.id;
        toast.success('Saved to your favorites!');
      }
      onFavoriteToggle?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update favorites.');
    } finally {
      setFavLoading(false);
    }
  };

  const pType = property.property_type || 'apartment';
  const PlaceholderIcon = TYPE_ICONS[pType] || FaHome;
  const typeLabel = property.property_type_display || pType;
  const isRent = property.listing_type === 'rent';

  return (
    <Link to={`/properties/${property.id}`} className="property-card">

      {/* ── Image & Badges ───────────────────────── */}
      <div className="property-card__image-wrap">
        {(property.primary_image_url || property.images?.[0]?.image_url) ? (
          <img
            src={property.primary_image_url || property.images[0].image_url}
            alt={property.title}
            className="property-card__image"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) {
                e.target.nextElementSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div
          className={`property-card__placeholder`}
          style={{ display: (property.primary_image_url || property.images?.[0]?.image_url) ? 'none' : 'flex' }}
        >
          <PlaceholderIcon className="property-card__placeholder-icon" />
          <span className="property-card__placeholder-type">{typeLabel}</span>
        </div>

        {/* Top Badges */}
        <div className="property-card__badges">
          <span className={`badge ${isRent ? 'badge-rent' : 'badge-sale'}`}>
            {isRent ? 'For Rent' : 'For Sale'}
          </span>
          {property.is_featured && (
            <span className="badge badge-featured">
              <FaStar size={10} /> Featured
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          className={`property-card__fav-btn ${isFav ? 'property-card__fav-btn--active' : ''}`}
          onClick={handleFavorite}
          disabled={favLoading}
          aria-label={isFav ? 'Remove from saved homes' : 'Save home'}
        >
          <FaHeart />
        </button>
      </div>

      {/* ── Card Content (Zillow Format) ─────────── */}
      <div className="property-card__body">
        <div className="property-card__price-row">
          <span className="property-card__price">
            {formatPrice(property.price)}
            {isRent && <span className="property-card__price-period">/mo</span>}
          </span>
        </div>

        {/* Specs: 3 bds · 2 ba · 1,850 sqft - Apartment for sale */}
        <div className="property-card__specs">
          {property.bedrooms > 0 && (
            <>
              <span className="property-card__spec-item">
                <strong>{property.bedrooms}</strong> bds
              </span>
              <span className="property-card__spec-dot">·</span>
            </>
          )}
          {property.bathrooms > 0 && (
            <>
              <span className="property-card__spec-item">
                <strong>{property.bathrooms}</strong> ba
              </span>
              <span className="property-card__spec-dot">·</span>
            </>
          )}
          {property.area_sqft > 0 && (
            <>
              <span className="property-card__spec-item">
                <strong>{property.area_sqft?.toLocaleString()}</strong> sqft
              </span>
              <span className="property-card__spec-dot">·</span>
            </>
          )}
          <span className="property-card__type-tag">{typeLabel}</span>
        </div>

        {/* Address */}
        <p className="property-card__address">
          {property.address ? `${property.address}, ` : ''}{property.city}
        </p>

        {/* Agent attribution */}
        <div className="property-card__footer">
          <small className="property-card__agent">
            Prestige Realty · {property.agent_name || 'Licensed Agent'}
          </small>
        </div>
      </div>

    </Link>
  );
}
