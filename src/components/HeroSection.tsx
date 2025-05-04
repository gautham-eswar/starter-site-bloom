
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const HeroSection: React.FC = () => {
  const [isTextAreaExpanded, setIsTextAreaExpanded] = useState(false);

  const toggleTextArea = () => {
    setIsTextAreaExpanded(!isTextAreaExpanded);
  };

  return (
    <section className="relative bg-draft-bg py-16 md:py-24 px-8 md:px-12 lg:px-20">
      <div className="flex flex-col md:flex-row gap-16">
        {/* Left side with text content */}
        <div className="md:w-1/2 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-title font-serif font-medium text-draft-text leading-tight">
            Make your resume 10x<br />better in seconds
          </h1>
          
          <p className="text-lg text-draft-text mt-8 max-w-md">
            Upload your resume and job application, and our AI will make your resume better than 90% of other applicants.
          </p>
          
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <Button className="bg-draft-green hover:bg-draft-green/90 text-white px-6 py-6 rounded-full">
              Get started
            </Button>
            
            {/* Expandable Write button/text area */}
            {isTextAreaExpanded ? (
              <div className="mt-2 border border-draft-green rounded-md overflow-hidden">
                <Textarea 
                  placeholder="Add description" 
                  className="border-none h-[200px] focus-visible:ring-0 focus-visible:ring-offset-0 text-draft-green" 
                />
                <div className="p-3 border-t border-draft-green flex items-center">
                  <Button
                    variant="ghost"
                    onClick={toggleTextArea}
                    className="text-draft-green hover:bg-transparent hover:text-draft-green/90 p-0"
                  >
                    <ArrowLeft size={16} />
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                className="pl-0 mt-4 text-draft-green hover:bg-transparent hover:text-draft-green/80 flex items-center gap-1"
                onClick={toggleTextArea}
              >
                Write <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </div>
        
        {/* Right side with image */}
        <div className="md:w-1/2 flex items-center justify-center">
          <img 
            src="/lovable-uploads/4888ffd5-758f-4167-9b6d-79e0225cc883.png" 
            alt="Resume screenshot" 
            className="max-w-full"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
