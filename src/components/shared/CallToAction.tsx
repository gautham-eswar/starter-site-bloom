
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  const ctaRef = useRef<HTMLDivElement>(null);

  // Optional: Simple animation on scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-4');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }

    return () => {
      if (ctaRef.current) {
        observer.unobserve(ctaRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={ctaRef}
      className="max-w-6xl mx-auto mt-24 px-8 md:px-12 lg:px-6 py-16 bg-[#F7F4ED] dark:bg-draft-green/20 rounded-lg opacity-0 translate-y-4 transition-all duration-700"
    >
      <div className="text-center">
        {/* h2: Updated to text-3xl (base styles handle weight/line-height). Colors will use heading default. */}
        <h2 className="text-3xl mb-6"> 
          Ready to optimize your resume?
        </h2>
        {/* p: Updated to text-base and text-foreground for universal color. */}
        <p className="text-base text-foreground dark:text-foreground max-w-2xl mx-auto mb-10">
          Join thousands of job seekers who are getting more interviews with DraftZero's resume optimization technology.
        </p>
        <Button
          onClick={() => navigate('/auth')}
          variant="default" // Apply the default variant
          // Kept custom padding for larger size. text-base is from CVA. Color/bg classes removed.
          className="px-8 py-6 h-auto rounded-md group transition-all duration-300 transform hover:scale-105"
        >
          Get Started Now
          <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.div> 
  );
};

export default CallToAction;
