
import React from 'react';

interface WarningDataItem {
  mid: string;
  amgmv: number;
  amgmvAtIssuance: number;
  averageAmgmv: number;
  spendsDrop: number;
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WarningsDataTable;

