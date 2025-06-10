
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import Header from '@/components/Header';
import SimpleResumeViewer from '@/components/SimpleResumeViewer';

interface Modification {
  section: string;
  original: string;
  improved: string;
  type: "Major" | "Minor";
  company?: string;
  position?: string;
}

interface OptimizationData {
  id: string;
  status: string;
  modifications: Modification[];
  enhanced_resume_id: string;
  error_message?: string;
}

const Comparison2Page: React.FC = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('job_id');
  const { user } = useAuth();
  const [optimizationData, setOptimizationData] = useState<OptimizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !user?.id) {
      setError('Missing job ID or user authentication');
      setIsLoading(false);
      return;
    }

    const fetchOptimizationData = async () => {
      try {
        const { data, error } = await supabase
          .from('optimization_jobs')
          .select('*')
          .eq('id', jobId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching optimization data:', error);
          setError('Failed to load optimization data');
          return;
        }

        // Transform the data to match our interface
        const transformedData: OptimizationData = {
          id: data.id,
          status: data.status,
          modifications: Array.isArray(data.modifications) ? data.modifications as Modification[] : [],
          enhanced_resume_id: data.enhanced_resume_id || '',
          error_message: data.error_message || undefined
        };

        setOptimizationData(transformedData);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptimizationData();
  }, [jobId, user?.id]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-draft-bg">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-draft-green mx-auto mb-4"></div>
            <p className="text-draft-text">Loading optimization results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !optimizationData) {
    return (
      <div className="min-h-screen bg-draft-bg">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-draft-text">{error || 'No optimization data found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-draft-bg">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-serif text-draft-green">Optimization Results</h1>
            {getStatusIcon(optimizationData.status)}
            <Badge className={getStatusColor(optimizationData.status)}>
              {optimizationData.status}
            </Badge>
          </div>
          <p className="text-draft-text">Job ID: {optimizationData.id}</p>
        </div>

        {optimizationData.error_message && (
          <Card className="mb-6 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error:</span>
                <span>{optimizationData.error_message}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Modifications Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-draft-green">Resume Modifications</CardTitle>
              </CardHeader>
              <CardContent>
                {optimizationData.modifications && optimizationData.modifications.length > 0 ? (
                  <div className="space-y-4">
                    {optimizationData.modifications.map((mod, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-draft-green">{mod.section}</span>
                          <Badge variant={mod.type === 'Major' ? 'default' : 'secondary'}>
                            {mod.type}
                          </Badge>
                        </div>
                        {mod.company && (
                          <p className="text-sm text-draft-text mb-2">
                            <strong>Company:</strong> {mod.company}
                          </p>
                        )}
                        {mod.position && (
                          <p className="text-sm text-draft-text mb-2">
                            <strong>Position:</strong> {mod.position}
                          </p>
                        )}
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">ORIGINAL:</p>
                            <p className="text-sm text-gray-700 bg-red-50 p-2 rounded">
                              {mod.original}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">IMPROVED:</p>
                            <p className="text-sm text-gray-700 bg-green-50 p-2 rounded">
                              {mod.improved}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-draft-text">No modifications available yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resume Viewer Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-draft-green">Enhanced Resume</CardTitle>
              </CardHeader>
              <CardContent>
                {optimizationData.enhanced_resume_id ? (
                  <SimpleResumeViewer 
                    resumeId={optimizationData.enhanced_resume_id} 
                    fileName="enhanced_resume.pdf"
                  />
                ) : (
                  <p className="text-draft-text">Enhanced resume not available yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comparison2Page;
