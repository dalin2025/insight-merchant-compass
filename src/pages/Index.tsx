
import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import TabNavigation from "@/components/TabNavigation";
import EnhancedEligibilityTab from "@/components/EnhancedEligibilityTab";
import EligibilityDemo from "@/components/EligibilityDemo";
import ApplicationStatusTab from "@/components/ApplicationStatusTab";
import LiveSpendsTab from "@/components/LiveSpendsTab";
import EarlyWarningTab from "@/components/EarlyWarningTab";
import MerchantSearchBar from "@/components/MerchantSearchBar";
import { evaluateEligibility } from "@/utils/eligibilityUtils";

// Mock data - in real app this would come from API
const merchantData = {
  mid: "RZPM10098765",
  name: "Tech Solutions Pvt. Ltd.",
  businessCategory: "technology_services",
  pgVintage: 12,
  businessType: "Private Limited" as const,
  averageMonthlyGMV: 3000000, // 30 lakhs
  qoqGrowth: 5,
  activeDays: 180,
  application: {
    status: "in-progress" as const,
    bankComments: ["KYC documents verified successfully.", "Business profile meets bank requirements."],
  },
  spends: {
    totalSpend: "₹1,75,000",
    spendTrend: "increasing" as const,
    monthlySpends: [
      { month: "Jan", amount: 45000 },
      { month: "Feb", amount: 52000 },
      { month: "Mar", amount: 78000 },
    ],
  },
  warnings: {
    riskFlag: "medium" as const,
    gmvDrop: 15,
    spendsDrop: 8,
    internalTriggers: [
      {
        name: "Delayed Payment",
        severity: "high" as const,
        details: "2 payments delayed by more than 5 days in the last month",
      },
      {
        name: "Ticket Escalation",
        severity: "low" as const,
        details: "1 support ticket escalated in the last 3 months",
      },
    ],
  },
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("eligibility");
  const eligibilityResult = evaluateEligibility(merchantData);

  const tabs = [
    { id: "eligibility", label: "Eligibility" },
    { id: "application", label: "Application Status" },
    { id: "spends", label: "Live/Spends" },
    { id: "warnings", label: "Early Warning Signals" },
    { id: "demo", label: "Eligibility Demo" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-razorpay-lightgray">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-razorpay-dark">Merchant Dashboard</h2>
                <div className="flex items-center mt-1 space-x-2">
                  <p className="text-sm text-gray-500">MID: {merchantData.mid}</p>
                  <span className="text-gray-300">|</span>
                  <p className="text-sm text-gray-500">{merchantData.name}</p>
                </div>
              </div>
              <div className="w-64">
                <MerchantSearchBar />
              </div>
            </div>
          </div>
          
          <TabNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          
          <div className="p-6">
            {activeTab === "eligibility" && (
              <EnhancedEligibilityTab eligibilityResult={eligibilityResult} />
            )}
            
            {activeTab === "application" && (
              <ApplicationStatusTab 
                status={merchantData.application.status}
                bankComments={merchantData.application.bankComments}
              />
            )}
            
            {activeTab === "spends" && (
              <LiveSpendsTab 
                totalSpend={merchantData.spends.totalSpend}
                spendTrend={merchantData.spends.spendTrend}
                monthlySpends={merchantData.spends.monthlySpends}
              />
            )}
            
            {activeTab === "warnings" && (
              <EarlyWarningTab 
                riskFlag={merchantData.warnings.riskFlag}
                gmvDrop={merchantData.warnings.gmvDrop}
                spendsDrop={merchantData.warnings.spendsDrop}
                internalTriggers={merchantData.warnings.internalTriggers}
              />
            )}
            
            {activeTab === "demo" && (
              <EligibilityDemo />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
