
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TechnologyHero from '@/components/technology/TechnologyHero';
import ProcessSection from '@/components/technology/ProcessSection';
import SemanticVisualization from '@/components/technology/SemanticVisualization';
import DualOptimization from '@/components/technology/DualOptimization';
import TechnologiesShowcase from '@/components/technology/TechnologiesShowcase';
import CallToAction from '@/components/shared/CallToAction';

const Technology: React.FC = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Changed the title in the document
  useEffect(() => {
    document.title = "Our Optimization Technology | DraftZero";
  }, []);

  return (
    <div className="min-h-screen bg-draft-bg dark:bg-[#1A3F35]">
      <Header />
      <main className="pb-16">
        <TechnologyHero />
        <ProcessSection />
        <SemanticVisualization />
        <DualOptimization />
        <TechnologiesShowcase />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Technology;
