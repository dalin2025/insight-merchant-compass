
import { Info, ChevronDown, ChevronUp, Check, X } from 'lucide-react';

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
