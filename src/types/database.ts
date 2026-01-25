// Custom type definitions for the database
export type AppRole = 'credit' | 'audit' | 'coo' | 'managing_director';
export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'declined' | 'flagged';
export type LoanProductType = 'short_term' | 'long_term';
export type ApplicationType = 'internal' | 'external';
export type LoanAmountRange = '100k_300k' | '300k_600k' | '600k_1m' | 'above_1m';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  email: string;
  has_bank_account: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  is_active: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
  created_at: string;
}


export interface LoanApplication {
  id: string;
  application_id: string;
  user_id: string;
  created_by_admin: string | null;
  passport_photo_url: string;
  product_type: LoanProductType;
  application_type: ApplicationType;
  full_name: string;
  ministry_department: string;
  employee_id: string;
  payment_slip_url: string;
  bvn: string;
  nin: string;
  nin_document_url: string;
  loan_amount_range: LoanAmountRange;
  specific_amount: number;
  repayment_period_months: number;
  bank_account_number: string;
  bank_name: string; // Now stores account type (savings/current/corporate)
  address: string;
  phone_number: string;
  signature_url: string;
  terms_accepted: boolean;
  status: ApplicationStatus;
  credit_approval: boolean | null;
  credit_approved_by: string | null;
  credit_approved_at: string | null;
  audit_approval: boolean | null;
  audit_approved_by: string | null;
  audit_approved_at: string | null;
  coo_approval: boolean | null;
  coo_approved_by: string | null;
  coo_approved_at: string | null;
  notes: string | null;
  decline_reason?: string | null;
  approved_amount?: number | null;
  current_step: number;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminAction {
  id: string;
  admin_user_id: string;
  action_type: string;
  target_table: string;
  target_id: string;
  previous_status: ApplicationStatus | null;
  new_status: ApplicationStatus | null;
  notes: string | null;
  created_at: string;
}

// Form step data types for multi-step loan form
export interface LoanStep1Data {
  full_name: string;
  phone_number: string;
  address: string;
  ministry_department: string;
  employee_id: string;
  passport_photo_url: string;
  application_type: ApplicationType;
}

export interface LoanStep2Data {
  bvn: string;
  nin: string;
  nin_document_url: string;
  signature_url: string;
  payment_slip_url: string;
}

export interface LoanStep3Data {
  product_type: LoanProductType; // Now used for solar product: short_term = Easy Solar, long_term = Smart Solar
  loan_amount_range: LoanAmountRange;
  specific_amount: number;
  repayment_period_months: number;
  bank_name: string; // Account type: savings/current/corporate
  bank_account_number: string;
}

// Solar Product Configuration
export const SOLAR_PRODUCTS = {
  short_term: {
    name: 'Easy Solar All-in-One 1000 (1kWh)',
    price: 630000,
    description: 'Compact all-in-one solar system for essential home power needs',
  },
  long_term: {
    name: 'Smart Solar 2000 All-in-One (2kWh)',
    price: 1196000,
    description: 'High-capacity all-in-one solar system for full household power needs',
  },
} as const;

export const getSolarProductName = (productType: LoanProductType): string => {
  return SOLAR_PRODUCTS[productType].name;
};

export const getSolarProductPrice = (productType: LoanProductType): number => {
  return SOLAR_PRODUCTS[productType].price;
};


export const LOAN_AMOUNT_LABELS: Record<LoanAmountRange, string> = {
  '100k_300k': '₦100,000 - ₦300,000',
  '300k_600k': '₦300,000 - ₦600,000',
  '600k_1m': '₦600,000 - ₦1,000,000',
  'above_1m': 'Above ₦1,000,000',
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Pending',
  under_review: 'Under Review',
  approved: 'Approved',
  declined: 'Declined',
  flagged: 'Flagged for Review',
};

export const ROLE_LABELS: Record<AppRole, string> = {
  credit: 'Credit Department',
  audit: 'Internal Audit',
  coo: 'Chief Operations Officer',
  managing_director: 'Managing Director',
};
