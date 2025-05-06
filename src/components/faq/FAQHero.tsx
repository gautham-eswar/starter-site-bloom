
import React, { useEffect, useRef } from 'react';

const FAQHero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  // Simple animation on load
  useEffect(() => {
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
  }, []);

  return (
    <div 
      ref={heroRef}
      className="relative py-24 flex items-center justify-center"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/lovable-uploads/dea2fb25-e955-4057-9663-d39a1bb2a3a8.png')] bg-cover bg-center opacity-5 dark:opacity-10"></div>
      </div>

      <div className="container mx-auto px-8 md:px-12 lg:px-6 z-10 text-center">
        <div className="flex flex-col items-center">
          <div className="bg-[#f1f1eb] dark:bg-draft-green/30 px-4 py-2 rounded-md mb-6">
            <span className="text-draft-green dark:text-draft-yellow uppercase text-sm font-medium">Support Center</span>
          </div>
          
          <h1 
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 text-draft-green dark:text-draft-yellow max-w-3xl mx-auto opacity-0 translate-y-6 transition-all duration-700"
          >
            Frequently Asked Questions
          </h1>
          
          <p 
            ref={subtitleRef}
            className="text-lg md:text-xl text-draft-text dark:text-gray-300 max-w-2xl mx-auto opacity-0 translate-y-6 transition-all duration-700 delay-300"
          >
            Find answers to common questions about DraftZero's resume optimization technology and services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQHero;
