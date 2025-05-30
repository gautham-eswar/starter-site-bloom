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
  const originalResumeIdParam = searchParams.get('originalResumeId');
  const enhancedResumeIdParam = searchParams.get('enhancedResumeId');
  const jobIdParam = searchParams.get('jobId');

  const {
    resumeId: contextResumeId, // In ResumeContext, resumeId should store the ENHANCED ID for this page
    setResumeId: setContextEnhancedResumeId,
    jobId: contextJobId,
    setJobId: setContextJobId,
    optimizationResult,
    setOptimizationResult
  } = useResumeContext();

  const {
    resumeId: pipelineOriginalResumeId, // From PipelineContext, this is the original resume ID
    jobId: pipelineJobId,
    enhancedResumeId: pipelineEnhancedResumeId, // From PipelineContext
    enhancementAnalysis // From PipelineContext
  } = usePipelineContext();

  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true); // Main page loading state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx'>('pdf');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null); // URL for the PDF viewer

  // Determine the IDs to use, prioritizing URL params
  const activeEnhancedResumeId = enhancedResumeIdParam || pipelineEnhancedResumeId || contextResumeId;
  const activeOriginalResumeId = originalResumeIdParam || pipelineOriginalResumeId;
  const activeJobId = jobIdParam || pipelineJobId || contextJobId;

  console.log('[ComparisonPage] Render. isLoading:', isLoading, 'pdfUrl:', pdfUrl, 'activeEnhancedResumeId:', activeEnhancedResumeId);

  // Check if PDF exists and get URL for the ENHANCED resume
  useEffect(() => {
    const checkAndFetchPdf = async () => {
      if (activeEnhancedResumeId && user?.id) {
        console.log(`[ComparisonPage] PDF Effect: Starting PDF check for enhancedResumeId: ${activeEnhancedResumeId}, user: ${user.id}`);
        try {
          // We can be optimistic here. If getPdfUrl fails, it will throw.
          // const exists = await checkPdfExists(activeEnhancedResumeId, user.id);
          // console.log(`[ComparisonPage] PDF Effect: PDF exists? ${exists} for ${activeEnhancedResumeId}`);
          // if (exists) {
          const url = await getPdfUrl(activeEnhancedResumeId, user.id);
          setPdfUrl(url);
          console.log(`[ComparisonPage] PDF Effect: Successfully set PDF URL for ${activeEnhancedResumeId}: ${url}`);
          // } else {
          //   setPdfUrl(null);
          //   console.warn(`[ComparisonPage] PDF Effect: PDF for ${activeEnhancedResumeId} not found by checkPdfExists.`);
          //   toast({ title: "PDF Not Found", description: "The enhanced PDF could not be located in storage.", variant: "warning" });
          // }
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
        if (!activeEnhancedResumeId) console.warn("[ComparisonPage] PDF Effect: activeEnhancedResumeId is missing for PDF check.");
        if (!user?.id) console.warn("[ComparisonPage] PDF Effect: user.id is missing for PDF check.");
      }
    };
    checkAndFetchPdf();
  }, [activeEnhancedResumeId, user?.id]); // Removed toast from dependencies as it's stable

  // Fetch/process optimization results
  useEffect(() => {
    console.log("[ComparisonPage] Optimization Effect: Triggered. Initial state - isLoading:", isLoading);
    setIsLoading(true); // Explicitly set loading true at the beginning of this effect
    console.log("[ComparisonPage] Optimization Effect: Set isLoading to true. Active IDs - Original:", activeOriginalResumeId, "Enhanced:", activeEnhancedResumeId, "Job:", activeJobId);
    console.log("[ComparisonPage] Optimization Effect: Context states - enhancementAnalysis:", enhancementAnalysis, "optimizationResult:", optimizationResult);
    console.log("[ComparisonPage] Optimization Effect: Pipeline context IDs - Original:", pipelineOriginalResumeId, "Enhanced:", pipelineEnhancedResumeId, "Job:", pipelineJobId);


    if (!activeEnhancedResumeId || !activeOriginalResumeId || !activeJobId) {
      toast({
        title: "Missing Information",
        description: "Key identifiers (original resume, enhanced resume, or job ID) are missing. Cannot display results.",
        variant: "destructive",
      });
      setOptimizationResult(null);
      console.log("[ComparisonPage] Optimization Effect: Missing IDs. Setting isLoading to false.");
      setIsLoading(false);
      return;
    }

    // Update ResumeContext with the active enhanced ID and job ID
    if (activeEnhancedResumeId && activeEnhancedResumeId !== contextResumeId) {
      console.log("[ComparisonPage] Optimization Effect: Updating contextEnhancedResumeId to", activeEnhancedResumeId);
      setContextEnhancedResumeId(activeEnhancedResumeId);
    }
    if (activeJobId && activeJobId !== contextJobId) {
      console.log("[ComparisonPage] Optimization Effect: Updating contextJobId to", activeJobId);
      setContextJobId(activeJobId);
    }
    
    if (optimizationResult && optimizationResult.resume_id === activeEnhancedResumeId && optimizationResult.job_id === activeJobId) {
      console.log("[ComparisonPage] Optimization Effect: Using optimizationResult from ResumeContext. Setting isLoading to false.", optimizationResult);
      setIsLoading(false);
      return;
    }
    
    if (enhancementAnalysis && 
        pipelineJobId === activeJobId && 
        pipelineEnhancedResumeId === activeEnhancedResumeId &&
        pipelineOriginalResumeId === activeOriginalResumeId) {
      console.log("[ComparisonPage] Optimization Effect: Using enhancementAnalysis from PipelineContext. Setting isLoading to false.", enhancementAnalysis);
      const pipelineData: OptimizationResult = {
        resume_id: pipelineEnhancedResumeId,
        job_id: pipelineJobId,
        status: 'completed', 
        created_at: new Date().toISOString(),
        modifications: enhancementAnalysis.modifications_summary || [],
        analysis_data: {
          old_score: enhancementAnalysis.old_score || 0,
          improved_score: enhancementAnalysis.improved_score || 0,
          match_percentage: enhancementAnalysis.match_percentage || 0,
          keyword_matches: enhancementAnalysis.keyword_matches || 0,
          total_keywords: enhancementAnalysis.total_keywords || 0,
        }
      };
      setOptimizationResult(pipelineData);
      setIsLoading(false);
      return;
    }
    
    console.log("[ComparisonPage] Optimization Effect: No suitable optimization results found in context. Setting isLoading to false.");
    setOptimizationResult(null);
    setIsLoading(false);

  }, [
    activeOriginalResumeId, activeEnhancedResumeId, activeJobId, 
    enhancementAnalysis, optimizationResult, 
    setContextEnhancedResumeId, setContextJobId, setOptimizationResult,
    contextResumeId, contextJobId,
    pipelineJobId, pipelineEnhancedResumeId, pipelineOriginalResumeId
  ]); // Removed toast from dependencies

  // Handle download for the ENHANCED resume
  const handleDownload = async (format: 'pdf' | 'docx' = 'pdf') => {
    if (!activeEnhancedResumeId || !user?.id) {
      toast({
        title: "Download failed",
        description: "Enhanced Resume ID or user information is missing.",
        variant: "destructive"
      });
      return;
    }
    
    setIsDownloading(true);
    setDownloadFormat(format); 
    console.log(`[ComparisonPage] Download: Initiated for ${format}, enhanced ID: ${activeEnhancedResumeId}`);
    
    try {
      if (format === 'docx') {
          console.log("[ComparisonPage] Download: DOCX format selected (to be implemented via API).");
          toast({ title: "DOCX Download", description: "DOCX download functionality to be implemented via API.", variant: "default" });
          setIsDownloading(false); 
          return; 
      }

      const url = await getPdfUrl(activeEnhancedResumeId, user.id); 
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
            <Loader className="h-8 w-8 animate-spin text-primary mb-4" /> {/* Updated icon color */}
            <p className="text-base text-foreground">Loading optimization results...</p> {/* Updated text */}
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
            {/* h2: text-2xl. Color from base. */}
            <h2 className="text-2xl mb-4">No Results Found</h2>
            {/* p: text-base text-muted-foreground. */}
            <p className="text-base text-muted-foreground mb-6">
              We couldn't find optimization results for this resume. This could be due to missing information or an issue during processing. Please try optimizing your resume again.
            </p>
            {/* Button: variant="default" */}
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
        {/* h1: text-4xl. Color from base. */}
        <h1 className="text-4xl mb-8 text-center">Resume Enhancement Results</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left side - Score Summary and Improvements */}
          <div className="space-y-10">
            {/* Score Summary Cards */}
            <div>
              {/* h2: text-3xl. Color from base. */}
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
              {/* h2: text-3xl. Color from base. */}
              <h2 className="text-3xl mb-6">Resume Enhancements</h2>
              
              {Object.keys(groupedImprovements).length > 0 ? <div className="space-y-6">
                  {Object.entries(groupedImprovements).map(([key, group], index) => <Collapsible key={index} defaultOpen={index === 0} className="bg-card rounded-xl overflow-hidden shadow-sm border border-border transition-all hover:shadow-md">
                      <CollapsibleTrigger className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors">
                        <div>
                          {/* h3: text-2xl. Color from base. */}
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
                                    {/* Badge colors are specific, keep as is or create variants */}
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
                {/* h2: text-3xl. Color from base. */}
                <h2 className="text-3xl">Enhanced Resume</h2>
                <div className="flex gap-3">
                  {/* Buttons use default variant */}
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
                        {(!activeEnhancedResumeId || !user?.id) 
                          ? "Preview unavailable: Missing resume information." 
                          : (isLoading ? "Processing results..." : "Loading preview or PDF not found...")} 
                      </p>
                  {!pdfUrl && activeEnhancedResumeId && user?.id && !isLoading && <p className="text-sm text-destructive mt-2">If this persists, the enhanced PDF might not be available or could not be loaded.</p>} {/* Changed text-draft-coral to text-destructive */}
                  {isLoading && <Loader className="h-6 w-6 animate-spin text-primary mt-4" />} {/* Updated icon color */}
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
