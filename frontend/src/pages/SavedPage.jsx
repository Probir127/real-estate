import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaBed, FaBath, FaRulerCombined, FaArrowRight } from 'react-icons/fa';
import './SavedPage.css';

export function formatBDT(amount) {
  if (amount >= 10000000) {
    const crore = amount / 10000000;
    return `৳ ${crore.toFixed(crore % 1 === 0 ? 0 : 2)} Crore`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `৳ ${lakh.toFixed(lakh % 1 === 0 ? 0 : 2)} Lakh`;
  }
  return `৳ ${Math.round(amount).toLocaleString('en-IN')}`;
}

export default function SavedPage() {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSaved = async () => {
      setLoading(true);
      try {
        const localSaved = JSON.parse(localStorage.getItem('zennor_saved_homes') || '[]');
        setSavedItems(Array.isArray(localSaved) ? localSaved : []);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    loadSaved();
  }, []);

  const handleRemove = (id) => {
    const updated = savedItems.filter((item) => item.id !== id);
    setSavedItems(updated);
    localStorage.setItem('zennor_saved_homes', JSON.stringify(updated));
  };

  return (
    <div className="z-saved-page">
      <section className="z-saved-hero">
        <div className="container-page">
          <h1 className="z-saved-title">Saved Properties</h1>
          <p className="z-saved-sub">
            Homes you have bookmarked for comparison and private viewings.
          </p>
        </div>
      </section>

      <div className="container-page z-saved-container">
        {loading ? (
          <div className="py-20 text-center">
            <div className="spinner mx-auto" />
            <p className="mt-4 text-ink-500 text-sm">Loading your saved properties...</p>
          </div>
        ) : savedItems.length === 0 ? (
          <div className="z-saved-empty">
            <div className="z-saved-empty__icon-wrap">
              <FaHeart className="z-saved-empty__icon" />
            </div>
            <h2 className="text-2xl font-bold text-ink-900 mt-4">You haven’t saved any homes yet</h2>
            <p className="text-ink-500 text-sm mt-2 max-w-md mx-auto">
              Click the heart icon on any listing across Dhaka, Chattogram or Sylhet to save it here for later.
            </p>
            <Link to="/search?type=buy" className="z-saved-browse-btn">
              Browse Properties <FaArrowRight className="ml-2" />
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-ink-500 mb-6">
              {savedItems.length} {savedItems.length === 1 ? 'property' : 'properties'} saved
            </p>

            <div className="z-saved-grid">
              {savedItems.map((prop) => (
                <div key={prop.id} className="z-saved-card">
                  <div className="z-saved-card__img-wrap">
                    <img
                      src={prop.primary_image || prop.images?.[0]?.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'}
                      alt={prop.title}
                      className="z-saved-card__img"
                      loading="lazy"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(prop.id)}
                      className="z-saved-remove-btn"
                      title="Remove from saved"
                      aria-label="Remove from saved"
                    >
                      <FaHeart className="text-rose-500 fill-current" />
                    </button>
                    <span className="z-saved-badge">
                      {prop.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                    </span>
                  </div>

                  <div className="z-saved-card__body">
                    <p className="z-saved-card__price">
                      {formatBDT(Number(prop.price))}
                      {prop.listing_type === 'rent' ? '/mo' : ''}
                    </p>
                    <h3 className="z-saved-card__title">
                      <Link to={`/properties/${prop.id}`}>{prop.title}</Link>
                    </h3>
                    <p className="z-saved-card__address">{prop.address}, {prop.city}</p>

                    <div className="z-saved-card__specs">
                      <span><FaBed className="inline mr-1" />{prop.bedrooms} beds</span>
                      <span><FaBath className="inline mr-1" />{prop.bathrooms} baths</span>
                      <span><FaRulerCombined className="inline mr-1" />{prop.area_sqft} sqft</span>
                    </div>

                    <Link to={`/properties/${prop.id}`} className="z-saved-card__link">
                      View Listing Details <FaArrowRight className="ml-1 text-xs" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
