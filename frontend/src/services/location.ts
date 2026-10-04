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
      `/api/v1/hospitals/search?service=${service}&state=${state}`
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
  async getDistricts() {
    const { data } = await api.get('/api/v1/hospitals/districts');
    return data.districts;
  },

  /**
   * Get all available service types.
   */
  async getServices() {
    const { data } = await api.get('/api/v1/hospitals/services');
    return data.services;
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
