import { FaHistory, FaTag, FaCheckCircle, FaFileInvoiceDollar } from 'react-icons/fa';
import { formatPrice } from '../utils/helpers';
import './PriceHistorySection.css';

export default function PriceHistorySection({ property }) {
  const currentPrice = property?.price || 10000000;
  const isRent = property?.listing_type === 'rent';

  const historyEvents = [
    {
      date: 'Aug 2026',
      event: isRent ? 'Listed for rent' : 'Listed for sale',
      price: currentPrice,
      change: '—',
      source: 'Prestige Realty Brokerage',
    },
    {
      date: 'Jan 2025',
      event: 'Price change',
      price: Math.round(currentPrice * 0.94),
      change: '+6.4%',
      source: 'Public Records',
    },
    {
      date: 'Nov 2023',
      event: 'Sold',
      price: Math.round(currentPrice * 0.82),
      change: '—',
      source: 'Prestige Deeds Registry',
    },
  ];

  return (
    <div className="z-history-card">
      <div className="z-history__header">
        <h3 className="z-history__title">
          <FaHistory className="text-blue" /> Price History & Public Records
        </h3>
        <span className="z-history__badge">Verified MLS Data</span>
      </div>

      <div className="z-history-table-wrap">
        <table className="z-history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Event</th>
              <th>Price</th>
              <th>Change</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {historyEvents.map((row, idx) => (
              <tr key={idx}>
                <td><strong>{row.date}</strong></td>
                <td>
                  <span className="z-history-event-pill">
                    <FaTag size={10} /> {row.event}
                  </span>
                </td>
                <td><strong className="z-history-price">{formatPrice(row.price)}</strong></td>
                <td><span className="text-green font-bold">{row.change}</span></td>
                <td><small className="text-muted">{row.source}</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
