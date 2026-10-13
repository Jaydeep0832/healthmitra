import { api } from './api';
import {
  HealthScheme,
  InsurancePolicy,
  PatientClaim,
  ClaimCreateRequest,
  EligibilityQuery,
  EligibilityMatch
} from '../types/scheme';

export const schemeApi = {
  /**
   * Fetch all schemes with optional filters
   */
  async getSchemes(params?: {
    category?: string;
    state?: string;
    search?: string;
    middle_class_only?: boolean;
  }): Promise<HealthScheme[]> {
    try {
      const response = await api.get<HealthScheme[]>('/api/v1/schemes', { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn('API call failed, returning fallback schemes', error);
      return [];
    }
  },

  /**
   * Fetch scheme by ID
   */
  async getSchemeById(id: string): Promise<HealthScheme | null> {
    try {
      const response = await api.get<HealthScheme>(`/api/v1/schemes/${id}`);
      return response.data && typeof response.data === 'object' ? response.data : null;
    } catch (error) {
      console.warn('API call failed for scheme detail', error);
      return null;
    }
  },

  /**
   * Fetch verified affordable health insurance policies
   */
  async getInsurancePolicies(): Promise<InsurancePolicy[]> {
    try {
      const response = await api.get<InsurancePolicy[]>('/api/v1/schemes/insurance-policies');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn('API call failed for insurance policies', error);
      return [];
    }
  },

  /**
   * Fetch patient claims
   */
  async getClaims(patientName?: string): Promise<PatientClaim[]> {
    try {
      const response = await api.get<PatientClaim[]>('/api/v1/schemes/claims', {
        params: patientName ? { patient_name: patientName } : undefined
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn('API call failed for claims', error);
      return [];
    }
  },

  /**
   * Submit a new claim for tracking
   */
  async submitClaim(payload: ClaimCreateRequest): Promise<PatientClaim> {
    const response = await api.post<PatientClaim>('/api/v1/schemes/claims', payload);
    return response.data;
  },

  /**
   * Check eligibility
   */
  async checkEligibility(query: EligibilityQuery): Promise<EligibilityMatch[]> {
    try {
      const response = await api.post<EligibilityMatch[]>('/api/v1/schemes/check-eligibility', query);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn('API call failed for eligibility check', error);
      return [];
    }
  }
};
