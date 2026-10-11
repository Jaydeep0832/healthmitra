import { create } from 'zustand';

export interface Hospital {
  id: string;
  name: string;
  facility_type: 'hospital' | 'clinic' | 'pharmacy' | string;
  hospital_type: string;
  address: string;
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  contact: string;
  services: string[];
  bed_count: number;
  ambulance: boolean;
  operating_hours: string;
  state: string;
  district: string;
  rating: number;
  distance_km?: number;
}

interface LocationState {
  // User location
  userLat: number | null;
  userLng: number | null;
  locationError: string | null;
  locationLoading: boolean;

  // Hospital data
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  totalHospitals: number;
  loading: boolean;
  error: string | null;

  // Filters
  searchRadius: number;
  serviceFilter: string | null;
  districtFilter: string | null;
  typeFilter: string | null;
  facilityFilter: string | null;
  sortBy: string;

  // Metadata
  districts: string[];
  services: string[];

  // Actions
  setUserLocation: (lat: number, lng: number) => void;
  setLocationError: (error: string) => void;
  setLocationLoading: (loading: boolean) => void;
  setHospitals: (hospitals: Hospital[], total: number) => void;
  setSelectedHospital: (hospital: Hospital | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchRadius: (radius: number) => void;
  setServiceFilter: (service: string | null) => void;
  setDistrictFilter: (district: string | null) => void;
  setTypeFilter: (type: string | null) => void;
  setFacilityFilter: (type: string | null) => void;
  setSortBy: (sortBy: string) => void;
  setDistricts: (districts: string[]) => void;
  setServices: (services: string[]) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  userLat: null,
  userLng: null,
  locationError: null,
  locationLoading: false,

  hospitals: [],
  selectedHospital: null,
  totalHospitals: 0,
  loading: false,
  error: null,

  searchRadius: 25,
  serviceFilter: null,
  districtFilter: null,
  typeFilter: null,
  facilityFilter: null,
  sortBy: 'distance',

  districts: [],
  services: [],

  setUserLocation: (lat, lng) =>
    set({ userLat: lat, userLng: lng, locationError: null, locationLoading: false }),
  setLocationError: (error) =>
    set({ locationError: error, locationLoading: false }),
  setLocationLoading: (loading) =>
    set({ locationLoading: loading }),
  setHospitals: (hospitals, total) =>
    set({ hospitals, totalHospitals: total, loading: false, error: null }),
  setSelectedHospital: (hospital) =>
    set({ selectedHospital: hospital }),
  setLoading: (loading) =>
    set({ loading }),
  setError: (error) =>
    set({ error, loading: false }),
  setSearchRadius: (radius) =>
    set({ searchRadius: radius }),
  setServiceFilter: (service) =>
    set({ serviceFilter: service }),
  setDistrictFilter: (district) =>
    set({ districtFilter: district }),
  setTypeFilter: (type) =>
    set({ typeFilter: type }),
  setFacilityFilter: (type) =>
    set({ facilityFilter: type }),
  setSortBy: (sortBy) =>
    set({ sortBy }),
  setDistricts: (districts) =>
    set({ districts }),
  setServices: (services) =>
    set({ services }),
}));
