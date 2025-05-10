
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ComparisonSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Score cards skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-200 bg-white rounded-lg p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      
      {/* Summary panel skeleton */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Bullet comparison skeletons */}
      {[1, 2].map((group) => (
        <div key={group} className="mb-4">
          <Skeleton className="h-12 w-full mb-2 rounded-md" />
          {group === 1 && (
            <div className="mt-4 pl-2">
              {[1, 2].map((bullet) => (
                <div key={bullet} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Skeleton className="h-20 rounded" />
                  <Skeleton className="h-20 rounded" />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ComparisonSkeleton;
