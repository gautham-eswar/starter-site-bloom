
import React from 'react';

interface BulletComparisonProps {
  original: string;
  enhanced: string;
}

const BulletComparison: React.FC<BulletComparisonProps> = ({ original, enhanced }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className="p-4 rounded bg-[#f9fafb] border border-[#e5e7eb]">
        <p className="text-xs text-gray-500 mb-1 font-medium">ORIGINAL</p>
        <p className="text-sm">{original}</p>
      </div>
      
      <div className="p-4 rounded bg-[#f0fdf4] border border-[#e5e7eb]">
        <p className="text-xs text-draft-green mb-1 font-medium">ENHANCED</p>
        <p className="text-sm">{enhanced}</p>
      </div>
    </div>
  );
};

export default BulletComparison;
