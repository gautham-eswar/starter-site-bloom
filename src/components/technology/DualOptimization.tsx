
import React, { useEffect, useRef } from 'react';
import { Monitor, Cpu, CheckCircle2 } from 'lucide-react';

interface OptimizationPointProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  side: 'left' | 'right';
}

const OptimizationPoint: React.FC<OptimizationPointProps> = ({ icon, title, description, delay, side }) => {
  const pointRef = useRef<HTMLDivElement>(null);

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

    if (pointRef.current) {
      observer.observe(pointRef.current);
    }

    return () => {
      if (pointRef.current) {
        observer.unobserve(pointRef.current);
      }
    };
  }, [delay]);

  return (
    <div 
      ref={pointRef}
      className={`flex items-start gap-4 opacity-0 translate-y-4 transition-all duration-700 mb-8 group ${
        side === 'right' ? 'text-left' : 'text-right md:flex-row-reverse'
      }`}
    >
      <div className={`flex-shrink-0 p-3 rounded-full bg-white dark:bg-draft-green/20 shadow-sm border border-gray-100 dark:border-draft-green/30 group-hover:shadow-md transition-all duration-300 text-draft-green dark:text-draft-yellow ${
        side === 'left' ? 'ml-auto' : ''
      }`}>
        {icon}
      </div>
      
      <div>
        <h4 className="text-xl font-medium mb-2 text-draft-green dark:text-draft-yellow">{title}</h4>
        <p className="text-draft-text dark:text-gray-300 text-[1.1rem]">{description}</p>
      </div>
    </div>
  );
};

const DualOptimization: React.FC = () => {
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
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-6">
        <div 
          ref={sectionRef}
          className="text-center mb-16 opacity-0 translate-y-6 transition-all duration-700"
        >
          <h2 className="text-heading font-serif mb-6 text-draft-green dark:text-draft-yellow">
            Dual Optimization Technology™
          </h2>
          <p className="text-draft-text dark:text-gray-300 max-w-3xl mx-auto text-lg">
            Only 25% of candidates pass both ATS and human screening. We optimize for both challenges simultaneously.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row">
          {/* Human Recruiter Side */}
          <div className="flex-1 mb-12 md:mb-0 md:pr-8 lg:pr-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-draft-green/10 dark:bg-draft-green/20 mb-4">
                <Monitor size={32} className="text-draft-green dark:text-draft-yellow" />
              </div>
              <h3 className="text-2xl font-semibold text-draft-green dark:text-draft-yellow">Human Recruiters</h3>
            </div>
            
            <div className="space-y-6">
              <OptimizationPoint
                icon={<CheckCircle2 size={20} />}
                title="Narrative Clarity"
                description="Strategic content organization that tells your career story effectively."
                delay={0}
                side="left"
              />
              
              <OptimizationPoint
                icon={<CheckCircle2 size={20} />}
                title="Visual Hierarchy"
                description="Carefully structured content that guides the recruiter's eye to key qualifications."
                delay={200}
                side="left"
              />
              
              <OptimizationPoint
                icon={<CheckCircle2 size={20} />}
                title="Achievement Focus"
                description="Emphasis on measurable results that demonstrate your impact."
                delay={400}
                side="left"
              />
            </div>
          </div>
          
          {/* Dividing Line */}
          <div className="hidden md:block w-px bg-gray-200 dark:bg-draft-green/30 mx-4 lg:mx-6"></div>
          
          {/* ATS Side */}
          <div className="flex-1 md:pl-8 lg:pl-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-draft-green/10 dark:bg-draft-green/20 mb-4">
                <Cpu size={32} className="text-draft-green dark:text-draft-yellow" />
              </div>
              <h3 className="text-2xl font-semibold text-draft-green dark:text-draft-yellow">ATS Systems</h3>
            </div>
            
            <div className="space-y-6">
              <OptimizationPoint
                icon={<CheckCircle2 size={20} />}
                title="Keyword Optimization"
                description="Strategic placement of industry-relevant keywords for maximum parsing accuracy."
                delay={100}
                side="right"
              />
              
              <OptimizationPoint
                icon={<CheckCircle2 size={20} />}
                title="Format Compatibility"
                description="ATS-friendly structure that ensures your information is correctly processed."
                delay={300}
                side="right"
              />
              
              <OptimizationPoint
                icon={<CheckCircle2 size={20} />}
                title="Semantic Matching"
                description="Contextual keyword optimization that matches job description patterns."
                delay={500}
                side="right"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DualOptimization;
