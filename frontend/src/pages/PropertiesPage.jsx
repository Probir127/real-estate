import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FaTimes, FaSearch, FaSlidersH, FaHome, FaBuilding,
  FaStore, FaTree, FaCity, FaBed, FaBath, FaFilter
} from 'react-icons/fa';
import { propertiesApi } from '../api/client';
import PropertyCard from '../components/PropertyCard';
import Pagination from '../components/Pagination';
import { getErrorMessage } from '../utils/helpers';
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

const PAGE_SIZE = 12;

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') applyFilters();
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasActiveFilters = Object.entries(filters).some(([k, v]) => v && k !== 'ordering');

  return (
    <main className="properties-page page-wrapper">
      
      {/* ── Top Zillow Filter Bar ───────────────────── */}
      <div className="pp-filter-bar">
        <div className="container pp-filter-bar__inner">
          
          {/* Search Box */}
          <div className="pp-filter-search">
            <FaSearch className="pp-filter-search__icon" />
            <input
              type="text"
              placeholder="City, neighborhood, address..."
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pp-filter-search__input"
            />
            {filters.search && (
              <button
                className="pp-filter-search__clear"
                onClick={() => {
                  const updated = { ...filters, search: '' };
                  setFilters(updated);
                  applyFilters(updated);
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Quick Filter Pills (Zillow Style) */}
          <div className="pp-filter-pills">
            
            {/* For Sale / Rent Selector */}
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

          {/* Sort Dropdown */}
          <div className="pp-sort-wrap">
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

      {/* ── Main Results View ───────────────────────── */}
      <div className="container pp-main-content">
        
        {/* Results Header */}
        <div className="pp-results-header">
          <h1 className="pp-results-title">
            {filters.city ? `Real Estate & Homes in ${filters.city}` : 'Real Estate & Homes For Sale & Rent'}
          </h1>
          <span className="pp-results-count">
            {loading ? 'Searching homes...' : `${totalCount.toLocaleString()} listings`}
          </span>
        </div>

        <div className="pp-layout">

          {/* Expanded Sidebar Drawer (for mobile / detailed filters) */}
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

          {/* Properties Grid */}
          <div className="pp-results-grid-wrap">
            {loading ? (
              <div className="pp-loading">
                <div className="spinner" />
                <p>Loading properties...</p>
              </div>
            ) : properties.length > 0 ? (
              <>
                <div className="pp-grid">
                  {properties.map(p => (
                    <PropertyCard key={p.id} property={p} />
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
