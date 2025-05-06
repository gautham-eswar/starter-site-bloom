import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  return <section className="py-20 px-8 md:px-12 lg:px-20 bg-draft-bg">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-12 mx-0">
          <div className="bg-[#f1f1eb] dark:bg-draft-green/30 px-4 py-2 rounded-md mb-6">
            <span className="text-draft-green dark:text-draft-yellow uppercase text-sm font-medium">Plans & Pricing</span>
          </div>
          
          <h2 className="text-heading font-serif text-center mb-4 text-draft-green dark:text-draft-yellow">
            Choose the plan that fits your job hunt
          </h2>
          
          <div className="flex items-center justify-center mt-6 gap-2">
            
            
            
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="flex flex-col h-full">
            <Card className="flex flex-col h-full border border-[#1D5F5B]/20 dark:border-draft-green/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-white dark:bg-draft-green/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-draft-green dark:text-draft-yellow text-2xl font-serif">Free</CardTitle>
                <div className="mt-2 mb-1">
                  <span className="text-4xl font-serif text-draft-green dark:text-draft-yellow">$0</span>
                  <span className="text-draft-text/70 dark:text-gray-400">/mo</span>
                </div>
                <CardDescription className="text-draft-text dark:text-gray-300">
                  Just getting started? Try DraftZero completely free.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-draft-green dark:text-draft-yellow" />
                    <span className="text-draft-text dark:text-gray-300">3 resumes/month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-draft-green dark:text-draft-yellow" />
                    <span className="text-draft-text dark:text-gray-300">AI-powered rewrite engine</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-draft-green dark:text-draft-yellow" />
                    <span className="text-draft-text dark:text-gray-300">Keyword matching</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-draft-green dark:text-draft-yellow" />
                    <span className="text-draft-text dark:text-gray-300">Export to PDF</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button id="btn-free" className="w-full bg-draft-green hover:bg-draft-green/90 text-white dark:bg-draft-yellow dark:text-draft-green dark:hover:bg-draft-yellow/90 rounded-full font-serif">
                  Start for Free
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Standard Plan */}
          <div className="flex flex-col h-full">
            <Card className="flex flex-col h-full border-2 border-draft-coral dark:border-draft-coral/70 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-white dark:bg-draft-green/10 relative">
              <div className="absolute -top-3 right-4">
                <Badge className="bg-draft-coral text-white dark:bg-draft-coral/90 rounded-full px-3 py-1 text-xs uppercase font-medium">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-draft-green dark:text-draft-yellow text-2xl font-serif">Standard</CardTitle>
                <div className="mt-2 mb-1">
                  <span className="text-4xl font-serif text-draft-green dark:text-draft-yellow">$4.99</span>
                  <span className="text-draft-text/70 dark:text-gray-400">/mo</span>
                </div>
                <CardDescription className="text-draft-text dark:text-gray-300">
                  Our most popular plan — ideal for active job seekers.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-draft-coral" />
                    <span className="text-draft-text dark:text-gray-300">25 resumes/month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-draft-coral" />
                    <span className="text-draft-text dark:text-gray-300">All core features included</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-draft-coral" />
                    <span className="text-draft-text dark:text-gray-300">Export to PDF & Overleaf</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-draft-coral" />
                    <span className="text-draft-text dark:text-gray-300">Intelligent keyword tailoring</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-draft-coral" />
                    <span className="text-draft-text dark:text-gray-300">Advanced analytics <i>(coming soon)</i></span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button id="btn-standard" className="w-full bg-draft-coral hover:bg-draft-coral/90 text-white rounded-full font-serif">
                  Choose Standard
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Pro Plan */}
          <div className="flex flex-col h-full">
            <Card className="flex flex-col h-full border border-draft-purple/50 dark:border-draft-purple/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-white dark:bg-draft-green/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-draft-green dark:text-draft-yellow text-2xl font-serif">Pro</CardTitle>
                <div className="mt-2 mb-1">
                  <span className="text-4xl font-serif text-draft-green dark:text-draft-yellow">$8.99</span>
                  <span className="text-draft-text/70 dark:text-gray-400">/mo</span>
                </div>
                <CardDescription className="text-draft-text dark:text-gray-300">
                  Built for consultants, power users, or those applying in bulk.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-draft-purple" />
                    <span className="text-draft-text dark:text-gray-300">65 resumes/month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-draft-purple" />
                    <span className="text-draft-text dark:text-gray-300">All features unlocked</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-draft-purple" />
                    <span className="text-draft-text dark:text-gray-300">Export & resume history</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-draft-purple" />
                    <span className="text-draft-text dark:text-gray-300">Advanced analytics <i>(coming soon)</i></span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-draft-purple" />
                    <span className="text-draft-text dark:text-gray-300">Priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button id="btn-pro" className="w-full bg-draft-purple hover:bg-draft-purple/90 text-white rounded-full font-serif">
                  Go Pro
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>;
};
export default PricingSection;