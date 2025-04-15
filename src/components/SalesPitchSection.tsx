
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { MerchantData } from "@/types/eligibility";
import { useToast } from "@/hooks/use-toast";

interface SalesPitchSectionProps {
  merchantData: MerchantData;
  isEligible: boolean;
}

const generatePrompt = (merchantData: MerchantData, isEligible: boolean) => {
  return `You are a sales expert tasked with crafting a compelling pitch for a corporate card to a business that uses a payment gateway. ${
    !isEligible ? "Note that this business is currently ineligible for standard approval, so focus on alternative paths like security deposit-backed cards or future eligibility." : ""
  }

Business Details:
- MID: ${merchantData.mid}
- Business Category: ${merchantData.businessCategory}
- PG Vintage: ${(merchantData.pgVintage / 12).toFixed(1)} years
- Business Type: ${merchantData.businessType}
- Average Monthly GMV: ₹${merchantData.averageMonthlyGMV.toLocaleString('en-IN')}
- QoQ Growth: ${merchantData.qoqGrowth}%
- Active Days per Month: ${merchantData.activeDays}

Please create a concise, data-driven sales pitch that:
1. Addresses their specific business profile and needs
2. Highlights relevant benefits based on their usage patterns
3. ${isEligible ? 
     "Emphasizes their pre-qualification and streamlined approval process" : 
     "Explains alternative paths to approval and growth opportunities"
   }
4. Provides clear next steps

Maintain a professional and persuasive tone. Keep the response under 400 words.`;
};

// Function to generate a pitch locally based on the merchant data
const generateLocalPitch = (merchantData: MerchantData, isEligible: boolean): string => {
  const businessCategory = merchantData.businessCategory.toLowerCase();
  const businessType = merchantData.businessType;
  const averageMonthlyGMV = merchantData.averageMonthlyGMV;
  const qoqGrowth = merchantData.qoqGrowth;
  const pgVintageYears = (merchantData.pgVintage / 12).toFixed(1);
  
  // Customize intro based on eligibility
  let pitch = isEligible 
    ? `Dear ${businessType} Business Owner,\n\nCongratulations! Based on your solid track record with our payment gateway for the past ${pgVintageYears} years, you're pre-qualified for our exclusive Corporate Card offering.\n\n`
    : `Dear ${businessType} Business Owner,\n\nThank you for your interest in our Corporate Card solution. While reviewing your business profile, we've identified some alternative options that could be valuable for your ${businessCategory} business.\n\n`;
  
  // Add business-specific benefits
  pitch += `For your ${businessCategory} business processing ₹${averageMonthlyGMV.toLocaleString('en-IN')} monthly, our card delivers:\n\n`;
  
  // Add tailored benefits based on business category and metrics
  if (averageMonthlyGMV > 500000) {
    pitch += "• Premium cashback rates on all business expenses\n";
    pitch += "• Extended 45-day interest-free credit period\n";
  } else {
    pitch += "• Competitive cashback rates on all business expenses\n";
    pitch += "• Standard 30-day interest-free credit period\n";
  }
  
  if (qoqGrowth > 10) {
    pitch += `• Scalable credit limits that grow with your impressive ${qoqGrowth}% quarterly growth\n`;
  } else {
    pitch += "• Stable credit limits with periodic reviews for increases\n";
  }
  
  // Add category-specific benefits
  if (businessCategory.includes("retail") || businessCategory.includes("shop")) {
    pitch += "• Enhanced rewards on inventory and supply chain expenses\n";
    pitch += "• Special merchant discounts at wholesale partners\n";
  } else if (businessCategory.includes("restaurant") || businessCategory.includes("food")) {
    pitch += "• Special rewards on food and beverage suppliers\n";
    pitch += "• Integrated expense management for multiple locations\n";
  } else if (businessCategory.includes("tech") || businessCategory.includes("software")) {
    pitch += "• Special benefits for SaaS subscriptions and cloud services\n";
    pitch += "• Tech-forward expense tracking and management tools\n";
  } else {
    pitch += "• Category-specific rewards tailored to your business needs\n";
    pitch += "• Integrated expense tracking and management tools\n";
  }
  
  // Add next steps based on eligibility
  if (isEligible) {
    pitch += "\nNext Steps:\n";
    pitch += "1. Complete our streamlined application (takes just 5 minutes)\n";
    pitch += "2. Receive your digital card instantly upon approval\n";
    pitch += "3. Physical card will be delivered within 3-5 business days\n";
    pitch += "4. Start enjoying all benefits immediately\n\n";
    pitch += "As a pre-qualified customer, your application process will be expedited with minimal documentation requirements.";
  } else {
    pitch += "\nAlternative Paths:\n";
    pitch += "1. Security deposit-backed card with 80% of deposit as your credit limit\n";
    pitch += "2. Starter business card with gradually increasing limits\n";
    pitch += "3. Co-branded card with specialized benefits for your business category\n\n";
    pitch += "Let's schedule a consultation to discuss which option best suits your business needs and growth objectives.";
  }
  
  return pitch;
};

const SalesPitchSection = ({ merchantData, isEligible }: SalesPitchSectionProps) => {
  const [pitch, setPitch] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateSalesPitch = async () => {
    try {
      setIsLoading(true);
      
      // Generate pitch locally instead of API call
      setTimeout(() => {
        const generatedPitch = generateLocalPitch(merchantData, isEligible);
        setPitch(generatedPitch);
        toast({
          title: "Success",
          description: "Sales pitch generated successfully",
        });
        setIsLoading(false);
      }, 1000); // Adding a small delay to simulate processing
      
    } catch (error) {
      console.error('Error generating sales pitch:', error);
      toast({
        title: "Error",
        description: "Failed to generate sales pitch. Please try again later.",
        variant: "destructive",
      });
      setPitch("Failed to generate sales pitch. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>AI-Generated Sales Pitch</span>
          <Button 
            onClick={generateSalesPitch}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Pitch'
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pitch ? (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{pitch}</div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Click "Generate Pitch" to create a personalized sales pitch based on the merchant's profile and eligibility status.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesPitchSection;
