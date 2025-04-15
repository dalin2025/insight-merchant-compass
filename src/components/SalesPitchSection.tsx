
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { MerchantData } from "@/types/eligibility";

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

const SalesPitchSection = ({ merchantData, isEligible }: SalesPitchSectionProps) => {
  const [pitch, setPitch] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const generateSalesPitch = async () => {
    try {
      setIsLoading(true);
      const prompt = generatePrompt(merchantData, isEligible);
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a professional sales expert who creates compelling, data-driven pitches.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate sales pitch');
      }

      const data = await response.json();
      setPitch(data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating sales pitch:', error);
      setPitch("Failed to generate sales pitch. Please try again later.");
    } finally {
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
        {pitch ? (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap">{pitch}</div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            Click the "Generate Pitch" button to create a personalized sales pitch based on the merchant's profile and eligibility status.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesPitchSection;
