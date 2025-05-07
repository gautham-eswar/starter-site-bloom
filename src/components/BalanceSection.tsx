
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const BalanceSection: React.FC = () => {
  return (
    <section className="py-16 px-8 md:px-12 lg:px-20 bg-white dark:bg-draft-footer">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="bg-[#f1f1eb] dark:bg-draft-green/30 px-4 py-2 rounded-md">
            <span className="text-draft-green dark:text-draft-yellow uppercase text-sm font-medium">Our Process</span>
          </div>
        </div>
        
        <h2 className="text-heading font-serif mb-12 text-center text-draft-green dark:text-draft-yellow">
          We've engineered a seamless process that transforms your existing resume into an optimized document that gets results.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-draft-green/10 dark:bg-draft-green/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-serif font-medium text-draft-green dark:text-draft-yellow">1</span>
            </div>
            <h3 className="text-xl font-serif font-medium mb-3 text-draft-green dark:text-draft-yellow">Resume Analysis</h3>
            <p className="text-draft-text dark:text-gray-300">
              Our algorithm analyzes your resume's structure, content, and formatting to identify optimization opportunities.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-draft-green/10 dark:bg-draft-green/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-serif font-medium text-draft-green dark:text-draft-yellow">2</span>
            </div>
            <h3 className="text-xl font-serif font-medium mb-3 text-draft-green dark:text-draft-yellow">Semantic Processing</h3>
            <p className="text-draft-text dark:text-gray-300">
              We identify key themes and experiences, then match them against industry-specific keyword patterns.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-draft-green/10 dark:bg-draft-green/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-serif font-medium text-draft-green dark:text-draft-yellow">3</span>
            </div>
            <h3 className="text-xl font-serif font-medium mb-3 text-draft-green dark:text-draft-yellow">Dual Optimization</h3>
            <p className="text-draft-text dark:text-gray-300">
              Your resume is simultaneously enhanced for both ATS systems and human recruiters for maximum impact.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BalanceSection;
