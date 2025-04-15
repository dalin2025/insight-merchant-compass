
import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import TabNavigation from "@/components/TabNavigation";
import EnhancedEligibilityTab from "@/components/EnhancedEligibilityTab";
import ApplicationStatusTab from "@/components/ApplicationStatusTab";
import LiveSpendsTab from "@/components/LiveSpendsTab";
import EarlyWarningTab from "@/components/EarlyWarningTab";
import MerchantSearchBar from "@/components/MerchantSearchBar";
import MerchantDataUpload from "@/components/MerchantDataUpload";
import { evaluateEligibility } from "@/utils/eligibilityUtils";
import { MerchantData } from "@/types/eligibility";
import { loadMerchantData, findMerchant } from "@/utils/databaseUtils";

const Index = () => {
  const [activeTab, setActiveTab] = useState("eligibility");
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [uploadedMerchants, setUploadedMerchants] = useState<MerchantData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load saved merchant data from database on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const merchants = await loadMerchantData();
        setUploadedMerchants(merchants);
        console.log("Loaded merchant data from database:", merchants.length, "merchants");
      } catch (error) {
        console.error("Error loading merchant data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleMerchantSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setMerchantData(null);
      return;
    }
    
    try {
      const foundMerchant = await findMerchant(term);
      setMerchantData(foundMerchant);
    } catch (error) {
      console.error("Error searching for merchant:", error);
      setMerchantData(null);
    }
  };

  const handleMerchantDataSave = (merchants: MerchantData[]) => {
    setUploadedMerchants(merchants);
  };

  const tabs = [
    { id: "eligibility", label: "Eligibility" },
    { id: "application", label: "Application Status" },
    { id: "spends", label: "Live/Spends" },
    { id: "warnings", label: "Early Warning Signals" },
    { id: "upload", label: "Upload Data" },
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
                  {merchantData && (
                    <>
                      <p className="text-sm text-gray-500">MID: {merchantData.mid}</p>
                      <span className="text-gray-300">|</span>
                      <p className="text-sm text-gray-500">{merchantData.name || "Unnamed Merchant"}</p>
                    </>
                  )}
                  {!merchantData && <p className="text-sm text-gray-500">No merchant selected</p>}
                </div>
              </div>
              <div className="w-64">
                <MerchantSearchBar 
                  onSearch={handleMerchantSearch}
                  searchTerm={searchTerm}
                />
              </div>
            </div>
          </div>
          
          <TabNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-pulse">Loading data...</div>
              </div>
            ) : (
              <>
                {activeTab === "eligibility" && (
                  merchantData ? (
                    <EnhancedEligibilityTab eligibilityResult={evaluateEligibility(merchantData)} />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        {searchTerm ? "No merchant found with this MID" : "Please search for a merchant by MID"}
                      </p>
                    </div>
                  )
                )}
                
                {activeTab === "application" && (
                  <ApplicationStatusTab 
                    status={merchantData?.application?.status || "not-started"}
                    bankComments={merchantData?.application?.bankComments || []}
                    hasData={merchantData !== null && merchantData.application !== undefined}
                    merchant={merchantData}
                  />
                )}
                
                {activeTab === "spends" && (
                  <LiveSpendsTab 
                    totalSpend={merchantData?.spends?.totalSpend || "₹0"}
                    spendTrend={merchantData?.spends?.spendTrend || "null"}
                    monthlySpends={merchantData?.spends?.monthlySpends || []}
                    hasData={merchantData !== null && merchantData.spends !== undefined}
                  />
                )}
                
                {activeTab === "warnings" && (
                  <EarlyWarningTab 
                    riskFlag={merchantData?.warnings?.riskFlag || "low"}
                    gmvDrop={merchantData?.warnings?.gmvDrop || 0}
                    spendsDrop={merchantData?.warnings?.spendsDrop || 0}
                    internalTriggers={merchantData?.warnings?.internalTriggers || []}
                    hasData={merchantData !== null && merchantData.warnings !== undefined}
                  />
                )}
                
                {activeTab === "upload" && (
                  <MerchantDataUpload 
                    savedMerchants={uploadedMerchants}
                    onMerchantDataSave={handleMerchantDataSave}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
