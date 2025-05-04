
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const HowToSection: React.FC = () => {
  return (
    <section className="flex flex-col md:flex-row gap-16 py-16 px-8 md:px-12 lg:px-20 relative">
      <div className="md:w-1/2 relative">
        {/* Left side illustration - similar to the one in the image but using existing styles */}
      </div>
      
      {/* Vertical divider line */}
      <div className="hidden md:block absolute left-1/2 h-full -ml-px">
        <Separator orientation="vertical" className="h-full bg-gray-200" />
      </div>
      
      <div className="md:w-1/2 flex flex-col gap-12 md:pl-16">
        <div className="bg-[#f1f1eb] inline-self-start px-6 py-2 rounded-full">
          <span className="text-draft-green uppercase text-sm font-semibold">HOW TO</span>
        </div>
        
        <div className="flex flex-col gap-12">
          {/* Step 1 */}
          <div>
            <h3 className="text-2xl font-medium flex items-baseline gap-2 text-draft-green">
              <span>1.</span> Upload resume
            </h3>
            <p className="text-draft-text mt-3">We will use this resume as a base.</p>
            
            {/* Button with border */}
            <Button 
              variant="outline" 
              className="mt-6 border border-draft-green text-draft-green hover:bg-transparent hover:text-draft-green/90 px-6"
            >
              Upload <ArrowRight className="ml-2" size={16} />
            </Button>
            
            {/* Step 1 illustration */}
            <div className="absolute right-20 top-40 hidden md:block">
              <div className="relative w-36 h-36 bg-draft-mint rounded-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-draft-yellow rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Horizontal separator */}
          <Separator className="bg-gray-200" />
          
          {/* Step 2 */}
          <div>
            <h3 className="text-2xl font-medium flex items-baseline gap-2 text-draft-green">
              <span>2.</span> Upload job description
            </h3>
            <p className="text-draft-text mt-3">Tailor your resume to this job description.</p>
            
            {/* Button with border */}
            <Button 
              variant="outline" 
              className="mt-6 border border-draft-green text-draft-green hover:bg-transparent hover:text-draft-green/90 px-6"
            >
              Write <ArrowRight className="ml-2" size={16} />
            </Button>
            
            {/* Step 2 illustration */}
            <div className="absolute right-20 bottom-40 hidden md:block">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-draft-coral rounded-full"></div>
                <div className="w-16 h-16 bg-draft-purple rounded-full mt-6"></div>
              </div>
            </div>
          </div>
          
          {/* Horizontal separator */}
          <Separator className="bg-gray-200" />
          
          {/* Final button */}
          <Button className="bg-draft-green hover:bg-draft-green/90 text-white w-fit mx-auto md:mx-0 px-8 py-6">
            Make it better
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowToSection;
