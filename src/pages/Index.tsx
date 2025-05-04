
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import Footer from '@/components/Footer';
import HowToSection from '@/components/HowToSection';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-draft-bg">
      <Header />
      <main>
        <HeroSection />
        <HowToSection />
        <StatsSection />
        <FeaturesSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
