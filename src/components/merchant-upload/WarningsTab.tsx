
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { downloadWarningsTemplate } from '@/utils/merchantDataUploadUtils';
import { UploadedFile } from './FileHistoryDisplay';
import FileHistoryDisplay from './FileHistoryDisplay';
import SavedFileInfo from './SavedFileInfo';
import WarningsDataTable from './WarningsDataTable';
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [apiKey, setApiKey] = useState<string>("");
  const { toast } = useToast();

  // Load API key from local storage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('openAiApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openAiApiKey', apiKey);
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been securely stored locally.",
      });
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex flex-col space-y-4">
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
      </div>
      
      <SavedFileInfo file={lastSavedFile} dataSaved={dataSaved} />
      <FileHistoryDisplay files={warningsFiles} />
      
      <Separator className="my-4" />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">OpenAI API Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label htmlFor="api-key" className="text-sm font-medium">
                OpenAI API Key
              </label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your OpenAI API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button 
                  onClick={saveApiKey}
                  variant="secondary"
                >
                  Save Key
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Your API key is stored locally in your browser and is used for generating sales pitches.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <WarningsDataTable data={warningsData} />
    </div>
  );
};

export default WarningsTab;
