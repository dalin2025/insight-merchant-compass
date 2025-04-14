
import React from 'react';
import { Button } from '@/components/ui/button';
import { MerchantData } from '@/types/eligibility';

interface MerchantListTableProps {
  merchants: MerchantData[];
  onSelectMerchant: (merchant: MerchantData) => void;
}

const MerchantListTable: React.FC<MerchantListTableProps> = ({ merchants, onSelectMerchant }) => {
  return (
    <div className="max-h-72 overflow-y-auto border rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">MID</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Business Type</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Monthly GMV</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {merchants.map((merchant) => (
            <tr key={merchant.mid} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm">{merchant.mid}</td>
              <td className="px-4 py-2 text-sm">{merchant.name || 'N/A'}</td>
              <td className="px-4 py-2 text-sm">{merchant.businessType}</td>
              <td className="px-4 py-2 text-sm">₹{merchant.averageMonthlyGMV.toLocaleString()}</td>
              <td className="px-4 py-2 text-sm">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onSelectMerchant(merchant)}
                >
                  Check Eligibility
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MerchantListTable;
