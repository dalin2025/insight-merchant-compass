
import { EligibilityResult, MerchantData, Policy, EligibilityParameter } from "../types/eligibility";

// Blocked categories for PG-YBL policy
const YBL_BLOCKED_CATEGORIES = [
  "amusement_parks_and_circuses", "bill_and_recharge_aggregators", "charity", 
  "ticketing", "construction_materials", "statewallet_top_up", "coupons", 
  "cable", "central", "water", "religious_products", "utilities_electric_gas_oil_water", 
  "electricity", "bus", "country_and_athletic_clubs", "cruise_lines", 
  "digital_gold_purchase", "construction_services", "realestate_classifieds", 
  "train_and_metro", "matchmaking", "tobacco", "commodities"
];

// Allowed business types for PG-YBL policy
const YBL_ALLOWED_BUSINESS_TYPES = [
  "Private Limited", "Public Limited", "LLP", "Partnership", "Proprietorship"
];

// Allowed business types for PG-RBL policy
const RBL_ALLOWED_BUSINESS_TYPES = [
  "Private Limited", "Public Limited", "LLP"
];

/**
 * Evaluate eligibility for PG-YBL Policy
 */
export const evaluateYBLPolicy = (merchant: MerchantData): Policy => {
  const parameters: EligibilityParameter[] = [
    {
      name: "Average Monthly GMV",
      value: merchant.averageMonthlyGMV,
      meets: merchant.averageMonthlyGMV > 100000, // > 1 lakh
      description: "Average Monthly GMV should be greater than ₹1,00,000"
    },
    {
      name: "QoQ Growth",
      value: `${merchant.qoqGrowth}%`,
      meets: merchant.qoqGrowth > -40,
      description: "Quarter-on-Quarter growth should be greater than -40%"
    },
    {
      name: "Business Category",
      value: merchant.businessCategory,
      meets: !YBL_BLOCKED_CATEGORIES.includes(merchant.businessCategory),
      description: "Business category should not be in the blocked list"
    },
    {
      name: "Active Days",
      value: merchant.activeDays,
      meets: merchant.activeDays > 6,
      description: "Active days should be more than 6"
    },
    {
      name: "PG Vintage",
      value: `${merchant.pgVintage} months`,
      meets: merchant.businessType === "Proprietorship" 
        ? merchant.pgVintage >= 12 
        : merchant.pgVintage >= 6,
      description: merchant.businessType === "Proprietorship"
        ? "For Proprietorship, PG vintage should be at least 12 months"
        : "PG vintage should be at least 6 months"
    },
    {
      name: "Business Type",
      value: merchant.businessType,
      meets: YBL_ALLOWED_BUSINESS_TYPES.includes(merchant.businessType),
      description: "Business type should be one of the allowed types for YBL policy"
    }
  ];

  const isEligible = parameters.every(param => param.meets);

  return {
    id: "ybl",
    name: "PG-YBL Policy",
    description: "Yes Bank Limited Corporate Card Policy",
    parameters,
    isEligible
  };
};

/**
 * Evaluate eligibility for PG-RBL Policy
 */
export const evaluateRBLPolicy = (merchant: MerchantData): Policy => {
  const parameters: EligibilityParameter[] = [
    {
      name: "PG Vintage",
      value: `${merchant.pgVintage} months`,
      meets: merchant.pgVintage > 6,
      description: "PG vintage should be greater than 6 months"
    },
    {
      name: "Average Monthly GMV",
      value: merchant.averageMonthlyGMV,
      meets: merchant.averageMonthlyGMV > 2500000, // > 25 lakhs
      description: "Average Monthly GMV should be greater than ₹25,00,000"
    },
    {
      name: "Business Type",
      value: merchant.businessType,
      meets: RBL_ALLOWED_BUSINESS_TYPES.includes(merchant.businessType),
      description: "Business type should be one of the allowed types for RBL policy"
    }
  ];

  const isEligible = parameters.every(param => param.meets);

  return {
    id: "rbl",
    name: "PG-RBL Policy",
    description: "RBL Bank Corporate Card Policy",
    parameters,
    isEligible
  };
};

/**
 * Calculate the limit based on merchant data and policy
 */
export const calculateLimit = (merchant: MerchantData, policy: Policy): string => {
  if (policy.id === "ybl") {
    // YBL limit calculation: 10% of average monthly GMV, max 5 lakhs
    const limit = Math.min(merchant.averageMonthlyGMV * 0.1, 500000);
    return formatCurrency(limit);
  } else if (policy.id === "rbl") {
    // RBL limit calculation: 15% of average monthly GMV, max 10 lakhs
    const limit = Math.min(merchant.averageMonthlyGMV * 0.15, 1000000);
    return formatCurrency(limit);
  }
  return "₹0";
};

/**
 * Format currency in Indian format
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Evaluate merchant eligibility across all policies
 */
export const evaluateEligibility = (merchant: MerchantData): EligibilityResult => {
  // Evaluate all policies
  const policies: Policy[] = [
    evaluateYBLPolicy(merchant),
    evaluateRBLPolicy(merchant)
  ];

  // Filter matching policies (policies merchant is eligible for)
  const matchingPolicies = policies.filter(policy => policy.isEligible);
  
  // Determine overall eligibility
  const isEligible = matchingPolicies.length > 0;
  
  // Identify primary policy (highest limit policy)
  let primaryPolicy: Policy | undefined;
  let highestLimit = 0;
  
  matchingPolicies.forEach(policy => {
    const limitValue = parseFloat(calculateLimit(merchant, policy).replace(/[^\d]/g, ''));
    if (limitValue > highestLimit) {
      highestLimit = limitValue;
      primaryPolicy = policy;
    }
  });
  
  // Calculate limit based on primary policy
  const calculatedLimit = primaryPolicy 
    ? calculateLimit(merchant, primaryPolicy) 
    : "₹0";
  
  // Compile ineligibility reasons
  const ineligibilityReasons = !isEligible ? 
    policies.flatMap(policy => 
      policy.parameters
        .filter(param => !param.meets)
        .map(param => param.description || `${param.name} criteria not met`)
    ) : [];
  
  return {
    isEligible,
    matchingPolicies,
    calculatedLimit,
    primaryPolicy,
    ineligibilityReasons: [...new Set(ineligibilityReasons)] // Remove duplicates
  };
};
