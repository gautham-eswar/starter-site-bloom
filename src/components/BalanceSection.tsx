
import React, { useEffect, useRef } from 'react';
import { Scan, Network, Balance } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ProcessStep = ({ 
  number, 
  title, 
  description, 
  icon, 
  delay 
}: { 
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}) => {
  const stepRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('opacity-100', 'translate-y-0');
              entry.target.classList.remove('opacity-0', 'translate-y-4');
              
              // Show the connection arrow after the step appears
              const arrowElement = document.getElementById(`arrow-${number}`);
              if (arrowElement) {
                setTimeout(() => {
                  arrowElement.classList.add('opacity-100');
                  arrowElement.classList.remove('opacity-0');
                }, 400);
              }
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
  }, [delay, number]);
  
  return (
    <div 
      ref={stepRef} 
      className="flex-1 relative mx-2 opacity-0 translate-y-4 transition-all duration-400 ease-out hover:scale-103 hover:shadow-md hover:z-10"
    >
      {/* Number Circle with enhanced styling */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-draft-green/90 dark:bg-draft-green/70 text-draft-yellow dark:text-draft-yellow w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 z-10 shadow-[0_0_10px_rgba(233,255,125,0.3)] dark:shadow-[0_0_15px_rgba(233,255,125,0.4)]">
        <span className="font-serif">{number}</span>
      </div>
      
      {/* Content Box */}
      <div className="pt-16 pb-8 px-6 bg-gradient-to-b from-draft-green/10 to-draft-green/20 dark:from-draft-green/30 dark:to-draft-green/40 backdrop-blur-sm rounded-lg transition-all duration-300 h-full">
        <div className="flex justify-center mb-6 text-draft-yellow">
          <div className="w-12 h-12">
            {icon}
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-center mb-4 text-draft-green dark:text-draft-yellow font-serif">{title}</h3>
        <p className="text-draft-text dark:text-gray-300 text-center">{description}</p>
      </div>
      
      {/* Connection Arrow (except for last step) */}
      {number < 3 && (
        <div 
          id={`arrow-${number}`}
          className="hidden md:flex absolute top-1/3 -right-4 w-8 h-8 opacity-0 transition-opacity duration-700 justify-center items-center z-20"
        >
          <div className="w-10 h-0.5 bg-draft-yellow dark:bg-draft-yellow opacity-85 animate-pulse-opacity"></div>
          <div className="absolute right-0 w-0 h-0 border-t-[6px] border-r-0 border-b-[6px] border-l-[8px] border-t-transparent border-r-transparent border-b-transparent border-l-draft-yellow dark:border-l-draft-yellow"></div>
        </div>
      )}
    </div>
  );
};

const BalanceSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Generate particle background
    const particleContainer = document.getElementById('particle-container');
    if (particleContainer) {
      for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 30}s`;
        particleContainer.appendChild(particle);
      }
    }
    
    // Animate elements on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === headingRef.current) {
              entry.target.classList.add('opacity-100', 'translate-y-0');
              entry.target.classList.remove('opacity-0', 'translate-y-6');
              
              // Animate subheading after the heading
              if (subheadingRef.current) {
                setTimeout(() => {
                  subheadingRef.current?.classList.add('opacity-100', 'translate-y-0');
                  subheadingRef.current?.classList.remove('opacity-0', 'translate-y-4');
                }, 300);
              }
            } else if (entry.target === ctaRef.current) {
              entry.target.classList.add('opacity-100', 'translate-y-0');
              entry.target.classList.remove('opacity-0', 'translate-y-4');
            }
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (headingRef.current) {
      observer.observe(headingRef.current);
    }
    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }
    
    return () => {
      if (headingRef.current) {
        observer.unobserve(headingRef.current);
      }
      if (ctaRef.current) {
        observer.unobserve(ctaRef.current);
      }
    };
  }, []);
  
  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden bg-gradient-to-b from-[#F7F4ED] to-[#F0EDE6] dark:from-draft-green/10 dark:to-draft-green/30">
      {/* Particle Background */}
      <div id="particle-container" className="absolute inset-0 z-0"></div>
      
      <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-6 relative z-10">
        <div ref={headingRef} className="text-center mb-5 opacity-0 translate-y-6 transition-all duration-700">
          <div className="bg-[#f1f1eb] dark:bg-draft-green/30 px-4 py-2 rounded-md inline-block mb-6">
            <span className="text-draft-green dark:text-draft-yellow uppercase text-sm font-medium">Our Process</span>
          </div>
          
          <h2 className="text-heading font-serif mb-6 text-center text-draft-green dark:text-draft-yellow">
            We've engineered a seamless process that transforms your existing resume into an optimized document that gets results.
          </h2>
        </div>
        
        <p ref={subheadingRef} className="text-center text-lg text-draft-text dark:text-gray-300 max-w-3xl mx-auto mb-16 opacity-0 translate-y-4 transition-all duration-700 delay-300">
          While other candidates wait in the application black hole, you'll be preparing for interviews.
        </p>
        
        <div className="flex flex-col md:flex-row gap-8 md:gap-4 relative">
          <ProcessStep 
            number={1}
            title="Resume Analysis"
            description="Our algorithm instantly analyzes your resume's structure and content, identifying critical optimization opportunities that most candidates miss."
            icon={<Scan size={48} className="animate-scan-effect" />}
            delay={0}
          />
          
          <ProcessStep 
            number={2}
            title="Semantic Processing"
            description="Our advanced semantic engine maps your experiences against industry-specific keyword patterns recognized by top employers' ATS systems."
            icon={<Network size={48} className="animate-network-effect" />}
            delay={200}
          />
          
          <ProcessStep 
            number={3}
            title="Dual Optimization"
            description="Your resume is precisely enhanced for both automated screening systems AND the 6-second human review—giving you an immediate advantage other applicants don't have."
            icon={<Balance size={48} className="animate-balance-effect" />}
            delay={400}
          />
        </div>
        
        {/* CTA Button */}
        <div ref={ctaRef} className="text-center mt-16 opacity-0 translate-y-4 transition-all duration-700">
          <Button
            onClick={() => navigate('/auth')}
            className="bg-draft-yellow text-draft-green hover:bg-draft-yellow/90 dark:bg-draft-yellow dark:text-draft-green dark:hover:bg-draft-yellow/90 px-8 py-5 h-auto text-lg rounded-md animate-pulse-scale"
          >
            Start your optimization now — before the next job posting closes
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BalanceSection;
