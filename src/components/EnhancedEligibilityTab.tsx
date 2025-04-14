
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, InfoCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Policy, EligibilityParameter, EligibilityResult } from "@/types/eligibility";
import StatusBadge from "./StatusBadge";
import { cn } from "@/lib/utils";

type EnhancedEligibilityTabProps = {
  eligibilityResult: EligibilityResult;
};

const PolicyParameterItem = ({ parameter }: { parameter: EligibilityParameter }) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">{parameter.name}</span>
        {parameter.description && (
          <div className="tooltip" title={parameter.description}>
            <InfoCircle className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">{parameter.value}</span>
        {parameter.meets ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
      </div>
    </div>
  );
};

const PolicyCard = ({ policy, isActive }: { policy: Policy; isActive: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className={cn(
      "mb-4 transition-all duration-200",
      isActive ? "border-2 border-blue-500" : ""
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg">{policy.name}</CardTitle>
            {isActive && (
              <Badge variant="default" className="bg-blue-500">Primary</Badge>
            )}
          </div>
          <StatusBadge 
            status={policy.isEligible ? "Eligible" : "Not Eligible"} 
            type={policy.isEligible ? "success" : "error"} 
          />
        </div>
        {policy.description && (
          <p className="text-sm text-gray-500 mt-1">{policy.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
            <span>Policy Parameters</span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="space-y-1">
              {policy.parameters.map((param, idx) => (
                <PolicyParameterItem key={idx} parameter={param} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

const EnhancedEligibilityTab = ({ eligibilityResult }: EnhancedEligibilityTabProps) => {
  const { 
    isEligible, 
    matchingPolicies, 
    calculatedLimit, 
    primaryPolicy, 
    ineligibilityReasons 
  } = eligibilityResult;

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
            <p className="text-xl font-bold">{calculatedLimit}</p>
          </div>

          {isEligible && primaryPolicy && (
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Primary Policy</p>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {primaryPolicy.name}
              </Badge>
            </div>
          )}

          {!isEligible && ineligibilityReasons.length > 0 && (
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

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Policy Evaluation Results</h3>
        
        {/* If eligible, show matching policies first */}
        {isEligible && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Eligible Policies</p>
            {matchingPolicies.map((policy) => (
              <PolicyCard 
                key={policy.id} 
                policy={policy} 
                isActive={primaryPolicy?.id === policy.id} 
              />
            ))}
          </div>
        )}
        
        {/* Show ineligible policies */}
        {eligibilityResult.isEligible && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Other Policies</p>
            {matchingPolicies.length !== 2 && (
              <div>
                {!matchingPolicies.some(p => p.id === "ybl") && (
                  <PolicyCard policy={eligibilityResult.matchingPolicies.find(p => p.id === "ybl") || 
                    {id: "ybl", name: "PG-YBL Policy", isEligible: false, parameters: []}} isActive={false} />
                )}
                {!matchingPolicies.some(p => p.id === "rbl") && (
                  <PolicyCard policy={eligibilityResult.matchingPolicies.find(p => p.id === "rbl") || 
                    {id: "rbl", name: "PG-RBL Policy", isEligible: false, parameters: []}} isActive={false} />
                )}
              </div>
            )}
          </div>
        )}

        {/* If not eligible, just show all policies in order */}
        {!isEligible && (
          <>
            <PolicyCard 
              policy={{id: "ybl", name: "PG-YBL Policy", isEligible: false, parameters: []}} 
              isActive={false} 
            />
            <PolicyCard 
              policy={{id: "rbl", name: "PG-RBL Policy", isEligible: false, parameters: []}} 
              isActive={false} 
            />
          </>
        )}
      </div>
      
      {/* Help text for clarity */}
      {isEligible && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTitle className="text-blue-700">Multiple Policy Eligibility</AlertTitle>
          <AlertDescription className="text-blue-600">
            The merchant is eligible under {matchingPolicies.length} {matchingPolicies.length === 1 ? 'policy' : 'policies'}.
            The policy offering the highest limit ({primaryPolicy?.name}) is selected as the primary policy.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EnhancedEligibilityTab;
