
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, AlertCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";

type RiskLevel = "high" | "medium" | "low";

type EarlyWarningTabProps = {
  amgmv: number;
  amgmvAtIssuance: number;
  spends: number;
  averageAmgmv: number;
  internalTriggers: Array<{
    name: string;
    severity: RiskLevel;
    details: string;
  }>;
  hasData?: boolean;
};

const calculateRiskLevel = (
  amgmv: number,
  amgmvAtIssuance: number,
  spends: number,
  averageAmgmv: number
): { riskFlag: RiskLevel; triggers: Array<{ name: string; severity: RiskLevel; details: string }> } => {
  const triggers: Array<{ name: string; severity: RiskLevel; details: string }> = [];
  let highestRisk: RiskLevel = "low";
  
  // Calculate AMGMV drop percentage
  const amgmvDropPercent = ((amgmvAtIssuance - amgmv) / amgmvAtIssuance) * 100;
  
  // Calculate Average AMGMV drop percentage
  const averageAmgmvDropPercent = ((amgmvAtIssuance - averageAmgmv) / amgmvAtIssuance) * 100;

  // Rule 1: AMGMV drop > 50%
  if (amgmvDropPercent > 50) {
    triggers.push({
      name: "Significant AMGMV Drop",
      severity: "high",
      details: `AMGMV has dropped by ${amgmvDropPercent.toFixed(1)}% since issuance`
    });
    highestRisk = "high";
  }

  // Rules for spends and average AMGMV drop combinations
  if (spends > 60 && averageAmgmvDropPercent > 10) {
    triggers.push({
      name: "Moderate Risk Indicator",
      severity: "low",
      details: `Spends (${spends}%) and Average AMGMV drop (${averageAmgmvDropPercent.toFixed(1)}%) indicate low risk`
    });
    highestRisk = highestRisk === "high" ? highestRisk : "low";
  } else if (spends >= 30 && spends <= 60 && averageAmgmvDropPercent >= 10 && averageAmgmvDropPercent <= 30) {
    triggers.push({
      name: "Elevated Risk Indicator",
      severity: "medium",
      details: `Spends (${spends}%) and Average AMGMV drop (${averageAmgmvDropPercent.toFixed(1)}%) indicate medium risk`
    });
    highestRisk = highestRisk === "high" ? highestRisk : "medium";
  } else if (spends < 30 && averageAmgmvDropPercent > 30) {
    triggers.push({
      name: "Critical Risk Indicator",
      severity: "high",
      details: `Low spends (${spends}%) and high Average AMGMV drop (${averageAmgmvDropPercent.toFixed(1)}%) indicate high risk`
    });
    highestRisk = "high";
  }

  return { riskFlag: highestRisk, triggers };
};

const EarlyWarningTab = ({
  amgmv = 0,
  amgmvAtIssuance = 0,
  spends = 0,
  averageAmgmv = 0,
  internalTriggers = [],
  hasData = false
}: EarlyWarningTabProps) => {
  const { riskFlag, triggers } = calculateRiskLevel(amgmv, amgmvAtIssuance, spends, averageAmgmv);

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
            <CardTitle className="text-lg">AMGMV Drop (from Issuance)</CardTitle>
            <TrendingDown className={`h-5 w-5 ${amgmv < amgmvAtIssuance ? 'text-razorpay-red' : 'text-razorpay-green'}`} />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-3xl font-bold">
                {((amgmvAtIssuance - amgmv) / amgmvAtIssuance * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">Since card issuance</p>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Current AMGMV</p>
                <p className="text-sm font-medium">₹{amgmv.toLocaleString()}</p>
                <p className="text-xs text-gray-500">AMGMV at Issuance</p>
                <p className="text-sm font-medium">₹{amgmvAtIssuance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Spends and Average AMGMV Matrix</CardTitle>
            <TrendingDown className={`h-5 w-5 ${averageAmgmv < amgmvAtIssuance ? 'text-razorpay-red' : 'text-razorpay-green'}`} />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-3xl font-bold">
                {((amgmvAtIssuance - averageAmgmv) / amgmvAtIssuance * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">Drop in Average AMGMV</p>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Current Average AMGMV</p>
                <p className="text-sm font-medium">₹{averageAmgmv.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Spends Utilization</p>
                <p className="text-sm font-medium">{spends}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Risk Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {triggers.length > 0 ? (
              triggers.map((trigger, index) => (
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
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No risk triggers detected</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarlyWarningTab;
