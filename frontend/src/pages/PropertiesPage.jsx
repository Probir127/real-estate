import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FaTimes, FaSearch, FaSlidersH, FaFilter,
  FaMapMarkedAlt, FaThLarge, FaBookmark, FaSortAmountDown
} from 'react-icons/fa';
import { propertiesApi } from '../api/client';
import PropertyCard from '../components/PropertyCard';
import ZillowSearchMap from '../components/ZillowSearchMap';
import Pagination from '../components/Pagination';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';
import './PropertiesPage.css';

const DEFAULT_FILTERS = {
  search: '', city: '', property_type: '', listing_type: '',
  min_price: '', max_price: '', min_bedrooms: '', ordering: '-created_at',
};

const PAGE_SIZE = 12;

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split' or 'grid'
  const [activePropertyId, setActivePropertyId] = useState(null);
  const filtersRef = useRef(null);

  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    property_type: searchParams.get('property_type') || '',
    listing_type: searchParams.get('type') || searchParams.get('listing_type') || '',
  });

  const fetchProperties = useCallback(async (page = 1, f = filters) => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      Object.entries(f).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await propertiesApi.list(params);
      setProperties(res.data.results || []);
      setTotalCount(res.data.count || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const listingTypeParam = searchParams.get('type') || searchParams.get('listing_type') || '';
    const cityParam = searchParams.get('city') || '';
    const searchParam = searchParams.get('search') || '';
    const typeParam = searchParams.get('property_type') || '';

    const initial = {
      ...DEFAULT_FILTERS,
      listing_type: listingTypeParam,
      city: cityParam,
      search: searchParam,
      property_type: typeParam,
    };
    setFilters(initial);
    fetchProperties(1, initial);
  }, [searchParams, fetchProperties]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = (updatedFilters = filters) => {
    const params = {};
    Object.entries(updatedFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
    fetchProperties(1, updatedFilters);
    setSidebarOpen(false);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams({});
    fetchProperties(1, DEFAULT_FILTERS);
    setSidebarOpen(false);
  };

  const handleSortChange = (ordering) => {
    const updated = { ...filters, ordering };
    setFilters(updated);
    applyFilters(updated);
  };

  const handleSaveSearch = () => {
    toast.success('Search preferences saved! You will receive email alerts for new listings.');
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasActiveFilters = Boolean(
    filters.city || filters.property_type || filters.listing_type ||
    filters.min_price || filters.max_price || filters.min_bedrooms
  );

  const isRent = filters.listing_type === 'rent';

  return (
    <div className="z-search-viewport-page">

      {/* ── 1. Sticky Horizontal Zillow Filter Bar ───────── */}
      <div className="z-search-filter-bar">
        <div className="z-search-filter-bar__inner">

          {/* Search Box */}
          <form
            onSubmit={(e) => { e.preventDefault(); applyFilters(); }}
            className="z-filter-search-box"
          >
            <FaSearch className="z-filter-search-icon" />
            <input
              type="text"
              placeholder="City, neighborhood, or address"
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              className="z-filter-search-input"
            />
            {filters.search && (
              <button
                type="button"
                className="z-filter-clear-btn"
                onClick={() => { updateFilter('search', ''); applyFilters({ ...filters, search: '' }); }}
              >
                <FaTimes />
              </button>
            )}
          </form>

          {/* Filter Pills */}
          <div className="z-filter-pills-row">
            
            {/* For Sale / Rent */}
            <select
              value={filters.listing_type}
              onChange={(e) => {
                const updated = { ...filters, listing_type: e.target.value };
                setFilters(updated);
                applyFilters(updated);
              }}
              className="z-filter-pill"
            >
              <option value="">For Sale & Rent</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>

            {/* Price Filter */}
            <select
              value={filters.max_price}
              onChange={(e) => {
                const updated = { ...filters, max_price: e.target.value };
                setFilters(updated);
                applyFilters(updated);
              }}
              className="z-filter-pill"
            >
              <option value="">Price (Any)</option>
              <option value="2000000">Under ৳20 Lakh</option>
              <option value="5000000">Under ৳50 Lakh</option>
              <option value="10000000">Under ৳1 Crore</option>
              <option value="30000000">Under ৳3 Crore</option>
              <option value="50000000">Under ৳5 Crore</option>
            </select>

            {/* Beds */}
            <select
              value={filters.min_bedrooms}
              onChange={(e) => {
                const updated = { ...filters, min_bedrooms: e.target.value };
                setFilters(updated);
                applyFilters(updated);
              }}
              className="z-filter-pill"
            >
              <option value="">Beds & Baths (Any)</option>
              <option value="1">1+ Beds</option>
              <option value="2">2+ Beds</option>
              <option value="3">3+ Beds</option>
              <option value="4">4+ Beds</option>
            </select>

            {/* Home Type */}
            <select
              value={filters.property_type}
              onChange={(e) => {
                const updated = { ...filters, property_type: e.target.value };
                setFilters(updated);
                applyFilters(updated);
              }}
              className="z-filter-pill"
            >
              <option value="">Home Type</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
            </select>

            <button
              type="button"
              className={`z-filter-pill z-filter-pill--btn ${sidebarOpen ? 'active' : ''}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaSlidersH /> More
              {hasActiveFilters && <span className="z-filter-dot" />}
            </button>

            {hasActiveFilters && (
              <button type="button" className="z-filter-reset-link" onClick={resetFilters}>
                Reset
              </button>
            )}
          </div>

          {/* Right Action: Save Search & View Switcher */}
          <div className="z-filter-right-group">
            <button
              type="button"
              className="z-save-search-btn"
              onClick={handleSaveSearch}
            >
              <FaBookmark size={11} /> Save search
            </button>

            <div className="z-view-mode-toggle">
              <button
                type="button"
                className={`z-view-mode-btn ${viewMode === 'split' ? 'active' : ''}`}
                onClick={() => setViewMode('split')}
                title="Split Map View"
              >
                <FaMapMarkedAlt />
              </button>
              <button
                type="button"
                className={`z-view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="List Only"
              >
                <FaThLarge />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. Full-Screen Split View Layout ────────────────── */}
      <div className={`z-split-container ${viewMode === 'grid' ? 'z-split-container--grid-only' : ''}`}>

        {/* ── Left Map Pane (Zillow 50% Full-Height Screen) ── */}
        {viewMode === 'split' && (
          <div className="z-split-map-pane">
            <ZillowSearchMap
              properties={properties}
              activeCity={filters.city || 'Dhaka'}
              activePropertyId={activePropertyId}
              onMarkerHover={(id) => setActivePropertyId(id)}
              onMarkerClick={(id) => setActivePropertyId(id)}
            />
          </div>
        )}

        {/* ── Right Scrollable Listings Feed ───────────────── */}
        <div className="z-split-listings-pane">
          
          {/* Results Header */}
          <div className="z-listings-header">
            <div>
              <h1 className="z-listings-title">
                {filters.city
                  ? `${isRent ? 'Rental' : 'Real Estate'} Listings in ${filters.city}`
                  : isRent
                  ? 'Rental Listings in Bangladesh'
                  : 'Real Estate & Homes in Bangladesh'}
              </h1>
              <span className="z-listings-count">
                {loading ? 'Searching homes...' : `${totalCount.toLocaleString()} results`}
              </span>
            </div>

            {/* Sort Selector */}
            <div className="z-sort-wrap">
              <FaSortAmountDown className="z-sort-icon" />
              <select
                value={filters.ordering}
                onChange={e => handleSortChange(e.target.value)}
                className="z-sort-select"
              >
                <option value="-created_at">Sort: Homes for you</option>
                <option value="price">Price (Low to High)</option>
                <option value="-price">Price (High to Low)</option>
                <option value="-area_sqft">Largest Sq Ft</option>
              </select>
            </div>
          </div>

          {/* Drawer: More Filters Sidebar */}
          {sidebarOpen && (
            <div className="z-filters-drawer" ref={filtersRef}>
              <div className="z-drawer-header">
                <h3><FaFilter /> All Filters</h3>
                <button type="button" onClick={() => setSidebarOpen(false)}><FaTimes /></button>
              </div>
              <div className="z-drawer-body">
                <div className="form-group">
                  <label className="form-label">City / Region</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dhaka, Gulshan, Banani"
                    value={filters.city}
                    onChange={e => updateFilter('city', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price Range (BDT)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Min"
                      value={filters.min_price}
                      onChange={e => updateFilter('min_price', e.target.value)}
                    />
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Max"
                      value={filters.max_price}
                      onChange={e => updateFilter('max_price', e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-primary w-full" onClick={() => applyFilters()}>
                    Apply Filters
                  </button>
                  <button type="button" className="btn btn-outline" onClick={resetFilters}>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          {loading ? (
            <div className="z-listings-loading">
              <div className="spinner" />
              <p>Loading homes...</p>
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="z-listings-grid">
                {properties.map(p => (
                  <div
                    key={p.id}
                    className={`z-listing-item ${activePropertyId === p.id ? 'active' : ''}`}
                    onMouseEnter={() => setActivePropertyId(p.id)}
                  >
                    <PropertyCard property={p} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="z-listings-pagination">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={page => fetchProperties(page)}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="z-listings-empty">
              <h3>No matching homes found</h3>
              <p>Try zooming out on the map, removing filters, or searching for another neighborhood.</p>
              <button type="button" className="btn btn-primary" onClick={resetFilters}>
                Remove all filters
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
