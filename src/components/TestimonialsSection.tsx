
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
    <section className="py-20 px-8 md:px-12 lg:px-20 bg-[#F7F4ED] dark:bg-draft-footer">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-12">
          <div className="bg-[#f1f1eb] dark:bg-draft-green/30 px-4 py-2 rounded-md mb-6">
            <span className="text-draft-green dark:text-draft-yellow uppercase text-sm font-medium">Testimonials</span>
          </div>
          
          <h2 className="text-heading font-serif text-center mb-6 text-draft-green dark:text-draft-yellow">
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
              className={`bg-white dark:bg-draft-green/10 p-6 rounded-lg border border-[#1D5F5B] dark:border-draft-green/30 ${
                testimonialView === 'list' ? 'max-w-2xl mx-auto' : ''
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium dark:text-draft-yellow">{testimonial.name}</span>
                  <span className="text-gray-500 dark:text-gray-300 text-sm">{testimonial.handle}</span>
                </div>
                <p className="text-draft-text dark:text-gray-300">{testimonial.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
