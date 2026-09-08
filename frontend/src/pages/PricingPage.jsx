import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMagic, FaCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import useSiteContent from '../hooks/useSiteContent';
import { paymentsApi } from '../api/client';
import toast from 'react-hot-toast';
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
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const content = useSiteContent('pricing', {
    badge: 'No commission, ever',
    title: 'Plans priced in taka, for agencies in Bangladesh',
    subtitle: 'Start free, upgrade when your listings outgrow it. Every plan includes the lead inbox and bKash billing.',
    tiers: TIERS,
    faqs: FAQS,
    faqTitle: 'Questions agents ask us',
    footnote: 'All prices exclude 15% VAT. Enterprise and multi-city developer packages available on request.',
  });
  const tiers = Array.isArray(content.tiers) ? content.tiers : TIERS;
  const faqs = Array.isArray(content.faqs) ? content.faqs : FAQS;

  const handlePlanClick = async (tier) => {
    if (tier.id === 'starter') {
      navigate('/sell');
      return;
    }
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/pricing' } } });
      return;
    }
    setCheckoutPlan(tier.id);
    try {
      const response = await paymentsApi.checkout(tier.id, isYearly ? 'yearly' : 'monthly');
      window.location.assign(response.data.checkout_url);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Checkout is temporarily unavailable.');
    } finally {
      setCheckoutPlan(null);
    }
  };

  return (
    <div className="z-pricing-page">
      {/* ── 1. Hero ────────────────────────────────────────────── */}
      <section className="z-pricing-hero">
        <div className="container-page text-center">
          <span className="z-pricing-badge">
            <FaMagic className="text-gold-400" />
            {content.badge}
          </span>
          <h1 className="z-pricing-hero__title">
            {content.title}
          </h1>
          <p className="z-pricing-hero__sub">
            {content.subtitle}
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
          {tiers.map((tier) => (
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

              <button
                type="button"
                onClick={() => handlePlanClick(tier)}
                disabled={checkoutPlan === tier.id}
                className={`z-tier-cta ${tier.popular ? 'z-tier-cta--primary' : 'z-tier-cta--outline'}`}
              >
                {checkoutPlan === tier.id ? 'Opening checkout...' : tier.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="z-pricing-footnote">
          {content.footnote}
        </p>
      </div>

      {/* ── 3. Questions FAQ ───────────────────────────────────── */}
      <section className="container-page z-pricing-faq-sec">
        <h2 className="text-center z-sec-title">{content.faqTitle}</h2>
        <div className="z-pricing-faq-grid">
          {faqs.map((faq, idx) => (
            <div key={idx} className="z-pricing-faq-card">
              <h3 className="z-pricing-faq-q">{faq.q}</h3>
              <p className="z-pricing-faq-a">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
