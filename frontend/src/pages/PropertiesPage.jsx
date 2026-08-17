import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FaTimes, FaSearch, FaSlidersH, FaHome, FaBuilding,
  FaStore, FaTree, FaCity, FaBed, FaBath, FaFilter,
  FaMapMarkedAlt, FaThLarge, FaMapMarkerAlt
} from 'react-icons/fa';
import { propertiesApi } from '../api/client';
import PropertyCard from '../components/PropertyCard';
import Pagination from '../components/Pagination';
import { getErrorMessage, formatPrice } from '../utils/helpers';
import './PropertiesPage.css';

const PROPERTY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
];

const DEFAULT_FILTERS = {
  search: '', city: '', property_type: '', listing_type: '',
  min_price: '', max_price: '', min_bedrooms: '', ordering: '-created_at',
};

const CITY_COORDS = {
  Dhaka: { lat: 23.8103, lng: 90.4125 },
  Chittagong: { lat: 22.3569, lng: 91.7832 },
  Sylhet: { lat: 24.8949, lng: 91.8687 },
  "Cox's Bazar": { lat: 21.4272, lng: 92.0058 },
  Rajshahi: { lat: 24.3745, lng: 88.6042 },
  Khulna: { lat: 22.8456, lng: 89.5403 },
};

const PAGE_SIZE = 12;

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'grid' or 'split'
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

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasActiveFilters = Boolean(
    filters.city || filters.property_type || filters.listing_type ||
    filters.min_price || filters.max_price || filters.min_bedrooms
  );

  // Map coordinates based on filtered city
  const city = filters.city || 'Dhaka';
  const coords = CITY_COORDS[city] || CITY_COORDS['Dhaka'];
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.08}%2C${coords.lat - 0.05}%2C${coords.lng + 0.08}%2C${coords.lat + 0.05}&layer=mapnik`;

  return (
    <main className="properties-page page-wrapper">

      {/* ── 1. Top Horizontal Filter Bar (Zillow Style) ── */}
      <div className="pp-filter-bar">
        <div className="container pp-filter-bar__inner">

          {/* Search Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); applyFilters(); }}
            className="pp-filter-search"
          >
            <FaSearch className="pp-filter-search__icon" />
            <input
              type="text"
              placeholder="City, neighborhood, or address"
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              className="pp-filter-search__input"
            />
            {filters.search && (
              <button
                type="button"
                className="pp-filter-search__clear"
                onClick={() => { updateFilter('search', ''); applyFilters({ ...filters, search: '' }); }}
              >
                <FaTimes />
              </button>
            )}
          </form>

          {/* Quick Filter Selects */}
          <div className="pp-filter-pills">
            
            {/* For Sale / Rent */}
            <select
              value={filters.listing_type}
              onChange={(e) => {
                const updated = { ...filters, listing_type: e.target.value };
                setFilters(updated);
                applyFilters(updated);
              }}
              className="pp-filter-pill-select"
            >
              <option value="">For Sale & Rent</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>

            {/* Home Type */}
            <select
              value={filters.property_type}
              onChange={(e) => {
                const updated = { ...filters, property_type: e.target.value };
                setFilters(updated);
                applyFilters(updated);
              }}
              className="pp-filter-pill-select"
            >
              <option value="">All Home Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
            </select>

            {/* Beds */}
            <select
              value={filters.min_bedrooms}
              onChange={(e) => {
                const updated = { ...filters, min_bedrooms: e.target.value };
                setFilters(updated);
                applyFilters(updated);
              }}
              className="pp-filter-pill-select"
            >
              <option value="">Bedrooms (Any)</option>
              <option value="1">1+ Beds</option>
              <option value="2">2+ Beds</option>
              <option value="3">3+ Beds</option>
              <option value="4">4+ Beds</option>
            </select>

            <button
              className={`btn btn-secondary btn-sm pp-more-filters-btn ${sidebarOpen ? 'active' : ''}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaSlidersH /> More Filters
              {hasActiveFilters && <span className="pp-filter-badge-dot" />}
            </button>

            {hasActiveFilters && (
              <button className="pp-reset-btn" onClick={resetFilters}>
                <FaTimes /> Reset
              </button>
            )}
          </div>

          {/* View Mode Toggle & Sort Dropdown */}
          <div className="pp-filter-right-controls">
            
            {/* Split View Toggle */}
            <div className="pp-view-switcher">
              <button
                type="button"
                className={`pp-view-btn ${viewMode === 'split' ? 'active' : ''}`}
                onClick={() => setViewMode('split')}
                title="Split Map View"
              >
                <FaMapMarkedAlt /> Map
              </button>
              <button
                type="button"
                className={`pp-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <FaThLarge /> Grid
              </button>
            </div>

            {/* Sort */}
            <select
              value={filters.ordering}
              onChange={e => handleSortChange(e.target.value)}
              className="pp-sort-select"
            >
              <option value="-created_at">Sort: Newest</option>
              <option value="price">Price (Low to High)</option>
              <option value="-price">Price (High to Low)</option>
              <option value="-area_sqft">Largest Sq Ft</option>
            </select>
          </div>

        </div>
      </div>

      {/* ── 2. Main Results Layout ───────────────────── */}
      <div className={`pp-main-content ${viewMode === 'split' ? 'pp-main-content--split' : 'container'}`}>
        
        {/* Results Count Header */}
        <div className="pp-results-header">
          <h1 className="pp-results-title">
            {filters.city ? `Real Estate & Homes in ${filters.city}` : 'Real Estate & Homes For Sale & Rent'}
          </h1>
          <span className="pp-results-count">
            {loading ? 'Searching homes...' : `${totalCount.toLocaleString()} listings`}
          </span>
        </div>

        {/* Expanded Sidebar Drawer */}
        {sidebarOpen && (
          <aside className="pp-sidebar" ref={filtersRef}>
            <div className="pp-sidebar__header">
              <h3><FaFilter /> Detailed Filters</h3>
              <button className="pp-sidebar__close" onClick={() => setSidebarOpen(false)}>
                <FaTimes />
              </button>
            </div>

            {/* City */}
            <div className="form-group">
              <label className="form-label">City / Location</label>
              <input
                type="text"
                placeholder="e.g. Dhaka, Chittagong, Sylhet"
                value={filters.city}
                onChange={e => updateFilter('city', e.target.value)}
                className="form-control"
              />
            </div>

            {/* Price Range */}
            <div className="form-group">
              <label className="form-label">Price Range (BDT)</label>
              <div className="pp-price-inputs">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.min_price}
                  onChange={e => updateFilter('min_price', e.target.value)}
                  className="form-control"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.max_price}
                  onChange={e => updateFilter('max_price', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="pp-sidebar__actions">
              <button className="btn btn-primary" onClick={() => applyFilters()}>
                Apply Filters
              </button>
              <button className="btn btn-outline" onClick={resetFilters}>
                Reset All
              </button>
            </div>
          </aside>
        )}

        {/* View Mode Layout: Split vs Grid */}
        <div className={`pp-layout ${viewMode === 'split' ? 'pp-layout--split' : ''}`}>

          {/* Left Column: Interactive Map (When in Split Mode) */}
          {viewMode === 'split' && (
            <div className="pp-split-map-wrap">
              <iframe
                title="Search Map"
                className="pp-split-map"
                src={mapEmbedUrl}
                loading="lazy"
              />
              <div className="pp-map-overlay-count">
                <FaMapMarkerAlt /> {properties.length} homes on map
              </div>
            </div>
          )}

          {/* Right Column: Properties Grid */}
          <div className="pp-results-grid-wrap">
            {loading ? (
              <div className="pp-loading">
                <div className="spinner" />
                <p>Loading properties...</p>
              </div>
            ) : properties.length > 0 ? (
              <>
                <div className={`pp-grid ${viewMode === 'split' ? 'pp-grid--split' : ''}`}>
                  {properties.map(p => (
                    <div
                      key={p.id}
                      onMouseEnter={() => setActivePropertyId(p.id)}
                      className={`pp-grid-item ${activePropertyId === p.id ? 'active' : ''}`}
                    >
                      <PropertyCard property={p} />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pp-pagination">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={page => fetchProperties(page)}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="pp-empty">
                <h3>No matching properties found</h3>
                <p>Try clearing some filters or searching for another city.</p>
                <button className="btn btn-secondary" onClick={resetFilters}>
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </main>
  );
}
