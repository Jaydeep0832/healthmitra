import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hospital } from '../../store/useLocationStore';

// Fix Leaflet default marker icon path issue in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapProps {
  hospitals: Hospital[];
  userLat: number | null;
  userLng: number | null;
  selectedHospital: Hospital | null;
  onHospitalSelect: (hospital: Hospital) => void;
}

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 20px; height: 20px; border-radius: 50%;
    background: #3B82F6; border: 3px solid white;
    box-shadow: 0 0 10px rgba(59,130,246,0.6);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const hospitalIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 28px; height: 28px; border-radius: 50%;
    background: #EF4444; border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; color: white;
  ">🏥</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const selectedIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 36px; height: 36px; border-radius: 50%;
    background: #10B981; border: 3px solid white;
    box-shadow: 0 0 15px rgba(16,185,129,0.5);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; color: white;
  ">🏥</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const HospitalMap: React.FC<MapProps> = ({
  hospitals,
  userLat,
  userLng,
  selectedHospital,
  onHospitalSelect,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const defaultCenter: [number, number] = [23.0225, 72.5714]; // Ahmedabad
    const center: [number, number] =
      userLat && userLng ? [userLat, userLng] : defaultCenter;

    const map = L.map(containerRef.current, {
      center,
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when data changes
  useEffect(() => {
    const map = mapRef.current;
    const markers = markersRef.current;
    if (!map || !markers) return;

    markers.clearLayers();

    // Add user location marker
    if (userLat && userLng) {
      L.marker([userLat, userLng], { icon: userIcon })
        .bindPopup('<strong>📍 Your Location</strong>')
        .addTo(markers);
    }

    // Add hospital markers
    hospitals.forEach((h) => {
      const lat = h.location.coordinates[1];
      const lng = h.location.coordinates[0];
      const isSelected = selectedHospital?.id === h.id;

      const marker = L.marker([lat, lng], {
        icon: isSelected ? selectedIcon : hospitalIcon,
      });

      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, sans-serif;">
          <h3 style="margin: 0 0 4px; font-size: 14px; font-weight: 600;">${h.name}</h3>
          <p style="margin: 0 0 4px; font-size: 12px; color: #6B7280;">${h.address}</p>
          <div style="display: flex; gap: 8px; font-size: 11px; margin-bottom: 4px;">
            <span style="background: #DBEAFE; color: #1D4ED8; padding: 2px 6px; border-radius: 4px;">${h.hospital_type}</span>
            ${h.distance_km ? `<span style="color: #059669;">📏 ${h.distance_km} km</span>` : ''}
          </div>
          <div style="font-size: 11px; color: #374151;">
            ⭐ ${h.rating} · 🛏️ ${h.bed_count} beds · ${h.ambulance ? '🚑 Ambulance' : ''}
          </div>
          <div style="margin-top: 6px;">
            <a href="tel:${h.contact}" style="font-size: 11px; color: #2563EB; text-decoration: none;">📞 ${h.contact}</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => onHospitalSelect(h));
      marker.addTo(markers);
    });

    // Fit bounds to show all markers
    const allPoints: [number, number][] = hospitals.map((h) => [
      h.location.coordinates[1],
      h.location.coordinates[0],
    ]);
    if (userLat && userLng) allPoints.push([userLat, userLng]);

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints.map((p) => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [hospitals, userLat, userLng, selectedHospital, onHospitalSelect]);

  // Pan to selected hospital
  useEffect(() => {
    if (!mapRef.current || !selectedHospital) return;
    const lat = selectedHospital.location.coordinates[1];
    const lng = selectedHospital.location.coordinates[0];
    mapRef.current.setView([lat, lng], 15, { animate: true });
  }, [selectedHospital]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '400px', borderRadius: '12px' }}
    />
  );
};

export default HospitalMap;
