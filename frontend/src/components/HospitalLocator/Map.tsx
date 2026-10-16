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
    width: 22px; height: 22px; border-radius: 50%;
    background: #2563EB; border: 3px solid white;
    box-shadow: 0 0 12px rgba(37,99,235,0.7);
    display: flex; align-items: center; justify-content: center;
  "><div style="width: 6px; height: 6px; border-radius: 50%; background: white;"></div></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const getFacilityIcon = (facilityType: string, selected: boolean) => {
  const glyph = facilityType === 'pharmacy' ? '💊' : facilityType === 'clinic' ? '🩺' : '🏥';
  const background = selected
    ? '#059669'
    : facilityType === 'pharmacy'
    ? '#DB2777'
    : facilityType === 'clinic'
    ? '#0D9488'
    : '#DC2626';
  const size = selected ? 38 : 30;
  const border = selected ? 3 : 2;
  const shadow = selected
    ? '0 0 15px rgba(5,150,105,0.6), 0 3px 8px rgba(0,0,0,0.3)'
    : '0 2px 6px rgba(0,0,0,0.25)';

  return L.divIcon({
    className: '',
    html: `<div style="
      width: ${size}px; height: ${size}px; border-radius: 50%;
      background: ${background}; border: ${border}px solid white;
      box-shadow: ${shadow};
      display: flex; align-items: center; justify-content: center;
      font-size: ${selected ? 19 : 15}px; color: white;
      transition: all 0.2s ease;
      cursor: pointer;
    ">${glyph}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const escapeHtml = (value: string | number | boolean | null | undefined) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] as string);

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
  const markerMapRef = useRef<Record<string, L.Marker>>({});

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const defaultCenter: [number, number] = [23.0225, 72.5714]; // Ahmedabad
    const center: [number, number] =
      userLat !== null && userLng !== null ? [userLat, userLng] : defaultCenter;

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
    markerMapRef.current = {};

    // Add user location marker
    if (userLat !== null && userLng !== null) {
      L.marker([userLat, userLng], { icon: userIcon })
        .bindPopup('<strong style="font-size: 13px;">📍 Your Detected Location</strong>')
        .addTo(markers);
    }

    // Add hospital markers
    hospitals.forEach((h) => {
      const lat = h.location.coordinates[1];
      const lng = h.location.coordinates[0];
      const isSelected = selectedHospital?.id === h.id;

      const marker = L.marker([lat, lng], {
        icon: getFacilityIcon(h.facility_type, isSelected),
        zIndexOffset: isSelected ? 1000 : 0,
      });

      const facilityTypeBadge =
        h.facility_type === 'clinic'
          ? '🩺 Clinic'
          : h.facility_type === 'pharmacy'
          ? '💊 Pharmacy'
          : '🏥 Hospital';

      const servicesPreview = h.services.slice(0, 4).map(
        (s) => `<span style="background: #F3F4F6; color: #374151; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${escapeHtml(s.replace(/_/g, ' '))}</span>`
      ).join(' ');

      const popupContent = `
        <div style="min-width: 220px; max-width: 280px; font-family: system-ui, sans-serif; line-height: 1.4;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="background: #E0E7FF; color: #3730A3; font-weight: 600; font-size: 10px; padding: 2px 6px; border-radius: 4px;">${facilityTypeBadge}</span>
            <span style="font-size: 11px; font-weight: 600; color: #059669;">⭐ ${escapeHtml(h.rating)}</span>
          </div>

          <h3 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #111827;">${escapeHtml(h.name)}</h3>
          <p style="margin: 0 0 6px; font-size: 11px; color: #4B5563;">📍 ${escapeHtml(h.address)}</p>

          <div style="display: flex; flex-wrap: wrap; gap: 4px; font-size: 11px; color: #374151; margin-bottom: 6px;">
            ${h.distance_km !== undefined ? `<span style="background: #D1FAE5; color: #065F46; padding: 1px 6px; border-radius: 4px; font-weight: 600;">📏 ${escapeHtml(h.distance_km)} km</span>` : ''}
            <span style="background: #FEF3C7; color: #92400E; padding: 1px 6px; border-radius: 4px;">⏰ ${escapeHtml(h.operating_hours || '24/7')}</span>
            ${h.bed_count > 0 ? `<span style="background: #F3F4F6; color: #374151; padding: 1px 6px; border-radius: 4px;">🛏️ ${escapeHtml(h.bed_count)} beds</span>` : ''}
            ${h.ambulance ? `<span style="background: #FEE2E2; color: #991B1B; padding: 1px 6px; border-radius: 4px; font-weight: 600;">🚑 Ambulance</span>` : ''}
          </div>

          ${servicesPreview ? `<div style="display: flex; flex-wrap: wrap; gap: 3px; margin-bottom: 8px;">${servicesPreview}</div>` : ''}

          <div style="display: flex; gap: 6px; margin-top: 8px;">
            ${h.contact ? `<a href="tel:${escapeHtml(h.contact)}" style="flex: 1; text-align: center; background: #EFF6FF; color: #1D4ED8; font-weight: 600; font-size: 11px; padding: 5px; border-radius: 6px; text-decoration: none;">📞 Call</a>` : ''}
            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #059669; color: white; font-weight: 600; font-size: 11px; padding: 5px; border-radius: 6px; text-decoration: none;">🧭 Directions</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300 });
      marker.on('click', () => {
        onHospitalSelect(h);
      });
      marker.addTo(markers);
      markerMapRef.current[h.id] = marker;
    });

    // Fit bounds to show all markers
    const allPoints: [number, number][] = hospitals.map((h) => [
      h.location.coordinates[1],
      h.location.coordinates[0],
    ]);
    if (userLat !== null && userLng !== null) allPoints.push([userLat, userLng]);

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints.map((p) => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [hospitals, userLat, userLng, selectedHospital, onHospitalSelect]);

  // Pan to selected hospital and open its popup
  useEffect(() => {
    if (!mapRef.current || !selectedHospital) return;
    const lat = selectedHospital.location.coordinates[1];
    const lng = selectedHospital.location.coordinates[0];
    mapRef.current.setView([lat, lng], 15, { animate: true });

    // Open popup for selected hospital
    const marker = markerMapRef.current[selectedHospital.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedHospital]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '400px', borderRadius: '12px' }}
    />
  );
};

export default HospitalMap;
