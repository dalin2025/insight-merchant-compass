
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MerchantData, ApplicationStatus, SpendData, WarningSignals } from '@/types/eligibility';
import { evaluateEligibility } from '@/utils/eligibilityUtils';
import EnhancedEligibilityTab from './EnhancedEligibilityTab';
import { toast } from "sonner";
import { 
  downloadCSVTemplate, 
  downloadSpendsTemplate, 
  downloadApplicationTemplate,
  downloadWarningsTemplate
} from '@/utils/merchantDataUploadUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileIcon, CheckCircle2 } from "lucide-react";

interface MerchantDataUploadProps {
  savedMerchants: MerchantData[];
  onMerchantDataSave: (merchants: MerchantData[]) => void;
}

interface UploadedFile {
  name: string;
  size: number;
  date: Date;
}

const MerchantDataUpload = ({ savedMerchants, onMerchantDataSave }: MerchantDataUploadProps) => {
  const [uploadedMerchants, setUploadedMerchants] = useState<MerchantData[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeUploadTab, setActiveUploadTab] = useState("basic");
  const [dataSaved, setDataSaved] = useState(false);
  
  const [basicFiles, setBasicFiles] = useState<UploadedFile[]>([]);
  const [applicationFiles, setApplicationFiles] = useState<UploadedFile[]>([]);
  const [spendsFiles, setSpendsFiles] = useState<UploadedFile[]>([]);
  const [warningsFiles, setWarningsFiles] = useState<UploadedFile[]>([]);
  
  // Track latest uploaded file for each category
  const [lastSavedFiles, setLastSavedFiles] = useState<{
    basic: UploadedFile | null,
    application: UploadedFile | null,
    spends: UploadedFile | null,
    warnings: UploadedFile | null
  }>({
    basic: null,
    application: null,
    spends: null,
    warnings: null
  });
  
  useEffect(() => {
    if (savedMerchants.length > 0) {
      setUploadedMerchants(savedMerchants);
    }
  }, [savedMerchants]);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setDataSaved(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          const parsedData = Array.isArray(data) ? data : [data];
          
          if (type === "basic") {
            validateAndSetMerchants(parsedData);
            addFileToHistory(file, setBasicFiles, type);
          } else if (type === "application") {
            validateAndUpdateApplicationStatus(parsedData);
            addFileToHistory(file, setApplicationFiles, type);
          } else if (type === "spends") {
            validateAndUpdateSpendData(parsedData);
            addFileToHistory(file, setSpendsFiles, type);
          } else if (type === "warnings") {
            validateAndUpdateWarningData(parsedData);
            addFileToHistory(file, setWarningsFiles, type);
          }
        } 
        else if (file.name.endsWith('.csv')) {
          if (type === "basic") {
            validateAndSetMerchants(parseCSV(content));
            addFileToHistory(file, setBasicFiles, type);
          } else if (type === "application") {
            validateAndUpdateApplicationStatus(parseCSV(content));
            addFileToHistory(file, setApplicationFiles, type);
          } else if (type === "spends") {
            validateAndUpdateSpendData(parseCSV(content, true));
            addFileToHistory(file, setSpendsFiles, type);
          } else if (type === "warnings") {
            validateAndUpdateWarningData(parseCSV(content));
            addFileToHistory(file, setWarningsFiles, type);
          }
        } 
        else {
          toast.error("Unsupported file format. Please upload JSON or CSV files.");
        }
      } catch (error) {
        console.error("Error processing file:", error);
        toast.error("Failed to process file. Please check the format.");
      } finally {
        setIsLoading(false);
        event.target.value = '';
      }
    };
    
    if (file.name.endsWith('.json') || file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      toast.error("Unsupported file format. Please upload JSON or CSV files.");
      setIsLoading(false);
    }
  };
  
  const addFileToHistory = (file: File, setFilesFunction: React.Dispatch<React.SetStateAction<UploadedFile[]>>, fileType: string) => {
    const newFile = {
      name: file.name,
      size: file.size,
      date: new Date()
    };
    
    setFilesFunction(prev => [
      newFile,
      ...prev
    ].slice(0, 5));
    
    // Update the current file for this type
    setLastSavedFiles(prev => ({
      ...prev,
      [fileType]: newFile
    }));
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const parseCSV = (csvContent: string, isSpendData = false): any[] => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    if (isSpendData) {
      return parseSimplifiedSpendCSV(csvContent);
    }
    
    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',').map(value => value.trim());
      const data: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        let value = values[index];
        
        if (/^\d+(\.\d+)?$/.test(value)) {
          data[header] = parseFloat(value);
        } else if (value === 'true' || value === 'false') {
          data[header] = value === 'true';
        } else {
          data[header] = value;
        }
      });
      
      return data;
    });
  };
  
  const parseSimplifiedSpendCSV = (csvContent: string): any[] => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',').map(value => value.trim());
      const data: Record<string, any> = {};
      
      data.mid = values[0];
      data.totalSpend = values[1];
      data.spendTrend = values[2];
      
      const monthlySpends = [];
      for (let i = 3; i < values.length; i += 2) {
        if (values[i] && values[i+1]) {
          monthlySpends.push({
            month: values[i],
            amount: parseFloat(values[i+1]) || 0
          });
        }
      }
      
      data.monthlySpends = monthlySpends;
      return data;
    });
  };
  
  const validateAndSetMerchants = (merchants: Partial<MerchantData>[]) => {
    const validMerchants: MerchantData[] = [];
    const requiredFields = ['mid', 'businessCategory', 'pgVintage', 'businessType', 'averageMonthlyGMV', 'qoqGrowth', 'activeDays'];
    
    merchants.forEach((merchant, index) => {
      const missingFields = requiredFields.filter(field => !(field in merchant));
      
      if (missingFields.length > 0) {
        toast.warning(`Merchant at index ${index} is missing required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      const validBusinessTypes = ["Private Limited", "Public Limited", "LLP", "Partnership", "Proprietorship"];
      if (!validBusinessTypes.includes(merchant.businessType as string)) {
        toast.warning(`Merchant ${merchant.mid}: Invalid business type "${merchant.businessType}"`);
        return;
      }
      
      const numericFields = ['pgVintage', 'averageMonthlyGMV', 'qoqGrowth', 'activeDays'];
      for (const field of numericFields) {
        if (typeof merchant[field as keyof typeof merchant] !== 'number') {
          toast.warning(`Merchant ${merchant.mid}: ${field} must be a number`);
          return;
        }
      }
      
      validMerchants.push(merchant as MerchantData);
    });
    
    if (validMerchants.length === 0) {
      toast.error("No valid merchant data found in the file");
      return;
    }
    
    const updatedMerchants = [...uploadedMerchants];
    
    validMerchants.forEach(newMerchant => {
      const existingIndex = updatedMerchants.findIndex(m => m.mid === newMerchant.mid);
      if (existingIndex >= 0) {
        updatedMerchants[existingIndex] = {
          ...newMerchant,
          application: updatedMerchants[existingIndex].application,
          spends: updatedMerchants[existingIndex].spends,
          warnings: updatedMerchants[existingIndex].warnings
        };
      } else {
        updatedMerchants.push(newMerchant);
      }
    });
    
    setUploadedMerchants(updatedMerchants);
    toast.success(`Successfully loaded ${validMerchants.length} merchant records`);
  };

  const validateAndUpdateApplicationStatus = (applicationData: any[]) => {
    if (applicationData.length === 0) {
      toast.error("No application data found in the file");
      return;
    }

    let updatedCount = 0;
    const updatedMerchants = [...uploadedMerchants];

    applicationData.forEach(data => {
      if (!data.mid) {
        toast.warning("Application data missing required MID field");
        return;
      }

      const merchantIndex = updatedMerchants.findIndex(m => m.mid === data.mid);
      if (merchantIndex === -1) {
        toast.warning(`Merchant with MID ${data.mid} not found`);
        return;
      }

      const validStatuses = ["not-started", "in-progress", "approved", "rejected"];
      if (data.status && !validStatuses.includes(data.status)) {
        toast.warning(`Invalid status "${data.status}" for merchant ${data.mid}`);
        return;
      }

      updatedMerchants[merchantIndex] = {
        ...updatedMerchants[merchantIndex],
        application: {
          status: data.status || "not-started",
          bankComments: Array.isArray(data.bankComments) ? data.bankComments : []
        }
      };
      updatedCount++;
    });

    if (updatedCount > 0) {
      setUploadedMerchants(updatedMerchants);
      toast.success(`Updated application data for ${updatedCount} merchants`);
    } else {
      toast.error("No merchant data was updated");
    }
  };

  const validateAndUpdateSpendData = (spendsData: any[]) => {
    if (spendsData.length === 0) {
      toast.error("No spends data found in the file");
      return;
    }

    let updatedCount = 0;
    const updatedMerchants = [...uploadedMerchants];

    spendsData.forEach(data => {
      if (!data.mid) {
        toast.warning("Spends data missing required MID field");
        return;
      }

      const merchantIndex = updatedMerchants.findIndex(m => m.mid === data.mid);
      if (merchantIndex === -1) {
        toast.warning(`Merchant with MID ${data.mid} not found`);
        return;
      }

      const validTrends = ["increasing", "decreasing", "stable", "null"];
      if (data.spendTrend && !validTrends.includes(data.spendTrend)) {
        toast.warning(`Invalid spendTrend "${data.spendTrend}" for merchant ${data.mid}`);
        return;
      }

      let monthlySpends: Array<{month: string; amount: number}> = [];
      if (data.monthlySpends) {
        if (!Array.isArray(data.monthlySpends)) {
          toast.warning(`Invalid monthlySpends format for merchant ${data.mid}`);
          return;
        }
        
        monthlySpends = data.monthlySpends.filter((spend: any) => 
          typeof spend === 'object' && 
          typeof spend.month === 'string' && 
          typeof spend.amount === 'number'
        );
      }

      updatedMerchants[merchantIndex] = {
        ...updatedMerchants[merchantIndex],
        spends: {
          totalSpend: data.totalSpend || "₹0",
          spendTrend: data.spendTrend || "null",
          monthlySpends: monthlySpends
        }
      };
      updatedCount++;
    });

    if (updatedCount > 0) {
      setUploadedMerchants(updatedMerchants);
      toast.success(`Updated spends data for ${updatedCount} merchants`);
    } else {
      toast.error("No merchant data was updated");
    }
  };

  const validateAndUpdateWarningData = (warningData: any[]) => {
    if (warningData.length === 0) {
      toast.error("No warning data found in the file");
      return;
    }

    let updatedCount = 0;
    const updatedMerchants = [...uploadedMerchants];

    warningData.forEach(data => {
      if (!data.mid) {
        toast.warning("Warning data missing required MID field");
        return;
      }

      const merchantIndex = updatedMerchants.findIndex(m => m.mid === data.mid);
      if (merchantIndex === -1) {
        toast.warning(`Merchant with MID ${data.mid} not found`);
        return;
      }

      const validRiskLevels = ["high", "medium", "low"];
      if (data.riskFlag && !validRiskLevels.includes(data.riskFlag)) {
        toast.warning(`Invalid riskFlag "${data.riskFlag}" for merchant ${data.mid}`);
        return;
      }

      let internalTriggers: Array<{name: string; severity: "high" | "medium" | "low"; details: string}> = [];
      if (data.internalTriggers) {
        if (!Array.isArray(data.internalTriggers)) {
          toast.warning(`Invalid internalTriggers format for merchant ${data.mid}`);
          return;
        }
        
        internalTriggers = data.internalTriggers.filter((trigger: any) => 
          typeof trigger === 'object' && 
          typeof trigger.name === 'string' && 
          validRiskLevels.includes(trigger.severity) &&
          typeof trigger.details === 'string'
        );
      }

      updatedMerchants[merchantIndex] = {
        ...updatedMerchants[merchantIndex],
        warnings: {
          riskFlag: data.riskFlag || "low",
          gmvDrop: typeof data.gmvDrop === 'number' ? data.gmvDrop : 0,
          spendsDrop: typeof data.spendsDrop === 'number' ? data.spendsDrop : 0,
          internalTriggers: internalTriggers
        }
      };
      updatedCount++;
    });

    if (updatedCount > 0) {
      setUploadedMerchants(updatedMerchants);
      toast.success(`Updated warning data for ${updatedCount} merchants`);
    } else {
      toast.error("No merchant data was updated");
    }
  };
  
  const handleSaveData = () => {
    onMerchantDataSave(uploadedMerchants);
    toast.success("Merchant data saved successfully!");
    setDataSaved(true);
  };

  const FileHistory = ({ files }: { files: UploadedFile[] }) => {
    if (files.length === 0) return (
      <div className="text-sm text-gray-500 mt-4">
        No files uploaded yet
      </div>
    );
    
    return (
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium">Recently Uploaded Files:</h4>
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-gray-50 border text-sm">
              <FileIcon className="h-4 w-4 text-gray-500" />
              <div className="flex-1 truncate">
                <div className="font-medium truncate">{file.name}</div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {file.date.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SavedFileInfo = ({ fileType }: { fileType: 'basic' | 'application' | 'spends' | 'warnings' }) => {
    const file = lastSavedFiles[fileType];
    
    if (!file || !dataSaved) return null;
    
    return (
      <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <div className="flex-1">
          <div className="text-sm font-medium text-green-700">Data saved successfully</div>
          <div className="text-xs text-green-600">
            File: {file.name} • {formatFileSize(file.size)} • Saved on {file.date.toLocaleString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Merchant Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" value={activeUploadTab} onValueChange={setActiveUploadTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="application">Application Status</TabsTrigger>
              <TabsTrigger value="spends">Spends Data</TabsTrigger>
              <TabsTrigger value="warnings">Warning Signals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <div className="flex flex-col space-y-2">
                <label htmlFor="merchant-file" className="text-sm font-medium">
                  Upload JSON or CSV file with merchant basic data
                </label>
                <div className="flex gap-2">
                  <input
                    id="merchant-file"
                    type="file"
                    accept=".json,.csv"
                    onChange={(e) => handleFileUpload(e, "basic")}
                    className="border rounded-md p-2 flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => downloadCSVTemplate()}
                    disabled={isLoading}
                  >
                    Download Template
                  </Button>
                </div>
                <div className="text-xs text-gray-500">
                  File must contain merchant data with at least: mid, businessCategory, pgVintage, businessType, averageMonthlyGMV, qoqGrowth, activeDays
                </div>
                <SavedFileInfo fileType="basic" />
                <FileHistory files={basicFiles} />
              </div>
            </TabsContent>
            
            <TabsContent value="application">
              <div className="flex flex-col space-y-2">
                <label htmlFor="application-file" className="text-sm font-medium">
                  Upload JSON or CSV file with application status data
                </label>
                <div className="flex gap-2">
                  <input
                    id="application-file"
                    type="file"
                    accept=".json,.csv"
                    onChange={(e) => handleFileUpload(e, "application")}
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
                <SavedFileInfo fileType="application" />
                <FileHistory files={applicationFiles} />
              </div>
            </TabsContent>
            
            <TabsContent value="spends">
              <div className="flex flex-col space-y-2">
                <label htmlFor="spends-file" className="text-sm font-medium">
                  Upload JSON or CSV file with spend data
                </label>
                <div className="flex gap-2">
                  <input
                    id="spends-file"
                    type="file"
                    accept=".json,.csv"
                    onChange={(e) => handleFileUpload(e, "spends")}
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
                <SavedFileInfo fileType="spends" />
                <FileHistory files={spendsFiles} />
              </div>
            </TabsContent>
            
            <TabsContent value="warnings">
              <div className="flex flex-col space-y-2">
                <label htmlFor="warnings-file" className="text-sm font-medium">
                  Upload JSON or CSV file with warning signals data
                </label>
                <div className="flex gap-2">
                  <input
                    id="warnings-file"
                    type="file"
                    accept=".json,.csv"
                    onChange={(e) => handleFileUpload(e, "warnings")}
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
                  File must contain warning data with at least: mid, riskFlag (high, medium, low), gmvDrop, spendsDrop, internalTriggers (array)
                </div>
                <SavedFileInfo fileType="warnings" />
                <FileHistory files={warningsFiles} />
              </div>
            </TabsContent>
          </Tabs>
          
          {uploadedMerchants.length > 0 && (
            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Uploaded Merchants ({uploadedMerchants.length})</h3>
                <Button 
                  onClick={handleSaveData}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save Data
                </Button>
              </div>
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
                    {uploadedMerchants.map((merchant) => (
                      <tr key={merchant.mid} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{merchant.mid}</td>
                        <td className="px-4 py-2 text-sm">{merchant.name || 'N/A'}</td>
                        <td className="px-4 py-2 text-sm">{merchant.businessType}</td>
                        <td className="px-4 py-2 text-sm">₹{merchant.averageMonthlyGMV.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedMerchant(merchant)}
                          >
                            Check Eligibility
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedMerchant && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Eligibility Check</CardTitle>
              <div className="text-sm text-gray-500">
                {selectedMerchant.name || selectedMerchant.mid}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <EnhancedEligibilityTab 
              eligibilityResult={evaluateEligibility(selectedMerchant)} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MerchantDataUpload;
