
import React from 'react';

const StatsSection: React.FC = () => {
  return (
    <section className="bg-[#F7F4ED] py-20 px-8 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-heading font-serif font-medium text-center">
          Your resume gets rejected in 7 seconds, fix it in 6
        </h2>
        <p className="text-center mt-3 text-draft-text opacity-70">
          Our AI doesn't fabricate experience, it intelligently enhances what you already have.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="flex flex-col items-center">
            <div className="mb-8 flex items-center justify-center">
              <img 
                src="/lovable-uploads/10c86fba-7dd2-4419-ac9b-07f4203ce297.png" 
                alt="Purple statistic icon" 
                className="w-[160px] h-[160px]" 
              />
            </div>
            <h3 className="text-4xl md:text-5xl font-serif font-medium">40%</h3>
            <p className="mt-2 text-center">A statistic</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="mb-8 flex items-center justify-center">
              <img 
                src="/lovable-uploads/21a3eeff-fd79-41e3-a871-8757e822189c.png" 
                alt="Coral statistic icon" 
                className="w-[160px] h-[160px]" 
              />
            </div>
            <h3 className="text-4xl md:text-5xl font-serif font-medium">100%</h3>
            <p className="mt-2 text-center">Another statistic</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="mb-8 flex items-center justify-center">
              <img 
                src="/lovable-uploads/650405ee-0627-4260-9765-779aee5d9699.png" 
                alt="Mint statistic icon" 
                className="w-[160px] h-[160px]" 
              />
            </div>
            <h3 className="text-4xl md:text-5xl font-serif font-medium">2457</h3>
            <p className="mt-2 text-center">Another statistic</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
