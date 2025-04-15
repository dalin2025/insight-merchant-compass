
import React from 'react';
import { Button } from '@/components/ui/button';
import { downloadWarningsTemplate } from '@/utils/merchantDataUploadUtils';
import { UploadedFile } from './FileHistoryDisplay';
import FileHistoryDisplay from './FileHistoryDisplay';
import SavedFileInfo from './SavedFileInfo';
import WarningsDataTable from './WarningsDataTable';

interface WarningsTabProps {
  isLoading: boolean;
  warningsFiles: UploadedFile[];
  lastSavedFile: UploadedFile | null;
  dataSaved: boolean;
  warningsData: Array<{
    mid: string;
    amgmv: number;
    amgmvAtIssuance: number;
    averageAmgmv: number;
    spendsDrop: number;
    internalTriggers: Array<{name: string; severity: "high" | "medium" | "low"; details: string}>;
  }>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveData: () => void;
}

const WarningsTab: React.FC<WarningsTabProps> = ({
  isLoading,
  warningsFiles,
  lastSavedFile,
  dataSaved,
  warningsData,
  onFileUpload,
  onSaveData
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="warnings-file" className="text-sm font-medium">
        Upload JSON or CSV file with warning signals data
      </label>
      <div className="flex gap-2">
        <input
          id="warnings-file"
          type="file"
          accept=".json,.csv"
          onChange={onFileUpload}
          className="border rounded-md p-2 flex-1"
          disabled={isLoading}
        />
        <Button 
          variant="outline"
          onClick={downloadWarningsTemplate}
          disabled={isLoading}
        >
          Download Template
        </Button>
      </div>
      <div className="text-xs text-gray-500">
        File must contain warning data with at least: mid, amgmv, amgmvAtIssuance, averageAmgmv, spendsDrop, internalTriggers (array)
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
      <FileHistoryDisplay files={warningsFiles} />
      <WarningsDataTable data={warningsData} />
    </div>
  );
};

export default WarningsTab;
