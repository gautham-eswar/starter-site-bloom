import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader, ChevronDown, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import { useResumeContext } from '@/contexts/ResumeContext';
import { OptimizationResult, Modification } from '@/types/api';
import { toast } from '@/hooks/use-toast';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DirectPDFViewer } from '@/components/DirectPDFViewer';
import { getResumeUrl, checkResumeExists } from '@/services/supabaseSetup';
import { useAuth } from '@/components/auth/AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';

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
    console.warn('[ComparisonPage] Modifications is not an array:', typeof modificationsJson);
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

const ComparisonPage: React.FC = () => {
  console.log('[ComparisonPage] === COMPONENT RENDER START ===');
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobIdParam = searchParams.get('job_id');
  
  console.log('[ComparisonPage] URL Search Params:', {
    job_id: jobIdParam,
    all_params: Object.fromEntries(searchParams.entries())
  });

  const {
    resumeId: contextResumeId,
    setResumeId: setContextEnhancedResumeId,
    jobId: contextJobId,
    setJobId: setContextJobId,
    optimizationResult,
    setOptimizationResult
  } = useResumeContext();

  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx'>('pdf');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [jobData, setJobData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [isPolling, setIsPolling] = useState(false);

  console.log('[ComparisonPage] Current State:', {
    user_id: user?.id,
    user_email: user?.email,
    isLoading,
    jobData: jobData ? { id: jobData.id, status: jobData.status } : null,
    error,
    pollingAttempts,
    isPolling,
    contextResumeId,
    contextJobId,
    optimizationResult: optimizationResult ? { status: optimizationResult.status } : null
  });

  // Main data fetching effect
  useEffect(() => {
    console.log('[ComparisonPage] === MAIN USEEFFECT TRIGGERED ===');
    console.log('[ComparisonPage] Effect Dependencies:', {
      jobIdParam,
      user_id: user?.id,
      user_authenticated: !!user
    });
    
    const fetchJobData = async () => {
      console.log('[ComparisonPage] === fetchJobData STARTED ===');
      
      // Reset previous states
      setError(null);
      setJobData(null);
      setPdfUrl(null);
      
      if (!jobIdParam) {
        console.error("[ComparisonPage] CRITICAL: No job_id in URL parameters");
        setError("No job ID provided in URL");
        setIsLoading(false);
        return;
      }

      if (!user?.id) {
        console.warn("[ComparisonPage] CRITICAL: User not authenticated");
        console.log("[ComparisonPage] User object:", user);
        setIsLoading(false);
        return;
      }

      try {
        console.log(`[ComparisonPage] === QUERYING SUPABASE ===`);
        console.log(`[ComparisonPage] Query params: job_id=${jobIdParam}, user_id=${user.id}`);
        
        // First, let's see what's in the optimization_jobs table
        const { data: recentJobs, error: listError } = await supabase
          .from('optimization_jobs')
          .select('id, status, created_at, user_id, enhanced_resume_id')
          .order('created_at', { ascending: false })
          .limit(10);
        
        console.log('[ComparisonPage] Recent jobs in table:', recentJobs);
        if (listError) {
          console.error('[ComparisonPage] Error listing recent jobs:', listError);
        }

        // Now query for the specific job
        const { data, error } = await supabase
          .from('optimization_jobs')
          .select('*')
          .eq('id', jobIdParam)
          .maybeSingle();

        console.log('[ComparisonPage] === SUPABASE QUERY RESULT ===');
        console.log('[ComparisonPage] Data:', data);
        console.log('[ComparisonPage] Error:', error);

        if (error) {
          console.error('[ComparisonPage] Supabase query error:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          
          setError(`Database error: ${error.message}`);
          toast({
            title: "Database Error",
            description: `Failed to query optimization results: ${error.message}`,
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        if (!data) {
          console.warn('[ComparisonPage] No job found with ID:', jobIdParam);
          console.log('[ComparisonPage] Available job IDs from recent query:', 
            recentJobs?.map(job => job.id) || 'none');
          
          // Check if we should poll (job might not be created yet)
          if (pollingAttempts < 30) {
            setPollingAttempts(prev => prev + 1);
            setIsPolling(true);
            console.log(`[ComparisonPage] Job not found, polling attempt ${pollingAttempts + 1}/30`);
            
            setTimeout(() => {
              fetchJobData();
            }, 5000); // Poll every 5 seconds
            return;
          } else {
            setError(`No optimization job found with ID: ${jobIdParam}`);
            setIsLoading(false);
            return;
          }
        }

        console.log('[ComparisonPage] === JOB FOUND ===');
        console.log('[ComparisonPage] Job details:', {
          id: data.id,
          status: data.status,
          user_id: data.user_id,
          enhanced_resume_id: data.enhanced_resume_id,
          created_at: data.created_at,
          modifications_count: Array.isArray(data.modifications) ? data.modifications.length : 'not array',
          modifications_type: typeof data.modifications,
          match_details_type: typeof data.match_details,
          keywords_extracted_count: Array.isArray(data.keywords_extracted) ? data.keywords_extracted.length : 'not array'
        });

        // Check if job is still processing
        if (data.status === 'pending' || data.status === 'processing') {
          console.log(`[ComparisonPage] Job still processing: ${data.status}`);
          
          if (pollingAttempts < 30) {
            setPollingAttempts(prev => prev + 1);
            setIsPolling(true);
            console.log(`[ComparisonPage] Continuing to poll, attempt ${pollingAttempts + 1}/30`);
            
            setTimeout(() => {
              fetchJobData();
            }, 5000);
            return;
          } else {
            setError("The optimization is taking longer than expected. Please try again later.");
            setIsLoading(false);
            return;
          }
        }

        // Check if job failed
        if (data.status === 'error') {
          console.error('[ComparisonPage] Job failed:', data.error_message);
          setError(`Optimization failed: ${data.error_message || 'Unknown error'}`);
          setIsLoading(false);
          return;
        }

        // Job completed successfully
        console.log('[ComparisonPage] === PROCESSING COMPLETED JOB ===');
        setJobData(data);
        setIsPolling(false);

        // Update context
        if (data.enhanced_resume_id) {
          console.log('[ComparisonPage] Setting enhanced resume ID:', data.enhanced_resume_id);
          setContextEnhancedResumeId(data.enhanced_resume_id);
        }
        setContextJobId(jobIdParam);

        // Process modifications data with proper type handling
        const modificationsData = parseModifications(data.modifications);
        console.log('[ComparisonPage] Processed modifications:', modificationsData.length, 'items');

        // Process match details
        const matchDetails = (data.match_details && typeof data.match_details === 'object') 
          ? data.match_details as any 
          : {};
        console.log('[ComparisonPage] Match details:', matchDetails);

        // Process keywords
        const keywordsExtracted = Array.isArray(data.keywords_extracted) 
          ? data.keywords_extracted 
          : [];
        console.log('[ComparisonPage] Keywords extracted:', keywordsExtracted.length, 'items');

        // Create optimization result
        const optimizationData: OptimizationResult = {
          resume_id: data.enhanced_resume_id || '',
          job_id: jobIdParam,
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

        console.log('[ComparisonPage] === SETTING OPTIMIZATION RESULT ===');
        console.log('[ComparisonPage] Final optimization data:', optimizationData);
        setOptimizationResult(optimizationData);
        setIsLoading(false);

      } catch (error) {
        console.error('[ComparisonPage] === EXCEPTION IN fetchJobData ===');
        console.error('[ComparisonPage] Exception details:', error);
        setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading results.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    // Reset polling attempts when dependencies change
    setPollingAttempts(0);
    setIsLoading(true);
    fetchJobData();
  }, [jobIdParam, user?.id, setContextEnhancedResumeId, setContextJobId, setOptimizationResult]);

  // PDF loading effect
  useEffect(() => {
    console.log('[ComparisonPage] === PDF LOADING EFFECT ===');
    console.log('[ComparisonPage] PDF Effect Dependencies:', {
      jobData: jobData ? { enhanced_resume_id: jobData.enhanced_resume_id } : null,
      user_id: user?.id,
      isLoading,
      error
    });
    
    const loadPdf = async () => {
      const resumeIdForPdf = jobData?.enhanced_resume_id;
      
      if (!resumeIdForPdf || !user?.id || isLoading || error) {
        console.log('[ComparisonPage] PDF loading skipped:', {
          resumeIdForPdf: !!resumeIdForPdf,
          user_id: !!user?.id,
          isLoading,
          error
        });
        return;
      }

      console.log(`[ComparisonPage] === CHECKING PDF EXISTENCE ===`);
      console.log(`[ComparisonPage] Resume ID for PDF: ${resumeIdForPdf}`);
      
      try {
        const exists = await checkResumeExists(user.id, resumeIdForPdf);
        console.log(`[ComparisonPage] PDF exists check result: ${exists}`);
        
        if (exists) {
          const url = await getResumeUrl(user.id, resumeIdForPdf, 'pdf', false);
          console.log(`[ComparisonPage] Generated PDF URL: ${url}`);
          setPdfUrl(url);
        } else {
          console.warn(`[ComparisonPage] PDF does not exist for resume ${resumeIdForPdf}`);
          setPdfUrl(null);
        }
      } catch (err) {
        console.error('[ComparisonPage] Error in PDF loading:', err);
        setPdfUrl(null);
        toast({
          title: "PDF Load Error",
          description: `Failed to load PDF preview: ${err instanceof Error ? err.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    };
    
    loadPdf();
  }, [jobData, user?.id, isLoading, error]);

  // Download handler
  const handleDownload = async (format: 'pdf' | 'docx' = 'pdf') => {
    console.log('[ComparisonPage] === DOWNLOAD INITIATED ===');
    const resumeIdForDownload = jobData?.enhanced_resume_id;
    
    console.log('[ComparisonPage] Download params:', {
      format,
      resumeIdForDownload,
      user_id: user?.id
    });
    
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
        console.log("[ComparisonPage] DOCX download requested (not implemented)");
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
      
      console.log(`[ComparisonPage] Opening download URL: ${url}`);
      window.open(url, '_blank');
      
      toast({
        title: "Download successful",
        description: "Your resume download has started."
      });
    } catch (error) {
      console.error("[ComparisonPage] Download error:", error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Download failed",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Retry handler
  const handleRetry = () => {
    console.log('[ComparisonPage] === RETRY INITIATED ===');
    setError(null);
    setPollingAttempts(0);
    setIsPolling(false);
    setIsLoading(true);
    // The useEffect will automatically trigger and refetch
  };

  console.log('[ComparisonPage] === RENDER DECISION ===');
  console.log('[ComparisonPage] Render state:', {
    isLoading,
    isPolling,
    error,
    hasOptimizationResult: !!optimizationResult,
    pdfUrl
  });

  // Loading state
  if (isLoading || isPolling) {
    console.log('[ComparisonPage] Rendering loading state');
    return (
      <div className="min-h-screen bg-draft-bg">
        <Header />
        <div className="h-[calc(100vh-80px)] flex items-center justify-center">
          <p className="text-base text-foreground font-medium">
            Loaded comparison page
          </p>
          {/* <div className="flex flex-col items-center max-w-md text-center">
            <div className="flex items-center mb-4">
              {isPolling ? (
                <RefreshCw className="h-8 w-8 animate-spin text-primary mr-3" />
              ) : (
                <Loader className="h-8 w-8 animate-spin text-primary mr-3" />
              )}
              <div>
                <p className="text-base text-foreground font-medium">
                  {isPolling ? 'Waiting for optimization to complete...' : 'Loading optimization results...'}
                </p>
                {isPolling && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Checking progress... (Attempt {pollingAttempts}/30)
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {isPolling 
                ? 'The backend is still processing your resume. This typically takes 1-3 minutes.' 
                : 'Please wait while we load your results.'}
            </p> */}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || (!optimizationResult && !isLoading)) {
    console.log('[ComparisonPage] Rendering error state');
    return (
      <div className="min-h-screen bg-draft-bg">
        <Header />
        <div className="px-8 py-10 md:px-12 lg:px-20">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl mb-4">
              {error ? "Error Loading Results" : "No Results Found"}
            </h2>
            <p className="text-base text-muted-foreground mb-6">
              {error || `We couldn't find optimization results for job ID: ${jobIdParam}.`}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Button variant="default" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  console.log('[ComparisonPage] Rendering main content');
  
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

  console.log('[ComparisonPage] Rendering with data:', {
    improvementData_count: improvementData.length,
    analysisData,
    groupedImprovements_keys: Object.keys(groupedImprovements),
    pdfUrl: !!pdfUrl
  });
  
  return (
    <div className="min-h-screen bg-draft-bg">
      <Header />
      
      <main className="px-4 py-8 md:px-12 lg:px-20 max-w-[1440px] mx-auto">
        <h1 className="text-4xl mb-8 text-center">Resume Enhancement Results</h1>
        
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
                        {(!jobData?.enhanced_resume_id || !user?.id) 
                          ? "Preview unavailable: Missing resume information." 
                          : "Loading preview or PDF not found..."} 
                      </p>
                      {!pdfUrl && jobData?.enhanced_resume_id && user?.id && (
                        <p className="text-sm text-destructive mt-2">
                          PDF file may not be available. Resume ID: {jobData.enhanced_resume_id}
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
    </div>
  );
};

export default ComparisonPage;
