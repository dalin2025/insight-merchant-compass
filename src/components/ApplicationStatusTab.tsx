
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "./StatusBadge";
import TimelineComponent from "./TimelineComponent";
import { useEffect, useState } from "react";
import { evaluateEligibility } from "@/utils/eligibilityUtils";
import { MerchantData } from "@/types/eligibility";

type StatusType = "not-started" | "in-progress" | "approved" | "rejected";

type ApplicationStatusTabProps = {
  status: StatusType;
  bankComments?: string[];
  hasData?: boolean;
  merchant?: MerchantData | null;
};

const ApplicationStatusTab = ({
  status,
  bankComments = [],
  hasData = false,
  merchant = null
}: ApplicationStatusTabProps) => {
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  
  useEffect(() => {
    if (merchant) {
      const eligibilityResult = evaluateEligibility(merchant);
      setIsEligible(eligibilityResult.isEligible);
    } else {
      setIsEligible(null);
    }
  }, [merchant]);

  // Define timeline steps based on status
  const getTimelineSteps = () => {
    const baseSteps = [
      {
        id: 1,
        name: "Submitted",
        status: "completed" as const,
        date: "15 Apr 2025",
      },
      {
        id: 2,
        name: "Under Review",
        status: "pending" as const,
        date: "",
      },
      {
        id: 3,
        name: "Bank Decision",
        status: "pending" as const,
        date: "",
      },
    ];

    if (status === "in-progress") {
      return baseSteps.map((step, index) => {
        if (index === 1) return { ...step, status: "current" as const, date: "Current" };
        return step;
      });
    } else if (status === "approved" || status === "rejected") {
      return baseSteps.map((step, index) => {
        if (index === 1) return { ...step, status: "completed" as const, date: "18 Apr 2025" };
        if (index === 2) return { 
          ...step, 
          status: "completed" as const, 
          date: "20 Apr 2025"
        };
        return step;
      });
    }
    
    return baseSteps;
  };

  const getStatusBadge = () => {
    switch (status) {
      case "in-progress":
        return <StatusBadge status="In Progress" type="info" />;
      case "approved":
        return <StatusBadge status="Approved" type="success" />;
      case "rejected":
        return <StatusBadge status="Rejected" type="error" />;
      default:
        return <StatusBadge status="Not Started" type="neutral" />;
    }
  };

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500">No application data available for this merchant</p>
      </div>
    );
  }
  
  if (merchant && isEligible === false) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500">This merchant is not eligible for application.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {merchant && isEligible && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Eligible Merchant Application</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Merchant ID</p>
                <p className="font-medium">{merchant.mid}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Application Status</p>
                <div>{getStatusBadge()}</div>
              </div>
              
              {bankComments && bankComments.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Bank Comments</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {bankComments.map((comment, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {comment}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(!merchant || isEligible) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Current Status</p>
                <div>{getStatusBadge()}</div>
              </div>

              <TimelineComponent steps={getTimelineSteps()} />

              {bankComments && bankComments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Bank Comments</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {bankComments.map((comment, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {comment}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(!merchant || isEligible) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">MID</p>
                  <p className="text-sm font-medium">{merchant ? merchant.mid : "RZPM10098765"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Business Name</p>
                  <p className="text-sm font-medium">{merchant ? merchant.name : "Tech Solutions Pvt. Ltd."}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Application Date</p>
                  <p className="text-sm font-medium">15 Apr 2025</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Requested Limit</p>
                  <p className="text-sm font-medium">₹2,50,000</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicationStatusTab;
