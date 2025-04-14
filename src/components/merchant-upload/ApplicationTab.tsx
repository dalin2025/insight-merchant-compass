
import React from 'react';
import { Button } from '@/components/ui/button';
import { downloadApplicationTemplate } from '@/utils/merchantDataUploadUtils';
import { UploadedFile } from './FileHistoryDisplay';
import FileHistoryDisplay from './FileHistoryDisplay';
import SavedFileInfo from './SavedFileInfo';
import ApplicationDataTable from './ApplicationDataTable';

interface ApplicationTabProps {
  isLoading: boolean;
  applicationFiles: UploadedFile[];
  lastSavedFile: UploadedFile | null;
  dataSaved: boolean;
  applicationData: Array<{
    mid: string;
    status: string;
    bankComments?: string[];
  }>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveData: () => void;
}

const ApplicationTab: React.FC<ApplicationTabProps> = ({
  isLoading,
  applicationFiles,
  lastSavedFile,
  dataSaved,
  applicationData,
  onFileUpload,
  onSaveData
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="application-file" className="text-sm font-medium">
        Upload JSON or CSV file with application status data
      </label>
      <div className="flex gap-2">
        <input
          id="application-file"
          type="file"
          accept=".json,.csv"
          onChange={onFileUpload}
          className="border rounded-md p-2 flex-1"
          disabled={isLoading}
        />
        <Button 
          variant="outline"
          onClick={downloadApplicationTemplate}
          disabled={isLoading}
        >
          Download Template
        </Button>
      </div>
      <div className="text-xs text-gray-500">
        File must contain application data with at least: mid, status (not-started, in-progress, approved, rejected), bankComments (array)
      </div>
      <div className="mt-4 flex justify-end">
        <Button 
          onClick={onSaveData}
          className="bg-green-600 hover:bg-green-700"
        >
          Save Data
        </Button>
      </div>
      <SavedFileInfo file={lastSavedFile} dataSaved={dataSaved} preserveData={true} />
      <FileHistoryDisplay files={applicationFiles} />
      <ApplicationDataTable data={applicationData} />
    </div>
  );
};

export default ApplicationTab;
