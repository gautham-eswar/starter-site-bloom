
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle, Search, Download, Loader, ChevronDown, RefreshCw } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import Header from '@/components/Header';
import SimpleResumeViewer from '@/components/SimpleResumeViewer';
import { DirectPDFViewer } from '@/components/DirectPDFViewer';
import { getResumeUrl, checkResumeExists } from '@/services/supabaseSetup';
import { useIsMobile } from '@/hooks/use-mobile';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import { OptimizationResult, Modification } from '@/types/api';

interface OptimizationData {
  id: string;
  status: string;
  modifications: Modification[];
  enhanced_resume_id: string;
  error_message?: string;
}

// Helper interface for grouped modifications
interface GroupedModifications {
  [key: string]: {
    company: string;
    position: string;
    modifications: Modification[];
  };
}

// Helper function to safely convert Json to Modification array
const parseModifications = (modificationsJson: any): Modification[] => {
  if (!Array.isArray(modificationsJson)) {
    console.warn('[Comparison2Page] Modifications is not an array:', typeof modificationsJson);
    return [];
  }

  return modificationsJson.map((mod: any) => ({
    section: mod.section || '',
    original: mod.original || mod.original_bullet || '',
    improved: mod.improved || mod.enhanced_bullet || '',
    type: (mod.type as "Major" | "Minor") || 'Minor',
    company: mod.company,
    position: mod.position,
    bullet_idx: mod.bullet_idx,
    experience_idx: mod.experience_idx,
    keywords_added: mod.keywords_added,
    original_bullet: mod.original_bullet,
    enhanced_bullet: mod.enhanced_bullet
  })) as Modification[];
};

const Comparison2Page: React.FC = () => {
  const [searchParams] = useSearchParams();
  const jobIdParam = searchParams.get('job_id');
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // Input state
  const [resumeIdInput, setResumeIdInput] = useState('');
  
  // Data states
  const [optimizationData, setOptimizationData] = useState<OptimizationData | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [jobData, setJobData] = useState<any>(null);
  
  // Download states
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx'>('pdf');

  // Load data from URL parameter on mount
  useEffect(() => {
    if (jobIdParam && user?.id) {
      fetchOptimizationDataByJobId(jobIdParam);
    }
  }, [jobIdParam, user?.id]);

  // PDF loading effect
  useEffect(() => {
    const loadPdf = async () => {
      const resumeIdForPdf = optimizationData?.enhanced_resume_id;
      
      if (!resumeIdForPdf || !user?.id || isLoading || error) {
        return;
      }

      try {
        const exists = await checkResumeExists(user.id, resumeIdForPdf);
        
        if (exists) {
          const url = await getResumeUrl(user.id, resumeIdForPdf, 'pdf', false);
          setPdfUrl(url);
        } else {
          setPdfUrl(null);
        }
      } catch (err) {
        console.error('[Comparison2Page] Error in PDF loading:', err);
        setPdfUrl(null);
        toast({
          title: "PDF Load Error",
          description: `Failed to load PDF preview: ${err instanceof Error ? err.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    };
    
    loadPdf();
  }, [optimizationData, user?.id, isLoading, error]);

  const fetchOptimizationDataByJobId = async (jobId: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOptimizationData(null);
    setPdfUrl(null);

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

      processOptimizationData(data);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOptimizationDataByResumeId = async (resumeId: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOptimizationData(null);
    setPdfUrl(null);

    try {
      // Find optimization job by enhanced_resume_id
      const { data, error } = await supabase
        .from('optimization_jobs')
        .select('*')
        .eq('enhanced_resume_id', resumeId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching optimization data:', error);
        setError('Failed to load optimization data');
        return;
      }

      if (!data) {
        setError(`No optimization job found for resume ID: ${resumeId}`);
        return;
      }

      processOptimizationData(data);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const processOptimizationData = (data: any) => {
    // Transform the data to match our interface
    const transformedData: OptimizationData = {
      id: data.id,
      status: data.status,
      modifications: Array.isArray(data.modifications) ? (data.modifications as unknown as Modification[]) : [],
      enhanced_resume_id: data.enhanced_resume_id || '',
      error_message: data.error_message || undefined
    };

    setOptimizationData(transformedData);
    setJobData(data);

    // Process modifications data with proper type handling
    const modificationsData = parseModifications(data.modifications);

    // Process match details
    const matchDetails = (data.match_details && typeof data.match_details === 'object') 
      ? data.match_details as any 
      : {};

    // Process keywords
    const keywordsExtracted = Array.isArray(data.keywords_extracted) 
      ? data.keywords_extracted 
      : [];

    // Create optimization result
    const optimizationResultData: OptimizationResult = {
      resume_id: data.enhanced_resume_id || '',
      job_id: data.id,
      status: data.status || 'completed',
      created_at: data.created_at,
      modifications: modificationsData,
      analysis_data: {
        old_score: matchDetails.old_score || 0,
        improved_score: matchDetails.improved_score || 0,
        match_percentage: matchDetails.match_percentage || 0,
        keyword_matches: data.match_count || 0,
        total_keywords: keywordsExtracted.length || 0,
      }
    };

    setOptimizationResult(optimizationResultData);
  };

  const handleSearch = () => {
    if (!resumeIdInput.trim()) {
      setError('Please enter a resume ID');
      return;
    }
    
    fetchOptimizationDataByResumeId(resumeIdInput.trim());
  };

  const handleDownload = async (format: 'pdf' | 'docx' = 'pdf') => {
    const resumeIdForDownload = optimizationData?.enhanced_resume_id;
    
    if (!resumeIdForDownload || !user?.id) {
      toast({
        title: "Download failed",
        description: "Resume ID or user information is missing.",
        variant: "destructive"
      });
      return;
    }
    
    setIsDownloading(true);
    setDownloadFormat(format);
    
    try {
      if (format === 'docx') {
        toast({ 
          title: "DOCX Download", 
          description: "DOCX download functionality to be implemented.", 
          variant: "default" 
        });
        setIsDownloading(false); 
        return; 
      }

      const url = await getResumeUrl(user.id, resumeIdForDownload, 'pdf', true);
      if (!url) {
        throw new Error('Could not generate download URL');
      }
      
      window.open(url, '_blank');
      
      toast({
        title: "Download successful",
        description: "Your resume download has started."
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Download failed",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

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

  // Process data for rendering
  const improvementData = optimizationResult?.modifications || [];
  const analysisData = optimizationResult?.analysis_data || {
    old_score: 0,
    improved_score: 0,
    match_percentage: 0,
    keyword_matches: 0,
    total_keywords: 0
  };

  // Group modifications by company/position
  const groupedImprovements: GroupedModifications = {};
  improvementData.forEach(mod => {
    const originalText = mod.original || mod.original_bullet || '';
    const improvedText = mod.improved || mod.enhanced_bullet || '';
    const company = mod.company || mod.section || 'General';
    const position = mod.position || '';
    const key = `${company}${position ? ` - ${position}` : ''}`;
    
    if (!groupedImprovements[key]) {
      groupedImprovements[key] = {
        company,
        position,
        modifications: []
      };
    }
    
    const normalizedMod: Modification = {
      section: mod.section || '',
      original: originalText,
      improved: improvedText,
      type: mod.type || 'Minor',
      company,
      position
    };
    groupedImprovements[key].modifications.push(normalizedMod);
  });

  return (
    <div className="min-h-screen bg-draft-bg">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Resume ID Input Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-draft-green">Search by Resume ID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter resume ID (e.g., user123/resume456)"
                  value={resumeIdInput}
                  onChange={(e) => setResumeIdInput(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading}
                  className="bg-draft-green hover:bg-draft-green/90"
                >
                  {isLoading ? (
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Section */}
        {optimizationData && (
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
        )}

        {/* Error Message */}
        {optimizationData?.error_message && (
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-draft-green mx-auto mb-4"></div>
              <p className="text-draft-text">Loading optimization results...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-draft-text">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {optimizationResult && !isLoading && !error && (
          <main className="max-w-[1440px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left side - Score Summary and Improvements */}
              <div className="space-y-10">
                {/* Score Summary Cards */}
                <div>
                  <h2 className="text-3xl mb-6">Resume Scorecard</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-border rounded-xl shadow-sm p-6 flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-primary/40">
                      <p className="text-sm font-medium text-muted-foreground">Original Score</p>
                      <p className="text-4xl font-bold text-primary">
                        {analysisData.old_score}/100
                      </p>
                    </div>
                    
                    <div className="bg-white border border-border rounded-xl shadow-sm p-6 flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-primary/40">
                      <p className="text-sm font-medium text-muted-foreground">Enhanced Score</p>
                      <p className="text-4xl font-bold text-primary">
                        {analysisData.improved_score}/100
                      </p>
                    </div>
                    
                    <div className="bg-white border border-border rounded-xl shadow-sm p-6 flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-primary/40">
                      <p className="text-sm font-medium text-muted-foreground">Job Match</p>
                      <p className="text-4xl font-bold text-primary">
                        {analysisData.match_percentage}%
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Improvements by Company */}
                <div>
                  <h2 className="text-3xl mb-6">Resume Enhancements</h2>
                  
                  {Object.keys(groupedImprovements).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(groupedImprovements).map(([key, group], index) => (
                        <Collapsible key={index} defaultOpen={index === 0} className="bg-card rounded-xl overflow-hidden shadow-sm border border-border transition-all hover:shadow-md">
                          <CollapsibleTrigger className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors">
                            <div>
                              <h3 className="text-2xl">{group.company}</h3>
                              {group.position && <p className="text-base text-muted-foreground mt-1 italic">{group.position}</p>}
                            </div>
                            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 ui-open:rotate-180" />
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="px-5 pb-5">
                            <div className="space-y-7 pt-2">
                              {group.modifications.map((mod, idx) => (
                                <div key={idx} className="transition hover:translate-y-[-2px] duration-300">
                                  <div className="border-l-4 border-primary/40 pl-4 mb-6">
                                    <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Original</p>
                                    <p className="text-base text-foreground/90 leading-relaxed pl-2">{mod.original}</p>
                                  </div>
                                  
                                  <div className="bg-primary/10 p-5 rounded-xl border border-primary/20">
                                    <p className="text-sm text-primary uppercase tracking-wider mb-2">Enhanced</p>
                                    <p className="text-base text-primary leading-relaxed pl-2">{mod.improved}</p>
                                    
                                    {mod.type && (
                                      <div className="mt-4 flex justify-end">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${mod.type === 'Major' ? 'bg-draft-coral bg-opacity-15 text-draft-coral' : 'bg-draft-mint bg-opacity-15 text-draft-green'}`}>
                                          {mod.type} Enhancement
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-card p-8 text-center rounded-lg border border-border">
                      <p className="text-base text-muted-foreground">No enhancements found for this job.</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right side - Resume Preview */}
              <div>
                <div className="sticky top-24 space-y-6">
                  {/* Resume preview header and download buttons */}
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl">Enhanced Resume</h2>
                    <div className="flex gap-3">
                      <Button variant="default" onClick={() => handleDownload('pdf')} disabled={isDownloading && downloadFormat === 'pdf'}>
                        {isDownloading && downloadFormat === 'pdf' ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        PDF
                      </Button>
                      <Button className="bg-draft-green hover:bg-draft-green/90 text-white" onClick={() => handleDownload('docx')} disabled={isDownloading && downloadFormat === 'docx'}>
                        {isDownloading && downloadFormat === 'docx' ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        DOCX
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-draft-green/10 rounded-xl overflow-hidden h-[680px] shadow-lg">
                    {pdfUrl ? (
                      <DirectPDFViewer url={pdfUrl} />
                    ) : (
                      <div className="p-6 h-full flex flex-col items-center justify-center">
                        <div className="text-center">
                          <h1 className="text-xl font-bold text-draft-green font-serif mb-2">Enhanced Resume Preview</h1>
                          <p className="text-draft-green/70 font-serif">
                            {(!optimizationData?.enhanced_resume_id || !user?.id) 
                              ? "Preview unavailable: Missing resume information." 
                              : "Loading preview or PDF not found..."} 
                          </p>
                          {!pdfUrl && optimizationData?.enhanced_resume_id && user?.id && (
                            <p className="text-sm text-destructive mt-2">
                              PDF file may not be available. Resume ID: {optimizationData.enhanced_resume_id}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default Comparison2Page;
