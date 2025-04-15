
export interface EligibilityParameter {
  name: string;
  value: any;
  meets: boolean;
  description?: string;
}

export interface Policy {
  id: string;
  name: string;
  description?: string;
  parameters: EligibilityParameter[];
  isEligible: boolean;
}

export interface EligibilityResult {
  isEligible: boolean;
  matchingPolicies: Policy[];
  allPolicies: Policy[]; // Added all policies for easy access by ID
  calculatedLimit: string;
  primaryPolicy?: Policy;
  ineligibilityReasons: string[];
}

export interface BusinessCategory {
  id: string;
  name: string;
}

export interface ApplicationStatus {
  status: "not-started" | "in-progress" | "approved" | "rejected";
  bankComments: string[];
  submittedDate?: string;
  underReviewDate?: string;
  bankDecisionDate?: string;
}

export interface SpendData {
  totalSpend: string;
  spendTrend: "increasing" | "decreasing" | "stable" | "null";
  monthlySpends: Array<{ month: string; amount: number }>;
}

export interface WarningSignals {
  amgmv: number;
  amgmvAtIssuance: number;
  averageAmgmv: number;
  spendsDrop: number;
  internalTriggers: Array<{
    name: string;
    severity: "high" | "medium" | "low";
    details: string;
  }>;
}

export interface MerchantData {
  mid: string;
  name: string;
  businessCategory: string;
  pgVintage: number; // in months
  businessType: "Private Limited" | "Public Limited" | "LLP" | "Partnership" | "Proprietorship";
  averageMonthlyGMV: number; // in rupees
  qoqGrowth: number; // in percentage
  activeDays: number;
  
  // Optional fields for application status, spends, and warnings
  application?: ApplicationStatus;
  spends?: SpendData;
  warnings?: WarningSignals;
}
