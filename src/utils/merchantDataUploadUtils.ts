
import { BusinessCategory, MerchantData } from "@/types/eligibility";

export const CSV_TEMPLATE_HEADERS = [
  "mid",
  "name",
  "businessCategory",
  "pgVintage",
  "businessType",
  "averageMonthlyGMV",
  "qoqGrowth",
  "activeDays"
];

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  { id: "technology_services", name: "Technology Services" },
  { id: "retail", name: "Retail" },
  { id: "healthcare", name: "Healthcare" },
  { id: "education", name: "Education" },
  { id: "financial_services", name: "Financial Services" }
];

export const BUSINESS_TYPES = [
  "Private Limited",
  "Public Limited",
  "LLP",
  "Partnership",
  "Proprietorship"
];

export const generateCSVTemplate = (): string => {
  const headers = CSV_TEMPLATE_HEADERS.join(",");
  const sampleData = [
    "RZPM10098765",
    "Tech Solutions Pvt. Ltd.",
    "technology_services",
    "12",
    "Private Limited",
    "3000000",
    "5",
    "180"
  ].join(",");
  
  return `${headers}\n${sampleData}`;
};

export const getPolicyRules = () => ({
  YBLPolicy: {
    averageMonthlyGMV: { min: 100000 },
    qoqGrowth: { min: -40 },
    activeDays: { min: 6 },
    pgVintage: {
      proprietorship: { min: 12 },
      others: { min: 6 }
    }
  },
  RBLPolicy: {
    averageMonthlyGMV: { min: 2500000 },
    pgVintage: { min: 6 }
  }
});

export const downloadCSVTemplate = () => {
  const csvContent = generateCSVTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "merchant_data_template.csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
