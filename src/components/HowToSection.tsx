
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const HowToSection: React.FC = () => {
  return (
    <section className="flex flex-col md:flex-row gap-16 py-16 px-8 md:px-12 lg:px-20 relative bg-draft-bg">
      {/* Left side with illustrations */}
      <div className="md:w-1/2 relative flex items-center justify-center">
        <div className="relative w-full h-64 md:h-80 max-w-md mx-auto">
          {/* Center circle */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 bg-draft-mint rounded-full flex items-center justify-center">
              <div className="w-20 h-20 bg-draft-yellow rounded-full"></div>
            </div>
          </div>
          
          {/* Top left shape */}
          <div className="absolute left-10 top-6">
            <div className="w-16 h-16 bg-draft-coral rounded-full"></div>
          </div>
          
          {/* Bottom right shape */}
          <div className="absolute right-10 bottom-6">
            <div className="w-16 h-16 bg-draft-purple rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Vertical divider line */}
      <div className="hidden md:block absolute left-1/2 h-full -ml-px">
        <Separator orientation="vertical" className="h-full bg-gray-300" />
      </div>
      
      {/* Right side content */}
      <div className="md:w-1/2 flex flex-col gap-8 md:pl-16">
        {/* How To Badge */}
        <Badge className="bg-[#f1f1eb] text-draft-green hover:bg-[#f1f1eb] rounded-full px-6 py-2 w-fit uppercase font-semibold">
          HOW TO
        </Badge>
        
        <div className="flex flex-col gap-8">
          {/* Step 1 */}
          <div>
            <h3 className="text-2xl font-medium flex items-baseline gap-2 text-draft-green">
              <span>1.</span> Upload resume
            </h3>
            <p className="text-draft-text mt-3">We will use this resume as a base.</p>
            
            {/* Button with border */}
            <Button 
              variant="outline" 
              className="mt-6 border-2 border-draft-green text-draft-green hover:bg-transparent hover:text-draft-green/90 px-6 rounded-full"
            >
              Upload <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
          
          {/* Horizontal separator */}
          <Separator className="bg-gray-300" />
          
          {/* Step 2 */}
          <div>
            <h3 className="text-2xl font-medium flex items-baseline gap-2 text-draft-green">
              <span>2.</span> Upload job description
            </h3>
            <p className="text-draft-text mt-3">Tailor your resume to this job description.</p>
            
            {/* Button with border */}
            <Button 
              variant="outline" 
              className="mt-6 border-2 border-draft-green text-draft-green hover:bg-transparent hover:text-draft-green/90 px-6 rounded-full"
            >
              Write <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
          
          {/* Horizontal separator */}
          <Separator className="bg-gray-300" />
          
          {/* Final button */}
          <Button className="bg-draft-green hover:bg-draft-green/90 text-white w-fit mx-auto md:mx-0 px-8 py-6 rounded-full">
            Make it better
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowToSection;
