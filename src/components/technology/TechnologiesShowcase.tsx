
import React, { useEffect, useRef } from 'react';
import { Brain, Scale, Cog, Target, Fingerprint, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TechnologyCardProps {
  icon: React.ReactNode;
  title: string;
  stat: string;
  description: string;
  details: string;
  index: number;
}

const TechnologyCard: React.FC<TechnologyCardProps> = ({ icon, title, stat, description, details, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('opacity-100', 'translate-y-0');
              entry.target.classList.remove('opacity-0', 'translate-y-4');
            }, index * 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [index]);

  return (
    <Card 
      ref={cardRef}
      className="border border-gray-200 dark:border-draft-green/30 opacity-0 translate-y-4 transition-all duration-700 hover:shadow-md"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-full bg-draft-green/10 dark:bg-draft-green/20 text-draft-green dark:text-draft-yellow">
            {icon}
          </div>
          <div className="text-3xl font-bold text-draft-green dark:text-draft-yellow font-serif">
            {stat}
          </div>
        </div>
        <CardTitle className="mt-4 text-xl text-draft-green dark:text-draft-yellow font-serif">{title}</CardTitle>
        <CardDescription className="text-draft-text dark:text-gray-300 text-[1.1rem] font-serif">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-draft-green/20">
            <AccordionTrigger className="text-draft-green dark:text-draft-yellow font-serif">Learn More</AccordionTrigger>
            <AccordionContent className="text-draft-text dark:text-gray-300 font-serif">
              {details}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

const TechnologiesShowcase: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-6');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Define the technologies data with the updated "Achievement Amplification" technology
  const technologies = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Semantic Intelligence Engine™",
      stat: "83%",
      description: "of recruiters prioritize context over exact term matches.",
      details: "Our Semantic Intelligence Engine understands the relationships between concepts and skills, ensuring that your resume communicates the right qualifications even when using different terminology than the job description. This contextual understanding is what sets DraftZero apart from simple keyword-matching tools."
    },
    {
      icon: <Scale className="h-6 w-6" />,
      title: "Dual Optimization Technology™",
      stat: "25%",
      description: "of candidates pass both ATS and human screening. We optimize for both.",
      details: "Most resumes either please the ATS but fail to engage recruiters, or look beautiful to humans but get rejected by software. Our Dual Optimization Technology ensures your resume performs exceptionally well in both scenarios, significantly increasing your interview chances."
    },
    {
      icon: <Cog className="h-6 w-6" />,
      title: "Industry-Adaptive Learning™",
      stat: "12x",
      description: "more effective when optimization is tailored to your specific industry.",
      details: "Different industries have distinct expectations and language patterns. Our technology recognizes these differences and tailors optimization specifically to your professional domain, whether you're in technology, healthcare, finance, or creative fields."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Smart Keyword Prioritization",
      stat: "3x",
      description: "more weight carried by top 5 keywords than all others combined.",
      details: "Not all keywords are created equal. Our algorithm identifies the most impactful terms for your target role and positions them strategically throughout your resume, optimizing placement for maximum impact with both ATS systems and human readers."
    },
    {
      icon: <Fingerprint className="h-6 w-6" />,
      title: "Authenticity Preservation",
      stat: "78%",
      description: "of recruiters spot generic AI content. We maintain your unique voice.",
      details: "Unlike many AI tools that generate generic content, DraftZero enhances YOUR experience and qualifications while maintaining your authentic voice. We optimize what you've already accomplished rather than replacing it with template text."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Achievement Amplification",
      stat: "67%",
      description: "Responsibilities get filtered. Achievements get interviews.",
      details: "We don't just add keywords—we restructure your experience to highlight results and measurable impacts that make recruiters stop and take notice, while maintaining complete factual accuracy. Our system identifies and emphasizes quantifiable accomplishments that demonstrate your real value to employers."
    }
  ];

  return (
    <section className="py-24 bg-[#F7F4ED] dark:bg-draft-green/10">
      <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-6">
        <div 
          ref={sectionRef}
          className="text-center mb-16 opacity-0 translate-y-6 transition-all duration-700"
        >
          <h2 className="text-heading font-serif mb-6 text-draft-green dark:text-draft-yellow">
            Our Advanced Resume Technologies
          </h2>
          <p className="text-draft-text dark:text-gray-300 max-w-3xl mx-auto text-lg font-serif">
            DraftZero combines multiple proprietary technologies to create the most effective resume optimization platform available today.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technologies.map((tech, index) => (
            <TechnologyCard
              key={index}
              icon={tech.icon}
              title={tech.title}
              stat={tech.stat}
              description={tech.description}
              details={tech.details}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologiesShowcase;
