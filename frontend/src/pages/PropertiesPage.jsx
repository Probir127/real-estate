import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  FaTimes, FaSearch, FaSlidersH, FaHome, FaBuilding,
  FaStore, FaTree, FaCity, FaBed, FaBath, FaFilter
} from 'react-icons/fa'
import { propertiesApi } from '../api/client'
import PropertyCard from '../components/PropertyCard'
import Pagination from '../components/Pagination'
import { getErrorMessage } from '../utils/helpers'
import './PropertiesPage.css'

const PROPERTY_TYPES = [
  { value: '', label: 'All Types', icon: <FaHome /> },
  { value: 'apartment', label: 'Apartment', icon: <FaBuilding /> },
  { value: 'house', label: 'House', icon: <FaHome /> },
  { value: 'villa', label: 'Villa', icon: <FaCity /> },
  { value: 'commercial', label: 'Commercial', icon: <FaStore /> },
  { value: 'land', label: 'Land', icon: <FaTree /> },
]

const DEFAULT_FILTERS = {
  search: '', city: '', property_type: '', listing_type: '',
  min_price: '', max_price: '', min_bedrooms: '', ordering: '-created_at',
}

const PAGE_SIZE = 12

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const filtersRef = useRef(null)

  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    property_type: searchParams.get('property_type') || '',
    listing_type: searchParams.get('listing_type') || '',
  })

  const fetchProperties = useCallback(async (page = 1, f = filters) => {
    setLoading(true)
    try {
      const params = { page, page_size: PAGE_SIZE }
      Object.entries(f).forEach(([k, v]) => { if (v) params[k] = v })
      const res = await propertiesApi.list(params)
      setProperties(res.data.results || [])
      setTotalCount(res.data.count || 0)
      setCurrentPage(page)
    } catch (err) {
      console.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    fetchProperties(1, filters)
  }, []) // eslint-disable-line

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = (updatedFilters = filters) => {
    const params = {}
    Object.entries(updatedFilters).forEach(([k, v]) => { if (v) params[k] = v })
    setSearchParams(params)
    fetchProperties(1, updatedFilters)
    setSidebarOpen(false)
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setSearchParams({})
    fetchProperties(1, DEFAULT_FILTERS)
    setSidebarOpen(false)
  }

  const handleSortChange = (ordering) => {
    const updated = { ...filters, ordering }
    setFilters(updated)
    applyFilters(updated)
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') applyFilters()
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const hasActiveFilters = Object.entries(filters).some(([k, v]) => v && k !== 'ordering')

  return (
    <main className="properties-page page-wrapper">
      <div className="container">

        {/* ── Page Header ────────────────────────────── */}
        <div className="pp-header">
          <div className="pp-header__left">
            <div className="pp-breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Properties</span>
            </div>
            <h1 className="pp-header__title">
              {filters.city ? `Properties in ${filters.city}` : 'All Properties'}
            </h1>
            <p className="pp-header__count text-slate">
              {loading
                ? 'Searching…'
                : `${totalCount.toLocaleString()} ${totalCount === 1 ? 'property' : 'properties'} found`
              }
              {hasActiveFilters && (
                <button className="pp-clear-btn" onClick={resetFilters}>
                  <FaTimes /> Clear all filters
                </button>
              )}
            </p>
          </div>

          {/* Sort + Mobile filter toggle */}
          <div className="pp-header__right">
            <div className="pp-search-inline">
              <FaSearch className="pp-search-icon" />
              <input
                type="text"
                placeholder="Search by title, city…"
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pp-search-input"
              />
              {filters.search && (
                <button className="pp-search-clear" onClick={() => {
                  const updated = { ...filters, search: '' }
                  setFilters(updated)
                  applyFilters(updated)
                }}><FaTimes /></button>
              )}
            </div>
            <select
              value={filters.ordering}
              onChange={e => handleSortChange(e.target.value)}
              className="form-select pp-sort"
            >
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-area_sqft">Largest First</option>
            </select>
            <button
              className={`btn btn-secondary pp-filter-toggle ${sidebarOpen ? 'active' : ''}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaSlidersH />
              Filters
              {hasActiveFilters && <span className="pp-filter-dot" />}
            </button>
          </div>
        </div>

        <div className="pp-layout">

          {/* ── Sidebar ──────────────────────────── */}
          <aside className={`pp-sidebar ${sidebarOpen ? 'pp-sidebar--open' : ''}`} ref={filtersRef}>
            <div className="pp-sidebar__header">
              <h3><FaFilter /> Filters</h3>
              <button className="pp-sidebar__close" onClick={() => setSidebarOpen(false)}><FaTimes /></button>
            </div>

            {/* Listing Type */}
            <div className="pp-filter-group">
              <label className="pp-filter-label">Listing Type</label>
              <div className="pp-type-pills">
                {[{ value: '', label: 'All' }, { value: 'sale', label: 'For Sale' }, { value: 'rent', label: 'For Rent' }].map(t => (
                  <button
                    key={t.value}
                    className={`pp-type-pill ${filters.listing_type === t.value ? 'pp-type-pill--active' : ''}`}
                    onClick={() => updateFilter('listing_type', t.value)}
                  >{t.label}</button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div className="pp-filter-group">
              <label className="pp-filter-label">Property Type</label>
              <div className="pp-type-grid">
                {PROPERTY_TYPES.map(t => (
                  <button
                    key={t.value}
                    className={`pp-type-btn ${filters.property_type === t.value ? 'pp-type-btn--active' : ''}`}
                    onClick={() => updateFilter('property_type', t.value)}
                  >
                    <span className="pp-type-btn-icon">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* City */}
            <div className="pp-filter-group">
              <label className="pp-filter-label">Location</label>
              <div className="pp-input-wrap">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dhaka, Gulshan, Banani…"
                  value={filters.city}
                  onChange={e => updateFilter('city', e.target.value)}
                />
              </div>
              <div className="pp-city-chips">
                {['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'].map(c => (
                  <button
                    key={c}
                    className={`pp-city-chip ${filters.city === c ? 'pp-city-chip--active' : ''}`}
                    onClick={() => updateFilter('city', filters.city === c ? '' : c)}
                  >{c}</button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="pp-filter-group">
              <label className="pp-filter-label">Price Range (BDT)</label>
              <div className="pp-price-row">
                <input
                  type="number"
                  className="form-input"
                  placeholder="Min"
                  value={filters.min_price}
                  onChange={e => updateFilter('min_price', e.target.value)}
                />
                <span className="pp-price-sep">—</span>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Max"
                  value={filters.max_price}
                  onChange={e => updateFilter('max_price', e.target.value)}
                />
              </div>
              <div className="pp-price-presets">
                {[
                  { label: 'Under ৳50L', min: '', max: 5000000 },
                  { label: '৳50L – 1Cr', min: 5000000, max: 10000000 },
                  { label: '৳1Cr – 5Cr', min: 10000000, max: 50000000 },
                  { label: 'Above ৳5Cr', min: 50000000, max: '' },
                ].map(p => (
                  <button
                    key={p.label}
                    className="pp-price-preset"
                    onClick={() => { updateFilter('min_price', p.min); updateFilter('max_price', p.max) }}
                  >{p.label}</button>
                ))}
              </div>
            </div>

            {/* Bedrooms */}
            <div className="pp-filter-group">
              <label className="pp-filter-label">Minimum Bedrooms</label>
              <div className="pp-bed-pills">
                {['', '1', '2', '3', '4', '5'].map(n => (
                  <button
                    key={n}
                    className={`pp-bed-pill ${filters.min_bedrooms === n ? 'pp-bed-pill--active' : ''}`}
                    onClick={() => updateFilter('min_bedrooms', n)}
                  >
                    {n === '' ? 'Any' : `${n}+`}
                  </button>
                ))}
              </div>
            </div>

            <div className="pp-sidebar__footer">
              <button className="btn btn-primary w-full" onClick={() => applyFilters()}>
                Apply Filters
              </button>
              <button className="btn btn-secondary w-full" onClick={resetFilters}>
                <FaTimes /> Reset All
              </button>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div className="pp-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
          )}

          {/* ── Main Grid ────────────────────────── */}
          <div className="pp-main">
            {loading ? (
              <div className="properties-grid">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 390, borderRadius: 18 }} />
                ))}
              </div>
            ) : properties.length > 0 ? (
              <>
                <div className="properties-grid">
                  {properties.map((p, i) => (
                    <div
                      key={p.id}
                      style={{
                        opacity: 1,
                        animation: `fadeUp 0.5s ease ${i * 0.05}s both`,
                      }}
                    >
                      <PropertyCard property={p} />
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => fetchProperties(page)}
                  />
                )}
              </>
            ) : (
              <div className="properties-empty empty-state">
                <div className="empty-state__icon">🔍</div>
                <h3>No properties found</h3>
                <p>Try adjusting your search criteria or clear filters to see all listings.</p>
                <button className="btn btn-outline mt-md" onClick={resetFilters}>
                  <FaTimes /> Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
