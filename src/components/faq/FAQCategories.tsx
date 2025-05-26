
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
        {/* TabsList: Updated background to use a muted theme color */}
        <TabsList className="w-full grid grid-cols-4 h-12 bg-muted/50 dark:bg-muted/20">
          {categories.map(category => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              // Updated classes for active/inactive states and typography
              className="text-base text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
