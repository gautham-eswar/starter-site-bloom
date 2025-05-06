
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FAQCategory } from '@/pages/FAQ';

interface FAQCategoriesProps {
  activeCategory: FAQCategory;
  setActiveCategory: (category: FAQCategory) => void;
}

const FAQCategories: React.FC<FAQCategoriesProps> = ({ activeCategory, setActiveCategory }) => {
  const categories = [
    { id: 'general', label: 'General' },
    { id: 'technology', label: 'Technology' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'account', label: 'Account' }
  ];

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value as FAQCategory);
    
    // Update URL with category parameter for direct linking
    const url = new URL(window.location.href);
    url.searchParams.set('category', value);
    window.history.pushState({}, '', url);
  };

  return (
    <div className="mb-8 flex justify-center">
      <Tabs 
        defaultValue={activeCategory} 
        value={activeCategory} 
        onValueChange={handleCategoryChange}
        className="w-full max-w-3xl"
      >
        <TabsList className="w-full grid grid-cols-4 h-12 bg-[#f1f1eb] dark:bg-draft-green/20">
          {categories.map(category => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="data-[state=active]:bg-draft-green data-[state=active]:text-white dark:data-[state=active]:bg-draft-yellow dark:data-[state=active]:text-draft-green text-draft-text dark:text-gray-300 text-[1.1rem] font-serif"
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default FAQCategories;
