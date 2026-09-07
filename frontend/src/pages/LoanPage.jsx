import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaCheck, FaInfoCircle, FaCalculator } from 'react-icons/fa';
import './LoanPage.css';

const LENDERS = [
  {
    id: 'dbh',
    name: 'DBH Finance',
    rate: 9.0,
    maxTenure: 25,
    maxLtv: 70,
    bestFor: 'Housing-only lender, fastest approvals on resale flats.',
  },
  {
    id: 'city',
    name: 'City Bank',
    rate: 9.5,
    maxTenure: 25,
    maxLtv: 70,
    bestFor: 'Strong on salaried applicants with a City Bank payroll account.',
  },
  {
    id: 'brac',
    name: 'BRAC Bank',
    rate: 9.25,
    maxTenure: 25,
    maxLtv: 70,
    bestFor: 'Accepts business income with two years of audited returns.',
  },
  {
    id: 'ebl',
    name: 'Eastern Bank (EBL)',
    rate: 9.75,
    maxTenure: 25,
    maxLtv: 70,
    bestFor: 'Good option for non-resident Bangladeshi buyers.',
  },
  {
    id: 'idlc',
    name: 'IDLC Finance',
    rate: 9.4,
    maxTenure: 20,
    maxLtv: 70,
    bestFor: 'Flexible on under-construction and developer-booking cases.',
  },
  {
    id: 'scb',
    name: 'Standard Chartered',
    rate: 10.0,
    maxTenure: 25,
    maxLtv: 70,
    bestFor: 'Higher rate, but the largest single-ticket loan sizes.',
  },
];

const FAQS = [
  {
    q: 'How much can I borrow?',
    a: 'Most Bangladeshi lenders cap the loan at 70% of the property value, and keep your total instalments under 50% of net monthly income. Both limits apply — whichever binds first sets your ceiling.',
  },
  {
    q: 'What papers will the bank ask for?',
    a: 'NID, TIN certificate, last two years of tax returns, six months of bank statements, salary certificate or trade licence, and the full property chain — deed, mutation, DCR and the approved plan.',
  },
  {
    q: 'What costs sit on top of the price?',
    a: 'Budget roughly 10–12% of the price for registration: stamp duty, registration fee, local government tax, VAT on the developer portion, plus the bank’s processing fee and legal vetting.',
  },
  {
    q: 'Can a non-resident Bangladeshi get a loan?',
    a: 'Yes. EBL, City Bank and DBH all run NRB products. You will need a local nominee with power of attorney, proof of remittance history, and salary documents attested by the Bangladesh mission in your country.',
  },
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

export default function LoanPage() {
  const [price, setPrice] = useState(15000000); // 1.5 Crore
  const [downPercent, setDownPercent] = useState(30); // 30%
  const [tenure, setTenure] = useState(20); // 20 years
  const [selectedLender, setSelectedLender] = useState(LENDERS[0]);
  const [openFaq, setOpenFaq] = useState(null);

  const calculations = useMemo(() => {
    const downPayment = (price * downPercent) / 100;
    const loanAmount = price - downPayment;
    const rate = selectedLender.rate;
    const monthlyRate = rate / 100 / 12;
    const totalMonths = tenure * 12;

    let emi = 0;
    if (loanAmount > 0 && monthlyRate > 0) {
      emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const totalPayment = emi * totalMonths;
    const totalInterest = Math.max(0, totalPayment - loanAmount);
    const processingFee = loanAmount * 0.005; // 0.5% typical

    return {
      downPayment,
      loanAmount,
      emi: Math.round(emi),
      totalInterest,
      processingFee: Math.round(processingFee),
    };
  }, [price, downPercent, tenure, selectedLender]);

  return (
    <div className="z-loan-page">
      {/* ── 1. Hero ────────────────────────────────────────────── */}
      <section className="z-loan-hero">
        <div className="container-page">
          <h1 className="z-loan-hero__title">Home loan &amp; EMI calculator</h1>
          <p className="z-loan-hero__sub">
            Set the price, your down payment and tenure, then compare what six Bangladeshi lenders would charge you each month.
          </p>
        </div>
      </section>

      {/* ── 2. Calculator Card ─────────────────────────────────── */}
      <div className="container-page z-loan-calc-container">
        <div className="z-loan-card">
          <div className="z-loan-card__grid">
            {/* Left Inputs */}
            <div className="z-loan-inputs">
              {/* Property Price */}
              <div className="z-calc-group">
                <div className="z-calc-group__header">
                  <span className="z-calc-label">Property price</span>
                  <span className="z-calc-val">৳ {price.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="2000000"
                  max="150000000"
                  step="500000"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="z-slider"
                />
                <div className="z-slider-ticks">
                  <span>৳ 20 Lakh</span>
                  <span>৳ 15 Crore</span>
                </div>
              </div>

              {/* Down Payment */}
              <div className="z-calc-group">
                <div className="z-calc-group__header">
                  <span className="z-calc-label">Down payment</span>
                  <span className="z-calc-val">
                    {downPercent}% · {formatBDT(calculations.downPayment)}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={downPercent}
                  onChange={(e) => setDownPercent(Number(e.target.value))}
                  className="z-slider"
                />
                <div className="z-slider-ticks">
                  <span>10%</span>
                  <span>80%</span>
                </div>
              </div>

              {/* Tenure */}
              <div className="z-calc-group">
                <div className="z-calc-group__header">
                  <span className="z-calc-label">Tenure</span>
                  <span className="z-calc-val">{tenure} years</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="z-slider"
                />
                <div className="z-slider-ticks">
                  <span>5 yrs</span>
                  <span>25 yrs</span>
                </div>
              </div>

              {/* Lender Selection */}
              <div className="z-calc-group">
                <span className="z-calc-label">Lender</span>
                <div className="z-lenders-grid">
                  {LENDERS.map((lender) => {
                    const isSelected = selectedLender.id === lender.id;
                    return (
                      <button
                        key={lender.id}
                        type="button"
                        onClick={() => setSelectedLender(lender)}
                        className={`z-lender-btn ${isSelected ? 'active' : ''}`}
                      >
                        <span className="z-lender-btn__name">{lender.name}</span>
                        <span className="z-lender-btn__meta">
                          {lender.rate}% · up to {lender.maxLtv}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Summary Dark Card */}
            <div className="z-loan-summary">
              <p className="z-loan-summary__sub">Your monthly instalment</p>
              <p className="z-loan-summary__amount">৳ {calculations.emi.toLocaleString('en-IN')}</p>
              <p className="z-loan-summary__duration">
                over {tenure} years at {selectedLender.rate}%
              </p>

              <dl className="z-loan-breakdown">
                <div className="z-loan-breakdown__row">
                  <dt>Loan amount</dt>
                  <dd>{formatBDT(calculations.loanAmount)}</dd>
                </div>
                <div className="z-loan-breakdown__row">
                  <dt>You pay upfront</dt>
                  <dd>{formatBDT(calculations.downPayment)}</dd>
                </div>
                <div className="z-loan-breakdown__row">
                  <dt>Total interest</dt>
                  <dd>{formatBDT(calculations.totalInterest)}</dd>
                </div>
                <div className="z-loan-breakdown__row">
                  <dt>Processing fee</dt>
                  <dd>৳ {calculations.processingFee.toLocaleString('en-IN')}</dd>
                </div>
              </dl>

              <p className="z-loan-disclaimer">
                <FaInfoCircle className="inline mr-1" />
                Indicative only. Rates move with Bangladesh Bank policy and your final offer depends on income assessment.
              </p>

              <Link to="/search?type=buy" className="z-loan-cta-btn">
                Browse verified homes in this budget
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Lenders Compared Table ─────────────────────────── */}
      <section className="container-page z-loan-table-sec">
        <h2 className="z-sec-title">Lenders compared</h2>
        <div className="z-table-wrap">
          <table className="z-loan-table">
            <thead>
              <tr>
                <th>Lender</th>
                <th className="text-right">Rate</th>
                <th className="text-right">Max tenure</th>
                <th className="text-right">Max LTV</th>
                <th>Best for</th>
              </tr>
            </thead>
            <tbody>
              {LENDERS.map((l) => (
                <tr key={l.id}>
                  <td className="font-semibold text-ink-900">{l.name}</td>
                  <td className="text-right font-semibold text-brand-700">{l.rate}%</td>
                  <td className="text-right text-ink-700">{l.maxTenure} yrs</td>
                  <td className="text-right text-ink-700">{l.maxLtv}%</td>
                  <td className="text-ink-500">{l.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="z-table-footnote">
          Indicative rates for illustration. Confirm current terms directly with the lender.
        </p>
      </section>

      {/* ── 4. Common Questions Accordion ───────────────────────── */}
      <section className="container-page z-loan-faq-sec">
        <h2 className="z-sec-title">Common questions</h2>
        <div className="z-faq-grid">
          {FAQS.map((faq, idx) => (
            <details
              key={idx}
              className="z-faq-card group"
              open={openFaq === idx}
              onClick={(e) => {
                e.preventDefault();
                setOpenFaq(openFaq === idx ? null : idx);
              }}
            >
              <summary className="z-faq-summary">
                <span>{faq.q}</span>
                <FaChevronDown className={`z-faq-icon ${openFaq === idx ? 'rotated' : ''}`} />
              </summary>
              <p className="z-faq-answer">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
