import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { IndianRupee } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Building2 } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("eligibility");
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [uploadedMerchants, setUploadedMerchants] = useState<MerchantData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFinancials, setShowFinancials] = useState(false);

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

  const financialMetrics = {
    totalRevenue: "₹1,25,00,000",
    grossProfitMargin: "32%",
    operatingExpenses: "₹85,00,000",
    netIncome: "₹28,00,000",
    cashFlow: "Positive",
    businessType: "E-commerce Retail",
    date: "End of Q1 2025",
    previousQuarter: {
      totalRevenue: "₹1,05,00,000",
      netIncome: "₹22,00,000"
    }
  };

  const monthlyRevenue = [
    { month: 'Jan 2025', revenue: 3800000 },
    { month: 'Feb 2025', revenue: 4200000 },
    { month: 'Mar 2025', revenue: 4500000 },
  ];

  const formatRevenue = (value: number) => `₹${value.toLocaleString()}`;

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
              <div className="flex items-center space-x-4">
                <div className="w-64">
                  <MerchantSearchBar 
                    onSearch={handleMerchantSearch}
                    searchTerm={searchTerm}
                  />
                </div>
                {merchantData && (
                  <Button 
                    onClick={() => setShowFinancials(true)}
                    className="gap-2 bg-blue-500 hover:bg-blue-600"
                  >
                    <IndianRupee className="h-4 w-4" />
                    Fetch Financials
                  </Button>
                )}
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
                    <EnhancedEligibilityTab 
                      eligibilityResult={evaluateEligibility(merchantData)}
                      merchantData={merchantData}
                    />
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
                    amgmv={merchantData?.warnings?.amgmv || 0}
                    amgmvAtIssuance={merchantData?.warnings?.amgmvAtIssuance || 0}
                    spends={merchantData?.warnings?.spendsDrop || 0}
                    averageAmgmv={merchantData?.warnings?.averageAmgmv || 0}
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
      
      <Dialog open={showFinancials} onOpenChange={setShowFinancials}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Financial Snapshot <span className="text-sm text-muted-foreground ml-2">(Fetched from Corpository)</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{financialMetrics.totalRevenue}</div>
                  <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4" />
                    +19% vs last quarter
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Net Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{financialMetrics.netIncome}</div>
                  <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4" />
                    +27% vs last quarter
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Gross Profit Margin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{financialMetrics.grossProfitMargin}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Operating Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{financialMetrics.operatingExpenses}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Cash Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{financialMetrics.cashFlow}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Business Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{financialMetrics.businessType}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Previous Quarter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{financialMetrics.previousQuarter.totalRevenue}</div>
                  <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4" />
                    +19% vs last quarter
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Previous Quarter Net Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{financialMetrics.previousQuarter.netIncome}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatRevenue(monthlyRevenue[0].revenue)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatRevenue(monthlyRevenue[1].revenue)}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
