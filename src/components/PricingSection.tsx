
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-16 px-8 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="bg-[#f1f1eb] dark:bg-draft-green/30 px-4 py-2 rounded-md">
            <span className="text-draft-green dark:text-draft-yellow uppercase text-sm font-medium">Pricing</span>
          </div>
        </div>
        
        <h2 className="text-heading font-serif mb-4 text-center text-draft-green dark:text-draft-yellow">
          Simple, transparent pricing
        </h2>
        
        <p className="text-lg text-center text-draft-text dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Choose the plan that works best for your career needs
        </p>

        <div className="flex items-center justify-center mb-12">
          <span className={`mr-3 ${isAnnual ? 'text-draft-text/60 dark:text-gray-400' : 'text-draft-green dark:text-draft-yellow font-medium'}`}>
            Monthly
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <span className={`ml-3 flex items-center ${!isAnnual ? 'text-draft-text/60 dark:text-gray-400' : 'text-draft-green dark:text-draft-yellow font-medium'}`}>
            Annual <Badge className="ml-2 bg-draft-yellow text-black font-normal">Save 20%</Badge>
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Basic Plan */}
          <Card className="border-draft-green/20 dark:border-draft-green/40">
            <CardHeader>
              <CardTitle className="text-draft-green dark:text-draft-yellow font-serif">Basic</CardTitle>
              <CardDescription>For occasional job seekers</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-draft-green dark:text-draft-yellow">${isAnnual ? '9' : '12'}</span>
                <span className="text-draft-text dark:text-gray-300 ml-1">{isAnnual ? '/month, billed annually' : '/month'}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check size={20} className="mr-2 text-draft-green dark:text-draft-yellow shrink-0 mt-0.5" />
                  <span>3 resume optimizations per month</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="mr-2 text-draft-green dark:text-draft-yellow shrink-0 mt-0.5" />
                  <span>Basic ATS compatibility score</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="mr-2 text-draft-green dark:text-draft-yellow shrink-0 mt-0.5" />
                  <span>PDF and Word exports</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-draft-green dark:border-draft-yellow text-draft-green dark:text-draft-yellow hover:bg-draft-green/10">
                Get Started
              </Button>
            </CardFooter>
          </Card>
          
          {/* Pro Plan */}
          <Card className="border-draft-green dark:border-draft-yellow relative md:scale-105">
            <div className="absolute top-0 left-0 right-0 h-1 bg-draft-green dark:bg-draft-yellow rounded-t-lg"></div>
            <Badge className="absolute -top-3 right-4 bg-draft-green dark:bg-draft-yellow text-white dark:text-black">Most Popular</Badge>
            <CardHeader>
              <CardTitle className="text-draft-green dark:text-draft-yellow font-serif">Pro</CardTitle>
              <CardDescription>For active job seekers</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-draft-green dark:text-draft-yellow">${isAnnual ? '19' : '24'}</span>
                <span className="text-draft-text dark:text-gray-300 ml-1">{isAnnual ? '/month, billed annually' : '/month'}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check size={20} className="mr-2 text-draft-green dark:text-draft-yellow shrink-0 mt-0.5" />
                  <span><strong>Unlimited</strong> resume optimizations</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="mr-2 text-draft-green dark:text-draft-yellow shrink-0 mt-0.5" />
                  <span>Advanced ATS compatibility score</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="mr-2 text-draft-green dark:text-draft-yellow shrink-0 mt-0.5" />
                  <span>Industry-specific keyword suggestions</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="mr-2 text-draft-green dark:text-draft-yellow shrink-0 mt-0.5" />
                  <span>All file formats + custom formatting</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-draft-green dark:bg-draft-yellow text-white dark:text-black hover:bg-draft-green/90 dark:hover:bg-draft-yellow/90">
                Get Started
              </Button>
            </CardFooter>
          </Card>
          
          {/* Enterprise Plan */}
          <Card className="border-draft-green/20 dark:border-draft-green/40">
            <CardHeader>
              <CardTitle className="text-draft-green dark:text-draft-yellow font-serif">Enterprise</CardTitle>
              <CardDescription>For teams and organizations</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-draft-green dark:text-draft-yellow">${isAnnual ? '39' : '49'}</span>
                <span className="text-draft-text dark:text-gray-300 ml-1">{isAnnual ? '/month, billed annually' : '/month'}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check size={20} className="mr-2 text-draft-green dark:text-draft-yellow shrink-0 mt-0.5" />
                  <span>Everything in Pro, plus:</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="mr-2 text-draft-green dark:text-draft-yellow shrink-0 mt-0.5" />
                  <span>Team management dashboard</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="mr-2 text-draft-green dark:text-draft-yellow shrink-0 mt-0.5" />
                  <span>Company branding integration</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="mr-2 text-draft-green dark:text-draft-yellow shrink-0 mt-0.5" />
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="mr-2 text-draft-green dark:text-draft-yellow shrink-0 mt-0.5" />
                  <span>Custom API integration</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-draft-green dark:border-draft-yellow text-draft-green dark:text-draft-yellow hover:bg-draft-green/10">
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
