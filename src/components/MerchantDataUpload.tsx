import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MerchantData } from '@/types/eligibility';
import { evaluateEligibility } from '@/utils/eligibilityUtils';
import EnhancedEligibilityTab from './EnhancedEligibilityTab';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadedFile } from './merchant-upload/FileHistoryDisplay';

import BasicInfoTab from './merchant-upload/BasicInfoTab';
import ApplicationTab from './merchant-upload/ApplicationTab';
import SpendsTab from './merchant-upload/SpendsTab';
import WarningsTab from './merchant-upload/WarningsTab';

import { parseCSV } from './merchant-upload/parseUtils';

interface MerchantDataUploadProps {
  savedMerchants: MerchantData[];
  onMerchantDataSave: (merchants: MerchantData[]) => void;
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

  const [applicationData, setApplicationData] = useState<Array<{
    mid: string;
    status: string;
    bankComments?: string[];
  }>>([]);
  
  const [spendsData, setSpendData] = useState<Array<{
    mid: string;
    totalSpend: string;
    spendTrend: string;
    monthlySpends: Array<{month: string; amount: number}>;
  }>>([]);
  
  const [warningsData, setWarningsData] = useState<Array<{
    mid: string;
    amgmv: number;
    amgmvAtIssuance: number;
    averageAmgmv: number;
    spendsDrop: number;
    internalTriggers: Array<{name: string; severity: "high" | "medium" | "low"; details: string}>;
  }>>([]);
  
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
      
      // Extract application data from saved merchants
      const appData = savedMerchants
        .filter(merchant => merchant.application)
        .map(merchant => ({
          mid: merchant.mid,
          status: merchant.application?.status || "not-started",
          bankComments: merchant.application?.bankComments || [],
          submittedDate: merchant.application?.submittedDate,
          underReviewDate: merchant.application?.underReviewDate,
          bankDecisionDate: merchant.application?.bankDecisionDate
        }));
      
      if (appData.length > 0) {
        setApplicationData(appData);
      }
      
      // Extract spends data
      const extractedSpendsData = savedMerchants
        .filter(merchant => merchant.spends)
        .map(merchant => ({
          mid: merchant.mid,
          totalSpend: merchant.spends?.totalSpend || "₹0",
          spendTrend: merchant.spends?.spendTrend || "null",
          monthlySpends: merchant.spends?.monthlySpends || []
        }));
        
      if (extractedSpendsData.length > 0) {
        setSpendData(extractedSpendsData);
      }
      
      // Extract warning signals data
      const extractedWarningsData = savedMerchants
        .filter(merchant => merchant.warnings)
        .map(merchant => ({
          mid: merchant.mid,
          amgmv: merchant.warnings?.amgmv || 0,
          amgmvAtIssuance: merchant.warnings?.amgmvAtIssuance || 0,
          averageAmgmv: merchant.warnings?.averageAmgmv || 0,
          spendsDrop: merchant.warnings?.spendsDrop || 0,
          internalTriggers: merchant.warnings?.internalTriggers || []
        }));
        
      if (extractedWarningsData.length > 0) {
        setWarningsData(extractedWarningsData);
      }
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
            validateAndUpdateWarningData(parseCSV(content, false, true));
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
    
    setLastSavedFiles(prev => ({
      ...prev,
      [fileType]: newFile
    }));
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
    const validAppData: Array<{
      mid: string;
      status: string;
      bankComments?: string[];
      submittedDate?: string;
      underReviewDate?: string;
      bankDecisionDate?: string;
    }> = [];

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

      const validAppItem = {
        mid: data.mid,
        status: data.status || "not-started",
        bankComments: Array.isArray(data.bankComments) ? data.bankComments : [],
        submittedDate: data.submittedDate || undefined,
        underReviewDate: data.underReviewDate || undefined,
        bankDecisionDate: data.bankDecisionDate || undefined
      };
      
      validAppData.push(validAppItem);

      updatedMerchants[merchantIndex] = {
        ...updatedMerchants[merchantIndex],
        application: {
          status: data.status || "not-started",
          bankComments: Array.isArray(data.bankComments) ? data.bankComments : [],
          submittedDate: data.submittedDate || undefined,
          underReviewDate: data.underReviewDate || undefined,
          bankDecisionDate: data.bankDecisionDate || undefined
        }
      };
      updatedCount++;
    });

    setApplicationData(validAppData);
    setUploadedMerchants(updatedMerchants); // Update the local state immediately

    if (updatedCount > 0) {
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
    const validSpendsData: Array<{
      mid: string;
      totalSpend: string;
      spendTrend: string;
      monthlySpends: Array<{month: string; amount: number}>;
    }> = [];

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

      const validSpendItem = {
        mid: data.mid,
        totalSpend: data.totalSpend || "₹0",
        spendTrend: data.spendTrend || "null",
        monthlySpends: monthlySpends
      };
      
      validSpendsData.push(validSpendItem);

      updatedMerchants[merchantIndex] = {
        ...updatedMerchants[merchantIndex],
        spends: validSpendItem
      };
      updatedCount++;
    });

    setSpendData(validSpendsData);

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
    const validWarningsData: Array<{
      mid: string;
      amgmv: number;
      amgmvAtIssuance: number;
      averageAmgmv: number;
      spendsDrop: number;
      internalTriggers: Array<{name: string; severity: "high" | "medium" | "low"; details: string}>;
    }> = [];

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

      // Validate numeric fields
      const amgmv = typeof data.amgmv === 'number' ? data.amgmv : 0;
      const amgmvAtIssuance = typeof data.amgmvAtIssuance === 'number' ? data.amgmvAtIssuance : 0;
      const averageAmgmv = typeof data.averageAmgmv === 'number' ? data.averageAmgmv : 0;
      const spendsDrop = typeof data.spendsDrop === 'number' ? data.spendsDrop : 0;

      // Process internal triggers
      let internalTriggers: Array<{name: string; severity: "high" | "medium" | "low"; details: string}> = [];
      if (data.internalTriggers) {
        if (!Array.isArray(data.internalTriggers)) {
          toast.warning(`Invalid internalTriggers format for merchant ${data.mid}`);
          return;
        }
        
        const validRiskLevels = ["high", "medium", "low"] as const;
        const parsedTriggers = [];
        for (const trigger of data.internalTriggers) {
          if (typeof trigger !== 'object') {
            continue;
          }
          
          const severity = trigger.severity;
          if (!validRiskLevels.includes(severity)) {
            toast.warning(`Invalid severity "${severity}" in trigger for merchant ${data.mid}`);
            continue;
          }
          
          parsedTriggers.push({
            name: trigger.name || '',
            severity: severity as "high" | "medium" | "low",
            details: trigger.details || ''
          });
        }
        internalTriggers = parsedTriggers;
      }

      const validWarningItem = {
        mid: data.mid,
        amgmv: amgmv,
        amgmvAtIssuance: amgmvAtIssuance,
        averageAmgmv: averageAmgmv,
        spendsDrop: spendsDrop,
        internalTriggers: internalTriggers
      };
      
      validWarningsData.push(validWarningItem);

      updatedMerchants[merchantIndex] = {
        ...updatedMerchants[merchantIndex],
        warnings: validWarningItem
      };
      updatedCount++;
    });

    setWarningsData(validWarningsData);

    if (updatedCount > 0) {
      setUploadedMerchants(updatedMerchants);
      toast.success(`Updated warning data for ${updatedCount} merchants`);
    } else {
      toast.error("No merchant data was updated");
    }
  };
  
  const handleSaveData = async () => {
    try {
      const { saveMerchantData } = await import('@/utils/databaseUtils');
      await saveMerchantData(uploadedMerchants);
      onMerchantDataSave(uploadedMerchants);
      toast.success("Merchant data saved successfully!");
      setDataSaved(true);
    } catch (error) {
      console.error("Error saving merchant data:", error);
      toast.error("Failed to save merchant data. Please try again.");
    }
  };

  const handleApplicationSaveData = () => {
    handleSaveData();
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
              <BasicInfoTab
                isLoading={isLoading}
                uploadedMerchants={uploadedMerchants}
                basicFiles={basicFiles}
                lastSavedFile={lastSavedFiles.basic}
                dataSaved={dataSaved}
                onFileUpload={(e) => handleFileUpload(e, "basic")}
                onSaveData={handleSaveData}
                onSelectMerchant={setSelectedMerchant}
              />
            </TabsContent>
            
            <TabsContent value="application">
              <ApplicationTab
                isLoading={isLoading}
                applicationFiles={applicationFiles}
                lastSavedFile={lastSavedFiles.application}
                dataSaved={dataSaved}
                applicationData={applicationData}
                onFileUpload={(e) => handleFileUpload(e, "application")}
                onSaveData={handleApplicationSaveData}
              />
            </TabsContent>
            
            <TabsContent value="spends">
              <SpendsTab
                isLoading={isLoading}
                spendsFiles={spendsFiles}
                lastSavedFile={lastSavedFiles.spends}
                dataSaved={dataSaved}
                spendsData={spendsData}
                onFileUpload={(e) => handleFileUpload(e, "spends")}
                onSaveData={handleSaveData}
              />
            </TabsContent>
            
            <TabsContent value="warnings">
              <WarningsTab
                isLoading={isLoading}
                warningsFiles={warningsFiles}
                lastSavedFile={lastSavedFiles.warnings}
                dataSaved={dataSaved}
                warningsData={warningsData}
                onFileUpload={(e) => handleFileUpload(e, "warnings")}
                onSaveData={handleSaveData}
              />
            </TabsContent>
          </Tabs>
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
