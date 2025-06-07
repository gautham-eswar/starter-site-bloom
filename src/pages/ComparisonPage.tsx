import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import { useResumeContext } from '@/contexts/ResumeContext';
import { usePipelineContext } from '@/contexts/ResumeContext';
import { OptimizationResult, EnhancementAnalysis, Modification } from '@/types/api';
import { toast } from '@/hooks/use-toast';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DirectPDFViewer } from '@/components/DirectPDFViewer';
import { getPdfUrl, checkPdfExists } from '@/services/pdfStorage';
import { useAuth } from '@/components/auth/AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
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

const ComparisonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobIdParam = searchParams.get('job_id');

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

  console.log('[ComparisonPage] Render. isLoading:', isLoading, 'pdfUrl:', pdfUrl, 'jobIdParam:', jobIdParam);

  // Fetch optimization job data from Supabase
  useEffect(() => {
    const fetchJobData = async () => {
      if (!jobIdParam) {
        console.warn("[ComparisonPage] No job_id parameter found in URL");
        setIsLoading(false);
        return;
      }

      try {
        console.log(`[ComparisonPage] Fetching job data for job_id: ${jobIdParam}`);
        
        const { data, error } = await supabase
          .from('optimization_jobs')
          .select('*')
          .eq('id', jobIdParam)
          .single();

        if (error) {
          console.error('[ComparisonPage] Error fetching job data:', error);
          toast({
            title: "Failed to load results",
            description: "Could not retrieve optimization results from database.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        if (!data) {
          console.warn('[ComparisonPage] No job data found for job_id:', jobIdParam);
          setIsLoading(false);
          return;
        }

        console.log('[ComparisonPage] Job data retrieved:', data);
        setJobData(data);

        // Update context with the fetched data
        if (data.enhanced_resume_id) {
          setContextEnhancedResumeId(data.enhanced_resume_id);
        }
        setContextJobId(jobIdParam);

        // Create optimization result from job data
        const optimizationData: OptimizationResult = {
          resume_id: data.enhanced_resume_id || '',
          job_id: jobIdParam,
          status: data.status || 'completed',
          created_at: data.created_at,
          modifications: data.modifications || [],
          analysis_data: {
            old_score: data.match_details?.old_score || 0,
            improved_score: data.match_details?.improved_score || 0,
            match_percentage: data.match_details?.match_percentage || 0,
            keyword_matches: data.match_count || 0,
            total_keywords: data.keywords_extracted?.length || 0,
          }
        };

        setOptimizationResult(optimizationData);
        setIsLoading(false);

      } catch (error) {
        console.error('[ComparisonPage] Error in fetchJobData:', error);
        toast({
          title: "Error loading results",
          description: "An unexpected error occurred while loading optimization results.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, [jobIdParam, setContextEnhancedResumeId, setContextJobId, setOptimizationResult]);

  // Check if PDF exists and get URL for the ENHANCED resume
  useEffect(() => {
    const checkAndFetchPdf = async () => {
      if (jobData?.enhanced_resume_id && user?.id) {
        console.log(`[ComparisonPage] PDF Effect: Starting PDF check for enhancedResumeId: ${jobData.enhanced_resume_id}, user: ${user.id}`);
        try {
          const url = await getPdfUrl(jobData.enhanced_resume_id, user.id);
          setPdfUrl(url);
          console.log(`[ComparisonPage] PDF Effect: Successfully set PDF URL for ${jobData.enhanced_resume_id}: ${url}`);
        } catch (err) {
          console.error('[ComparisonPage] PDF Effect: Error getting PDF URL:', err);
          setPdfUrl(null);
          toast({
            title: "PDF Load Error",
            description: `Failed to retrieve PDF URL. ${err instanceof Error ? err.message : 'Unknown error'}`,
            variant: "destructive"
          });
        }
      } else {
        setPdfUrl(null); 
        if (!jobData?.enhanced_resume_id) console.warn("[ComparisonPage] PDF Effect: enhanced_resume_id is missing for PDF check.");
        if (!user?.id) console.warn("[ComparisonPage] PDF Effect: user.id is missing for PDF check.");
      }
    };
    
    if (jobData && !isLoading) {
      checkAndFetchPdf();
    }
  }, [jobData, user?.id, isLoading]);

  // Handle download for the ENHANCED resume
  const handleDownload = async (format: 'pdf' | 'docx' = 'pdf') => {
    if (!jobData?.enhanced_resume_id || !user?.id) {
      toast({
        title: "Download failed",
        description: "Enhanced Resume ID or user information is missing.",
        variant: "destructive"
      });
      return;
    }
    
    setIsDownloading(true);
    setDownloadFormat(format); 
    console.log(`[ComparisonPage] Download: Initiated for ${format}, enhanced ID: ${jobData.enhanced_resume_id}`);
    
    try {
      if (format === 'docx') {
          console.log("[ComparisonPage] Download: DOCX format selected (to be implemented via API).");
          toast({ title: "DOCX Download", description: "DOCX download functionality to be implemented via API.", variant: "default" });
          setIsDownloading(false); 
          return; 
      }

      const url = await getPdfUrl(jobData.enhanced_resume_id, user.id); 
      if (!url) {
        throw new Error('Could not generate download URL for the enhanced resume.');
      }
      console.log(`[ComparisonPage] Download: PDF URL for download: ${url}`);
      
      window.open(url, '_blank');
      
      toast({
        title: "Download successful",
        description: `Your optimized resume (${format.toUpperCase()}) has been opened in a new tab.`
      });
    } catch (error) {
      console.error("[ComparisonPage] Download: Error for enhanced resume:", error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "There was an error downloading your resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
      console.log("[ComparisonPage] Download: Finished.");
    }
  };

  console.log('[ComparisonPage] Before main return. isLoading:', isLoading, 'optimizationResult:', !!optimizationResult, 'pdfUrl:', pdfUrl);

  if (isLoading) {
    console.log('[ComparisonPage] Rendering: Main loading state.');
    return <div className="min-h-screen bg-draft-bg">
        <Header />
        <div className="h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-base text-foreground">Loading optimization results...</p>
          </div>
        </div>
      </div>;
  }

  if (!optimizationResult && !isLoading) {
    console.log('[ComparisonPage] Rendering: No optimization result found and not loading.');
    return <div className="min-h-screen bg-draft-bg">
        <Header />
        <div className="px-8 py-10 md:px-12 lg:px-20">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl mb-4">No Results Found</h2>
            <p className="text-base text-muted-foreground mb-6">
              We couldn't find optimization results for job ID: {jobIdParam}. This could be due to missing information or an issue during processing. Please try optimizing your resume again.
            </p>
            <Button variant="default" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>;
  }
  
  console.log('[ComparisonPage] Rendering: Main content with results.');
  
  // ... keep existing code (improvementData, analysisData, groupedImprovements processing)
  const improvementData = optimizationResult?.modifications || [];
  console.log("[ComparisonPage] Data for rendering: Improvements data:", improvementData);

  const analysisData = optimizationResult?.analysis_data || {
    old_score: 0,
    improved_score: 0,
    match_percentage: 0,
    keyword_matches: 0,
    total_keywords: 0
  };
  console.log("[ComparisonPage] Data for rendering: Analysis data:", analysisData);

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
  console.log("[ComparisonPage] Data for rendering: Grouped improvements:", groupedImprovements);
  
  return <div className="min-h-screen bg-draft-bg">
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
              
              {Object.keys(groupedImprovements).length > 0 ? <div className="space-y-6">
                  {Object.entries(groupedImprovements).map(([key, group], index) => <Collapsible key={index} defaultOpen={index === 0} className="bg-card rounded-xl overflow-hidden shadow-sm border border-border transition-all hover:shadow-md">
                      <CollapsibleTrigger className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors">
                        <div>
                          <h3 className="text-2xl">{group.company}</h3>
                          {group.position && <p className="text-base text-muted-foreground mt-1 italic">{group.position}</p>}
                        </div>
                        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 ui-open:rotate-180" />
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="px-5 pb-5">
                        <div className="space-y-7 pt-2">
                          {group.modifications.map((mod, idx) => <div key={idx} className="transition hover:translate-y-[-2px] duration-300">
                              <div className="border-l-4 border-primary/40 pl-4 mb-6">
                                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Original</p>
                                <p className="text-base text-foreground/90 leading-relaxed pl-2">{mod.original}</p>
                              </div>
                              
                              <div className="bg-primary/10 p-5 rounded-xl border border-primary/20">
                                <p className="text-sm text-primary uppercase tracking-wider mb-2">Enhanced</p>
                                <p className="text-base text-primary leading-relaxed pl-2">{mod.improved}</p>
                                
                                {mod.type && <div className="mt-4 flex justify-end">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${mod.type === 'Major' ? 'bg-draft-coral bg-opacity-15 text-draft-coral' : 'bg-draft-mint bg-opacity-15 text-draft-green'}`}>
                                      {mod.type} Enhancement
                                    </span>
                                  </div>}
                              </div>
                            </div>)}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>)}
                </div> : <div className="bg-card p-8 text-center rounded-lg border border-border">
                  <p className="text-base text-muted-foreground">No enhancements found for this job.</p>
                </div>}
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
                          : (isLoading ? "Processing results..." : "Loading preview or PDF not found...")} 
                      </p>
                  {!pdfUrl && jobData?.enhanced_resume_id && user?.id && !isLoading && <p className="text-sm text-destructive mt-2">If this persists, the enhanced PDF might not be available or could not be loaded.</p>}
                  {isLoading && <Loader className="h-6 w-6 animate-spin text-primary mt-4" />}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>;
};
export default ComparisonPage;
