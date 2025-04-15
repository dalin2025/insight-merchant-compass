
import React from 'react';

interface TriggerItem {
  name: string;
  severity: "high" | "medium" | "low";
  details: string;
}

interface WarningDataItem {
  mid: string;
  amgmv: number;
  amgmvAtIssuance: number;
  averageAmgmv: number;
  spendsDrop: number;
  internalTriggers: TriggerItem[];
}

interface WarningsDataTableProps {
  data: WarningDataItem[];
}

const WarningsDataTable: React.FC<WarningsDataTableProps> = ({ data }) => {
  if (data.length === 0) return (
    <div className="text-sm text-gray-500 mt-4">
      No warnings data uploaded
    </div>
  );
  
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Uploaded Warning Signals Data:</h4>
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">MID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">AMGMV</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">AMGMV at Issuance</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Average AMGMV</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Spends Drop %</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Internal Triggers</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">{item.mid}</td>
                <td className="px-4 py-2 text-sm">₹{item.amgmv.toLocaleString()}</td>
                <td className="px-4 py-2 text-sm">₹{item.amgmvAtIssuance.toLocaleString()}</td>
                <td className="px-4 py-2 text-sm">₹{item.averageAmgmv.toLocaleString()}</td>
                <td className="px-4 py-2 text-sm">{item.spendsDrop}%</td>
                <td className="px-4 py-2 text-sm">
                  {item.internalTriggers && item.internalTriggers.length > 0 ? (
                    <ul className="list-disc pl-4">
                      {item.internalTriggers.map((trigger, i) => (
                        <li key={i} className="mb-1">
                          <div className="font-medium">{trigger.name}</div>
                          <div className="text-xs">
                            <span className={`px-1 rounded ${
                              trigger.severity === "high" ? "bg-red-100 text-red-800" :
                              trigger.severity === "medium" ? "bg-yellow-100 text-yellow-800" :
                              "bg-green-100 text-green-800"
                            }`}>
                              {trigger.severity}
                            </span>
                            {" - "}{trigger.details}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No triggers"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WarningsDataTable;
