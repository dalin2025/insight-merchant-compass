
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import StatusBadge from "./StatusBadge";

type TrendType = "increasing" | "decreasing" | "stable" | "null";

type LiveSpendsTabProps = {
  totalSpend: string;
  spendTrend: TrendType;
  nullReason?: string;
  stakeholder?: string;
  monthlySpends?: Array<{ month: string; amount: number }>;
  hasData?: boolean;
};

const LiveSpendsTab = ({
  totalSpend = "₹0",
  spendTrend = "null",
  nullReason = "",
  stakeholder = "",
  monthlySpends = [],
  hasData = false
}: LiveSpendsTabProps) => {
  
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500">No spends data available for this merchant</p>
      </div>
    );
  }

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
                {spendTrend === "stable" && (
                  <StatusBadge status="Stable" type="info" />
                )}
                {spendTrend === "null" && (
                  <StatusBadge status="NULL" type="error" />
                )}
              </div>

              {spendTrend === "null" && nullReason && (
                <div className="space-y-2 pt-2">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Reason</p>
                    <p className="text-sm">{nullReason}</p>
                  </div>
                  {stakeholder && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Responsible Stakeholder</p>
                      <StatusBadge status={stakeholder} type="info" />
                    </div>
                  )}
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
            {monthlySpends.length > 0 ? (
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
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">No monthly spend data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {monthlySpends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Average Monthly Spend</p>
                  <p className="text-xl font-medium">
                    {monthlySpends.length > 0 
                      ? `₹${Math.round(monthlySpends.reduce((sum, item) => sum + item.amount, 0) / monthlySpends.length).toLocaleString()}`
                      : '₹0'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Highest Monthly Spend</p>
                  {monthlySpends.length > 0 ? (
                    <>
                      <p className="text-xl font-medium">
                        ₹{Math.max(...monthlySpends.map(item => item.amount)).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {monthlySpends.reduce((max, item) => item.amount > max.amount ? item : max, monthlySpends[0]).month}
                      </p>
                    </>
                  ) : (
                    <p className="text-xl font-medium">₹0</p>
                  )}
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Month-on-Month Growth</p>
                  {monthlySpends.length > 1 ? (
                    <>
                      <p className="text-xl font-medium">
                        {((monthlySpends[monthlySpends.length - 1].amount - monthlySpends[0].amount) / monthlySpends[0].amount * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-400">
                        {monthlySpends[0].month} to {monthlySpends[monthlySpends.length - 1].month}
                      </p>
                    </>
                  ) : (
                    <p className="text-xl font-medium">0%</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveSpendsTab;
