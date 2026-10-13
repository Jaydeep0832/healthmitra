import { HealthScheme, InsurancePolicy, PatientClaim, SchemeCategory } from '../types/scheme';

const mockSchemes: HealthScheme[] = [
  {
    id: 'pmjay-ayushman',
    name: 'Ayushman Bharat PM-JAY',
    short_description: '₹5 Lakh annual coverage',
    issuing_authority: 'Central Government',
    state_jurisdiction: 'All India',
    categories: ['hospitalization', 'operations_surgery', 'critical_illness'],
    coverage_amount: '₹5,00,000 per family / year',
    coverage_amount_num: 500000,
    income_limit: 'SECC 2011 criteria',
    income_limit_max: 300000,
    eligibility_criteria: ['SECC families'],
    covered_treatments: ['Heart surgery', 'Cancer therapy'],
    required_documents: ['Aadhaar', 'Ration Card'],
    application_link: 'https://beneficiary.nha.gov.in/',
    helpline_number: '14555',
    verification_status: 'Verified',
    last_verified_on: '2026-10-10',
    verified_by: 'NHA',
    middle_class_friendly: true
  },
  {
    id: 'gujarat-maa-yojana',
    name: 'Mukhyamantri Amrutam (MA & MA Vatsalya)',
    short_description: 'Up to ₹10 Lakh for Gujarat families',
    issuing_authority: 'State Government',
    state_jurisdiction: 'Gujarat',
    categories: ['critical_illness', 'operations_surgery'],
    coverage_amount: 'Up to ₹10,00,000',
    coverage_amount_num: 1000000,
    income_limit: 'Up to ₹4,00,000 / year',
    income_limit_max: 400000,
    eligibility_criteria: ['Gujarat resident', 'Income <= 4 Lakh'],
    covered_treatments: ['Renal transplant', 'Cardiology'],
    required_documents: ['Income Certificate', 'Aadhaar'],
    application_link: 'https://magujarat.com/',
    helpline_number: '1800-233-1022',
    verification_status: 'Verified',
    last_verified_on: '2026-10-11',
    verified_by: 'Govt of Gujarat',
    middle_class_friendly: true
  },
  {
    id: 'hmdg-grant',
    name: "Health Minister's Discretionary Grant",
    short_description: 'One-time assistance up to ₹1,25,000',
    issuing_authority: 'Central Government',
    state_jurisdiction: 'All India',
    categories: ['critical_illness'],
    coverage_amount: 'Up to ₹1,25,000',
    coverage_amount_num: 125000,
    income_limit: 'Income <= ₹1,50,000',
    income_limit_max: 150000,
    eligibility_criteria: ['Indigent patients'],
    covered_treatments: ['Heart surgery'],
    required_documents: ['Income Certificate', 'MP Letter'],
    application_link: 'https://main.mohfw.gov.in/',
    helpline_number: '011-23061323',
    verification_status: 'Active',
    last_verified_on: '2026-10-07',
    verified_by: 'MoHFW',
    middle_class_friendly: false
  }
];

describe('Health Schemes Filtering Logic', () => {
  it('filters schemes by operations_surgery category', () => {
    const surgery = mockSchemes.filter((s) =>
      s.categories.includes('operations_surgery')
    );
    expect(surgery.length).toBe(2);
    expect(surgery.map((s) => s.id)).toEqual(['pmjay-ayushman', 'gujarat-maa-yojana']);
  });

  it('filters schemes by middle-class accessibility', () => {
    const middleClass = mockSchemes.filter((s) => s.middle_class_friendly);
    expect(middleClass.length).toBe(2);
    expect(middleClass.every((s) => s.middle_class_friendly)).toBe(true);
  });

  it('filters schemes by state jurisdiction', () => {
    const gujaratOnly = mockSchemes.filter(
      (s) => s.state_jurisdiction === 'Gujarat' || s.state_jurisdiction === 'All India'
    );
    expect(gujaratOnly.length).toBe(3);
  });

  it('verifies all schemes possess verification status and date', () => {
    mockSchemes.forEach((s) => {
      expect(['Active', 'Verified', 'Under Review', 'Expired']).toContain(
        s.verification_status
      );
      expect(s.last_verified_on).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(s.coverage_amount_num).toBeGreaterThan(0);
    });
  });
});

describe('Patient Claims Source and Verification Audit', () => {
  const sampleClaims: PatientClaim[] = [
    {
      id: 'c1',
      claim_reference: 'PMJAY/GJ/8891',
      scheme_or_policy: 'Ayushman Bharat PM-JAY',
      patient_name: 'Ramesh Patel',
      hospital_name: 'Civil Hospital',
      claim_type: 'Government Scheme Direct Pre-Auth',
      amount_claimed: 150000,
      amount_approved: 150000,
      status: 'settled',
      source: 'Official TPA / PM-JAY API (Verified)',
      is_verified: true,
      submitted_date: '2026-09-15',
      last_updated: '2026-09-20',
      next_steps: 'Claim settled'
    },
    {
      id: 'c2',
      claim_reference: 'USER/SUB/9912',
      scheme_or_policy: 'Star Health',
      patient_name: 'Dinesh Shah',
      hospital_name: 'Sterling Hospital',
      claim_type: 'Reimbursement',
      amount_claimed: 45000,
      amount_approved: null,
      status: 'active',
      source: 'User Submitted (Unverified)',
      is_verified: false,
      submitted_date: '2026-10-10',
      last_updated: '2026-10-10',
      next_steps: 'Awaiting TPA desk review'
    }
  ];

  it('differentiates official verified claims from user submitted claims', () => {
    const verified = sampleClaims.filter((c) => c.is_verified);
    const unverified = sampleClaims.filter((c) => !c.is_verified);

    expect(verified.length).toBe(1);
    expect(verified[0].source).toContain('Verified');

    expect(unverified.length).toBe(1);
    expect(unverified[0].source).toContain('Unverified');
    expect(unverified[0].amount_approved).toBeNull();
  });
});
