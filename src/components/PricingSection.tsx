
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  
  return (
    <section className="py-24 bg-draft-bg dark:bg-[#0A2218]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-heading font-serif mb-4 text-draft-green dark:text-draft-yellow">
            Simple, Transparent Pricing
          </h2>
          <p className="text-draft-text dark:text-gray-300 max-w-2xl mx-auto text-lg font-serif">
            Choose the plan that's right for you and start optimizing your resume today.
          </p>
          
          <div className="flex items-center justify-center mt-8">
            <span className="mr-3 text-sm font-medium text-draft-green dark:text-gray-300 font-serif">Monthly</span>
            <Switch 
              checked={isAnnual} 
              onCheckedChange={setIsAnnual} 
              className="data-[state=checked]:bg-draft-green"
            />
            <span className="ml-3 text-sm font-medium text-draft-green dark:text-gray-300 font-serif">
              Annual
              <Badge className="ml-2 bg-draft-yellow text-draft-green font-medium">Save 20%</Badge>
            </span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <Card className="border border-gray-200 dark:border-draft-green/30 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-draft-green dark:text-draft-yellow font-serif">Basic</CardTitle>
              <CardDescription className="font-serif">For individuals getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-draft-green dark:text-draft-yellow font-serif">
                  {isAnnual ? '$9' : '$12'}
                </span>
                <span className="text-draft-text dark:text-gray-300 ml-1 font-serif">
                  /{isAnnual ? 'month, billed annually' : 'month'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  'Resume ATS Optimization',
                  'Basic Keyword Analysis',
                  '3 Resume Exports per Month',
                  'Email Support'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center font-serif">
                    <Check className="h-5 w-5 mr-2 text-draft-green dark:text-draft-yellow" />
                    <span className="text-draft-text dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-draft-green hover:bg-draft-green/90 text-white dark:bg-draft-yellow dark:text-draft-green dark:hover:bg-draft-yellow/90 font-serif">
                Get Started
              </Button>
            </CardFooter>
          </Card>
          
          {/* Pro Plan */}
          <Card className="border-2 border-draft-green dark:border-draft-yellow shadow-lg relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Badge className="bg-draft-green text-white dark:bg-draft-yellow dark:text-draft-green font-serif">
                Most Popular
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-draft-green dark:text-draft-yellow font-serif">Pro</CardTitle>
              <CardDescription className="font-serif">For professionals seeking an edge</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-draft-green dark:text-draft-yellow font-serif">
                  {isAnnual ? '$19' : '$24'}
                </span>
                <span className="text-draft-text dark:text-gray-300 ml-1 font-serif">
                  /{isAnnual ? 'month, billed annually' : 'month'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  'Everything in Basic',
                  'Advanced ATS Algorithm',
                  'Industry-Specific Optimization',
                  'Unlimited Resume Exports',
                  'Priority Email Support',
                  'Job Match Recommendations'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center font-serif">
                    <Check className="h-5 w-5 mr-2 text-draft-green dark:text-draft-yellow" />
                    <span className="text-draft-text dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-draft-green hover:bg-draft-green/90 text-white dark:bg-draft-yellow dark:text-draft-green dark:hover:bg-draft-yellow/90 font-serif">
                Get Started
              </Button>
            </CardFooter>
          </Card>
          
          {/* Enterprise Plan */}
          <Card className="border border-gray-200 dark:border-draft-green/30 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-draft-green dark:text-draft-yellow font-serif">Enterprise</CardTitle>
              <CardDescription className="font-serif">For teams and businesses</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-draft-green dark:text-draft-yellow font-serif">
                  {isAnnual ? '$39' : '$49'}
                </span>
                <span className="text-draft-text dark:text-gray-300 ml-1 font-serif">
                  /{isAnnual ? 'month, billed annually' : 'month'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  'Everything in Pro',
                  'Team Management Dashboard',
                  'Custom Integration Options',
                  'Resume Performance Analytics',
                  'Dedicated Account Manager',
                  'API Access',
                  'Custom Branding'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center font-serif">
                    <Check className="h-5 w-5 mr-2 text-draft-green dark:text-draft-yellow" />
                    <span className="text-draft-text dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-draft-green hover:bg-draft-green/90 text-white dark:bg-draft-yellow dark:text-draft-green dark:hover:bg-draft-yellow/90 font-serif">
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-draft-text dark:text-gray-300 max-w-2xl mx-auto font-serif">
            All plans include a 14-day free trial. No credit card required to start. 
            Need something different? <a href="#" className="text-draft-green dark:text-draft-yellow underline hover:no-underline font-serif">Contact us</a> for custom pricing.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
