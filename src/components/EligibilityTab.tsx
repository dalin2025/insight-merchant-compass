import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "./StatusBadge";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, TrendingUp, Building2 } from "lucide-react";

type EligibilityTabProps = {
  isEligible: boolean;
  limit?: string;
  ineligibilityReasons?: string[];
};

const EligibilityTab = ({
  isEligible,
  limit = "₹2,50,000",
  ineligibilityReasons = ["Merchant age less than 6 months", "Low monthly GMV"],
}: EligibilityTabProps) => {
  const [showFinancials, setShowFinancials] = useState(false);

  // Dummy financial data
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Corporate Card Eligibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Status</p>
              {isEligible ? (
                <StatusBadge status="Eligible" type="success" />
              ) : (
                <StatusBadge status="Not Eligible" type="error" />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500">Calculated Limit</p>
            <p className="text-xl font-bold">{limit}</p>
          </div>

          {!isEligible && ineligibilityReasons && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Reason for Ineligibility</p>
              <ul className="list-disc pl-4 space-y-1">
                {ineligibilityReasons.map((reason, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Eligibility Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm">Business Age</p>
              <StatusBadge 
                status={isEligible ? "Meets criteria" : "Does not meet"} 
                type={isEligible ? "success" : "error"} 
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Monthly GMV</p>
              <StatusBadge 
                status={isEligible ? "Meets criteria" : "Below threshold"} 
                type={isEligible ? "success" : "error"} 
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Risk Assessment</p>
              <StatusBadge 
                status={isEligible ? "Low risk" : "Moderate risk"} 
                type={isEligible ? "success" : "warning"} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={() => setShowFinancials(true)}
          className="gap-2"
        >
          <IndianRupee className="h-4 w-4" />
          Fetch Financials
        </Button>
      </div>

      <Dialog open={showFinancials} onOpenChange={setShowFinancials}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Financial Snapshot
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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Gross Profit Margin</p>
                <p className="font-medium">{financialMetrics.grossProfitMargin}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Operating Expenses</p>
                <p className="font-medium">{financialMetrics.operatingExpenses}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Cash Flow Status</p>
                <StatusBadge status={financialMetrics.cashFlow} type="success" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quarterly Revenue Trend</h4>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#2563eb"
                      name="Revenue"
                      formatter={(value) => `₹${(value as number).toLocaleString()}`}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <p>Business Type: {financialMetrics.businessType}</p>
              <p>As of: {financialMetrics.date}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EligibilityTab;
