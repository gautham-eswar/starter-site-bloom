
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

const HowToSection: React.FC = () => {
  const [isWriteExpanded, setIsWriteExpanded] = useState(false);
  
  const toggleWriteSection = () => {
    setIsWriteExpanded(!isWriteExpanded);
  };

  return (
    <section className="flex flex-col md:flex-row py-16 px-8 md:px-12 lg:px-20 relative bg-draft-bg">
      {/* Left side content */}
      <div className="md:w-1/2 flex flex-col gap-8 md:pr-16">
        {/* How To Badge */}
        <Badge className="bg-[#f1f1eb] text-draft-green hover:bg-[#f1f1eb] rounded-full px-6 py-2 w-fit uppercase font-semibold text-sm">
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
              className="mt-6 border border-draft-green text-draft-green hover:bg-transparent hover:text-draft-green/90 px-6 rounded-full"
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
            
            {/* Expandable text area section */}
            {isWriteExpanded ? (
              <div className="mt-6 border border-draft-green rounded-md overflow-hidden">
                <Textarea 
                  placeholder="Add description" 
                  className="border-none h-[200px] focus-visible:ring-0 focus-visible:ring-offset-0 text-draft-green" 
                />
                <div className="p-3 border-t border-draft-green flex items-center">
                  <Button
                    variant="ghost"
                    onClick={toggleWriteSection}
                    className="text-draft-green hover:bg-transparent hover:text-draft-green/90 p-0"
                  >
                    <ArrowLeft size={16} />
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="mt-6 border border-draft-green text-draft-green hover:bg-transparent hover:text-draft-green/90 px-6 rounded-full"
                onClick={toggleWriteSection}
              >
                Write <ArrowRight className="ml-2" size={16} />
              </Button>
            )}
          </div>
          
          {/* Horizontal separator */}
          <Separator className="bg-gray-300" />
          
          {/* Final button */}
          <Button className="bg-draft-green hover:bg-draft-green/90 text-white w-fit mx-auto md:mx-0 px-8 py-6 rounded-full">
            Make it better
          </Button>
        </div>
      </div>
      
      {/* Vertical divider line */}
      <div className="hidden md:block absolute left-1/2 h-full -ml-px">
        <Separator orientation="vertical" className="h-full bg-gray-300" />
      </div>
      
      {/* Right side with illustrations */}
      <div className="md:w-1/2 mt-12 md:mt-0 md:pl-16 flex items-center justify-center">
        {/* First illustration (top) */}
        <div className="relative w-full max-w-md mx-auto">
          <div className="w-[300px] h-[300px] bg-draft-mint rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-[200px] h-[200px] bg-draft-yellow shape-blob"></div>
          </div>
          
          {/* Second illustration (bottom) - based on provided CSS */}
          <div className="absolute bottom-8 right-16 flex flex-row justify-center items-center p-2 gap-2 isolation-isolate">
            {/* Purple vector */}
            <div className="absolute w-[58px] h-[58px] right-8 top-5 bg-[#E1D1F9] rounded-full z-0"></div>
            
            {/* Orange vector */}
            <div className="absolute w-[87px] h-[87px] left-0 top-[23px] bg-[#F29C77] rounded-full z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToSection;
