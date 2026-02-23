import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DisasterMap = ({ position, setPosition }) => {
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });
    return null;
  };

  return (
    <div className="relative">
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', height: '320px' }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {position && <Marker position={position} />}
          <MapEvents />
        </MapContainer>
      </div>
      <div
        className="mt-3 text-center text-xs font-semibold py-2 rounded-xl"
        style={{
          color: position ? '#67e8f9' : '#64748b',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        {position
          ? `🎯 Target locked: ${position.lat.toFixed(4)}°N, ${position.lng.toFixed(4)}°E`
          : "🗺️ Click on the map to lock disaster coordinates"
        }
      </div>
    </div>
  );
};

export default DisasterMap;
