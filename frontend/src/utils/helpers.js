/**
 * Utility helpers used across the frontend.
 */

/**
 * Format a price in BDT (Bangladeshi Taka) using lakh/crore notation.
 * Examples: ৳50 Lakh, ৳2.5 Crore, ৳25,000/mo
 */
export function formatPrice(price, listingType = 'sale') {
  const num = parseFloat(price);
  if (isNaN(num) || num === 0) return 'মূল্য TBD';

  let formatted;
  if (num >= 10_000_000) {
    // Crore (1 crore = 1,00,00,000)
    const crore = num / 10_000_000;
    formatted = '৳' + (Number.isInteger(crore) ? crore : crore.toFixed(2).replace(/\.?0+$/, '')) + ' Crore';
  } else if (num >= 100_000) {
    // Lakh (1 lakh = 1,00,000)
    const lakh = num / 100_000;
    formatted = '৳' + (Number.isInteger(lakh) ? lakh : lakh.toFixed(2).replace(/\.?0+$/, '')) + ' Lakh';
  } else {
    formatted = '৳' + num.toLocaleString('en-BD');
  }

  return listingType === 'rent' ? `${formatted}/mo` : formatted;
}

/** Return a human-readable relative time: "3 days ago" */
export function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/** Truncate a string with ellipsis */
export function truncate(str, maxLen = 120) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

/** Extract error message from Axios error response */
export function getErrorMessage(error) {
  if (error?.response?.data) {
    const data = error.response.data;
    if (data.message) return data.message;
    if (data.detail) return data.detail;
    // Flatten field-level validation errors
    if (typeof data.errors === 'object') {
      const first = Object.values(data.errors)[0];
      if (Array.isArray(first)) return first[0];
      return String(first);
    }
  }
  return error?.message || 'An unexpected error occurred.';
}

/** Build a full media URL (handles relative paths from Django) */
export function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
  return `${base}${path}`;
}

/** Property type icon name lookup */
export const PROPERTY_TYPE_ICONS = {
  house: 'FaHome',
  apartment: 'FaBuilding',
  condo: 'FaCity',
  townhouse: 'FaHouseUser',
  land: 'FaMountain',
  commercial: 'FaStore',
  villa: 'FaUmbrellaBeach',
};
