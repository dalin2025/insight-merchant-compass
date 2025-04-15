
import React from 'react';

interface ApplicationDataItem {
  mid: string;
  status: string;
  bankComments?: string[];
  submittedDate?: string;
  underReviewDate?: string;
  bankDecisionDate?: string;
}

interface ApplicationDataTableProps {
  data: ApplicationDataItem[];
}

const ApplicationDataTable: React.FC<ApplicationDataTableProps> = ({ data }) => {
  if (data.length === 0) return (
    <div className="text-sm text-gray-500 mt-4">
      No application data uploaded
    </div>
  );
  
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Uploaded Application Data:</h4>
      <div className="border rounded-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">MID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bank Comments</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Under Review</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bank Decision</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">{item.mid}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === "approved" ? "bg-green-100 text-green-800" :
                    item.status === "rejected" ? "bg-red-100 text-red-800" :
                    item.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">
                  {item.bankComments && item.bankComments.length > 0 ? (
                    <ul className="list-disc pl-4">
                      {item.bankComments.map((comment, i) => (
                        <li key={i}>{comment}</li>
                      ))}
                    </ul>
                  ) : (
                    "No comments"
                  )}
                </td>
                <td className="px-4 py-2 text-sm">{item.submittedDate || "-"}</td>
                <td className="px-4 py-2 text-sm">{item.underReviewDate || "-"}</td>
                <td className="px-4 py-2 text-sm">{item.bankDecisionDate || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationDataTable;
