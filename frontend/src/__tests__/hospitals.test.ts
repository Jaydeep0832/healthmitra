jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    post: jest.fn(),
    get: jest.fn(),
  })),
  post: jest.fn(),
  get: jest.fn(),
}));

import { locationService } from '../services/location';
import { api } from '../services/api';

describe('Hospital & Healthcare Facility Listing and Filtering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockFacilities = [
    {
      id: 'hosp-1',
      name: 'Civil Hospital Ahmedabad',
      facility_type: 'hospital',
      district: 'Ahmedabad',
      services: ['emergency', 'cardiology', 'icu'],
      rating: 4.5,
      distance_km: 2.1,
    },
    {
      id: 'clinic-1',
      name: 'Urban Health Centre Katargam',
      facility_type: 'clinic',
      district: 'Surat',
      services: ['general_medicine', 'maternity'],
      rating: 4.2,
      distance_km: 15.4,
    },
    {
      id: 'pharm-1',
      name: 'PM Janaushadhi Kendra - Majura Gate',
      facility_type: 'pharmacy',
      district: 'Surat',
      services: ['generic_medicines'],
      rating: 4.6,
      distance_km: 16.0,
    },
  ];

  it('queries nearby healthcare facilities with spatial coordinates and radius', async () => {
    jest.spyOn(api, 'get').mockResolvedValueOnce({
      data: {
        hospitals: mockFacilities,
        total: 3,
        page: 1,
      },
    });

    const result = await locationService.findNearby({
      lat: 23.0225,
      lng: 72.5714,
      radius: 25,
      district: 'Ahmedabad',
    });

    expect(api.get).toHaveBeenCalled();
    const calledUrl = (api.get as jest.Mock).mock.calls[0][0];
    expect(calledUrl).toContain('lat=23.0225');
    expect(calledUrl).toContain('lng=72.5714');
    expect(calledUrl).toContain('radius=25');
    expect(calledUrl).toContain('district=Ahmedabad');
    expect(result.hospitals.length).toBe(3);
  });

  it('supports facility_type filtering for clinics and medical stores', async () => {
    const pharmacyOnly = [mockFacilities[2]];
    jest.spyOn(api, 'get').mockResolvedValueOnce({
      data: {
        hospitals: pharmacyOnly,
        total: 1,
      },
    });

    const result = await locationService.findNearby({
      lat: 21.1702,
      lng: 72.8311,
      facility_type: 'pharmacy',
    });

    const calledUrl = (api.get as jest.Mock).mock.calls[0][0];
    expect(calledUrl).toContain('facility_type=pharmacy');
    expect(result.hospitals[0].facility_type).toBe('pharmacy');
  });

  it('falls back to default Gujarat districts if remote metadata service fails', async () => {
    jest.spyOn(api, 'get').mockRejectedValueOnce(new Error('Network Timeout'));

    const districts = await locationService.getDistricts();

    expect(districts).toContain('Ahmedabad');
    expect(districts).toContain('Surat');
    expect(districts).toContain('Rajkot');
    expect(districts).toContain('Vadodara');
    expect(districts.length).toBeGreaterThanOrEqual(25);
  });
});
