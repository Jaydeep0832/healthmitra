import React from 'react';
import { Hospital } from '../../store/useLocationStore';

interface HospitalListProps {
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  onSelect: (hospital: Hospital) => void;
  loading: boolean;
}

const serviceColors: Record<string, string> = {
  emergency: '#EF4444',
  icu: '#F59E0B',
  cardiology: '#EC4899',
  oncology: '#8B5CF6',
  orthopedics: '#06B6D4',
  neurology: '#6366F1',
  obstetrics: '#F97316',
  pediatrics: '#10B981',
  general_medicine: '#3B82F6',
  surgery: '#14B8A6',
};

const HospitalList: React.FC<HospitalListProps> = ({
  hospitals,
  selectedHospital,
  onSelect,
  loading,
}) => {
  const facilityLabel = (facilityType: string) => {
    if (facilityType === 'clinic') return 'clinic';
    if (facilityType === 'pharmacy') return 'medical store';
    return 'hospital';
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-100 rounded-xl p-4 h-32"
          />
        ))}
      </div>
    );
  }

  if (hospitals.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-5xl mb-4">🏥</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No healthcare facilities found
        </h3>
        <p className="text-sm text-gray-500">
          Try increasing the search radius or changing filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-2 overflow-y-auto" style={{ maxHeight: '600px' }}>
      <p className="text-sm text-gray-500 px-2">
        {hospitals.length} healthcare facilit{hospitals.length !== 1 ? 'ies' : 'y'} found
      </p>

      {hospitals.map((hospital) => {
        const isSelected = selectedHospital?.id === hospital.id;
        return (
          <div
            key={hospital.id}
            onClick={() => onSelect(hospital)}
            className={`
              cursor-pointer rounded-xl p-4 transition-all duration-200
              border-2 hover:shadow-lg
              ${isSelected
                ? 'border-emerald-500 bg-emerald-50 shadow-md'
                : 'border-transparent bg-white hover:border-blue-200'
              }
            `}
            style={{
              boxShadow: isSelected
                ? '0 4px 15px rgba(16, 185, 129, 0.15)'
                : '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                  {hospital.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {hospital.address}
                </p>
              </div>
              {hospital.distance_km !== undefined && (
                <span className="ml-2 flex-shrink-0 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  {hospital.distance_km} km
                </span>
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
              {hospital.rating > 0 && (
                <span className="flex items-center gap-1">
                  ⭐ {hospital.rating}
                </span>
              )}
              {hospital.bed_count > 0 && (
                <span className="flex items-center gap-1">
                  🛏️ {hospital.bed_count}
                </span>
              )}
              {hospital.ambulance && (
                <span className="text-red-500 font-medium">🚑 Ambulance</span>
              )}
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  hospital.facility_type === 'clinic'
                    ? 'bg-emerald-100 text-emerald-700'
                    : hospital.facility_type === 'pharmacy'
                    ? 'bg-pink-100 text-pink-700'
                    : hospital.hospital_type === 'government'
                    ? 'bg-blue-100 text-blue-700'
                    : hospital.hospital_type === 'multispeciality'
                    ? 'bg-purple-100 text-purple-700'
                    : hospital.hospital_type === 'superspeciality'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {facilityLabel(hospital.facility_type)}
              </span>
            </div>

            {/* Services */}
            <div className="flex flex-wrap gap-1">
              {hospital.services.slice(0, 5).map((service) => (
                <span
                  key={service}
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: `${serviceColors[service] || '#6B7280'}15`,
                    color: serviceColors[service] || '#6B7280',
                  }}
                >
                  {service.replace(/_/g, ' ')}
                </span>
              ))}
              {hospital.services.length > 5 && (
                <span className="text-xs text-gray-400">
                  +{hospital.services.length - 5} more
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              {hospital.contact && <a
                href={`tel:${hospital.contact}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 text-center text-xs font-medium py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
              >
                📞 Call
              </a>}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.location.coordinates[1]},${hospital.location.coordinates[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 text-center text-xs font-medium py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
              >
                🧭 Directions
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HospitalList;
