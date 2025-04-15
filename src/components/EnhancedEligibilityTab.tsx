import { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Check, X, AlertTriangle } from 'lucide-react';
import { EligibilityParameter, Policy, EligibilityResult, MerchantData } from '@/types/eligibility';
import SalesPitchSection from './SalesPitchSection';

const PolicyParameterItem = ({ parameter }: { parameter: EligibilityParameter }) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">{parameter.name}</span>
        {parameter.description && (
          <div className="tooltip" title={parameter.description}>
            <Info className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">{parameter.value}</span>
        {parameter.meets ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <X className="h-4 w-4 text-red-500" />
        )}
      </div>
    </div>
  );
};

interface EnhancedEligibilityTabProps {
  eligibilityResult: EligibilityResult;
  merchantData?: MerchantData;
}

const EnhancedEligibilityTab = ({ eligibilityResult, merchantData }: EnhancedEligibilityTabProps) => {
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  const togglePolicy = (policyId: string) => {
    setExpandedPolicy(expandedPolicy === policyId ? null : policyId);
  };

  const getPolicy = (id: string): Policy | undefined => {
    return eligibilityResult.allPolicies?.find(policy => policy.id === id);
  };

  const yblPolicy = getPolicy('ybl');
  const rblPolicy = getPolicy('rbl');

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Eligibility Status</h3>
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${eligibilityResult.isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {eligibilityResult.isEligible ? 'Eligible' : 'Not Eligible'}
          </div>
        </div>
        
        {eligibilityResult.isEligible && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Primary Policy: {eligibilityResult.primaryPolicy?.name}</p>
            <p className="mt-2 text-lg font-bold">Credit Limit: {eligibilityResult.calculatedLimit}</p>
          </div>
        )}
        
        {!eligibilityResult.isEligible && (
          <div className="mt-4">
            <p className="text-sm font-medium text-red-600">Reasons for Ineligibility:</p>
            
            {yblPolicy && !yblPolicy.isEligible && (
              <div className="mt-2">
                <p className="text-sm font-medium">YBL Policy:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {yblPolicy.parameters
                    .filter(param => !param.meets)
                    .map((param, index) => (
                      <li key={`ybl-${index}`} className="text-sm text-gray-600">
                        {param.description || `${param.name} criteria not met`}
                      </li>
                    ))}
                </ul>
              </div>
            )}
            
            {rblPolicy && !rblPolicy.isEligible && (
              <div className="mt-2">
                <p className="text-sm font-medium">RBL Policy:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {rblPolicy.parameters
                    .filter(param => !param.meets)
                    .map((param, index) => (
                      <li key={`rbl-${index}`} className="text-sm text-gray-600">
                        {param.description || `${param.name} criteria not met`}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="rounded-lg border">
        <div className="border-b p-4">
          <h3 className="text-lg font-semibold">Policy Details</h3>
        </div>
        
        <div className="divide-y">
          {eligibilityResult.allPolicies && eligibilityResult.allPolicies.length > 0 ? (
            eligibilityResult.allPolicies.map((policy) => (
              <div key={policy.id} className="p-4">
                <div 
                  className="flex cursor-pointer items-center justify-between"
                  onClick={() => togglePolicy(policy.id)}
                >
                  <div>
                    <h4 className="font-medium">{policy.name}</h4>
                    {policy.description && <p className="text-sm text-gray-500">{policy.description}</p>}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${policy.isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {policy.isEligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                    {expandedPolicy === policy.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expandedPolicy === policy.id && (
                  <div className="mt-4 space-y-2">
                    {policy.parameters.map((param, index) => (
                      <PolicyParameterItem key={index} parameter={param} />
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No eligible policies found
            </div>
          )}
        </div>
      </div>

      {merchantData && (
        <SalesPitchSection 
          merchantData={merchantData}
          isEligible={eligibilityResult.isEligible}
        />
      )}
    </div>
  );
};

export default EnhancedEligibilityTab;
