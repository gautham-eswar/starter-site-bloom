import React from 'react';
const StatsSection: React.FC = () => {
  return <section className="bg-[#F7F4ED] dark:bg-[#0A2218] py-20 px-8 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto">
        {/* h2: text-3xl. Color from base heading styles (text-foreground). Typographic classes already updated. */}
        <h2 className="text-3xl text-center">
          Your resume gets rejected in 7 seconds, fix it in 6
        </h2>
        {/* Subtitle uses muted-foreground - CORRECT */}
        <p className="text-center mt-3 text-muted-foreground dark:text-muted-foreground opacity-70">
          Our AI doesn't fabricate experience, it intelligently enhances what you already have.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="flex flex-col items-center">
            <div className="mb-8 flex items-center justify-center">
              <img src="/lovable-uploads/10c86fba-7dd2-4419-ac9b-07f4203ce297.png" alt="Purple statistic icon" className="w-[160px] h-[160px]" />
            </div>
            {/* Stat numbers use primary accent color */}
            <h3 className="text-4xl md:text-5xl font-serif font-medium text-primary dark:text-primary">93%</h3>
            {/* Stat descriptions use muted-foreground */}
            <p className="mt-2 text-center text-muted-foreground dark:text-muted-foreground">Resumes rejected automatically by the ATS system </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="mb-8 flex items-center justify-center">
              <img src="/lovable-uploads/21a3eeff-fd79-41e3-a871-8757e822189c.png" alt="Coral statistic icon" className="w-[160px] h-[160px]" />
            </div>
            {/* Stat numbers use primary accent color */}
            <h3 className="text-4xl md:text-5xl font-serif font-medium text-primary dark:text-primary">7.4 sec</h3>
            {/* Stat descriptions use muted-foreground */}
            <p className="mt-2 text-center text-muted-foreground dark:text-muted-foreground">Average time recruiters spend on reading your resume</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="mb-8 flex items-center justify-center">
              <img src="/lovable-uploads/650405ee-0627-4260-9765-779aee5d9699.png" alt="Mint statistic icon" className="w-[160px] h-[160px]" />
            </div>
            {/* Stat numbers use primary accent color */}
            <h3 className="text-4xl md:text-5xl font-serif font-medium text-primary dark:text-primary">3x</h3>
            {/* Stat descriptions use muted-foreground */}
            <p className="mt-2 text-center text-muted-foreground dark:text-muted-foreground">Tailored resumes get thrice the amount of interview calls</p>
          </div>
        </div>
      </div>
    </section>;
};
export default StatsSection;