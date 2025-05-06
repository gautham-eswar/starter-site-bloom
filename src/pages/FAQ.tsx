
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FAQHero from '@/components/faq/FAQHero';
import FAQCategories from '@/components/faq/FAQCategories';
import FAQAccordion from '@/components/faq/FAQAccordion';
import FAQSearch from '@/components/faq/FAQSearch';
import CallToAction from '@/components/shared/CallToAction';

// Define FAQ categories
export type FAQCategory = 'general' | 'technology' | 'pricing' | 'account';

const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('general');
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll to top on page load without animation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Set document title
  useEffect(() => {
    document.title = "Frequently Asked Questions | DraftZero";
  }, []);

  return (
    <div className="min-h-screen bg-draft-bg dark:bg-[#1A3F35]">
      <Header />
      <main className="pb-16">
        <FAQHero />
        <div className="max-w-5xl mx-auto px-8 md:px-12 lg:px-6">
          <FAQSearch query={searchQuery} setQuery={setSearchQuery} />
          <FAQCategories activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
          <FAQAccordion activeCategory={activeCategory} searchQuery={searchQuery} />
        </div>
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
