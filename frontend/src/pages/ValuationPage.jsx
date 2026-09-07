import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaMagic, FaChartLine, FaInfoCircle, FaArrowRight,
  FaChevronDown, FaCheckCircle, FaTimes
} from 'react-icons/fa';
import './ValuationPage.css';

const AREAS = [
  { id: 'gulshan', name: 'Gulshan, Dhaka', baseRate: 26500, trend: '+6.4%' },
  { id: 'banani', name: 'Banani, Dhaka', baseRate: 22000, trend: '+5.8%' },
  { id: 'dhanmondi', name: 'Dhanmondi, Dhaka', baseRate: 18500, trend: '+4.9%' },
  { id: 'uttara', name: 'Uttara, Dhaka', baseRate: 12000, trend: '+6.1%' },
  { id: 'bashundhara', name: 'Bashundhara R/A, Dhaka', baseRate: 11000, trend: '+7.2%' },
  { id: 'mirpur-dohs', name: 'Mirpur DOHS, Dhaka', baseRate: 10500, trend: '+5.0%' },
  { id: 'baridhara-dohs', name: 'Baridhara DOHS, Dhaka', baseRate: 24000, trend: '+6.0%' },
  { id: 'khulshi', name: 'Khulshi, Chattogram', baseRate: 13500, trend: '+4.5%' },
  { id: 'uposhohor', name: 'Uposhohor, Sylhet', baseRate: 8500, trend: '+3.8%' },
  { id: 'purbachal', name: 'Purbachal, Dhaka', baseRate: 7500, trend: '+8.5%' },
];

const CONDITIONS = [
  { id: 'new', label: 'Newly renovated', factor: 1.06 },
  { id: 'well', label: 'Well maintained', factor: 1.00 },
  { id: 'some', label: 'Needs some work', factor: 0.95 },
  { id: 'full', label: 'Needs full renovation', factor: 0.88 },
];

const FACINGS = [
  { id: 'south', label: 'South', factor: 1.04 },
  { id: 'se', label: 'South-East', factor: 1.03 },
  { id: 'east', label: 'East', factor: 1.02 },
  { id: 'west', label: 'West', factor: 0.98 },
  { id: 'north', label: 'North', factor: 1.00 },
];

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

export default function ValuationPage() {
  const [selectedAreaId, setSelectedAreaId] = useState('gulshan');
  const [sizeSqft, setSizeSqft] = useState(1600);
  const [floor, setFloor] = useState(4);
  const [buildingAge, setBuildingAge] = useState(5);
  const [parkingSpaces, setParkingSpaces] = useState(1);
  const [condition, setCondition] = useState('well');
  const [facing, setFacing] = useState('south');
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const selectedArea = useMemo(
    () => AREAS.find((a) => a.id === selectedAreaId) || AREAS[0],
    [selectedAreaId]
  );

  const valuation = useMemo(() => {
    let rate = selectedArea.baseRate;

    // Floor adjustment (floors 3-8 prime, ground floor lower, top floor roof access)
    if (floor === 0) rate *= 0.93;
    else if (floor >= 3 && floor <= 9) rate *= 1.03;
    else if (floor > 14) rate *= 1.01;

    // Building age depreciation (approx 0.8% per year)
    const ageDeprec = Math.max(0, 1 - buildingAge * 0.008);
    rate *= ageDeprec;

    // Condition
    const condObj = CONDITIONS.find((c) => c.id === condition) || CONDITIONS[1];
    rate *= condObj.factor;

    // Facing
    const facingObj = FACINGS.find((f) => f.id === facing) || FACINGS[0];
    rate *= facingObj.factor;

    // Parking added value (~৳ 5-8 Lakh per slot)
    const parkingValue = parkingSpaces * 650000;

    const baseValue = sizeSqft * rate;
    const totalEstimate = baseValue + parkingValue;

    const ratePerSqft = Math.round(totalEstimate / sizeSqft);
    const lowRange = totalEstimate * 0.92;
    const highRange = totalEstimate * 1.08;

    // Monthly rental yield approximation (approx 4.5% - 5.5% annual yield)
    const monthlyRent = Math.round((totalEstimate * 0.05) / 12);

    return {
      total: Math.round(totalEstimate),
      low: Math.round(lowRange),
      high: Math.round(highRange),
      ratePerSqft,
      monthlyRent,
      trend: selectedArea.trend,
    };
  }, [selectedArea, sizeSqft, floor, buildingAge, parkingSpaces, condition, facing]);

  const handleBookSubmit = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setModalOpen(false);
    }, 2200);
  };

  return (
    <div className="z-val-page">
      {/* ── 1. Hero ────────────────────────────────────────────── */}
      <section className="z-val-hero">
        <div className="container-page">
          <span className="z-val-badge">
            <FaMagic className="text-gold-400" />
            ZennorValue estimate
          </span>
          <h1 className="z-val-hero__title">What is my property worth?</h1>
          <p className="z-val-hero__sub">
            We start from the going rate per sqft in your area, then adjust for floor, building age, condition, facing and parking — the same factors a bank’s valuer weighs.
          </p>
        </div>
      </section>

      {/* ── 2. Form & Sticky Valuation Summary ────────────────── */}
      <div className="container-page z-val-container">
        <div className="z-val-grid">
          {/* Left Form */}
          <div className="z-val-form-card">
            <h2 className="z-val-card-title">Tell us about the property</h2>

            <div className="z-val-fields">
              {/* Area Select */}
              <div className="z-val-group">
                <span className="z-val-label">Area</span>
                <div className="z-select-wrap">
                  <select
                    value={selectedAreaId}
                    onChange={(e) => setSelectedAreaId(e.target.value)}
                    className="z-val-select"
                  >
                    {AREAS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="z-select-chevron" />
                </div>
                <p className="z-val-help">
                  Current area rate: <b>৳ {selectedArea.baseRate.toLocaleString('en-IN')}/sqft</b>
                </p>
              </div>

              {/* Size Slider */}
              <div className="z-val-group">
                <div className="z-val-group__header">
                  <span className="z-val-label">Size</span>
                  <span className="z-val-val">{sizeSqft.toLocaleString('en-IN')} sqft</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="50"
                  value={sizeSqft}
                  onChange={(e) => setSizeSqft(Number(e.target.value))}
                  className="z-slider"
                />
                <div className="z-slider-ticks">
                  <span>500 sqft</span>
                  <span>5,000 sqft</span>
                </div>
              </div>

              {/* Floor Slider */}
              <div className="z-val-group">
                <div className="z-val-group__header">
                  <span className="z-val-label">Floor</span>
                  <span className="z-val-val">{floor === 0 ? 'Ground floor' : `Floor ${floor}`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value))}
                  className="z-slider"
                />
                <div className="z-slider-ticks">
                  <span>Ground</span>
                  <span>20th floor</span>
                </div>
              </div>

              {/* Building Age */}
              <div className="z-val-group">
                <div className="z-val-group__header">
                  <span className="z-val-label">Building age</span>
                  <span className="z-val-val">{buildingAge === 0 ? 'Brand new' : `${buildingAge} years`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={buildingAge}
                  onChange={(e) => setBuildingAge(Number(e.target.value))}
                  className="z-slider"
                />
                <div className="z-slider-ticks">
                  <span>New</span>
                  <span>30 years</span>
                </div>
              </div>

              {/* Parking Spaces */}
              <div className="z-val-group">
                <div className="z-val-group__header">
                  <span className="z-val-label">Parking spaces</span>
                  <span className="z-val-val">{parkingSpaces}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={parkingSpaces}
                  onChange={(e) => setParkingSpaces(Number(e.target.value))}
                  className="z-slider"
                />
                <div className="z-slider-ticks">
                  <span>0</span>
                  <span>4 spots</span>
                </div>
              </div>

              {/* Condition */}
              <div className="z-val-group">
                <span className="z-val-label">Condition</span>
                <div className="z-pill-grid sm-cols-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCondition(c.id)}
                      className={`z-choice-btn ${condition === c.id ? 'active' : ''}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Facing */}
              <div className="z-val-group">
                <span className="z-val-label">Facing</span>
                <div className="z-pill-wrap">
                  {FACINGS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFacing(f.id)}
                      className={`z-choice-btn ${facing === f.id ? 'active' : ''}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sticky Valuation Result */}
          <aside className="z-val-sidebar">
            <div className="z-val-result-card">
              <p className="z-val-result-header">
                <FaChartLine className="text-gold-400 mr-2" />
                Estimated market value
              </p>
              <p className="z-val-result-amount">{formatBDT(valuation.total)}</p>
              <p className="z-val-result-range">
                Likely range: {formatBDT(valuation.low)} – {formatBDT(valuation.high)}
              </p>

              {/* Progress Range Bar */}
              <div className="z-val-meter">
                <div className="z-val-meter-fill" />
              </div>

              <dl className="z-val-metrics">
                <div className="z-val-metric-row">
                  <dt>Value per sqft</dt>
                  <dd>৳ {valuation.ratePerSqft.toLocaleString('en-IN')}</dd>
                </div>
                <div className="z-val-metric-row">
                  <dt>If you rented it out</dt>
                  <dd>
                    ৳ {valuation.monthlyRent.toLocaleString('en-IN')}
                    <span className="text-white/50 text-xs">/mo</span>
                  </dd>
                </div>
                <div className="z-val-metric-row">
                  <dt>Area trend (1 yr)</dt>
                  <dd className="text-emerald-300 font-bold">{valuation.trend}</dd>
                </div>
              </dl>

              <p className="z-val-notice">
                <FaInfoCircle className="inline mr-1" />
                An estimate, not a valuation report. A bank or buyer will want a physical inspection before agreeing a number.
              </p>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="z-val-visit-btn"
              >
                Book a free valuation visit
                <FaArrowRight className="ml-1" />
              </button>
            </div>

            {/* Ready to sell prompt */}
            <Link to="/sell" className="z-val-sell-banner">
              <p className="font-bold text-ink-900">Ready to sell?</p>
              <p className="text-sm text-ink-500 mt-1">
                List it free and reach 12,000+ buyers browsing this week.
              </p>
              <span className="z-val-sell-link">
                Post a property <FaArrowRight className="ml-1" />
              </span>
            </Link>
          </aside>
        </div>
      </div>

      {/* ── 3. Booking Modal ───────────────────────────────────── */}
      {modalOpen && (
        <div className="z-modal-overlay">
          <div className="z-modal-content">
            <button
              type="button"
              className="z-modal-close"
              onClick={() => setModalOpen(false)}
            >
              <FaTimes />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-6">
                <FaCheckCircle className="text-emerald-500 text-5xl mx-auto mb-3" />
                <h3 className="text-xl font-bold text-ink-900">Valuation Request Received!</h3>
                <p className="text-ink-500 text-sm mt-2">
                  A certified Zennor valuation inspector for {selectedArea.name} will call you within 24 hours to schedule the physical visit.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit}>
                <h3 className="text-xl font-bold text-ink-900">Book Free Valuation Visit</h3>
                <p className="text-ink-500 text-sm mt-1 mb-4">
                  For property in <b>{selectedArea.name}</b> (~{sizeSqft} sqft)
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1">Your Full Name</label>
                    <input required type="text" placeholder="e.g. Asif Chowdhury" className="z-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1">Mobile Number (BD)</label>
                    <input required type="tel" placeholder="+880 1711-XXXXXX" className="z-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1">Building / House Details</label>
                    <input required type="text" placeholder="Road 11, House 24, Apt 4B" className="z-input" />
                  </div>
                </div>

                <button type="submit" className="z-modal-submit-btn">
                  Confirm Free Valuation Visit
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
