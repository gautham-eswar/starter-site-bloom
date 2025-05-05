
import React, { useState } from 'react';
import { Scissors, Mic, Bot, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define our feature data structure
interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
}

const FeaturesSection: React.FC = () => {
  // Features data with associated images
  const features: Feature[] = [
    {
      id: 'cut-fluff',
      icon: <Scissors className="text-draft-green dark:text-draft-yellow" size={20} />,
      title: 'Cut the fluff',
      description: "We trim what doesn't matter and spotlight what does — fast.",
      image: '/lovable-uploads/4888ffd5-758f-4167-9b6d-79e0225cc883.png'
    },
    {
      id: 'speak-language',
      icon: <Mic className="text-draft-green dark:text-draft-yellow" size={20} />,
      title: 'Speak their language',
      description: 'Match keywords and phrases from the job posting.',
      image: '/lovable-uploads/dea2fb25-e955-4057-9663-d39a1bb2a3a8.png'
    },
    {
      id: 'ats-friendly',
      icon: <Bot className="text-draft-green dark:text-draft-yellow" size={20} />,
      title: 'ATS-friendly by default',
      description: 'Designed to pass through Applicant Tracking Systems.',
      image: '/lovable-uploads/4888ffd5-758f-4167-9b6d-79e0225cc883.png'
    },
    {
      id: 'zero-guesswork',
      icon: <Search className="text-draft-green dark:text-draft-yellow" size={20} />,
      title: 'Zero guesswork',
      description: 'Follow our proven templates for guaranteed results.',
      image: '/lovable-uploads/dea2fb25-e955-4057-9663-d39a1bb2a3a8.png'
    }
  ];

  // State to track the currently selected feature
  const [selectedFeature, setSelectedFeature] = useState<string>(features[0].id);

  // Find the currently selected feature object
  const currentFeature = features.find(feature => feature.id === selectedFeature) || features[0];

  return (
    <section className="py-20 px-8 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="bg-[#f1f1eb] dark:bg-draft-green/30 px-4 py-2 rounded-md">
            <span className="text-draft-green dark:text-draft-yellow uppercase text-sm font-medium">What we offer</span>
          </div>
        </div>
        
        <h2 className="text-heading font-serif mb-12 text-center text-draft-green dark:text-draft-yellow">
          Build zero-effort resumes with DraftZero
        </h2>
        
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/5">
            <div className="flex flex-col gap-10">
              {features.map((feature) => (
                <div 
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature.id)}
                  className={cn(
                    "flex gap-4 items-start p-4 rounded-lg transition-all duration-200 cursor-pointer",
                    "hover:bg-[#EDEEE7] dark:hover:bg-draft-green/20",
                    selectedFeature === feature.id && "bg-[#EDEEE7] dark:bg-draft-green/20 border-l-4 border-draft-green dark:border-draft-yellow"
                  )}
                >
                  <div className="mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className={cn(
                      "font-medium",
                      selectedFeature === feature.id && "text-draft-green dark:text-draft-yellow"
                    )}>
                      {feature.title}
                    </h3>
                    <p className="text-draft-text dark:text-gray-300 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-3/5">
            <div className="bg-white dark:bg-draft-green/10 rounded-lg border border-gray-200 dark:border-draft-green/30 shadow-lg overflow-hidden transition-all duration-300 h-[515px]">
              <img 
                src={currentFeature.image} 
                alt={`${currentFeature.title} - DraftZero Feature`} 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
