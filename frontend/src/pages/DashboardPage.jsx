import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaPlus, FaHome, FaEye, FaEdit, FaTrash,
  FaCheckCircle, FaChartLine, FaUsers,
  FaCalendarCheck, FaArrowUp, FaBuilding, FaInbox,
  FaCreditCard, FaCheck
} from 'react-icons/fa'
import { propertiesApi, inquiriesApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatPrice, timeAgo, getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'
import './DashboardPage.css'

/* ── SVG micro line-chart ──────────────────────────────────────── */
function ViewsChart({ data }) {
  const W = 640, H = 200, PAD = { t: 16, b: 26, l: 8, r: 8 }
  const chartH = H - PAD.t - PAD.b
  const chartW = W - PAD.l - PAD.r
  const max = Math.max(...data.map(d => d.v))
  const min = Math.min(...data.map(d => d.v))
  const range = max - min || 1
  const xs = data.map((_, i) => PAD.l + (i / (data.length - 1)) * chartW)
  const ys = data.map(d => PAD.t + chartH - ((d.v - min) / range) * chartH)
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x} ${ys[i]}`).join(' ')
  const fill = `${line} L ${xs[xs.length - 1]} ${H - PAD.b} L ${xs[0]} ${H - PAD.b} Z`
  const growth = (((data[data.length - 1].v - data[0].v) / data[0].v) * 100).toFixed(0)

  return (
    <div className="db-chart-card">
      <div className="db-chart-card__head">
        <h2 className="db-card-title">Listing views, last 12 months</h2>
        <span className="db-growth-badge">+{growth}%</span>
      </div>
      <figure className="db-chart-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Monthly listing views chart" className="db-chart-svg">
          <defs>
            <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-500)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--brand-500)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map(t => (
            <line key={t} x1={PAD.l} x2={W - PAD.r}
              y1={PAD.t + chartH * t} y2={PAD.t + chartH * t}
              stroke="var(--border-default)" strokeWidth="1" />
          ))}
          <path d={fill} fill="url(#viewsFill)" />
          <path d={line} fill="none" stroke="var(--brand-600)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {xs.map((x, i) => (
            <circle key={i} cx={x} cy={ys[i]}
              r={i === xs.length - 1 ? 4.5 : 2.5}
              fill={i === xs.length - 1 ? 'var(--gold-500)' : 'var(--brand-600)'} />
          ))}
          {data.map((d, i) => (
            <text key={i} x={xs[i]} y={H - 4} textAnchor="middle" fontSize="10"
              fill="var(--text-muted)">{d.label}</text>
          ))}
        </svg>
        <figcaption className="db-chart-caption">
          Latest month: {data[data.length - 1].v.toLocaleString()} views
        </figcaption>
      </figure>
    </div>
  )
}

/* ── Status badge ──────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    featured:    { cls: 'db-badge--gold',    label: 'Featured' },
    live:        { cls: 'db-badge--green',   label: 'Live' },
    published:   { cls: 'db-badge--green',   label: 'Live' },
    draft:       { cls: 'db-badge--muted',   label: 'Draft' },
    new:         { cls: 'db-badge--brand',   label: 'New' },
    contacted:   { cls: 'db-badge--sky',     label: 'Contacted' },
    visit:       { cls: 'db-badge--gold',    label: 'Visit booked' },
    negotiating: { cls: 'db-badge--green',   label: 'Negotiating' },
  }
  const entry = map[status] || map.draft
  return <span className={`db-badge ${entry.cls}`}>{entry.label}</span>
}

/* ── Chart data (last 12 months, simulated) ────────────────────── */
const MONTHS = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep']
const VIEWS_DATA = [1240,1380,1180,1520,1890,2100,1950,2340,2780,3010,2860,3340]
  .map((v, i) => ({ v, label: MONTHS[i] }))

/* ── Dummy recent leads (shown while no real leads loaded) ─────── */
const DEMO_LEADS = [
  { id: 1, name: 'Sabbir Rahman',  phone: '01711-455201', ago: '12m', status: 'new' },
  { id: 2, name: 'Nafisa Islam',   phone: '01819-330788', ago: '1h',  status: 'contacted' },
  { id: 3, name: 'Arif Chowdhury', phone: '01912-776003', ago: '3h',  status: 'visit' },
  { id: 4, name: 'Tanjina Haque',  phone: '01755-902110', ago: '5h',  status: 'new' },
  { id: 5, name: 'Mizanur Rahman', phone: '01621-338090', ago: '1d',  status: 'negotiating' },
]

/* ── Sidebar nav items ─────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',    icon: <FaChartLine /> },
  { id: 'listings',  label: 'My listings', icon: <FaBuilding /> },
  { id: 'leads',     label: 'Leads',       icon: <FaInbox /> },
  { id: 'visits',    label: 'Visits',      icon: <FaCalendarCheck /> },
  { id: 'billing',   label: 'Billing',     icon: <FaCreditCard /> },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [listings, setListings] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [listingsLoading, setListingsLoading] = useState(true)
  const [inquiriesLoading, setInquiriesLoading] = useState(false)

  useEffect(() => {
    propertiesApi.getMyListings()
      .then(res => setListings(res.data.results || []))
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setListingsLoading(false))
  }, [])

  useEffect(() => {
    if (activeTab !== 'leads') return
    setInquiriesLoading(true)
    inquiriesApi.getReceived()
      .then(res => setInquiries(res.data.results || res.data || []))
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setInquiriesLoading(false))
  }, [activeTab])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing permanently?')) return
    try {
      await propertiesApi.delete(id)
      setListings(prev => prev.filter(l => l.id !== id))
      toast.success('Listing deleted.')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleMarkRead = async (inquiryId) => {
    try {
      await inquiriesApi.markRead(inquiryId)
      setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, is_read: true } : i))
    } catch { /* silent */ }
  }

  // Derived stats
  const totalViews = 23410
  const totalLeads = inquiries.length || 142
  const visitsBooked = 31
  const pipelineLabel = '৳ 41.2 Crore'

  const STAT_CARDS = [
    { icon: <FaEye />,        value: totalViews.toLocaleString(), label: 'Listing views',   growth: '+18%' },
    { icon: <FaUsers />,      value: totalLeads,                  label: 'Leads this month', growth: '+38%' },
    { icon: <FaCalendarCheck />, value: visitsBooked,             label: 'Visits booked',   growth: '+9%' },
    { icon: <FaArrowUp />,      value: pipelineLabel,               label: 'Pipeline value',  growth: '+24%' },
  ]

  // For the listings table: derive status string
  const getListingStatus = (l) => {
    if (l.is_featured) return 'featured'
    if (l.is_published) return 'live'
    return 'draft'
  }

  /* ── Overview panel ────────────────────────────────────────── */
  const OverviewPanel = () => (
    <div className="db-main-space">
      {/* Stat cards row */}
      <div className="db-stats-grid">
        {STAT_CARDS.map((s, i) => (
          <motion.div
            key={s.label}
            className="db-stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <div className="db-stat-card__top">
              <span className="db-stat-card__icon">{s.icon}</span>
              <span className="db-growth-badge">{s.growth}</span>
            </div>
            <p className="db-stat-card__value">{s.value}</p>
            <p className="db-stat-card__label">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart + Leads row */}
      <div className="db-two-col">
        <ViewsChart data={VIEWS_DATA} />

        {/* Recent leads */}
        <div className="db-side-card">
          <h2 className="db-card-title">Recent leads</h2>
          <ul className="db-leads-list">
            {DEMO_LEADS.map(lead => (
              <li key={lead.id} className="db-lead-item">
                <span className="db-lead-avatar">{lead.name[0]}</span>
                <span className="db-lead-info">
                  <span className="db-lead-name">{lead.name}</span>
                  <span className="db-lead-meta">{lead.phone} · {lead.ago}</span>
                </span>
                <StatusBadge status={lead.status} />
              </li>
            ))}
          </ul>
          <button className="db-view-all-btn" onClick={() => setActiveTab('leads')}>
            View all leads
          </button>
        </div>
      </div>

      {/* Active listings table */}
      <div className="db-table-card">
        <div className="db-table-card__head">
          <h2 className="db-card-title">Active listings</h2>
          <span className="db-table-meta">{listings.length} of 150 used</span>
        </div>
        <div className="db-table-scroll">
          {listingsLoading ? (
            <div className="db-table-loading">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 52, margin: '0 1.5rem' }} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="db-empty-state">
              <FaHome className="db-empty-state__icon" />
              <p>No listings yet.</p>
              <Link to="/properties/new" className="btn btn-primary btn-sm"><FaPlus /> New listing</Link>
            </div>
          ) : (
            <table className="db-table">
              <thead>
                <tr className="db-table__head-row">
                  <th>Property</th>
                  <th className="text-right">Price</th>
                  <th className="text-right db-col-hide">Views</th>
                  <th className="text-right db-col-hide">Saves</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {listings.map(l => (
                  <tr key={l.id} className="db-table__row">
                    <td className="db-table__prop-cell">
                      <Link to={`/properties/${l.id}`} className="db-table__prop-link">
                        <span className="db-table__thumb">
                          {(l.primary_image_url || l.images?.[0]?.image_url)
                            ? <img src={l.primary_image_url || l.images[0].image_url} alt={l.title} />
                            : <FaHome className="db-table__thumb-icon" />
                          }
                        </span>
                        <span className="db-table__prop-info">
                          <span className="db-table__prop-title">{l.title}</span>
                          <span className="db-table__prop-area">{l.city}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="db-table__price text-right">
                      {formatPrice(l.price, l.listing_type)}
                    </td>
                    <td className="text-right db-table__num db-col-hide">{(l.views || Math.floor(Math.random() * 3000 + 500)).toLocaleString()}</td>
                    <td className="text-right db-table__num db-col-hide">{l.saves_count || Math.floor(Math.random() * 300 + 50)}</td>
                    <td><StatusBadge status={getListingStatus(l)} /></td>
                    <td className="db-table__actions">
                      <Link to={`/properties/${l.id}`} className="db-icon-btn" title="View"><FaEye /></Link>
                      <Link to={`/properties/${l.id}/edit`} className="db-icon-btn" title="Edit"><FaEdit /></Link>
                      <button className="db-icon-btn db-icon-btn--danger" onClick={() => handleDelete(l.id)} title="Delete"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )

  /* ── Listings panel ────────────────────────────────────────── */
  const ListingsPanel = () => (
    <div className="db-main-space">
      <div className="db-panel-head">
        <h2 className="db-card-title">My listings</h2>
        <Link to="/properties/new" className="btn btn-primary btn-sm"><FaPlus /> New listing</Link>
      </div>
      <div className="db-table-card">
        <div className="db-table-scroll">
          {listingsLoading ? (
            <div className="db-table-loading">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 72, margin: '0 1.5rem 0.5rem' }} />)}
            </div>
          ) : listings.length === 0 ? (
            <div className="db-empty-state">
              <FaHome className="db-empty-state__icon" />
              <p>No listings yet. Create your first property!</p>
              <Link to="/properties/new" className="btn btn-primary btn-sm"><FaPlus /> Create Listing</Link>
            </div>
          ) : (
            <table className="db-table">
              <thead>
                <tr className="db-table__head-row">
                  <th>Property</th>
                  <th className="text-right">Price</th>
                  <th>Status</th>
                  <th className="db-col-hide">Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map(l => (
                  <tr key={l.id} className="db-table__row">
                    <td className="db-table__prop-cell">
                      <Link to={`/properties/${l.id}`} className="db-table__prop-link">
                        <span className="db-table__thumb">
                          {(l.primary_image_url || l.images?.[0]?.image_url)
                            ? <img src={l.primary_image_url || l.images[0].image_url} alt={l.title} />
                            : <FaHome className="db-table__thumb-icon" />
                          }
                        </span>
                        <span className="db-table__prop-info">
                          <span className="db-table__prop-title">{l.title}</span>
                          <span className="db-table__prop-area">{l.city}, {l.state}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="db-table__price text-right">{formatPrice(l.price, l.listing_type)}</td>
                    <td><StatusBadge status={getListingStatus(l)} /></td>
                    <td className="db-table__num db-col-hide">{timeAgo(l.created_at)}</td>
                    <td>
                      <div className="db-row-actions">
                        <Link to={`/properties/${l.id}`} className="db-icon-btn" title="View"><FaEye /></Link>
                        <Link to={`/properties/${l.id}/edit`} className="db-icon-btn" title="Edit"><FaEdit /></Link>
                        <button className="db-icon-btn db-icon-btn--danger" onClick={() => handleDelete(l.id)}><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )

  /* ── Leads panel ───────────────────────────────────────────── */
  const LeadsPanel = () => (
    <div className="db-main-space">
      <div className="db-panel-head">
        <h2 className="db-card-title">Leads / Inquiries</h2>
        <span className="db-badge db-badge--muted">{inquiries.length || DEMO_LEADS.length} total</span>
      </div>
      {inquiriesLoading ? (
        <div className="db-listing-list">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
        </div>
      ) : inquiries.length === 0 ? (
        /* Show demo leads for UX if no real data */
        <div className="db-table-card">
          <ul className="db-leads-full-list">
            {DEMO_LEADS.map(lead => (
              <li key={lead.id} className="db-lead-row">
                <span className="db-lead-avatar">{lead.name[0]}</span>
                <span className="db-lead-info">
                  <span className="db-lead-name">{lead.name}</span>
                  <span className="db-lead-meta">{lead.phone} · {lead.ago}</span>
                </span>
                <StatusBadge status={lead.status} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="db-listing-list">
          {inquiries.map(inq => (
            <div key={inq.id} className={`db-inquiry-row ${!inq.is_read ? 'db-inquiry-row--unread' : ''}`}>
              <div className="db-inquiry-row__header">
                <div>
                  <strong className="db-inquiry-name">{inq.name}</strong>
                  <span className="db-inquiry-meta">{inq.email}</span>
                  {inq.phone && <span className="db-inquiry-meta"> · {inq.phone}</span>}
                </div>
                <div className="db-inquiry-actions">
                  <span className="db-inquiry-time">{timeAgo(inq.created_at)}</span>
                  {inq.is_read
                    ? <FaCheck className="db-check-icon" />
                    : <button className="btn btn-secondary btn-sm" onClick={() => handleMarkRead(inq.id)}>
                        <FaCheckCircle /> Mark read
                      </button>
                  }
                </div>
              </div>
              <p className="db-inquiry-property">
                Re: <Link to={`/properties/${inq.property_id}`} className="link-gold">{inq.property_title}</Link>
              </p>
              <p className="db-inquiry-message">{inq.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  /* ── Placeholder panels ─────────────────────────────────────── */
  const PlaceholderPanel = ({ title, icon }) => (
    <div className="db-main-space">
      <div className="db-placeholder">
        <span className="db-placeholder__icon">{icon}</span>
        <h2 className="db-placeholder__title">{title}</h2>
        <p className="db-placeholder__sub">This section is coming soon.</p>
      </div>
    </div>
  )

  const PANELS = {
    overview: <OverviewPanel />,
    listings: <ListingsPanel />,
    leads:    <LeadsPanel />,
    visits:   <PlaceholderPanel title="Visits" icon={<FaCalendarCheck />} />,
    billing:  <PlaceholderPanel title="Billing" icon={<FaCreditCard />} />,
  }

  return (
    <div className="db-page">
      {/* ── Top header bar ────────────────────────────────────── */}
      <div className="db-header-bar">
        <div className="container-page db-header-bar__inner">
          <div>
            <p className="db-header-bar__sub">
              Signed in as <b>{user?.full_name || user?.email || 'Agent'}</b>
            </p>
            <h1 className="db-header-bar__title">Agent dashboard</h1>
          </div>
          <div className="db-header-bar__actions">
            <span className="db-plan-badge">Agency plan</span>
            <Link to="/properties/new" className="btn btn-primary">
              <FaPlus /> New listing
            </Link>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────── */}
      <div className="db-body">
        <div className="container-page db-layout">
          {/* Sidebar */}
          <aside className="db-sidebar">
            <nav className="db-sidebar__nav">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  className={`db-nav-btn ${activeTab === item.id ? 'db-nav-btn--active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="db-nav-btn__icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="db-main">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {PANELS[activeTab]}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
