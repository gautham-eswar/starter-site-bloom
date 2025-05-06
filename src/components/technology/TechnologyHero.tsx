
import React, { useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const TechnologyHero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const isMobile = useIsMobile();

  // Simple animation on scroll
  useEffect(() => {
    const animateOnScroll = () => {
      if (heroRef.current) {
        const scrollPosition = window.scrollY;
        const heroElement = heroRef.current;
        const heroTop = heroElement.offsetTop;
        const heroHeight = heroElement.offsetHeight;
        
        // Simple parallax effect
        if (titleRef.current && !isMobile) {
          titleRef.current.style.transform = `translateY(${scrollPosition * 0.1}px)`;
        }
      }
    };

    // Fade in on load
    setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.classList.add('opacity-100', 'translate-y-0');
        titleRef.current.classList.remove('opacity-0', 'translate-y-6');
      }
      
      setTimeout(() => {
        if (subtitleRef.current) {
          subtitleRef.current.classList.add('opacity-100', 'translate-y-0');
          subtitleRef.current.classList.remove('opacity-0', 'translate-y-6');
        }
      }, 300);
    }, 100);

    // Add scroll event for parallax
    if (!isMobile) {
      window.addEventListener('scroll', animateOnScroll);
      return () => window.removeEventListener('scroll', animateOnScroll);
    }
  }, [isMobile]);

  return (
    <div 
      ref={heroRef}
      className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden"
    >
      {/* Particle animation background (simplified version) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/lovable-uploads/4888ffd5-758f-4167-9b6d-79e0225cc883.png')] bg-cover bg-center opacity-5 dark:opacity-10"></div>
        <div className="particle-container absolute inset-0">
          {/* We'll add actual particles with CSS */}
          <div className="h-full w-full bg-gradient-to-b from-draft-bg/0 via-draft-bg/50 to-draft-bg dark:from-[#1A3F35]/0 dark:via-[#1A3F35]/50 dark:to-[#1A3F35]"></div>
        </div>
      </div>

      <div className="container mx-auto px-8 md:px-12 lg:px-6 z-10 text-center">
        <div className="flex flex-col items-center">
          <div className="bg-[#f1f1eb] dark:bg-draft-green/30 px-4 py-2 rounded-md mb-6">
            <span className="text-draft-green dark:text-draft-yellow uppercase text-sm font-medium">Our Technology</span>
          </div>
          
          <h1 
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 text-draft-green dark:text-draft-yellow max-w-4xl mx-auto opacity-0 translate-y-6 transition-all duration-700"
          >
            Powering the Next Generation of Resume Optimization
          </h1>
          
          <p 
            ref={subtitleRef}
            className="text-lg md:text-xl text-draft-text dark:text-gray-300 max-w-3xl mx-auto opacity-0 translate-y-6 transition-all duration-700 delay-300"
          >
            Our proprietary blend of semantic intelligence and industry-specific optimization delivers resumes that win with both ATS systems and human recruiters.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TechnologyHero;
