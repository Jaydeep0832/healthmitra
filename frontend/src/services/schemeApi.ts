import { api } from './api';
import {
  HealthScheme,
  InsurancePolicy,
  PatientClaim,
  ClaimCreateRequest,
  EligibilityQuery,
  EligibilityMatch
} from '../types/scheme';
import {
  FALLBACK_SCHEMES,
  FALLBACK_POLICIES,
  FALLBACK_CLAIMS
} from '../data/fallbackSchemes';

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
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (error) {
      console.warn('API call failed, using verified fallback schemes', error);
    }

    let schemes = [...FALLBACK_SCHEMES];
    if (params?.category && params.category !== 'all') {
      schemes = schemes.filter(s => s.categories.includes(params.category as any));
    }
    if (params?.state && params.state !== 'all') {
      schemes = schemes.filter(s => s.state_jurisdiction === 'All India' || s.state_jurisdiction.toLowerCase().includes(params.state!.toLowerCase()));
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      schemes = schemes.filter(s => s.name.toLowerCase().includes(q) || s.short_description.toLowerCase().includes(q));
    }
    if (params?.middle_class_only) {
      schemes = schemes.filter(s => s.middle_class_friendly);
    }
    return schemes;
  },

  /**
   * Fetch scheme by ID
   */
  async getSchemeById(id: string): Promise<HealthScheme | null> {
    try {
      const response = await api.get<HealthScheme>(`/api/v1/schemes/${id}`);
      if (response.data && typeof response.data === 'object') {
        return response.data;
      }
    } catch (error) {
      console.warn('API call failed for scheme detail, using fallback', error);
    }
    return FALLBACK_SCHEMES.find(s => s.id === id) || null;
  },

  /**
   * Fetch verified affordable health insurance policies
   */
  async getInsurancePolicies(): Promise<InsurancePolicy[]> {
    try {
      const response = await api.get<InsurancePolicy[]>('/api/v1/schemes/insurance-policies');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (error) {
      console.warn('API call failed for insurance policies, using fallback', error);
    }
    return FALLBACK_POLICIES;
  },

  /**
   * Fetch patient claims
   */
  async getClaims(patientName?: string): Promise<PatientClaim[]> {
    try {
      const response = await api.get<PatientClaim[]>('/api/v1/schemes/claims', {
        params: patientName ? { patient_name: patientName } : undefined
      });
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (error) {
      console.warn('API call failed for claims, using fallback', error);
    }
    return FALLBACK_CLAIMS;
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
