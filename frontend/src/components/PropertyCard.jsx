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
        if (property.favorite_id) {
          await favoritesApi.remove(property.favorite_id);
        }
        setIsFav(false);
        toast.success('Removed from favorites.');
      } else {
        const res = await favoritesApi.add(property.id);
        setIsFav(true);
        // Update favorite_id in-place for future removal
        property.favorite_id = res?.data?.id;
        toast.success('Added to favorites!');
      }
      onFavoriteToggle?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update favorites.');
    } finally {
      setFavLoading(false);
    }
  };

  const pType = property.property_type || 'default';
  const PlaceholderIcon = TYPE_ICONS[pType] || FaHome;
  const typeLabel = property.property_type_display || pType;

  return (
    <Link to={`/properties/${property.id}`} className="property-card">

      {/* ── Image / Gradient Placeholder ─────────── */}
      <div className="property-card__image-wrap">
        {(property.primary_image_url || property.images?.[0]?.image_url) ? (
          <img
            src={property.primary_image_url || property.images[0].image_url}
            alt={property.title}
            className="property-card__image"
            loading="lazy"
          />
        ) : (
          <div className={`property-card__placeholder placeholder--${pType}`}>
            <PlaceholderIcon className="placeholder__icon" />
            <span className="placeholder__type">{typeLabel}</span>
          </div>
        )}

        {/* Badges */}
        <div className="property-card__badges">
          <span className={`badge ${property.listing_type === 'rent' ? 'badge-blue' : 'badge-gold'}`}>
            {property.listing_type_display || (property.listing_type === 'rent' ? 'For Rent' : 'For Sale')}
          </span>
          {property.is_featured && (
            <span className="badge badge-gold">
              <FaStar size={9} /> Featured
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          className={`property-card__fav-btn ${isFav ? 'property-card__fav-btn--active' : ''}`}
          onClick={handleFavorite}
          disabled={favLoading}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <FaHeart />
        </button>
      </div>

      {/* ── Card Body ────────────────────────────── */}
      <div className="property-card__body">
        <div className="property-card__price">
          {formatPrice(property.price, property.listing_type)}
        </div>

        <h3 className="property-card__title">{truncate(property.title, 58)}</h3>

        <div className="property-card__location">
          <FaMapMarkerAlt />
          <span>{property.city}{property.state ? `, ${property.state}` : ''}</span>
        </div>

        <div className="property-card__stats">
          {property.bedrooms > 0 && (
            <span><FaBed /> {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
          )}
          {property.bathrooms > 0 && (
            <span><FaBath /> {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
          )}
          {property.area_sqft > 0 && (
            <span><FaRulerCombined /> {property.area_sqft?.toLocaleString()} sqft</span>
          )}
        </div>

        <div className="property-card__footer">
          <span className="property-card__type">{typeLabel}</span>
          <span className="property-card__agent">
            {property.agent_name ? `By ${property.agent_name}` : ''}
          </span>
        </div>
      </div>
    </Link>
  );
}
