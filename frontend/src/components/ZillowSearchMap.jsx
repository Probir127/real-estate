import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { formatPrice } from '../utils/helpers';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './ZillowSearchMap.css';

// Fix Leaflet's default marker icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CITY_COORDS = {
  Dhaka: [23.8103, 90.4125],
  Chittagong: [22.3569, 91.7832],
  Sylhet: [24.8949, 91.8687],
  "Cox's Bazar": [21.4272, 92.0058],
  Rajshahi: [24.3745, 88.6042],
  Khulna: [22.8456, 89.5403],
};

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Generate a compact price text for pins: e.g. "৳3.5Cr", "৳45K"
function formatCompactPrice(price, isRent) {
  if (!price) return '৳0';
  const num = Number(price);
  if (isRent) {
    if (num >= 100000) return `৳${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `৳${Math.round(num / 1000)}K`;
    return `৳${num}`;
  } else {
    if (num >= 10000000) return `৳${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `৳${(num / 100000).toFixed(1)}L`;
    return `৳${Math.round(num / 1000)}K`;
  }
}

export default function ZillowSearchMap({
  properties = [],
  activeCity = 'Dhaka',
  activePropertyId = null,
  onMarkerHover = () => {},
  onMarkerClick = () => {},
}) {
  const centerCoords = CITY_COORDS[activeCity] || CITY_COORDS['Dhaka'];

  return (
    <div className="z-search-map-container">
      <MapContainer
        center={centerCoords}
        zoom={12}
        scrollWheelZoom={true}
        className="z-leaflet-map"
      >
        <ChangeMapView center={centerCoords} zoom={activeCity ? 12 : 7} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {properties.map((p, idx) => {
          const lat = p.latitude || centerCoords[0] + (Math.sin(idx * 1.5) * 0.03);
          const lng = p.longitude || centerCoords[1] + (Math.cos(idx * 1.5) * 0.03);
          const isSelected = activePropertyId === p.id;
          const isRent = p.listing_type === 'rent';
          const priceLabel = formatCompactPrice(p.price, isRent);

          const customIcon = L.divIcon({
            className: `z-map-pill ${isSelected ? 'z-map-pill--active' : ''} ${isRent ? 'z-map-pill--rent' : ''}`,
            html: `<span>${priceLabel}</span>`,
            iconSize: [58, 26],
            iconAnchor: [29, 13],
          });

          return (
            <Marker
              key={p.id}
              position={[lat, lng]}
              icon={customIcon}
              eventHandlers={{
                mouseover: () => onMarkerHover(p.id),
                mouseout: () => onMarkerHover(null),
                click: () => onMarkerClick(p.id),
              }}
            >
              <Popup className="z-map-popup">
                <div className="z-popup-card">
                  {p.primary_image_url && (
                    <img src={p.primary_image_url} alt={p.title} className="z-popup-img" />
                  )}
                  <div className="z-popup-body">
                    <strong className="z-popup-price">
                      {formatPrice(p.price)}
                      {isRent && <small>/mo</small>}
                    </strong>
                    <div className="z-popup-specs">
                      {p.bedrooms > 0 && <span>{p.bedrooms} bds</span>}
                      {p.bathrooms > 0 && <span>• {p.bathrooms} ba</span>}
                      {p.area_sqft > 0 && <span>• {p.area_sqft} sqft</span>}
                    </div>
                    <p className="z-popup-title">{p.title}</p>
                    <Link to={`/properties/${p.id}`} className="z-popup-link">
                      View Details →
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="z-map-overlay-banner">
        <span>Save search for instant price drop alerts</span>
      </div>
    </div>
  );
}
