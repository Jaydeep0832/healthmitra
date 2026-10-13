export type SchemeVerificationStatus = 'Active' | 'Verified' | 'Under Review' | 'Expired';

export type SchemeCategory =
  | 'all'
  | 'operations_surgery'
  | 'opd'
  | 'hospitalization'
  | 'critical_illness'
  | 'medicines_diagnostics'
  | 'maternity_child'
  | 'chronic_diseases';

export type IssuingAuthority = 'Central Government' | 'State Government' | 'Central & State Joint';

export interface HealthScheme {
  id: string;
  name: string;
  name_localized?: Record<string, string>;
  short_description: string;
  description_localized?: Record<string, string>;
  issuing_authority: IssuingAuthority;
  state_jurisdiction: string;
  categories: SchemeCategory[];
  coverage_amount: string;
  coverage_amount_num: number;
  income_limit: string;
  income_limit_max?: number | null;
  eligibility_criteria: string[];
  covered_treatments: string[];
  required_documents: string[];
  application_link: string;
  helpline_number: string;
  verification_status: SchemeVerificationStatus;
  last_verified_on: string;
  verified_by: string;
  middle_class_friendly: boolean;
}

export interface InsurancePolicy {
  id: string;
  policy_name: string;
  provider: string;
  category: string;
  premium_range: string;
  sum_insured_range: string;
  key_coverage: string[];
  waiting_periods: string;
  claim_settlement_ratio: string;
  entry_age: string;
  official_link: string;
  verification_status: SchemeVerificationStatus;
  last_verified_on: string;
  irdai_registration: string;
}

export type ClaimStatus = 'active' | 'verified' | 'settled' | 'rejected';
export type ClaimType =
  | 'Cashless Hospitalization'
  | 'Reimbursement'
  | 'Government Scheme Direct Pre-Auth';

export interface PatientClaim {
  id: string;
  claim_reference: string;
  scheme_or_policy: string;
  patient_name: string;
  hospital_name: string;
  claim_type: ClaimType;
  amount_claimed: number;
  amount_approved?: number | null;
  status: ClaimStatus;
  source: string;
  is_verified: boolean;
  submitted_date: string;
  last_updated: string;
  next_steps: string;
  notes?: string;
}

export interface ClaimCreateRequest {
  scheme_or_policy: string;
  patient_name: string;
  hospital_name: string;
  claim_type: ClaimType;
  amount_claimed: number;
  claim_reference?: string;
  notes?: string;
}

export interface EligibilityQuery {
  state: string;
  annual_income: number;
  age: number;
  illness_type?: string;
  category?: string;
  family_members?: number;
}

export interface EligibilityMatch {
  scheme: HealthScheme;
  match_score: number;
  is_eligible: boolean;
  matching_reasons: string[];
  warning_notes?: string[];
}
