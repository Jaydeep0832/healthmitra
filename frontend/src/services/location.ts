import { api } from './api';

/**
 * Hospital & location API service layer.
 */

export interface NearbyParams {
  lat: number;
  lng: number;
  radius?: number;
  service?: string;
  district?: string;
  type?: string;
  facility_type?: string;
  include_external?: boolean;
  sort_by?: string;
  limit?: number;
  page?: number;
}

export const locationService = {
  /**
   * Find hospitals near the given coordinates.
   */
  async findNearby(params: NearbyParams) {
    const queryParams: Record<string, string> = {
      lat: params.lat.toString(),
      lng: params.lng.toString(),
    };
    if (params.radius) queryParams.radius = params.radius.toString();
    if (params.service) queryParams.service = params.service;
    if (params.district) queryParams.district = params.district;
    if (params.type) queryParams.type = params.type;
    if (params.facility_type) queryParams.facility_type = params.facility_type;
    if (params.include_external !== undefined) {
      queryParams.include_external = params.include_external.toString();
    }
    if (params.sort_by) queryParams.sort_by = params.sort_by;
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.page) queryParams.page = params.page.toString();

    const query = new URLSearchParams(queryParams).toString();
    const { data } = await api.get(`/api/v1/hospitals/nearby?${query}`);
    return data;
  },

  /**
   * Search hospitals by service type.
   */
  async searchByService(service: string, state: string = 'Gujarat') {
    const { data } = await api.get(
      `/api/v1/hospitals/search?service=${encodeURIComponent(service)}&state=${encodeURIComponent(state)}`
    );
    return data;
  },

  /**
   * Get hospital details by ID.
   */
  async getHospital(hospitalId: string) {
    const { data } = await api.get(`/api/v1/hospitals/${hospitalId}`);
    return data;
  },

  /**
   * Get all available districts.
   */
  async getDistricts(): Promise<string[]> {
    try {
      const { data } = await api.get('/api/v1/hospitals/districts');
      if (Array.isArray(data?.districts) && data.districts.length > 0) {
        return data.districts;
      }
    } catch (err) {
      console.warn('Using default districts fallback:', err);
    }
    return [
      "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad",
      "Dahod", "Devbhumi_Dwarka", "Gandhinagar", "Gir_Somnath", "Jamnagar", "Junagadh", "Kutch",
      "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot",
      "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"
    ];
  },

  /**
   * Get all available service types.
   */
  async getServices(): Promise<string[]> {
    try {
      const { data } = await api.get('/api/v1/hospitals/services');
      if (Array.isArray(data?.services) && data.services.length > 0) {
        return data.services;
      }
    } catch (err) {
      console.warn('Using default services fallback:', err);
    }
    return [
      "cardiac_surgery", "cardiology", "chemotherapy", "emergency", "gastroenterology",
      "general_medicine", "gynecology", "icu", "ivf", "joint_replacement", "neurology",
      "obstetrics", "oncology", "orthopedics", "pediatrics", "radiation_therapy",
      "spine_surgery", "surgery"
    ];
  },

  async getFacilityTypes(): Promise<string[]> {
    try {
      const { data } = await api.get('/api/v1/hospitals/facility-types');
      if (Array.isArray(data?.facility_types) && data.facility_types.length > 0) {
        return data.facility_types;
      }
    } catch (err) {
      console.warn('Using default facility types fallback:', err);
    }
    return ["hospital", "clinic", "pharmacy", "diagnostic_center"];
  },

  /**
   * Get hospital database statistics.
   */
  async getStats() {
    const { data } = await api.get('/api/v1/hospitals/stats');
    return data;
  },

  /**
   * Trigger hospital data seeding (admin).
   */
  async seedHospitals() {
    const { data } = await api.post('/api/v1/hospitals/seed');
    return data;
  },
};
