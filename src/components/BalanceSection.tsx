
import React from 'react';

const BalanceSection: React.FC = () => {
  return (
    <section className="py-20 px-8 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-heading font-serif font-medium text-center text-draft-green dark:text-draft-yellow mb-12">
          The Perfect Balance: ATS-Friendly + Human-Captivating
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          {/* ATS Optimization Column */}
          <div className="bg-white dark:bg-draft-green/10 p-8 rounded-lg border border-draft-green/20 dark:border-draft-yellow/20">
            <h3 className="text-2xl font-serif font-medium text-draft-green dark:text-draft-yellow mb-6">
              First, beat the bots
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">✓</span>
                <span className="text-draft-text dark:text-gray-300">Keyword optimization based on job requirements</span>
              </li>
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">✓</span>
                <span className="text-draft-text dark:text-gray-300">Proper formatting that scanning systems can parse</span>
              </li>
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">✓</span>
                <span className="text-draft-text dark:text-gray-300">Strategic placement of critical terms</span>
              </li>
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">✓</span>
                <span className="text-draft-text dark:text-gray-300">Industry-specific terminology matching</span>
              </li>
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">✓</span>
                <span className="text-draft-text dark:text-gray-300">Logical structure that algorithms recognize</span>
              </li>
            </ul>
          </div>
          
          {/* Human Appeal Column */}
          <div className="bg-white dark:bg-draft-green/10 p-8 rounded-lg border border-draft-green/20 dark:border-draft-yellow/20">
            <h3 className="text-2xl font-serif font-medium text-draft-green dark:text-draft-yellow mb-6">
              Then, impress the humans
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">✓</span>
                <span className="text-draft-text dark:text-gray-300">Natural language that flows conversationally</span>
              </li>
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">✓</span>
                <span className="text-draft-text dark:text-gray-300">Achievement-focused bullet points</span>
              </li>
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">✓</span>
                <span className="text-draft-text dark:text-gray-300">Quantifiable results that catch attention</span>
              </li>
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">✓</span>
                <span className="text-draft-text dark:text-gray-300">Authentic voice that sounds like you</span>
              </li>
              <li className="flex items-start">
                <span className="text-draft-green dark:text-draft-yellow mr-2">✓</span>
                <span className="text-draft-text dark:text-gray-300">Compelling narrative that showcases your unique value</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Supporting Text */}
        <div className="mt-10 text-center">
          <p className="text-lg text-draft-text dark:text-gray-300 max-w-3xl mx-auto">
            75% of resumes never make it past ATS filters. Of those that do, only 20% capture recruiter attention. 
            Draft Zero optimizes for both challenges in one go.
          </p>
          
          {/* Urgency Text */}
          <p className="mt-6 text-lg font-medium text-draft-green dark:text-draft-yellow italic max-w-3xl mx-auto">
            Why choose between technical optimization and human appeal when your competition is mastering both?
          </p>
        </div>
      </div>
    </section>
  );
};

export default BalanceSection;
