
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HowToSection: React.FC = () => {
  return (
    <section className="flex flex-col md:flex-row gap-16 py-16 px-8 md:px-12 lg:px-20">
      <div className="md:w-1/2">
        {/* Left content remains empty, matching the design */}
      </div>
      
      <div className="md:w-1/2 flex flex-col gap-12">
        <div className="bg-[#f1f1eb] inline-self-start px-4 py-2 rounded-md">
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
            <Button variant="ghost" className="pl-0 mt-4 text-draft-green hover:bg-transparent hover:text-draft-green/80 flex items-center gap-1">
              Write <ArrowRight size={16} />
            </Button>
          </div>
          
          <Button className="bg-draft-green hover:bg-draft-green/90 text-white w-fit">
            Make it better
          </Button>
        </div>
        
        <div className="relative">
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

export default HowToSection;
