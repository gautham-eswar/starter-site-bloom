
import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-8 md:px-12 lg:px-20">
      <div className="max-w-2xl">
        <h1 className="text-title font-serif font-medium text-draft-green leading-tight">
          Build a resume that wins <span className="italic">every</span> time.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-draft-text opacity-90">
          Tailor your resume to match a job description in minutes
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
