
import React, { useState } from 'react';
import { Brain, Scale, Cog, Fingerprint, Trophy } from 'lucide-react';
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
  const features: Feature[] = [{
    id: 'semantic-intelligence',
    icon: <Brain className="text-draft-green dark:text-draft-yellow" size={24} />,
    title: 'Semantic Intelligence Engine™',
    description: "Our algorithm understands meaning, not just keywords. 83% of recruiters prioritize context over exact term matches.",
    image: '/lovable-uploads/4888ffd5-758f-4167-9b6d-79e0225cc883.png'
  }, {
    id: 'dual-optimization',
    icon: <Scale className="text-draft-green dark:text-draft-yellow" size={24} />,
    title: 'Dual Optimization Technology™',
    description: 'Only 25% of candidates pass both ATS and human screening. We optimize for both challenges simultaneously.',
    image: '/lovable-uploads/dea2fb25-e955-4057-9663-d39a1bb2a3a8.png'
  }, {
    id: 'industry-adaptive',
    icon: <Cog className="text-draft-green dark:text-draft-yellow" size={24} />,
    title: 'Industry-Adaptive Learning™',
    description: "Draft Zero recognizes the unique language patterns in your professional domain, and tailors optimization specifically to your industry's expectations.",
    image: '/lovable-uploads/4888ffd5-758f-4167-9b6d-79e0225cc883.png'
  }, {
    id: 'adaptive-formatting',
    icon: <Trophy className="text-draft-green dark:text-draft-yellow" size={24} />,
    title: 'Adaptive Formatting Engine',
    description: 'DraftZero outperforms generic tools with an adaptive formatting engine that transforms your resume into a clean, recruiter-optimized layout.',
    image: '/lovable-uploads/dea2fb25-e955-4057-9663-d39a1bb2a3a8.png'
  }];

  // State to track the currently selected feature
  const [selectedFeature, setSelectedFeature] = useState<string>(features[0].id);

  // Find the currently selected feature object
  const currentFeature = features.find(feature => feature.id === selectedFeature) || features[0];
  return <section className="py-16 px-8 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="bg-[#f1f1eb] dark:bg-draft-green/30 px-4 py-2 rounded-md">
            <span className="text-draft-green dark:text-draft-yellow uppercase text-sm font-medium">WHAT WE DO</span>
          </div>
        </div>
        
        <h2 className="text-heading font-serif mb-4 text-center text-draft-green dark:text-draft-yellow">
          Build zero-effort resumes with DraftZero
        </h2>
        
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-1/2 pl-0.2">
            <div className="flex flex-col gap-3 my-0">
              {features.map(feature => <div key={feature.id} onClick={() => setSelectedFeature(feature.id)} className={cn("flex gap-3 items-start p-4 rounded-lg transition-all duration-200 cursor-pointer w-full", "hover:bg-[#EDEEE7] dark:hover:bg-draft-green/20", selectedFeature === feature.id && "bg-[#EDEEE7] dark:bg-draft-green/20 border-l-4 border-draft-green dark:border-draft-yellow")}>
                  <div className="mt-1 shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className={cn("font-medium text-base", selectedFeature === feature.id && "text-draft-green dark:text-draft-yellow")}>
                      {feature.title}
                    </h3>
                    <p className="text-draft-text dark:text-gray-300 mt-1 text-[1rem]">
                      {feature.description}
                    </p>
                  </div>
                </div>)}
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="bg-white dark:bg-draft-green/10 rounded-lg border border-gray-200 dark:border-draft-green/30 shadow-lg overflow-hidden transition-all duration-300 h-[450px]">
              <img src={currentFeature.image} alt={`${currentFeature.title} - DraftZero Feature`} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default FeaturesSection;
