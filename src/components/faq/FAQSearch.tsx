
import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface FAQSearchProps {
  query: string;
  setQuery: (query: string) => void;
}

const FAQSearch: React.FC<FAQSearchProps> = ({ query, setQuery }) => {
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Animation on mount
  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.classList.add('opacity-100', 'translate-y-0');
      searchRef.current.classList.remove('opacity-0', 'translate-y-4');
    }
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div 
      ref={searchRef}
      className="mb-8 opacity-0 translate-y-4 transition-all duration-700"
    >
      <div className="relative max-w-3xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {/* Search Icon: Updated to text-muted-foreground */}
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder="Search frequently asked questions..."
          value={query}
          onChange={handleSearchChange}
          // Input text: text-foreground. Placeholder: placeholder:text-muted-foreground
          className="block w-full pl-12 pr-10 py-4 bg-white dark:bg-draft-green/10 border border-gray-200 dark:border-draft-green/30 rounded-lg shadow-sm focus:border-[#5A998A] dark:focus:border-[#5A998A] focus:ring-2 focus:ring-[#5A998A]/50 dark:focus:ring-[#5A998A]/40 text-foreground dark:text-foreground placeholder:text-muted-foreground text-base"
        />
        
        {query && (
          <button
            onClick={handleClearSearch}
            // Clear button icon: text-muted-foreground hover:text-foreground
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FAQSearch;
