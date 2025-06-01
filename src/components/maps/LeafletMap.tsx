import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Create a custom default icon configuration
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Set the default icon for all markers
L.Marker.prototype.options.icon = defaultIcon;

interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  className?: string;
  markerText?: string;
  markers?: Array<{
    position: [number, number];
    text?: string;
    icon?: L.Icon;
  }>;
  onMapClick?: (latlng: L.LatLng) => void;
}

// Component to handle map view changes
const MapViewUpdater = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({ 
  center,
  zoom = 13,
  className = '',
  markerText = 'R4H Location – Available Now',
  markers = [],
  onMapClick
}) => {
  const defaultMarker = useMemo(() => (
    { position: center, text: markerText }
  ), [center, markerText]);

  const allMarkers = useMemo(() => (
    markers.length > 0 ? markers : [defaultMarker]
  ), [markers, defaultMarker]);

  return (
    <div className={`relative ${className}`}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        className="w-full h-[400px]"
        whenCreated={(map) => {
          if (onMapClick) {
            map.on('click', (e) => onMapClick(e.latlng));
          }
        }}
      >
        <MapViewUpdater center={center} zoom={zoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {allMarkers.map((marker, index) => (
          <Marker 
            key={`marker-${index}`} 
            position={marker.position}
            icon={marker.icon || defaultIcon}
          >
            <Popup>
              {marker.text}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;