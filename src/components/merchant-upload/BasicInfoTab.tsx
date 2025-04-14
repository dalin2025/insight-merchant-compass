
import React from 'react';
import { Button } from '@/components/ui/button';
import { MerchantData } from '@/types/eligibility';
import { downloadCSVTemplate } from '@/utils/merchantDataUploadUtils';
import { UploadedFile } from './FileHistoryDisplay';
import FileHistoryDisplay from './FileHistoryDisplay';
import SavedFileInfo from './SavedFileInfo';
import MerchantListTable from './MerchantListTable';

interface BasicInfoTabProps {
  isLoading: boolean;
  uploadedMerchants: MerchantData[];
  basicFiles: UploadedFile[];
  lastSavedFile: UploadedFile | null;
  dataSaved: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveData: () => void;
  onSelectMerchant: (merchant: MerchantData) => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  isLoading,
  uploadedMerchants,
  basicFiles,
  lastSavedFile,
  dataSaved,
  onFileUpload,
  onSaveData,
  onSelectMerchant
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="merchant-file" className="text-sm font-medium">
        Upload JSON or CSV file with merchant basic data
      </label>
      <div className="flex gap-2">
        <input
          id="merchant-file"
          type="file"
          accept=".json,.csv"
          onChange={onFileUpload}
          className="border rounded-md p-2 flex-1"
          disabled={isLoading}
        />
        <Button 
          variant="outline"
          onClick={downloadCSVTemplate}
          disabled={isLoading}
        >
          Download Template
        </Button>
      </div>
      <div className="text-xs text-gray-500">
        File must contain merchant data with at least: mid, businessCategory, pgVintage, businessType, averageMonthlyGMV, qoqGrowth, activeDays
      </div>
      <SavedFileInfo file={lastSavedFile} dataSaved={dataSaved} />
      <FileHistoryDisplay files={basicFiles} />
      
      {uploadedMerchants.length > 0 && (
        <div className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Uploaded Merchants ({uploadedMerchants.length})</h3>
            <Button 
              onClick={onSaveData}
              className="bg-green-600 hover:bg-green-700"
            >
              Save Data
            </Button>
          </div>
          <MerchantListTable 
            merchants={uploadedMerchants} 
            onSelectMerchant={onSelectMerchant} 
          />
        </div>
      )}
    </div>
  );
};

export default BasicInfoTab;
