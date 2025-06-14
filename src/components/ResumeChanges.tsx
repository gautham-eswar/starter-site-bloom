import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Plus, Minus, Edit3 } from 'lucide-react';

interface ResumeChangesProps {
  modifications: any;
  isLoading?: boolean;
}

const ResumeChanges: React.FC<ResumeChangesProps> = ({ modifications, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-draft-green">Resume Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!modifications || Object.keys(modifications).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-draft-green">Resume Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-draft-text">No changes data available for this resume.</p>
        </CardContent>
      </Card>
    );
  }

  const renderSection = (title: string, items: any[], type: 'added' | 'removed' | 'modified') => {
    if (!items || items.length === 0) return null;

    const getIcon = () => {
      switch (type) {
        case 'added': return <Plus className="h-4 w-4 text-green-600" />;
        case 'removed': return <Minus className="h-4 w-4 text-red-600" />;
        case 'modified': return <Edit3 className="h-4 w-4 text-blue-600" />;
      }
    };

    const getBadgeVariant = () => {
      switch (type) {
        case 'added': return 'default';
        case 'removed': return 'destructive';
        case 'modified': return 'secondary';
      }
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h4 className="font-medium text-draft-green">{title}</h4>
          <Badge variant={getBadgeVariant()}>{items.length}</Badge>
        </div>
        <div className="space-y-2 pl-6">
          {items.map((item, index) => (
            <div key={index} className="text-sm text-draft-text">
              {typeof item === 'string' ? (
                <p>{item}</p>
              ) : (
                <div className="space-y-1">
                  {item.skill && <p><strong>Skill:</strong> {item.skill}</p>}
                  {item.before && <p><strong>Before:</strong> {item.before}</p>}
                  {item.after && <p><strong>After:</strong> {item.after}</p>}
                  {item.reason && <p><strong>Reason:</strong> {item.reason}</p>}
                  {item.section && <p><strong>Section:</strong> {item.section}</p>}
                  {item.change && <p>{item.change}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkillsChanges = (skillsData: any) => {
    if (!skillsData) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-draft-green flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Skills Optimization
        </h3>
        
        {skillsData.skills_added && renderSection('Skills Added', skillsData.skills_added, 'added')}
        {skillsData.skills_removed && renderSection('Skills Removed', skillsData.skills_removed, 'removed')}
        {skillsData.skills_modified && renderSection('Skills Modified', skillsData.skills_modified, 'modified')}
        
        {skillsData.technical_skills && (
          <div className="space-y-2">
            <h4 className="font-medium text-draft-green">Technical Skills Added</h4>
            <div className="flex flex-wrap gap-2 pl-6">
              {skillsData.technical_skills.map((skill: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGeneralChanges = (changes: any[]) => {
    if (!changes || changes.length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-draft-green">Content Changes</h3>
        <div className="space-y-3">
          {changes.map((change, index) => (
            <div key={index} className="border-l-4 border-draft-green/30 pl-4 py-2">
              <div className="space-y-1">
                {change.section && (
                  <Badge variant="outline" className="text-xs mb-2">
                    {change.section}
                  </Badge>
                )}
                {change.type && (
                  <p className="text-sm font-medium text-draft-green">
                    {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
                  </p>
                )}
                {change.description && (
                  <p className="text-sm text-draft-text">{change.description}</p>
                )}
                {change.before && (
                  <div className="text-xs text-gray-600">
                    <strong>Before:</strong> {change.before}
                  </div>
                )}
                {change.after && (
                  <div className="text-xs text-gray-700">
                    <strong>After:</strong> {change.after}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-draft-green">Resume Changes</CardTitle>
        <p className="text-sm text-draft-text">
          Here are the optimizations made to your resume
        </p>
      </CardHeader>
      <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
        {/* Skills Changes */}
        {modifications.skills && renderSkillsChanges(modifications.skills)}
        
        {/* General Content Changes */}
        {modifications.content_changes && renderGeneralChanges(modifications.content_changes)}
        
        {/* Other modifications */}
        {modifications.experience_changes && renderSection('Experience Changes', modifications.experience_changes, 'modified')}
        {modifications.education_changes && renderSection('Education Changes', modifications.education_changes, 'modified')}
        {modifications.summary_changes && renderSection('Summary Changes', modifications.summary_changes, 'modified')}
        
        {/* Raw modifications fallback */}
        {!modifications.skills && !modifications.content_changes && (
          <div className="space-y-3">
            <h3 className="font-semibold text-draft-green">Modifications</h3>
            <div className="text-sm text-draft-text">
              <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded text-xs">
                {JSON.stringify(modifications, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeChanges;
