
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const TestimonialsSection: React.FC = () => {
  const [testimonialView, setTestimonialView] = useState('grid');
  
  const testimonials = [
    { name: "John Doe", handle: "@johndoe", text: "DraftZero is fucking awesome." },
    { name: "John Doe", handle: "@johndoe", text: "DraftZero is fucking awesome." },
    { name: "John Doe", handle: "@johndoe", text: "DraftZero is fucking awesome." },
    { name: "John Doe", handle: "@johndoe", text: "DraftZero is fucking awesome." },
    { name: "John Doe", handle: "@johndoe", text: "DraftZero is fucking awesome." },
    { name: "John Doe", handle: "@johndoe", text: "DraftZero is fucking awesome." },
  ];

  return (
    <section className="py-20 px-8 md:px-12 lg:px-20 bg-[#F7F4ED] dark:bg-[#0A2218]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-12">
          <div className="bg-[#f1f1eb] dark:bg-draft-green/30 px-4 py-2 rounded-md mb-6">
            {/* Badge text: using primary for its distinct color in both modes */}
            <span className="text-primary dark:text-primary uppercase text-sm font-medium">Testimonials</span>
          </div>
          
          {/* h2: text-3xl. Color from base heading styles (text-foreground). font-serif and text-heading removed by typography subtask. */}
          <h2 className="text-3xl text-center mb-6">
            Hear from real people
          </h2>
          
          <div className="flex items-center gap-2 p-1 bg-[#e6e6e0] dark:bg-draft-green/20 rounded-full">
            <Switch
              checked={testimonialView === 'grid'}
              onCheckedChange={(checked) => setTestimonialView(checked ? 'grid' : 'list')}
              className="bg-draft-green data-[state=unchecked]:bg-[#e6e6e0] dark:bg-draft-yellow dark:data-[state=unchecked]:bg-draft-green/40"
            />
          </div>
        </div>
        
        <div className={`grid gap-4 ${testimonialView === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={`bg-slate-50 dark:bg-white/5 p-6 rounded-lg transition-colors duration-300 ease-in-out ${
                testimonialView === 'list' ? 'max-w-2xl mx-auto' : ''
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {/* Name: font-medium, text-muted-foreground */}
                  <span className="font-medium text-muted-foreground dark:text-muted-foreground">{testimonial.name}</span>
                  {/* Handle: text-sm, text-muted-foreground */}
                  <span className="text-sm text-muted-foreground dark:text-muted-foreground">{testimonial.handle}</span>
                </div>
                {/* Quote text: text-lg, text-foreground */}
                <p className="text-lg text-foreground dark:text-foreground">{testimonial.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
