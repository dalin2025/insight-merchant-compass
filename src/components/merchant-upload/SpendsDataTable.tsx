
import React from 'react';

interface SpendDataItem {
  mid: string;
  totalSpend: string;
  spendTrend: string;
  monthlySpends: Array<{month: string; amount: number}>;
}

interface SpendsDataTableProps {
  data: SpendDataItem[];
}

const SpendsDataTable: React.FC<SpendsDataTableProps> = ({ data }) => {
  if (data.length === 0) return (
    <div className="text-sm text-gray-500 mt-4">
      No spends data uploaded
    </div>
  );
  
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Uploaded Spends Data:</h4>
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">MID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Spend</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monthly Spends</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">{item.mid}</td>
                <td className="px-4 py-2 text-sm">{item.totalSpend}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.spendTrend === "increasing" ? "bg-green-100 text-green-800" :
                    item.spendTrend === "decreasing" ? "bg-red-100 text-red-800" :
                    item.spendTrend === "stable" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {item.spendTrend}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">
                  {item.monthlySpends && item.monthlySpends.length > 0 ? (
                    <ul className="list-none space-y-1">
                      {item.monthlySpends.map((spend, i) => (
                        <li key={i}>{spend.month}: ₹{spend.amount}</li>
                      ))}
                    </ul>
                  ) : (
                    "No monthly data"
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

export default SpendsDataTable;
