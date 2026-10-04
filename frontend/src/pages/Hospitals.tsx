import React, { useEffect, useCallback } from 'react';
import { useLocationStore } from '../store/useLocationStore';
import { locationService } from '../services/location';
import HospitalMap from '../components/HospitalLocator/Map';
import HospitalList from '../components/HospitalLocator/HospitalList';
import FilterPanel from '../components/HospitalLocator/FilterPanel';

const HospitalsPage: React.FC = () => {
  const {
    userLat,
    userLng,
    locationError,
    locationLoading,
    hospitals,
    selectedHospital,
    loading,
    error,
    searchRadius,
    serviceFilter,
    districtFilter,
    typeFilter,
    sortBy,
    districts,
    services,
    setUserLocation,
    setLocationError,
    setLocationLoading,
    setHospitals,
    setSelectedHospital,
    setLoading,
    setError,
    setSearchRadius,
    setServiceFilter,
    setDistrictFilter,
    setTypeFilter,
    setSortBy,
    setDistricts,
    setServices,
  } = useLocationStore();

  // Request user location
  useEffect(() => {
    if (userLat && userLng) return; // Already have location

    setLocationLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          // Default to Ahmedabad
          setUserLocation(23.0225, 72.5714);
          setLocationError(
            'Location access denied. Showing Ahmedabad hospitals.'
          );
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserLocation(23.0225, 72.5714);
      setLocationError('Geolocation not supported. Showing Ahmedabad hospitals.');
    }
  }, [userLat, userLng, setUserLocation, setLocationError, setLocationLoading]);

  // Load filter metadata
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [districtList, serviceList] = await Promise.all([
          locationService.getDistricts(),
          locationService.getServices(),
        ]);
        setDistricts(districtList);
        setServices(serviceList);
      } catch (err) {
        console.warn('Failed to load filter metadata:', err);
      }
    };
    loadMeta();
  }, [setDistricts, setServices]);

  // Search hospitals when location or filters change
  const searchHospitals = useCallback(async () => {
    if (!userLat || !userLng) return;

    setLoading(true);
    setError(null);

    try {
      const result = await locationService.findNearby({
        lat: userLat,
        lng: userLng,
        radius: searchRadius,
        service: serviceFilter || undefined,
        district: districtFilter || undefined,
        type: typeFilter || undefined,
        sort_by: sortBy,
        limit: 50,
      });
      setHospitals(result.hospitals, result.total);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load hospitals');
      setHospitals([], 0);
    }
  }, [
    userLat, userLng, searchRadius, serviceFilter,
    districtFilter, typeFilter, sortBy,
    setLoading, setError, setHospitals,
  ]);

  useEffect(() => {
    searchHospitals();
  }, [searchHospitals]);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-6 py-6">
        <h1 className="text-2xl font-bold">🏥 Hospital Locator</h1>
        <p className="text-sm text-blue-100 mt-1">
          Find nearby hospitals in Gujarat • Real-time geospatial search
        </p>
        {locationError && (
          <div className="mt-2 bg-yellow-400/20 text-yellow-100 text-xs px-3 py-1.5 rounded-lg inline-block">
            ⚠️ {locationError}
          </div>
        )}
        {locationLoading && (
          <div className="mt-2 text-xs text-blue-200 animate-pulse">
            📡 Detecting your location...
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <div className="max-w-7xl mx-auto px-4 -mt-4 relative z-10">
        <FilterPanel
          searchRadius={searchRadius}
          serviceFilter={serviceFilter}
          districtFilter={districtFilter}
          typeFilter={typeFilter}
          sortBy={sortBy}
          districts={districts}
          services={services}
          onRadiusChange={setSearchRadius}
          onServiceChange={setServiceFilter}
          onDistrictChange={setDistrictFilter}
          onTypeChange={setTypeFilter}
          onSortChange={setSortBy}
          onSearch={searchHospitals}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            ❌ {error}
            <button
              onClick={searchHospitals}
              className="ml-3 underline font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Content: Map + List */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Map */}
          <div className="lg:col-span-3">
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              style={{ height: '550px' }}
            >
              <HospitalMap
                hospitals={hospitals}
                userLat={userLat}
                userLng={userLng}
                selectedHospital={selectedHospital}
                onHospitalSelect={setSelectedHospital}
              />
            </div>
          </div>

          {/* Hospital List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              style={{ height: '550px', overflowY: 'auto' }}>
              <HospitalList
                hospitals={hospitals}
                selectedHospital={selectedHospital}
                onSelect={setSelectedHospital}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 text-xs text-gray-500">
          <span>
            Showing {hospitals.length} hospitals
            {userLat && userLng && ` within ${searchRadius}km`}
          </span>
          <span>
            {selectedHospital
              ? `Selected: ${selectedHospital.name}`
              : 'Click a hospital to see details'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HospitalsPage;
