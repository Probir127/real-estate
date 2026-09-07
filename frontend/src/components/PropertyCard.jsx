import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './PropertyCard.css';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
  'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80',
];

function formatBDT(price) {
  if (!price) return '—';
  const n = Number(price);
  if (n >= 10000000) return `৳ ${(n / 10000000).toFixed(2).replace(/\.?0+$/, '')} Crore`;
  if (n >= 100000) return `৳ ${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 2).replace(/\.?0+$/, '')} Lakh`;
  if (n >= 1000) return `৳ ${(n / 1000).toFixed(0)}K`;
  return `৳ ${n.toLocaleString()}`;
}

function getStoredSaved() {
  try {
    return JSON.parse(localStorage.getItem('zennor_saved_homes') || '[]');
  } catch {
    return [];
  }
}

export default function PropertyCard({ property, onFavoriteToggle, fallbackIndex = 0 }) {
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(() => {
    if (property.is_favorited) return true;
    const stored = getStoredSaved();
    return stored.some(item => String(item.id) === String(property.id));
  });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Sync state if property.is_favorited changes
  useEffect(() => {
    if (property.is_favorited !== undefined) {
      setSaved(property.is_favorited);
    } else {
      const stored = getStoredSaved();
      setSaved(stored.some(item => String(item.id) === String(property.id)));
    }
  }, [property.id, property.is_favorited]);

  const isRent = property.listing_type === 'rent';
  const typeLabel = property.property_type_display || property.property_type || 'Apartment';
  
  const rawImg = property.primary_image_url || property.primary_image || property.images?.[0]?.image_url || property.images?.[0]?.image || (typeof property.images?.[0] === 'string' ? property.images[0] : null);
  const imageUrl = (!imgError && rawImg) || FALLBACK_IMAGES[fallbackIndex % FALLBACK_IMAGES.length];

  const address = [property.address, property.city].filter(Boolean).join(', ') || 'Dhaka, Bangladesh';
  const timeAgo = property.created_at
    ? (() => {
        const diff = Date.now() - new Date(property.created_at).getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return `${Math.floor(days / 7)} week${days >= 14 ? 's' : ''} ago`;
      })()
    : 'Recently';

  const parking = property.garage ?? property.parking_spaces ?? 0;

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const stored = getStoredSaved();
    const isCurrentlySaved = saved || stored.some(item => String(item.id) === String(property.id));
    
    let updated;
    if (isCurrentlySaved) {
      updated = stored.filter(item => String(item.id) !== String(property.id));
      setSaved(false);
      toast.success('Removed from saved properties');
    } else {
      const cleanItem = {
        id: property.id,
        title: property.title || `${typeLabel} in ${property.city || 'Dhaka'}`,
        price: property.price,
        listing_type: property.listing_type || 'sale',
        property_type: property.property_type || 'apartment',
        property_type_display: typeLabel,
        city: property.city || 'Dhaka',
        address: property.address || '',
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        area_sqft: property.area_sqft || 0,
        garage: parking,
        primary_image: imageUrl,
        primary_image_url: imageUrl,
      };
      updated = [cleanItem, ...stored.filter(item => String(item.id) !== String(property.id))];
      setSaved(true);
      toast.success('Saved to your shortlist!');
    }

    localStorage.setItem('zennor_saved_homes', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('savedHomesUpdated', { detail: updated }));
    onFavoriteToggle?.();
  };

  return (
    <article className="pcard">
      <Link to={`/properties/${property.id}`} className="pcard__link" aria-label={property.title}>

        {/* Image */}
        <div className="pcard__img-wrap">
          {!imgLoaded && !imgError && <div className="pcard__skeleton" aria-hidden="true" />}
          <img
            src={imageUrl}
            alt={property.title || 'Property'}
            className={`pcard__img${imgLoaded ? ' pcard__img--loaded' : ''}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
          />

          {/* Badges */}
          <div className="pcard__badges">
            <span className="pcard__badge pcard__badge--type">
              {isRent ? 'For rent' : 'For sale'}
            </span>
            {property.is_featured && (
              <span className="pcard__badge pcard__badge--featured">Featured</span>
            )}
          </div>

          {/* Save button */}
          <button
            className={`pcard__save${saved ? ' pcard__save--active' : ''}`}
            onClick={handleSave}
            aria-label="Save property"
            aria-pressed={saved}
          >
            <svg viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>
            </svg>
          </button>

          {/* Price overlay */}
          <div className="pcard__price-overlay">
            <p className="pcard__price">
              {formatBDT(property.price)}
              {isRent && <span className="pcard__price-period">/month</span>}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="pcard__body">
          <div className="pcard__type-row">
            <span className="pcard__type-label">{typeLabel}</span>
            <span className="pcard__dot">•</span>
            <span className="pcard__verified">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              Verified
            </span>
          </div>

          <h3 className="pcard__title">
            {property.title || `${typeLabel} in ${property.city || 'Dhaka'}`}
          </h3>

          <p className="pcard__address">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{address}</span>
          </p>

          <div className="pcard__specs">
            {property.bedrooms > 0 && (
              <span className="pcard__spec">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/>
                  <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/>
                  <path d="M12 4v6"/>
                  <path d="M2 18h20"/>
                </svg>
                <b>{property.bedrooms}</b>
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="pcard__spec">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <path d="M10 4 8 6"/>
                  <path d="M17 19v2"/>
                  <path d="M2 12h20"/>
                  <path d="M7 19v2"/>
                  <path d="M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>
                </svg>
                <b>{property.bathrooms}</b>
              </span>
            )}
            {property.area_sqft > 0 && (
              <span className="pcard__spec">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <path d="M15 3h6v6"/>
                  <path d="m21 3-7 7"/>
                  <path d="m3 21 7-7"/>
                  <path d="M9 21H3v-6"/>
                </svg>
                <b>{property.area_sqft?.toLocaleString()}</b>
                <span>sqft</span>
              </span>
            )}
            {parking > 0 && (
              <span className="pcard__spec">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                  <circle cx="7" cy="17" r="2"/>
                  <path d="M9 17h6"/>
                  <circle cx="17" cy="17" r="2"/>
                </svg>
                <b>{parking}</b>
              </span>
            )}
          </div>

          <p className="pcard__time">{timeAgo}</p>
        </div>
      </Link>
    </article>
  );
}
