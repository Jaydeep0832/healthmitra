import React from 'react';
import { Hospital } from '../../store/useLocationStore';

interface HospitalListProps {
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  onSelect: (hospital: Hospital) => void;
  loading: boolean;
  onRadiusExpand?: (radius: number) => void;
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
  ophthalmology: '#2563EB',
  dental: '#0D9488',
  ayurvedic: '#16A34A',
  veterinary: '#D97706',
  pharmacy: '#DB2777',
  dermatology: '#E11D48',
};

const HospitalList: React.FC<HospitalListProps> = ({
  hospitals,
  selectedHospital,
  onSelect,
  loading,
  onRadiusExpand,
}) => {
  const facilityLabel = (facilityType: string) => {
    if (facilityType === 'clinic') return 'Clinic';
    if (facilityType === 'pharmacy') return 'Medical Store';
    return 'Hospital';
  };

  const facilityEmoji = (facilityType: string) => {
    if (facilityType === 'clinic') return '🩺';
    if (facilityType === 'pharmacy') return '💊';
    return '🏥';
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
      <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-gray-200">
        <div className="text-5xl mb-3">🏥</div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          No healthcare facilities found within current radius
        </h3>
        <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
          We couldn't find any clinic, hospital, or pharmacy in this immediate radius. Broaden your search to view facilities across Gujarat.
        </p>
        {onRadiusExpand && (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => onRadiusExpand(50)}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 transition"
            >
              🔍 Expand to 50 km
            </button>
            <button
              onClick={() => onRadiusExpand(100)}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition"
            >
              🗺️ Expand to 100 km
            </button>
            <button
              onClick={() => onRadiusExpand(500)}
              className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-lg hover:bg-purple-100 transition"
            >
              📍 Search All Gujarat (500 km)
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-2 overflow-y-auto" style={{ maxHeight: '600px' }}>
      <div className="flex items-center justify-between px-2">
        <p className="text-xs font-semibold text-gray-600">
          {hospitals.length} healthcare facilit{hospitals.length !== 1 ? 'ies' : 'y'} available
        </p>
        <span className="text-[11px] text-gray-400">
          Click any card to inspect full specs
        </span>
      </div>

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
                ? 'border-emerald-500 bg-emerald-50/70 shadow-md ring-2 ring-emerald-200'
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
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{facilityEmoji(hospital.facility_type)}</span>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                    {hospital.name}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  📍 {hospital.address}
                </p>
              </div>
              {hospital.distance_km !== undefined && (
                <span className="flex-shrink-0 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg">
                  {hospital.distance_km} km
                </span>
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-2 text-xs text-gray-600 mb-2 mt-2">
              {hospital.rating > 0 && (
                <span className="flex items-center gap-0.5 font-medium text-amber-600">
                  ⭐ {hospital.rating}
                </span>
              )}
              {hospital.bed_count > 0 && (
                <span className="flex items-center gap-1 text-gray-700">
                  🛏️ {hospital.bed_count} beds
                </span>
              )}
              {hospital.ambulance ? (
                <span className="text-red-600 font-semibold text-xs flex items-center gap-0.5">
                  🚑 24/7 Ambulance
                </span>
              ) : null}
              <span
                className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
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
                {facilityLabel(hospital.facility_type)} · {hospital.hospital_type}
              </span>
            </div>

            {/* Services badges preview */}
            {!isSelected && (
              <div className="flex flex-wrap gap-1 mt-2">
                {hospital.services.slice(0, 4).map((service) => (
                  <span
                    key={service}
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `${serviceColors[service] || '#6B7280'}15`,
                      color: serviceColors[service] || '#6B7280',
                    }}
                  >
                    {service.replace(/_/g, ' ')}
                  </span>
                ))}
                {hospital.services.length > 4 && (
                  <span className="text-[11px] text-gray-400 font-medium self-center">
                    +{hospital.services.length - 4} more
                  </span>
                )}
              </div>
            )}

            {/* Expanded Detailed Specifications when selected */}
            {isSelected && (
              <div className="mt-3 pt-3 border-t border-emerald-200 bg-white/80 -mx-4 -mb-4 p-4 rounded-b-xl text-xs space-y-2.5">
                <div className="font-bold text-emerald-900 text-xs flex items-center justify-between">
                  <span>📋 Facility Specifications & Details</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-medium">
                    Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Category & Type</span>
                    <span className="font-semibold text-gray-800 capitalize">
                      {facilityLabel(hospital.facility_type)} ({hospital.hospital_type})
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Hours & Schedule</span>
                    <span className="font-semibold text-gray-800">
                      ⏰ {hospital.operating_hours || '24/7'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Inpatient Bed Capacity</span>
                    <span className="font-semibold text-gray-800">
                      🛏️ {hospital.bed_count > 0 ? `${hospital.bed_count} Inpatient Beds` : 'Outpatient / Daycare'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Emergency Ambulance</span>
                    <span className={`font-semibold ${hospital.ambulance ? 'text-red-600' : 'text-gray-600'}`}>
                      {hospital.ambulance ? '🚑 24/7 Rapid Response' : 'No in-house fleet'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-gray-100 col-span-2">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Phone Helpline & Location</span>
                    <span className="font-semibold text-gray-800 block">📞 {hospital.contact || 'Direct contact on arrival'}</span>
                    <span className="text-gray-600 text-[11px] block mt-0.5">📍 {hospital.address}, {hospital.district}, {hospital.state}</span>
                  </div>
                </div>

                {/* All Medical Services */}
                <div className="pt-1">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider mb-1.5">
                    Medical Specialties & Services ({hospital.services.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {hospital.services.map((service) => (
                      <span
                        key={service}
                        className="text-[11px] px-2 py-0.5 rounded-md font-medium border"
                        style={{
                          backgroundColor: `${serviceColors[service] || '#3B82F6'}15`,
                          color: serviceColors[service] || '#1E40AF',
                          borderColor: `${serviceColors[service] || '#3B82F6'}30`,
                        }}
                      >
                        ✓ {service.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-3 pt-1">
              {hospital.contact && (
                <a
                  href={`tel:${hospital.contact}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 text-center text-xs font-semibold py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition shadow-sm"
                >
                  📞 Call {hospital.contact}
                </a>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.location.coordinates[1]},${hospital.location.coordinates[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 text-center text-xs font-semibold py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
              >
                🧭 GPS Directions
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HospitalList;
