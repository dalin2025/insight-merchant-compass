
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MerchantData } from '@/types/eligibility';
import { evaluateEligibility } from '@/utils/eligibilityUtils';
import EnhancedEligibilityTab from './EnhancedEligibilityTab';
import { toast } from "sonner";
import { downloadCSVTemplate } from '@/utils/merchantDataUploadUtils';

interface MerchantDataUploadProps {
  savedMerchants: MerchantData[];
  onMerchantDataSave: (merchants: MerchantData[]) => void;
}

const MerchantDataUpload = ({ savedMerchants, onMerchantDataSave }: MerchantDataUploadProps) => {
  const [uploadedMerchants, setUploadedMerchants] = useState<MerchantData[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize with saved data
  useEffect(() => {
    if (savedMerchants.length > 0) {
      setUploadedMerchants(savedMerchants);
    }
  }, [savedMerchants]);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Handle JSON format
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          // Check if it's an array of merchants or a single merchant
          const merchants = Array.isArray(data) ? data : [data];
          validateAndSetMerchants(merchants);
        } 
        // Handle CSV format
        else if (file.name.endsWith('.csv')) {
          const merchants = parseCSV(content);
          validateAndSetMerchants(merchants);
        } 
        else {
          toast.error("Unsupported file format. Please upload JSON or CSV files.");
        }
      } catch (error) {
        console.error("Error processing file:", error);
        toast.error("Failed to process file. Please check the format.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      toast.error("Unsupported file format. Please upload JSON or CSV files.");
      setIsLoading(false);
    }
  };
  
  const parseCSV = (csvContent: string): Partial<MerchantData>[] => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',').map(value => value.trim());
      const merchant: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        let value = values[index];
        
        // Try to convert numeric values
        if (/^\d+(\.\d+)?$/.test(value)) {
          merchant[header] = parseFloat(value);
        } else if (value === 'true' || value === 'false') {
          merchant[header] = value === 'true';
        } else {
          merchant[header] = value;
        }
      });
      
      return merchant as Partial<MerchantData>;
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
      
      // Type check and conversion for businessType
      const validBusinessTypes = ["Private Limited", "Public Limited", "LLP", "Partnership", "Proprietorship"];
      if (!validBusinessTypes.includes(merchant.businessType as string)) {
        toast.warning(`Merchant ${merchant.mid}: Invalid business type "${merchant.businessType}"`);
        return;
      }
      
      // Ensure numeric fields are numbers
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
    
    // Update existing merchants or add new ones
    validMerchants.forEach(newMerchant => {
      const existingIndex = updatedMerchants.findIndex(m => m.mid === newMerchant.mid);
      if (existingIndex >= 0) {
        updatedMerchants[existingIndex] = newMerchant;
      } else {
        updatedMerchants.push(newMerchant);
      }
    });
    
    setUploadedMerchants(updatedMerchants);
    toast.success(`Successfully loaded ${validMerchants.length} merchant records`);
  };
  
  const handleSaveData = () => {
    onMerchantDataSave(uploadedMerchants);
    toast.success("Merchant data saved successfully!");
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Merchant Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="merchant-file" className="text-sm font-medium">
                Upload JSON or CSV file with merchant data
              </label>
              <div className="flex gap-2">
                <input
                  id="merchant-file"
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="border rounded-md p-2 flex-1"
                />
                <Button 
                  variant="outline"
                  onClick={() => downloadCSVTemplate()}
                >
                  Download Template
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                File must contain merchant data with at least: mid, businessCategory, pgVintage, businessType, averageMonthlyGMV, qoqGrowth, activeDays
              </div>
            </div>
            
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
          </div>
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
