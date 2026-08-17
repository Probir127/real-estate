import { useState, useMemo } from 'react';
import { FaCalculator, FaHome, FaShieldAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import { formatPrice } from '../utils/helpers';
import './MortgageCalculator.css';

export default function MortgageCalculator({ propertyPrice = 10000000 }) {
  const [homePrice, setHomePrice] = useState(propertyPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [interestRate, setInterestRate] = useState(7.5);
  const [propertyTaxRate, setPropertyTaxRate] = useState(0.8);
  const [homeInsurance, setHomeInsurance] = useState(3500);
  const [hoaFee, setHoaFee] = useState(4000);

  // Sync if prop changes
  useMemo(() => {
    if (propertyPrice && propertyPrice !== homePrice) {
      setHomePrice(propertyPrice);
    }
  }, [propertyPrice]);

  const downPaymentAmount = useMemo(() => {
    return Math.round((homePrice * downPaymentPercent) / 100);
  }, [homePrice, downPaymentPercent]);

  const loanAmount = useMemo(() => {
    return Math.max(0, homePrice - downPaymentAmount);
  }, [homePrice, downPaymentAmount]);

  const monthlyPrincipalAndInterest = useMemo(() => {
    if (loanAmount <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = loanTermYears * 12;
    if (monthlyRate === 0) return Math.round(loanAmount / totalPayments);
    const monthly =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    return Math.round(monthly);
  }, [loanAmount, interestRate, loanTermYears]);

  const monthlyPropertyTax = useMemo(() => {
    return Math.round((homePrice * (propertyTaxRate / 100)) / 12);
  }, [homePrice, propertyTaxRate]);

  const totalMonthlyPayment = useMemo(() => {
    return (
      monthlyPrincipalAndInterest +
      monthlyPropertyTax +
      Number(homeInsurance) +
      Number(hoaFee)
    );
  }, [monthlyPrincipalAndInterest, monthlyPropertyTax, homeInsurance, hoaFee]);

  // Breakdown percentages for color bar
  const piPercent = totalMonthlyPayment > 0 ? (monthlyPrincipalAndInterest / totalMonthlyPayment) * 100 : 0;
  const taxPercent = totalMonthlyPayment > 0 ? (monthlyPropertyTax / totalMonthlyPayment) * 100 : 0;
  const insPercent = totalMonthlyPayment > 0 ? (homeInsurance / totalMonthlyPayment) * 100 : 0;
  const hoaPercent = totalMonthlyPayment > 0 ? (hoaFee / totalMonthlyPayment) * 100 : 0;

  return (
    <div className="z-mortgage-calc">
      <div className="z-mortgage-calc__header">
        <div>
          <h3 className="z-mortgage-calc__title">
            <FaCalculator className="text-blue" /> Mortgage & Monthly Cost Calculator
          </h3>
          <p className="z-mortgage-calc__subtitle">
            Estimate your monthly payments with custom down payment, loan terms, and interest rates.
          </p>
        </div>
        <div className="z-mortgage-calc__total-box">
          <span className="z-mortgage-calc__total-label">Estimated Payment</span>
          <span className="z-mortgage-calc__total-amount">
            {formatPrice(totalMonthlyPayment)}
            <small>/mo</small>
          </span>
        </div>
      </div>

      {/* Visual Multi-Color Breakdown Bar */}
      <div className="z-mortgage-bar" title="Payment Breakdown">
        <div className="z-mortgage-bar__segment z-mortgage-bar__segment--pi" style={{ width: `${piPercent}%` }} />
        <div className="z-mortgage-bar__segment z-mortgage-bar__segment--tax" style={{ width: `${taxPercent}%` }} />
        <div className="z-mortgage-bar__segment z-mortgage-bar__segment--ins" style={{ width: `${insPercent}%` }} />
        <div className="z-mortgage-bar__segment z-mortgage-bar__segment--hoa" style={{ width: `${hoaPercent}%` }} />
      </div>

      {/* Legend & Breakdown Numbers */}
      <div className="z-mortgage-legend">
        <div className="z-mortgage-legend__item">
          <span className="z-legend-dot z-legend-dot--pi" />
          <span className="z-legend-label">Principal & Interest</span>
          <strong className="z-legend-val">{formatPrice(monthlyPrincipalAndInterest)}/mo</strong>
        </div>
        <div className="z-mortgage-legend__item">
          <span className="z-legend-dot z-legend-dot--tax" />
          <span className="z-legend-label">Property Taxes</span>
          <strong className="z-legend-val">{formatPrice(monthlyPropertyTax)}/mo</strong>
        </div>
        <div className="z-mortgage-legend__item">
          <span className="z-legend-dot z-legend-dot--ins" />
          <span className="z-legend-label">Home Insurance</span>
          <strong className="z-legend-val">{formatPrice(homeInsurance)}/mo</strong>
        </div>
        <div className="z-mortgage-legend__item">
          <span className="z-legend-dot z-legend-dot--hoa" />
          <span className="z-legend-label">HOA / Maintenance</span>
          <strong className="z-legend-val">{formatPrice(hoaFee)}/mo</strong>
        </div>
      </div>

      {/* Interactive Controls & Sliders */}
      <div className="z-mortgage-controls">
        
        {/* Home Price Input */}
        <div className="z-calc-field">
          <label className="form-label">Home Price</label>
          <div className="input-with-symbol">
            <span className="input-symbol">৳</span>
            <input
              type="number"
              className="form-control"
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value) || 0)}
              step="100000"
            />
          </div>
        </div>

        {/* Down Payment (% and ৳) */}
        <div className="z-calc-field">
          <label className="form-label">Down Payment ({downPaymentPercent}%)</label>
          <div className="input-with-symbol">
            <span className="input-symbol">৳</span>
            <input
              type="number"
              className="form-control"
              value={downPaymentAmount}
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                setDownPaymentPercent(homePrice > 0 ? Math.round((val / homePrice) * 100) : 0);
              }}
              step="50000"
            />
          </div>
          <input
            type="range"
            min="0"
            max="80"
            step="5"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="z-calc-slider"
          />
        </div>

        {/* Loan Term Selector */}
        <div className="z-calc-field">
          <label className="form-label">Loan Term</label>
          <select
            className="form-control"
            value={loanTermYears}
            onChange={(e) => setLoanTermYears(Number(e.target.value))}
          >
            <option value={30}>30 Years Fixed</option>
            <option value={20}>20 Years Fixed</option>
            <option value={15}>15 Years Fixed</option>
            <option value={10}>10 Years Fixed</option>
            <option value={5}>5 Years Fixed</option>
          </select>
        </div>

        {/* Interest Rate */}
        <div className="z-calc-field">
          <label className="form-label">Interest Rate (%)</label>
          <div className="input-with-symbol">
            <span className="input-symbol">%</span>
            <input
              type="number"
              step="0.1"
              min="1"
              max="20"
              className="form-control"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
            />
          </div>
          <input
            type="range"
            min="3"
            max="15"
            step="0.25"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="z-calc-slider"
          />
        </div>

      </div>
    </div>
  );
}
