
import React, { useMemo } from 'react';

interface Modification {
  company?: string;
  section?: string;
  type?: string;
}

interface SummaryPanelProps {
  modifications: Modification[];
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ modifications }) => {
  const summary = useMemo(() => {
    // Count total modifications
    const total = modifications.length;
    
    // Count unique companies/sections
    const uniqueSections = new Set();
    modifications.forEach(mod => {
      const section = mod.company || mod.section;
      if (section) uniqueSections.add(section);
    });
    
    // Count major and minor improvements
    const majorCount = modifications.filter(mod => mod.type === 'Major').length;
    const minorCount = modifications.filter(mod => mod.type === 'Minor').length;
    
    return {
      total,
      uniqueSections: uniqueSections.size,
      majorCount,
      minorCount
    };
  }, [modifications]);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e5e7eb] mb-6">
      <h3 className="text-lg font-semibold text-draft-green mb-4">Resume Enhancement Summary</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-draft-green">{summary.total}</p>
          <p className="text-sm text-gray-600">Total Improvements</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-draft-green">{summary.uniqueSections}</p>
          <p className="text-sm text-gray-600">Sections Enhanced</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-draft-coral">{summary.majorCount}</p>
          <p className="text-sm text-gray-600">Major Enhancements</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-draft-mint">{summary.minorCount}</p>
          <p className="text-sm text-gray-600">Minor Enhancements</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryPanel;
