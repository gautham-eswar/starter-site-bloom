
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
          {/* h2: text-3xl. Color from base heading styles. */}
          <h2 className="text-3xl mb-4">
            Simple, Transparent Pricing
          </h2>
          {/* p: text-base, text-muted-foreground. */}
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for you and start optimizing your resume today.
          </p>
          
          <div className="flex items-center justify-center mt-8">
            {/* Spans: text-sm font-medium text-foreground. */}
            <span className="mr-3 text-sm font-medium text-foreground">Monthly</span>
            <Switch 
              checked={isAnnual} 
              onCheckedChange={setIsAnnual} 
              className="data-[state=checked]:bg-primary" // Use primary for checked state
            />
            <span className="ml-3 text-sm font-medium text-foreground">
              Annual
              {/* Badge: bg-primary text-primary-foreground. */}
              <Badge className="ml-2 bg-primary text-primary-foreground font-medium">Save 20%</Badge>
            </span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <Card className="border hover:shadow-lg transition-shadow duration-300"> {/* Use default border */}
            <CardHeader>
              {/* CardTitle (h3): text-2xl. Color from base heading styles. */}
              <CardTitle className="text-2xl">Basic</CardTitle>
              {/* CardDescription: text-base text-muted-foreground. */}
              <CardDescription className="text-base text-muted-foreground">For individuals getting started</CardDescription>
              <div className="mt-4">
                {/* Price text: text-3xl font-bold text-primary. */}
                <span className="text-3xl font-bold text-primary dark:text-primary">
                  {isAnnual ? '$9' : '$12'}
                </span>
                {/* "/month" text: text-base text-muted-foreground. */}
                <span className="text-base text-muted-foreground ml-1">
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
                  // li: text-base text-foreground.
                  <li key={i} className="flex items-center text-base text-foreground">
                    {/* Check icon: text-primary. */}
                    <Check className="h-5 w-5 mr-2 text-primary dark:text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {/* Button: variant="default". */}
              <Button variant="default" className="w-full">
                Get Started
              </Button>
            </CardFooter>
          </Card>
          
          {/* Pro Plan */}
          {/* Pro Plan - border-primary for emphasis */}
          <Card className="border-2 border-primary dark:border-primary shadow-lg relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {/* Badge: bg-primary text-primary-foreground. */}
              <Badge className="bg-primary text-primary-foreground font-medium">
                Most Popular
              </Badge>
            </div>
            <CardHeader>
              {/* CardTitle (h3): text-2xl. Color from base heading styles. */}
              <CardTitle className="text-2xl">Pro</CardTitle>
              {/* CardDescription: text-base text-muted-foreground. */}
              <CardDescription className="text-base text-muted-foreground">For professionals seeking an edge</CardDescription>
              <div className="mt-4">
                {/* Price text: text-3xl font-bold text-primary. */}
                <span className="text-3xl font-bold text-primary dark:text-primary">
                  {isAnnual ? '$19' : '$24'}
                </span>
                {/* "/month" text: text-base text-muted-foreground. */}
                <span className="text-base text-muted-foreground ml-1">
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
                  // li: text-base text-foreground.
                  <li key={i} className="flex items-center text-base text-foreground">
                    {/* Check icon: text-primary. */}
                    <Check className="h-5 w-5 mr-2 text-primary dark:text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {/* Button: variant="default". */}
              <Button variant="default" className="w-full">
                Get Started
              </Button>
            </CardFooter>
          </Card>
          
          {/* Enterprise Plan */}
          <Card className="border hover:shadow-lg transition-shadow duration-300"> {/* Use default border */}
            <CardHeader>
              {/* CardTitle (h3): text-2xl. Color from base heading styles. */}
              <CardTitle className="text-2xl">Enterprise</CardTitle>
              {/* CardDescription: text-base text-muted-foreground. */}
              <CardDescription className="text-base text-muted-foreground">For teams and businesses</CardDescription>
              <div className="mt-4">
                {/* Price text: text-3xl font-bold text-primary. */}
                <span className="text-3xl font-bold text-primary dark:text-primary">
                  {isAnnual ? '$39' : '$49'}
                </span>
                {/* "/month" text: text-base text-muted-foreground. */}
                <span className="text-base text-muted-foreground ml-1">
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
                  // li: text-base text-foreground.
                  <li key={i} className="flex items-center text-base text-foreground">
                    {/* Check icon: text-primary. */}
                    <Check className="h-5 w-5 mr-2 text-primary dark:text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {/* Button: variant="default". */}
              <Button variant="default" className="w-full">
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-16 text-center">
          {/* p: text-base text-muted-foreground. */}
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            All plans include a 14-day free trial. No credit card required to start. 
            Need something different? <a href="#" className="text-primary dark:text-primary underline hover:no-underline">Contact us</a> for custom pricing.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
