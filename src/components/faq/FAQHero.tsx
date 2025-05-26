
import React from 'react';

const FAQHero: React.FC = () => {
  return (
    <div className="relative py-24 flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/lovable-uploads/dea2fb25-e955-4057-9663-d39a1bb2a3a8.png')] bg-cover bg-center opacity-5 dark:opacity-10"></div>
      </div>

      <div className="container mx-auto px-8 md:px-12 lg:px-6 z-10 text-center">
        <div className="flex flex-col items-center">
          <div className="bg-[#f1f1eb] dark:bg-draft-green/30 px-4 py-2 rounded-md mb-6">
            {/* Badge text: Updated to use primary color, font-serif removed */}
            <span className="text-primary dark:text-primary uppercase text-sm font-medium">Support Center</span>
          </div>
          
          {/* H1: Typographic classes (font-serif) removed, color classes removed (handled by base styles) */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 max-w-3xl mx-auto">
            Frequently Asked Questions
          </h1>
          
          {/* P: Typographic classes (font-serif, text-lg, md:text-xl) removed/updated. Color classes updated to use foreground. */}
          <p className="text-base text-foreground dark:text-foreground max-w-2xl mx-auto">
            Find answers to common questions about DraftZero's resume optimization technology and services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQHero;
