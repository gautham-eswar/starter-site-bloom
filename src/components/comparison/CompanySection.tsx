
import React from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import BulletComparison from './BulletComparison';

export interface BulletModification {
  original: string;
  enhanced: string;
  experience_idx?: number;
  bullet_idx?: number;
}

export interface CompanySectionProps {
  company: string;
  position: string;
  bullets: BulletModification[];
}

const CompanySection: React.FC<CompanySectionProps> = ({ company, position, bullets }) => {
  const sectionId = `section-${company.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <Accordion type="single" collapsible className="mb-4">
      <AccordionItem value={sectionId}>
        <AccordionTrigger className="px-4 bg-white hover:bg-gray-50 rounded-md">
          <div className="text-left">
            <p className="font-bold">{company}</p>
            {position && <p className="text-sm text-gray-600">{position}</p>}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-1 pt-4">
          {bullets.map((bullet, idx) => (
            <BulletComparison 
              key={idx} 
              original={bullet.original} 
              enhanced={bullet.enhanced} 
            />
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default CompanySection;
