import React from 'react';

interface FilterPanelProps {
  searchRadius: number;
  serviceFilter: string | null;
  districtFilter: string | null;
  typeFilter: string | null;
  sortBy: string;
  districts: string[];
  services: string[];
  onRadiusChange: (radius: number) => void;
  onServiceChange: (service: string | null) => void;
  onDistrictChange: (district: string | null) => void;
  onTypeChange: (type: string | null) => void;
  onSortChange: (sort: string) => void;
  onSearch: () => void;
}

const hospitalTypes = [
  { value: '', label: 'All Types' },
  { value: 'government', label: '🏛️ Government' },
  { value: 'multispeciality', label: '🏥 Multi-Speciality' },
  { value: 'superspeciality', label: '⭐ Super-Speciality' },
  { value: 'speciality', label: '🔬 Speciality' },
  { value: 'private', label: '🏢 Private' },
];

const sortOptions = [
  { value: 'distance', label: '📏 Distance' },
  { value: 'rating', label: '⭐ Rating' },
  { value: 'bed_count', label: '🛏️ Beds' },
];

const radiusOptions = [5, 10, 25, 50, 100];

const FilterPanel: React.FC<FilterPanelProps> = ({
  searchRadius,
  serviceFilter,
  districtFilter,
  typeFilter,
  sortBy,
  districts,
  services,
  onRadiusChange,
  onServiceChange,
  onDistrictChange,
  onTypeChange,
  onSortChange,
  onSearch,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm">🔍 Search Filters</h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Search Radius */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Radius (km)
          </label>
          <div className="flex gap-1 flex-wrap">
            {radiusOptions.map((r) => (
              <button
                key={r}
                onClick={() => { onRadiusChange(r); onSearch(); }}
                className={`px-2 py-1 text-xs rounded-lg font-medium transition ${
                  searchRadius === r
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Sort By
          </label>
          <div className="flex gap-1 flex-wrap">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onSortChange(opt.value); onSearch(); }}
                className={`px-2 py-1 text-xs rounded-lg font-medium transition ${
                  sortBy === opt.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Service Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Service
          </label>
          <select
            value={serviceFilter || ''}
            onChange={(e) => {
              onServiceChange(e.target.value || null);
              onSearch();
            }}
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
          >
            <option value="">All Services</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* District Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            District
          </label>
          <select
            value={districtFilter || ''}
            onChange={(e) => {
              onDistrictChange(e.target.value || null);
              onSearch();
            }}
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Type
          </label>
          <select
            value={typeFilter || ''}
            onChange={(e) => {
              onTypeChange(e.target.value || null);
              onSearch();
            }}
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
          >
            {hospitalTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
