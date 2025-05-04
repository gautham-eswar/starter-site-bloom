
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
      {/* Left side with illustrations */}
      <div className="md:w-1/2 relative flex items-center justify-center">
        <div className="relative w-full h-64 md:h-80 max-w-md mx-auto">
          {/* Center illustration - mint background with yellow shape */}
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="w-64 h-64 bg-draft-mint rounded-lg flex items-center justify-center">
              <div className="w-40 h-40 bg-draft-yellow shape-blob"></div>
            </div>
          </div>
          
          {/* Top right coral blob */}
          <div className="absolute right-4 top-4">
            <div className="w-20 h-20 bg-draft-coral shape-blob"></div>
          </div>
          
          {/* Bottom left purple blob */}
          <div className="absolute bottom-4 left-4">
            <div className="w-24 h-24 bg-draft-purple shape-blob"></div>
          </div>
        </div>
      </div>
      
      {/* Vertical divider line */}
      <div className="hidden md:block absolute left-1/2 h-full -ml-px">
        <Separator orientation="vertical" className="h-full bg-gray-300" />
      </div>
      
      {/* Right side content */}
      <div className="md:w-1/2 flex flex-col gap-8 md:pl-16 mt-8 md:mt-0">
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
                <div className="p-3 border-t border-draft-green">
                  <Button
                    variant="ghost"
                    onClick={toggleWriteSection}
                    className="text-draft-green hover:bg-transparent hover:text-draft-green/90"
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
    </section>
  );
};

export default HowToSection;
