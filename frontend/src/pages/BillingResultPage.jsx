import { Link, useParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaArrowRight } from 'react-icons/fa';
import './BillingResultPage.css';

const STATES = {
  success: {
    title: 'Payment confirmed',
    message: 'Your Zennor subscription is active. You can now manage listings from your dashboard.',
    icon: FaCheckCircle,
    className: 'success',
  },
  failed: {
    title: 'Payment could not be completed',
    message: 'No charge was confirmed. Please try again or choose another payment method.',
    icon: FaTimesCircle,
    className: 'failed',
  },
  cancelled: {
    title: 'Payment cancelled',
    message: 'Your checkout was cancelled and no subscription was activated.',
    icon: FaTimesCircle,
    className: 'cancelled',
  },
};

export default function BillingResultPage() {
  const { result } = useParams();
  const state = STATES[result] || STATES.failed;
  const Icon = state.icon;

  return (
    <main className="billing-result">
      <Icon className={`billing-result__icon billing-result__icon--${state.className}`} />
      <h1>{state.title}</h1>
      <p>{state.message}</p>
      <div className="billing-result__actions">
        <Link to="/dashboard" className="billing-result__primary">Open dashboard <FaArrowRight /></Link>
        <Link to="/pricing" className="billing-result__secondary">Back to plans</Link>
      </div>
    </main>
  );
}
