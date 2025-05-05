
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left side - Hero text */}
        <div className="flex flex-col justify-center lg:sticky lg:top-24 lg:self-start">
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
        <div className="relative">
          <div className="bg-[#f1f1eb] inline-block px-4 py-2 rounded-md mb-8">
            <span className="text-draft-green uppercase text-sm font-medium">How to</span>
          </div>
          
          <div className="flex flex-col gap-10">
            <div className="relative flex items-center h-24">
              <div>
                <h3 className="text-xl font-medium flex items-baseline gap-2">
                  <span className="text-draft-green">1.</span> Upload resume
                </h3>
                <p className="text-draft-text opacity-70 mt-1">We will use this resume as a base.</p>
                <Button variant="ghost" className="pl-0 mt-4 text-draft-green hover:bg-transparent hover:text-draft-green/80 flex items-center gap-1">
                  Upload <ArrowRight size={16} />
                </Button>
              </div>
              <div className="absolute right-0 h-full flex items-center">
                <img 
                  src="/lovable-uploads/c5522b82-cbba-4967-b071-9464b0ddf692.png" 
                  alt="Decorative element" 
                  className="w-24 h-24" 
                />
              </div>
            </div>
            
            <div className="relative">
              <div className="flex items-center h-24 relative">
                <div>
                  <h3 className="text-xl font-medium flex items-baseline gap-2">
                    <span className="text-draft-green">2.</span> Upload job description
                  </h3>
                  <p className="text-draft-text opacity-70 mt-1">Tailor your resume to this job description.</p>
                </div>
                <div className="absolute right-0 h-full flex items-center">
                  <img 
                    src="/lovable-uploads/fcc43085-9c29-4c70-8944-9781978da937.png" 
                    alt="Decorative element" 
                    className="w-24 h-24" 
                  />
                </div>
              </div>
              
              <div className="mt-4 h-[200px]">
                {isWriteExpanded ? (
                  <div className="border border-draft-green rounded-md h-full flex flex-col transition-all duration-300 ease-in-out animate-fade-in">
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
                  <div className="h-full flex items-start">
                    <Button 
                      variant="ghost" 
                      onClick={toggleWriteExpanded} 
                      className="pl-0 text-draft-green hover:bg-transparent hover:text-draft-green/80 flex items-center gap-1"
                    >
                      Write <ArrowRight size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <Button className="bg-draft-green hover:bg-draft-green/90 text-white w-fit">
              Make it better
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
