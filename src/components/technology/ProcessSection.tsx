
import React, { useEffect, useRef } from 'react';
import { FileText, Database, CheckCircle } from 'lucide-react';

interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}

const ProcessStep: React.FC<ProcessStepProps> = ({ number, title, description, icon, delay }) => {
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('opacity-100', 'translate-y-0');
              entry.target.classList.remove('opacity-0', 'translate-y-4');
            }, delay);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (stepRef.current) {
      observer.observe(stepRef.current);
    }

    return () => {
      if (stepRef.current) {
        observer.unobserve(stepRef.current);
      }
    };
  }, [delay]);

  return (
    <div 
      ref={stepRef}
      className="flex-1 relative group opacity-0 translate-y-4 transition-all duration-700"
    >
      {/* Number Circle */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-draft-green dark:bg-draft-yellow text-white dark:text-draft-green w-12 h-12 rounded-full flex items-center justify-center text-xl font-semibold transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg z-10">
        {number}
      </div>
      
      {/* Content Box */}
      <div className="pt-10 px-6 pb-6 bg-white dark:bg-draft-green/10 rounded-lg shadow-sm border border-gray-100 dark:border-draft-green/30 transition-all duration-300 group-hover:shadow-md group-hover:scale-105 h-full">
        <div className="flex justify-center mb-4 text-draft-green dark:text-draft-yellow transition-all duration-300 group-hover:transform group-hover:scale-110">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-center mb-3 text-draft-green dark:text-draft-yellow">{title}</h3>
        <p className="text-draft-text dark:text-gray-300 text-center text-[1.1rem]">{description}</p>
      </div>
      
      {/* Connecting line (except for last item) */}
      {number < 3 && (
        <div className="hidden md:block absolute top-[4.5rem] right-0 w-[calc(50%-1.5rem)] h-[2px] bg-gray-200 dark:bg-draft-green/30"></div>
      )}
    </div>
  );
};

const ProcessSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-6');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="py-20 bg-[#F7F4ED] dark:bg-draft-green/10">
      <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-6">
        <div 
          ref={sectionRef}
          className="text-center mb-16 opacity-0 translate-y-6 transition-all duration-700"
        >
          <h2 className="text-heading font-serif mb-6 text-draft-green dark:text-draft-yellow">
            Our Three-Step Optimization Process
          </h2>
          <p className="text-draft-text dark:text-gray-300 max-w-3xl mx-auto text-lg">
            We've engineered a seamless process that transforms your existing resume into an optimized document that gets results.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 md:gap-4 relative">
          <ProcessStep 
            number={1}
            title="Resume Analysis"
            description="Our algorithm analyzes your resume's structure, content, and formatting to identify optimization opportunities."
            icon={<FileText size={36} />}
            delay={0}
          />
          
          <ProcessStep 
            number={2}
            title="Semantic Processing"
            description="We identify key themes and experiences, then match them against industry-specific keyword patterns."
            icon={<Database size={36} />}
            delay={200}
          />
          
          <ProcessStep 
            number={3}
            title="Dual Optimization"
            description="Your resume is simultaneously enhanced for both ATS systems and human recruiters for maximum impact."
            icon={<CheckCircle size={36} />}
            delay={400}
          />
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
