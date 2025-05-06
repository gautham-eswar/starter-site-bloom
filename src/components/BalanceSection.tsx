
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const BalanceSection: React.FC = () => {
  return (
    <section className="py-20 px-8 md:px-12 lg:px-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif mb-12 text-center text-draft-green dark:text-draft-yellow">
          The Perfect Balance: ATS-Friendly + Human-Captivating
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4 text-draft-green dark:text-draft-yellow">First, beat the bots</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">•</span>
                <span>Keyword optimization based on job requirements</span>
              </li>
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">•</span>
                <span>Proper formatting that scanning systems can parse</span>
              </li>
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">•</span>
                <span>Strategic placement of critical terms</span>
              </li>
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">•</span>
                <span>Industry-specific terminology matching</span>
              </li>
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">•</span>
                <span>Logical structure that algorithms recognize</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4 text-draft-green dark:text-draft-yellow">Then, impress the humans</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">•</span>
                <span>Natural language that flows conversationally</span>
              </li>
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">•</span>
                <span>Achievement-focused bullet points</span>
              </li>
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">•</span>
                <span>Quantifiable results that catch attention</span>
              </li>
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">•</span>
                <span>Authentic voice that sounds like you</span>
              </li>
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">•</span>
                <span>Compelling narrative that showcases your unique value</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="text-center mb-12">
          <p className="text-lg mb-6 max-w-3xl mx-auto">
            75% of resumes never make it past ATS filters. Of those that do, only 20% capture recruiter attention. 
            Draft Zero optimizes for both challenges in one go.
          </p>
          <p className="text-lg font-medium text-draft-green dark:text-draft-yellow">
            Why choose between technical optimization and human appeal when your competition is mastering both?
          </p>
        </div>
      </div>
    </section>
  );
};

export default BalanceSection;
