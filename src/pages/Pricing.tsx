
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PricingSection from '@/components/PricingSection';

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-draft-bg">
      <Header />
      <main>
        <div className="py-12">
          <h1 className="text-4xl font-serif text-center mb-6 text-draft-green dark:text-draft-yellow">
            Our Pricing Plans
          </h1>
          <p className="text-center text-draft-text dark:text-gray-300 max-w-2xl mx-auto mb-12">
            Find the perfect plan to optimize your job search with DraftZero's AI-powered resume tailoring platform.
          </p>
        </div>
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
