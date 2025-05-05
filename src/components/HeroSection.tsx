
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const HeroSection: React.FC = () => {
  const [isWriteExpanded, setIsWriteExpanded] = useState(false);

  const toggleWriteExpanded = () => {
    setIsWriteExpanded(prev => !prev);
  };

  return (
    <section className="py-16 md:py-24 px-8 md:px-12 lg:px-20">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left side - Hero text */}
        <div className="lg:w-1/2 flex flex-col justify-center">
          <div className="max-w-2xl">
            <h1 className="text-title font-serif font-medium text-draft-green leading-tight">
              Build a resume that wins <span className="italic">every</span> time.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-draft-text opacity-90">
              Tailor your resume to match a job description in minutes
            </p>
          </div>
        </div>
        
        {/* Right side - How to section */}
        <div className="lg:w-1/2 relative">
          <div className="bg-[#f1f1eb] inline-block px-4 py-2 rounded-md mb-8">
            <span className="text-draft-green uppercase text-sm font-medium">How to</span>
          </div>
          
          <div className="flex flex-col gap-10">
            <div>
              <h3 className="text-xl font-medium flex items-baseline gap-2">
                <span className="text-draft-green">1.</span> Upload resume
              </h3>
              <p className="text-draft-text opacity-70 mt-1">We will use this resume as a base.</p>
              <Button variant="ghost" className="pl-0 mt-4 text-draft-green hover:bg-transparent hover:text-draft-green/80 flex items-center gap-1">
                Upload <ArrowRight size={16} />
              </Button>
            </div>
            
            <div>
              <h3 className="text-xl font-medium flex items-baseline gap-2">
                <span className="text-draft-green">2.</span> Upload job description
              </h3>
              <p className="text-draft-text opacity-70 mt-1">Tailor your resume to this job description.</p>
              
              {isWriteExpanded ? (
                <div className="mt-4 border border-draft-green rounded-md h-[200px] flex flex-col">
                  <Textarea 
                    placeholder="Add description" 
                    className="flex-1 border-none focus-visible:ring-0 text-draft-green resize-none"
                  />
                  <div className="border-t border-draft-green p-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={toggleWriteExpanded} 
                      className="p-0 hover:bg-transparent"
                    >
                      <ArrowLeft size={16} className="text-draft-green" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={toggleWriteExpanded} 
                  className="pl-0 mt-4 text-draft-green hover:bg-transparent hover:text-draft-green/80 flex items-center gap-1"
                >
                  Write <ArrowRight size={16} />
                </Button>
              )}
            </div>
            
            <Button className="bg-draft-green hover:bg-draft-green/90 text-white w-fit">
              Make it better
            </Button>
          </div>
          
          <div className="absolute -top-12 -right-12">
            <div className="shape-blob w-20 h-20 bg-draft-mint"></div>
          </div>
          <div className="absolute -bottom-4 -right-4">
            <div className="shape-blob w-16 h-16 bg-draft-coral"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
