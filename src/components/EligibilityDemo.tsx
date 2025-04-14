
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MerchantData } from "@/types/eligibility";
import { evaluateEligibility } from "@/utils/eligibilityUtils";
import EnhancedEligibilityTab from "./EnhancedEligibilityTab";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

// Default merchant data for demonstration
const defaultMerchantData: MerchantData = {
  mid: "RZPM10098765",
  name: "Tech Solutions Pvt. Ltd.",
  businessCategory: "technology_services",
  pgVintage: 12,
  businessType: "Private Limited",
  averageMonthlyGMV: 3000000, // 30 lakhs
  qoqGrowth: 5,
  activeDays: 180
};

const EligibilityDemo = () => {
  const [merchantData, setMerchantData] = useState<MerchantData>(defaultMerchantData);
  const eligibilityResult = evaluateEligibility(merchantData);
  
  const form = useForm<MerchantData>({
    defaultValues: merchantData
  });

  const updateMerchantData = (field: keyof MerchantData, value: any) => {
    setMerchantData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const businessTypes = [
    "Private Limited",
    "Public Limited",
    "LLP",
    "Partnership",
    "Proprietorship"
  ];
  
  const businessCategories = [
    "technology_services",
    "retail",
    "healthcare",
    "education",
    "financial_services",
    "amusement_parks_and_circuses",
    "bill_and_recharge_aggregators",
    "charity",
    "ticketing"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Merchant Data</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Average Monthly GMV</label>
                <Input 
                  type="number" 
                  value={merchantData.averageMonthlyGMV}
                  onChange={(e) => updateMerchantData('averageMonthlyGMV', Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Current: ₹{merchantData.averageMonthlyGMV.toLocaleString()}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">QoQ Growth (%)</label>
                <Input 
                  type="number" 
                  value={merchantData.qoqGrowth}
                  onChange={(e) => updateMerchantData('qoqGrowth', Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Current: {merchantData.qoqGrowth}%</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">PG Vintage (months)</label>
                <Input 
                  type="number" 
                  value={merchantData.pgVintage}
                  onChange={(e) => updateMerchantData('pgVintage', Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Current: {merchantData.pgVintage} months</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Active Days</label>
                <Input 
                  type="number" 
                  value={merchantData.activeDays}
                  onChange={(e) => updateMerchantData('activeDays', Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Current: {merchantData.activeDays} days</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Type</label>
                <select 
                  value={merchantData.businessType}
                  onChange={(e) => updateMerchantData('businessType', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Category</label>
                <select 
                  value={merchantData.businessCategory}
                  onChange={(e) => updateMerchantData('businessCategory', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {businessCategories.map((category) => (
                    <option key={category} value={category}>{category.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div>
        <EnhancedEligibilityTab eligibilityResult={eligibilityResult} />
      </div>
    </div>
  );
};

export default EligibilityDemo;
