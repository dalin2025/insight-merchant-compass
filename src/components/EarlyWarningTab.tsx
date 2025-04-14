
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, AlertCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";

type RiskLevel = "high" | "medium" | "low";

type EarlyWarningTabProps = {
  riskFlag: RiskLevel;
  gmvDrop: number; // Percentage
  spendsDrop: number; // Percentage
  internalTriggers: Array<{
    name: string;
    severity: RiskLevel;
    details: string;
  }>;
  hasData?: boolean;
};

const EarlyWarningTab = ({
  riskFlag = "low",
  gmvDrop = 0,
  spendsDrop = 0,
  internalTriggers = [],
  hasData = false
}: EarlyWarningTabProps) => {
  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case "high":
        return <StatusBadge status="High Risk" type="error" />;
      case "medium":
        return <StatusBadge status="Medium Risk" type="warning" />;
      case "low":
        return <StatusBadge status="Low Risk" type="success" />;
      default:
        return <StatusBadge status="Unknown" type="neutral" />;
    }
  };

  const getRiskIcon = (risk: RiskLevel) => {
    switch (risk) {
      case "high":
        return <AlertCircle className="h-5 w-5 text-razorpay-red" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-razorpay-orange" />;
      case "low":
        return <AlertTriangle className="h-5 w-5 text-razorpay-green" />;
      default:
        return null;
    }
  };

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500">No warning signals data available for this merchant</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Overall Risk Flag</p>
              {getRiskBadge(riskFlag)}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">GMV Drop</CardTitle>
            <TrendingDown className={`h-5 w-5 ${gmvDrop > 10 ? 'text-razorpay-red' : 'text-razorpay-orange'}`} />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-3xl font-bold">{gmvDrop}%</p>
              <p className="text-sm text-gray-500">Since card issuance</p>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Impact</p>
                {gmvDrop > 10 ? (
                  <StatusBadge status="Significant Impact" type="error" />
                ) : (
                  <StatusBadge status="Moderate Impact" type="warning" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Spends Drop</CardTitle>
            <TrendingDown className={`h-5 w-5 ${spendsDrop > 10 ? 'text-razorpay-red' : 'text-razorpay-orange'}`} />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-3xl font-bold">{spendsDrop}%</p>
              <p className="text-sm text-gray-500">Month-on-month</p>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Impact</p>
                {spendsDrop > 10 ? (
                  <StatusBadge status="Significant Impact" type="error" />
                ) : (
                  <StatusBadge status="Moderate Impact" type="warning" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {internalTriggers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Internal Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {internalTriggers.map((trigger, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-100 rounded-lg flex space-x-3"
                >
                  <div>{getRiskIcon(trigger.severity)}</div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{trigger.name}</h4>
                      {getRiskBadge(trigger.severity)}
                    </div>
                    <p className="text-sm text-gray-600">{trigger.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Internal Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-500">No internal triggers detected</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EarlyWarningTab;
