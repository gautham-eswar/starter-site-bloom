import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PricingSection from '@/components/PricingSection';
const Pricing: React.FC = () => {
  return <div className="min-h-screen bg-draft-bg">
      <Header />
      <main>
        
        <PricingSection />
      </main>
      <Footer />
    </div>;
};
export default Pricing;