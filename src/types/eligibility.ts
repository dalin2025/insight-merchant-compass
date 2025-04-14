
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
  calculatedLimit: string;
  primaryPolicy?: Policy;
  ineligibilityReasons: string[];
}

export interface BusinessCategory {
  id: string;
  name: string;
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
  // Removed isProfitable field
  // Add other merchant data fields as needed
}
