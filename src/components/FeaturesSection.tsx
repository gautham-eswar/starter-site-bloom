
import React from 'react';
import { Scissors, Mic, Bot, Search } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 px-8 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#f1f1eb] inline-block px-4 py-2 rounded-md mb-8">
          <span className="text-draft-green uppercase text-sm font-medium">What we offer</span>
        </div>
        
        <h2 className="text-heading font-serif mb-12">
          Build zero-effort resumes with DraftZero
        </h2>
        
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/5">
            <div className="flex flex-col gap-10">
              <div className="flex gap-4 items-start">
                <div className="mt-1">
                  <Scissors className="text-draft-green" size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Cut the fluff</h3>
                  <p className="text-draft-text opacity-70 mt-1">
                    We trim what doesn't matter and spotlight what does — fast.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="mt-1">
                  <Mic className="text-draft-green" size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Speak their language</h3>
                  <p className="text-draft-text opacity-70 mt-1">
                    Match keywords and phrases from the job posting.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="mt-1">
                  <Bot className="text-draft-green" size={20} />
                </div>
                <div>
                  <h3 className="font-medium">ATS-friendly by default</h3>
                  <p className="text-draft-text opacity-70 mt-1">
                    Designed to pass through Applicant Tracking Systems.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="mt-1">
                  <Search className="text-draft-green" size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Zero guesswork</h3>
                  <p className="text-draft-text opacity-70 mt-1">
                    Follow our proven templates for guaranteed results.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-3/5">
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
              <img 
                src="/lovable-uploads/4888ffd5-758f-4167-9b6d-79e0225cc883.png" 
                alt="DraftZero Resume Builder Interface" 
                className="w-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
