
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import StatusBadge from "./StatusBadge";

type TrendType = "increasing" | "decreasing" | "null";

type LiveSpendsTabProps = {
  totalSpend: string;
  spendTrend: TrendType;
  nullReason?: string;
  stakeholder?: string;
  monthlySpends?: Array<{ month: string; amount: number }>;
};

const LiveSpendsTab = ({
  totalSpend = "₹1,75,000",
  spendTrend = "increasing",
  nullReason = "Card not activated",
  stakeholder = "Merchant Success",
  monthlySpends = [
    { month: "Jan", amount: 45000 },
    { month: "Feb", amount: 52000 },
    { month: "Mar", amount: 78000 },
  ],
}: LiveSpendsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Spend (Last 3 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-3xl font-bold">{totalSpend}</p>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500">Trend:</p>
                {spendTrend === "increasing" && (
                  <StatusBadge status="Increasing" type="success" />
                )}
                {spendTrend === "decreasing" && (
                  <StatusBadge status="Decreasing" type="warning" />
                )}
                {spendTrend === "null" && (
                  <StatusBadge status="NULL" type="error" />
                )}
              </div>

              {spendTrend === "null" && (
                <div className="space-y-2 pt-2">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Reason</p>
                    <p className="text-sm">{nullReason}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Responsible Stakeholder</p>
                    <StatusBadge status={stakeholder} type="info" />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Spend Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySpends}>
                  <XAxis dataKey="month" />
                  <YAxis 
                    tickFormatter={(value) => `₹${value/1000}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="amount" fill="#0077FF" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Average Monthly Spend</p>
                <p className="text-xl font-medium">₹58,333</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Highest Monthly Spend</p>
                <p className="text-xl font-medium">₹78,000</p>
                <p className="text-xs text-gray-400">Mar 2025</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Month-on-Month Growth</p>
                <p className="text-xl font-medium">+50%</p>
                <p className="text-xs text-gray-400">Jan to Mar</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveSpendsTab;
