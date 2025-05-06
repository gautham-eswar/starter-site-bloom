
import React, { useState } from 'react';
import { Brain, Scale, Cog, Target, Fingerprint } from 'lucide-react';
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
    icon: <Brain className="text-draft-green dark:text-draft-yellow" size={20} />,
    title: 'Semantic Intelligence Engine™',
    description: "Our algorithm understands meaning, not just keywords. 83% of recruiters prioritize context over exact term matches.",
    image: '/lovable-uploads/4888ffd5-758f-4167-9b6d-79e0225cc883.png'
  }, {
    id: 'dual-optimization',
    icon: <Scale className="text-draft-green dark:text-draft-yellow" size={20} />,
    title: 'Dual Optimization Technology™',
    description: 'Only 25% of candidates pass both ATS and human screening. We optimize for both challenges simultaneously.',
    image: '/lovable-uploads/dea2fb25-e955-4057-9663-d39a1bb2a3a8.png'
  }, {
    id: 'industry-adaptive',
    icon: <Cog className="text-draft-green dark:text-draft-yellow" size={20} />,
    title: 'Industry-Adaptive Learning™',
    description: 'Draft Zero recognizes the unique language patterns in your professional domain, and tailors optimization specifically to your industry's expectations.',
    image: '/lovable-uploads/4888ffd5-758f-4167-9b6d-79e0225cc883.png'
  }, {
    id: 'smart-keyword',
    icon: <Target className="text-draft-green dark:text-draft-yellow" size={20} />,
    title: 'Smart Keyword Prioritization',
    description: 'Top 5 keywords carry 3x more weight than all others combined. We identify and position what matters most.',
    image: '/lovable-uploads/dea2fb25-e955-4057-9663-d39a1bb2a3a8.png'
  }, {
    id: 'authenticity',
    icon: <Fingerprint className="text-draft-green dark:text-draft-yellow" size={20} />,
    title: 'Authenticity Preservation',
    description: '78% of recruiters spot generic AI content. We enhance YOUR experience while maintaining your unique voice.',
    image: '/lovable-uploads/4888ffd5-758f-4167-9b6d-79e0225cc883.png'
  }];

  // State to track the currently selected feature
  const [selectedFeature, setSelectedFeature] = useState<string>(features[0].id);

  // Find the currently selected feature object
  const currentFeature = features.find(feature => feature.id === selectedFeature) || features[0];
  return <section className="py-20 px-8 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="bg-[#f1f1eb] dark:bg-draft-green/30 px-4 py-2 rounded-md">
            <span className="text-draft-green dark:text-draft-yellow uppercase text-sm font-medium">BUILT TO WIN</span>
          </div>
        </div>
        
        <h2 className="text-heading font-serif mb-4 text-center text-draft-green dark:text-draft-yellow">
          Build zero-effort resumes with DraftZero
        </h2>
        
        <p className="text-center text-draft-text dark:text-gray-300 mb-12 max-w-3xl mx-auto">
          Powered by breakthrough resume optimization technology
        </p>
        
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/5">
            <div className="flex flex-col gap-10">
              {features.map(feature => <div key={feature.id} onClick={() => setSelectedFeature(feature.id)} className={cn("flex gap-4 items-start p-4 rounded-lg transition-all duration-200 cursor-pointer", "hover:bg-[#EDEEE7] dark:hover:bg-draft-green/20", selectedFeature === feature.id && "bg-[#EDEEE7] dark:bg-draft-green/20 border-l-4 border-draft-green dark:border-draft-yellow")}>
                  <div className="mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className={cn("font-medium", selectedFeature === feature.id && "text-draft-green dark:text-draft-yellow")}>
                      {feature.title}
                    </h3>
                    <p className="text-draft-text dark:text-gray-300 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>)}
            </div>
          </div>
          
          <div className="lg:w-3/5">
            <div className="bg-white dark:bg-draft-green/10 rounded-lg border border-gray-200 dark:border-draft-green/30 shadow-lg overflow-hidden transition-all duration-300 h-[515px]">
              <img src={currentFeature.image} alt={`${currentFeature.title} - DraftZero Feature`} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default FeaturesSection;
