
import React from 'react';
import { Button } from '@/components/ui/button';
import { downloadSpendsTemplate } from '@/utils/merchantDataUploadUtils';
import { UploadedFile } from './FileHistoryDisplay';
import FileHistoryDisplay from './FileHistoryDisplay';
import SavedFileInfo from './SavedFileInfo';
import SpendsDataTable from './SpendsDataTable';

interface SpendsTabProps {
  isLoading: boolean;
  spendsFiles: UploadedFile[];
  lastSavedFile: UploadedFile | null;
  dataSaved: boolean;
  spendsData: Array<{
    mid: string;
    totalSpend: string;
    spendTrend: string;
    monthlySpends: Array<{month: string; amount: number}>;
  }>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveData: () => void;
}

const SpendsTab: React.FC<SpendsTabProps> = ({
  isLoading,
  spendsFiles,
  lastSavedFile,
  dataSaved,
  spendsData,
  onFileUpload,
  onSaveData
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="spends-file" className="text-sm font-medium">
        Upload JSON or CSV file with spend data
      </label>
      <div className="flex gap-2">
        <input
          id="spends-file"
          type="file"
          accept=".json,.csv"
          onChange={onFileUpload}
          className="border rounded-md p-2 flex-1"
          disabled={isLoading}
        />
        <Button 
          variant="outline"
          onClick={downloadSpendsTemplate}
          disabled={isLoading}
        >
          Download Template
        </Button>
      </div>
      <div className="text-xs text-gray-500">
        File must contain spend data with at least: mid, totalSpend, spendTrend (increasing, decreasing, stable, null), monthlySpends (array)
      </div>
      <div className="mt-4 flex justify-end">
        <Button 
          onClick={onSaveData}
          className="bg-green-600 hover:bg-green-700"
        >
          Save Data
        </Button>
      </div>
      <SavedFileInfo file={lastSavedFile} dataSaved={dataSaved} />
      <FileHistoryDisplay files={spendsFiles} />
      <SpendsDataTable data={spendsData} />
    </div>
  );
};

export default SpendsTab;
