
import React, { useMemo } from 'react';
import CompanySection, { CompanySectionProps } from './CompanySection';

interface Modification {
  company?: string;
  position?: string;
  original_bullet?: string;
  enhanced_bullet?: string;
  section?: string;
  original?: string;
  improved?: string;
  type?: string;
  experience_idx?: number;
  bullet_idx?: number;
}

interface BulletComparisonContainerProps {
  modifications: Modification[];
}

const BulletComparisonContainer: React.FC<BulletComparisonContainerProps> = ({ modifications }) => {
  const groupedModifications = useMemo(() => {
    if (!modifications || !modifications.length) {
      return [];
    }
    
    const groupedByCompany: Record<string, CompanySectionProps> = {};
    
    modifications.forEach(mod => {
      // Handle both expected API formats based on what we observed
      const company = mod.company || mod.section || 'General';
      const position = mod.position || '';
      const original = mod.original_bullet || mod.original || '';
      const enhanced = mod.enhanced_bullet || mod.improved || '';
      
      if (!groupedByCompany[company]) {
        groupedByCompany[company] = {
          company,
          position,
          bullets: []
        };
      }
      
      groupedByCompany[company].bullets.push({
        original,
        enhanced,
        experience_idx: mod.experience_idx,
        bullet_idx: mod.bullet_idx
      });
    });
    
    // Convert to array and sort by experience_idx if available
    return Object.values(groupedByCompany).sort((a, b) => {
      if (a.bullets[0]?.experience_idx !== undefined && 
          b.bullets[0]?.experience_idx !== undefined) {
        return a.bullets[0].experience_idx - b.bullets[0].experience_idx;
      }
      return 0; // Keep original order if no index
    });
  }, [modifications]);
  
  if (!modifications || groupedModifications.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">No modifications found for this resume.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {groupedModifications.map((group, idx) => (
        <CompanySection 
          key={idx} 
          company={group.company} 
          position={group.position} 
          bullets={group.bullets} 
        />
      ))}
    </div>
  );
};

export default BulletComparisonContainer;
