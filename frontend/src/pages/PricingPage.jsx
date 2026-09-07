import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMagic, FaCheck, FaArrowRight } from 'react-icons/fa';
import './PricingPage.css';

const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    sub: 'For individual owners selling one property',
    monthlyPrice: 'Free',
    yearlyPrice: 'Free',
    period: '',
    highlight: '1 active listing',
    popular: false,
    cta: 'Start free',
    link: '/sell',
    features: [
      '1 active listing',
      'Up to 8 photos',
      'Buyer enquiries by email',
      'Basic listing page',
      'Listed for 30 days',
    ],
  },
  {
    id: 'agent',
    name: 'Agent',
    sub: 'For working brokers running a personal book',
    monthlyPrice: '৳ 2,500',
    yearlyPrice: '৳ 2,083',
    period: '/month',
    highlight: '25 active listings',
    popular: true,
    cta: 'Start 14-day trial',
    link: '/dashboard',
    features: [
      '25 active listings',
      'Verified agent badge',
      'Lead inbox with WhatsApp handoff',
      'Featured placement 4 days/month',
      'Listing performance analytics',
      'Own agent profile page',
      'bKash & Nagad billing',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    sub: 'For brokerages with a team on the ground',
    monthlyPrice: '৳ 9,500',
    yearlyPrice: '৳ 7,916',
    period: '/month',
    highlight: '150 active listings',
    popular: false,
    cta: 'Start 14-day trial',
    link: '/dashboard',
    features: [
      '150 active listings',
      'Up to 10 agent seats',
      'Shared team lead pipeline',
      'Agency branding on every listing',
      'Bulk upload from Excel',
      'Featured placement 15 days/month',
      'Priority support on WhatsApp',
    ],
  },
  {
    id: 'developer',
    name: 'Developer',
    sub: 'For real estate developers marketing projects',
    monthlyPrice: '৳ 35,000',
    yearlyPrice: '৳ 29,166',
    period: '/month',
    highlight: 'Unlimited listings',
    popular: false,
    cta: 'Start 14-day trial',
    link: '/dashboard',
    features: [
      'Unlimited listings & unlimited seats',
      'Dedicated project microsite',
      'Floor-plan and inventory manager',
      'Homepage banner placement',
      'API access & CRM webhooks',
      'Named account manager',
      'Monthly market report for your areas',
    ],
  },
];

const FAQS = [
  {
    q: 'How do I pay?',
    a: 'bKash, Nagad, Rocket, any local debit or credit card, or bank transfer for agency and developer plans. Invoices are issued with your BIN for VAT purposes.',
  },
  {
    q: 'Is there a contract?',
    a: 'No lock-in on monthly plans — cancel any month and your listings stay live until the period ends. Yearly plans give you two months free.',
  },
  {
    q: 'What does verification involve?',
    a: 'We check your NID, trade licence and two past deals. It usually takes 2 working days, after which the verified badge appears on all your listings.',
  },
  {
    q: 'Do you take commission on deals?',
    a: 'No. You pay the subscription and keep 100% of your commission. We do not sit between you and your client.',
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="z-pricing-page">
      {/* ── 1. Hero ────────────────────────────────────────────── */}
      <section className="z-pricing-hero">
        <div className="container-page text-center">
          <span className="z-pricing-badge">
            <FaMagic className="text-gold-400" />
            No commission, ever
          </span>
          <h1 className="z-pricing-hero__title">
            Plans priced in taka, for agencies in Bangladesh
          </h1>
          <p className="z-pricing-hero__sub">
            Start free, upgrade when your listings outgrow it. Every plan includes the lead inbox and bKash billing.
          </p>

          {/* Billing Switcher */}
          <div className="z-billing-toggle">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`z-toggle-btn ${!isYearly ? 'active' : ''}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`z-toggle-btn ${isYearly ? 'active' : ''}`}
            >
              Yearly
              <span className="z-toggle-pill">2 months free</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. Pricing Grid ────────────────────────────────────── */}
      <div className="container-page z-pricing-container">
        <div className="z-pricing-grid">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`z-tier-card ${tier.popular ? 'z-tier-card--popular' : ''}`}
            >
              {tier.popular && (
                <span className="z-tier-popular-tag">Most popular</span>
              )}

              <h2 className="z-tier-name">{tier.name}</h2>
              <p className="z-tier-sub">{tier.sub}</p>

              <div className="z-tier-price-wrap">
                <span className="z-tier-price">
                  {isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                </span>
                {tier.period && <span className="z-tier-period">{tier.period}</span>}
              </div>
              <p className="z-tier-highlight">{tier.highlight}</p>

              <ul className="z-tier-features">
                {tier.features.map((feat, idx) => (
                  <li key={idx} className="z-tier-feature-item">
                    <FaCheck className="z-tier-check-icon" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={tier.link}
                className={`z-tier-cta ${tier.popular ? 'z-tier-cta--primary' : 'z-tier-cta--outline'}`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="z-pricing-footnote">
          All prices exclude 15% VAT. Enterprise and multi-city developer packages available on request.
        </p>
      </div>

      {/* ── 3. Questions FAQ ───────────────────────────────────── */}
      <section className="container-page z-pricing-faq-sec">
        <h2 className="text-center z-sec-title">Questions agents ask us</h2>
        <div className="z-pricing-faq-grid">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="z-pricing-faq-card">
              <h3 className="z-pricing-faq-q">{faq.q}</h3>
              <p className="z-pricing-faq-a">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Live Demo Banner ────────────────────────────────── */}
      <section className="container-page z-pricing-cta-sec">
        <div className="z-pricing-demo-box">
          <h2 className="z-pricing-demo-title">See the dashboard before you pay anything</h2>
          <p className="z-pricing-demo-sub">
            The full agent dashboard is open as a live demo — listings, leads, visits and invoices, with sample data.
          </p>
          <Link to="/dashboard" className="z-pricing-demo-btn">
            Open the live demo
          </Link>
          <p className="z-pricing-demo-trust">Trusted by 1,340+ agents across Bangladesh</p>
        </div>
      </section>
    </div>
  );
}
