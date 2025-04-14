
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "./StatusBadge";

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
    </div>
  );
};

export default EligibilityTab;
