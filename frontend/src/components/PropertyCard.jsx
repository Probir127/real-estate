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

  const imageUrl = property.primary_image_url || property.images?.[0]?.image_url || property.image_url;

  return (
    <Link to={`/properties/${property.id}`} className="z-card">

      {/* ── 1. Photo Container ──────────────────── */}
      <div className="z-card__photo-box">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={property.title}
            className="z-card__photo"
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
          className="z-card__placeholder"
          style={{ display: imageUrl ? 'none' : 'flex' }}
        >
          <PlaceholderIcon className="z-card__placeholder-icon" />
          <span>{typeLabel}</span>
        </div>

        {/* Status Pill (Zillow Style: Dot + Text) */}
        <div className="z-card__status-pill">
          <span className={`z-card__status-dot ${isRent ? 'z-card__status-dot--blue' : 'z-card__status-dot--green'}`} />
          <span className="z-card__status-text">
            {typeLabel} {isRent ? 'for rent' : 'for sale'}
          </span>
        </div>

        {/* Save Home Heart Button */}
        <button
          className={`z-card__heart-btn ${isFav ? 'z-card__heart-btn--active' : ''}`}
          onClick={handleFavorite}
          disabled={favLoading}
          aria-label={isFav ? 'Remove from saved homes' : 'Save home'}
        >
          <FaHeart />
        </button>
      </div>

      {/* ── 2. Card Body (Exact Zillow Specs) ────── */}
      <div className="z-card__body">
        
        {/* Price Row */}
        <div className="z-card__price-row">
          <span className="z-card__price">
            {formatPrice(property.price)}
            {isRent && <span className="z-card__price-period">/mo</span>}
          </span>
        </div>

        {/* Specs: 4 bds | 3 ba | 3,200 sqft - House for sale */}
        <div className="z-card__specs">
          {property.bedrooms > 0 && (
            <span className="z-card__spec">
              <strong>{property.bedrooms}</strong> bds
            </span>
          )}
          {property.bedrooms > 0 && property.bathrooms > 0 && (
            <span className="z-card__spec-divider">•</span>
          )}
          {property.bathrooms > 0 && (
            <span className="z-card__spec">
              <strong>{property.bathrooms}</strong> ba
            </span>
          )}
          {property.area_sqft > 0 && (
            <>
              <span className="z-card__spec-divider">•</span>
              <span className="z-card__spec">
                <strong>{property.area_sqft?.toLocaleString()}</strong> sqft
              </span>
            </>
          )}
          <span className="z-card__spec-divider">-</span>
          <span className="z-card__spec-type">{isRent ? 'For Rent' : 'For Sale'}</span>
        </div>

        {/* Address */}
        <div className="z-card__address" title={property.address || property.location || property.city}>
          {property.address || property.location || `${property.city}, Bangladesh`}
        </div>

        {/* Broker / Agent Attribution */}
        <div className="z-card__broker">
          PRESTIGE REALTY BROKERAGE
        </div>

      </div>

    </Link>
  );
}
