
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import { useResumeContext } from '@/contexts/ResumeContext';
import { usePipelineContext } from '@/contexts/ResumeContext';
import { OptimizationResult, EnhancementAnalysis, Modification } from '@/types/api';
import { toast } from '@/hooks/use-toast';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PDFViewer from '@/components/PDFViewer';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx'>('pdf');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Determine the IDs to use, prioritizing URL params
  const activeEnhancedResumeId = enhancedResumeIdParam || pipelineEnhancedResumeId || contextResumeId;
  const activeOriginalResumeId = originalResumeIdParam || pipelineOriginalResumeId;
  const activeJobId = jobIdParam || pipelineJobId || contextJobId;

  // Check if PDF exists and get URL for the ENHANCED resume
  useEffect(() => {
    const checkAndFetchPdf = async () => {
      if (activeEnhancedResumeId && user?.id) {
        console.log(`Checking PDF for enhancedResumeId: ${activeEnhancedResumeId}, user: ${user.id}`);
        try {
          const exists = await checkPdfExists(activeEnhancedResumeId, user.id);
          if (exists) {
            const url = await getPdfUrl(activeEnhancedResumeId, user.id);
            setPdfUrl(url);
            console.log(`PDF URL for enhanced resume (${activeEnhancedResumeId}) set: ${url}`);
          } else {
            setPdfUrl(null);
            console.warn(`PDF for enhanced resume (${activeEnhancedResumeId}) not found in storage.`);
            // Optionally, toast here or rely on PDFViewer's internal handling
          }
        } catch (err) {
          console.error('Error checking/fetching PDF for enhanced resume:', err);
          setPdfUrl(null);
        }
      } else {
        setPdfUrl(null); // Reset if IDs are missing
        if (!activeEnhancedResumeId) console.warn("activeEnhancedResumeId is missing for PDF check.");
        if (!user?.id) console.warn("user.id is missing for PDF check.");
      }
    };
    checkAndFetchPdf();
  }, [activeEnhancedResumeId, user?.id]);

  // Fetch/process optimization results
  useEffect(() => {
    setIsLoading(true);
    console.log("ComparisonPage: useEffect for processing results triggered.", {
      activeOriginalResumeId, activeEnhancedResumeId, activeJobId, enhancementAnalysis, optimizationResult
    });

    if (!activeEnhancedResumeId || !activeOriginalResumeId || !activeJobId) {
      toast({
        title: "Missing Information",
        description: "Key identifiers (original resume, enhanced resume, or job ID) are missing. Cannot display results.",
        variant: "destructive",
      });
      setOptimizationResult(null);
      setIsLoading(false);
      console.error("Missing IDs for displaying results:", { activeOriginalResumeId, activeEnhancedResumeId, activeJobId });
      return;
    }

    // Update ResumeContext with the active enhanced ID and job ID
    if (activeEnhancedResumeId && activeEnhancedResumeId !== contextResumeId) {
      setContextEnhancedResumeId(activeEnhancedResumeId);
    }
    if (activeJobId && activeJobId !== contextJobId) {
      setContextJobId(activeJobId);
    }

    // Priority: 1. optimizationResult from ResumeContext (if matches current IDs)
    //           2. enhancementAnalysis from PipelineContext (if matches current IDs)
    //           3. Fallback: No results
    
    if (optimizationResult && optimizationResult.resume_id === activeEnhancedResumeId && optimizationResult.job_id === activeJobId) {
      console.log("Using optimizationResult from ResumeContext:", optimizationResult);
      setIsLoading(false);
      return;
    }
    
    if (enhancementAnalysis && 
        enhancementAnalysis.job_id === activeJobId && 
        enhancementAnalysis.enhanced_resume_id === activeEnhancedResumeId &&
        enhancementAnalysis.original_resume_id === activeOriginalResumeId) {
      console.log("Using enhancementAnalysis from PipelineContext to build OptimizationResult:", enhancementAnalysis);
      const pipelineData: OptimizationResult = {
        resume_id: enhancementAnalysis.enhanced_resume_id, // This is the ID of the enhanced resume
        job_id: enhancementAnalysis.job_id,
        status: 'completed', // Assuming completed if we have analysis
        created_at: new Date().toISOString(), // Placeholder, actual creation time is on backend
        modifications: enhancementAnalysis.modifications_summary || [],
        analysis_data: {
          old_score: enhancementAnalysis.old_score || 0,
          improved_score: enhancementAnalysis.improved_score || 0,
          match_percentage: enhancementAnalysis.match_percentage || 0,
          keyword_matches: enhancementAnalysis.keyword_matches || 0,
          total_keywords: enhancementAnalysis.total_keywords || 0,
          // Add any other fields from EnhancementAnalysis that map to OptimizationResult.analysis_data
        }
      };
      setOptimizationResult(pipelineData);
      setIsLoading(false);
      return;
    }
    
    console.log("No suitable optimization results found in context for ComparisonPage. Active IDs:", { activeOriginalResumeId, activeEnhancedResumeId, activeJobId });
    // If we reach here, no data is available or doesn't match.
    // A fetch might be needed if data isn't passed via context, but current design relies on context.
    setOptimizationResult(null); // Ensure it's cleared if no valid data
    setIsLoading(false);

  }, [
    activeOriginalResumeId, activeEnhancedResumeId, activeJobId, 
    enhancementAnalysis, optimizationResult, 
    setContextEnhancedResumeId, setContextJobId, setOptimizationResult,
    contextResumeId, contextJobId // Dependencies for context updates
  ]);

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
    setDownloadFormat(format); // Keep track of which format is downloading
    
    try {
      // TODO: The backend /api/download needs to handle 'docx' format if supported.
      // For now, assuming getPdfUrl gives a URL for PDF.
      // If DOCX download uses a different mechanism, this needs adjustment.
      // The current getPdfUrl is specific to PDFs in Supabase storage.
      if (format === 'docx') {
          // Placeholder for DOCX download logic if it differs
          // Example: const docxDownloadUrl = `${API_BASE_URL}/api/download/${activeEnhancedResumeId}/docx`;
          // window.open(docxDownloadUrl, '_blank'); 
          toast({ title: "DOCX Download", description: "DOCX download functionality to be implemented via API.", variant: "info" });
          setIsDownloading(false); // Reset early if not fully implemented
          return; 
      }

      const url = await getPdfUrl(activeEnhancedResumeId, user.id); // Fetches PDF for enhanced resume
      if (!url) {
        throw new Error('Could not generate download URL for the enhanced resume.');
      }
      
      window.open(url, '_blank');
      
      toast({
        title: "Download successful",
        description: `Your optimized resume (${format.toUpperCase()}) has been opened in a new tab.`
      });
    } catch (error) {
      console.error("Download error for enhanced resume:", error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "There was an error downloading your resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return <div className="min-h-screen bg-draft-bg">
        <Header />
        <div className="h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-draft-green mb-4" />
            <p className="text-draft-green font-serif">Loading optimization results...</p>
          </div>
        </div>
      </div>;
  }

  if (!optimizationResult && !isLoading) {
    return <div className="min-h-screen bg-draft-bg">
        <Header />
        <div className="px-8 py-10 md:px-12 lg:px-20">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-serif text-draft-green mb-4">No Results Found</h2>
            <p className="text-draft-text mb-6 font-serif">
              We couldn't find optimization results for this resume. This could be due to missing information or an issue during processing. Please try optimizing your resume again.
            </p>
            <Button onClick={() => navigate('/')} className="bg-draft-green hover:bg-draft-green/90 text-white">
              Back to Home
            </Button>
          </div>
        </div>
      </div>;
  }

  const improvementData = optimizationResult?.modifications || [];
  console.log("Improvements data:", improvementData);

  const analysisData = optimizationResult?.analysis_data || {
    old_score: 0,
    improved_score: 0,
    match_percentage: 0,
    keyword_matches: 0,
    total_keywords: 0
  };

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
  
  return <div className="min-h-screen bg-draft-bg">
      <Header />
      
      <main className="px-4 py-8 md:px-12 lg:px-20 max-w-[1440px] mx-auto">
        <h1 className="text-3xl font-serif text-draft-green mb-8 text-center">Resume Enhancement Results</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left side - Score Summary and Improvements */}
          <div className="space-y-10">
            {/* Score Summary Cards */}
            <div>
              <h2 className="text-2xl font-serif text-draft-green mb-6">Resume Scorecard</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-draft-green/20 rounded-xl shadow-sm p-6 flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-draft-green/40">
                  <p className="text-draft-green text-sm mb-2 font-medium font-serif">Original Score</p>
                  <p className="text-4xl font-bold text-draft-green font-serif">
                    {analysisData.old_score}/100
                  </p>
                </div>
                
                <div className="bg-white border border-draft-green/20 rounded-xl shadow-sm p-6 flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-draft-green/40">
                  <p className="text-draft-green text-sm mb-2 font-medium font-serif">Enhanced Score</p>
                  <p className="text-4xl font-bold text-draft-green font-serif">
                    {analysisData.improved_score}/100
                  </p>
                </div>
                
                <div className="bg-white border border-draft-green/20 rounded-xl shadow-sm p-6 flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-draft-green/40">
                  <p className="text-draft-green text-sm mb-2 font-medium font-serif">Job Match</p>
                  <p className="text-4xl font-bold text-draft-green font-serif">
                    {analysisData.match_percentage}%
                  </p>
                </div>
              </div>
            </div>
            
            {/* Keyword Summary */}
            
            
            {/* Improvements by Company - Redesigned to be more flowing and modern */}
            <div>
              <h2 className="text-2xl font-serif text-draft-green mb-6">Resume Enhancements</h2>
              
              {Object.keys(groupedImprovements).length > 0 ? <div className="space-y-6">
                  {Object.entries(groupedImprovements).map(([key, group], index) => <Collapsible key={index} defaultOpen={index === 0} className="bg-white rounded-xl overflow-hidden shadow-sm border border-draft-green/10 transition-all hover:shadow-md">
                      <CollapsibleTrigger className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F2FCE2]/50 transition-colors">
                        <div>
                          <h3 className="text-xl text-draft-green font-serif">{group.company}</h3>
                          {group.position && <p className="text-draft-green/70 mt-1 font-serif italic">{group.position}</p>}
                        </div>
                        <ChevronDown className="h-5 w-5 text-draft-green/70 transition-transform duration-200 ui-open:rotate-180" />
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="px-5 pb-5">
                        <div className="space-y-7 pt-2">
                          {group.modifications.map((mod, idx) => <div key={idx} className="transition hover:translate-y-[-2px] duration-300">
                              <div className="border-l-4 border-draft-green/40 pl-4 mb-6">
                                <p className="text-sm text-draft-green/70 uppercase tracking-wider mb-2 font-serif">Original</p>
                                <p className="font-serif text-draft-text/90 leading-relaxed pl-2">{mod.original}</p>
                              </div>
                              
                              <div className="bg-[#F2FCE2]/50 p-5 rounded-xl border border-draft-green/10">
                                <p className="text-sm text-draft-green uppercase tracking-wider mb-2 font-serif">Enhanced</p>
                                <p className="font-serif text-draft-green leading-relaxed pl-2">{mod.improved}</p>
                                
                                {mod.type && <div className="mt-4 flex justify-end">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${mod.type === 'Major' ? 'bg-draft-coral bg-opacity-15 text-draft-coral' : 'bg-draft-mint bg-opacity-15 text-draft-green'} font-serif`}>
                                      {mod.type} Enhancement
                                    </span>
                                  </div>}
                              </div>
                            </div>)}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>)}
                </div> : <div className="bg-white p-8 text-center rounded-lg border border-draft-green/10">
                  <p className="text-draft-green/70 font-serif">No enhancements found for this job.</p>
                </div>}
            </div>
          </div>
          
          {/* Right side - Resume Preview */}
          <div>
            <div className="sticky top-24 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif text-draft-green">Enhanced Resume</h2>
                <div className="flex gap-3">
                  <Button className="bg-draft-green hover:bg-draft-green/90 text-white" onClick={() => handleDownload('pdf')} disabled={isDownloading && downloadFormat === 'pdf'}>
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
                {activeEnhancedResumeId && user?.id ? (
                  <PDFViewer 
                    resumeId={activeEnhancedResumeId} 
                    userId={user.id} 
                    height="100%" 
                    directUrl={pdfUrl} // pdfUrl is already fetched using activeEnhancedResumeId
                  />
                ) : (
                  <div className="p-6 h-full flex flex-col items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-xl font-bold text-draft-green font-serif mb-2">Enhanced Resume Preview</h1>
                      <p className="text-draft-green/70 font-serif">
                        {(!activeEnhancedResumeId || !user?.id) 
                          ? "Preview unavailable: Missing resume information." 
                          : "Loading preview or PDF not found..."}
                      </p>
                      {!pdfUrl && activeEnhancedResumeId && user?.id && <p className="text-sm text-draft-coral mt-2">If this persists, the enhanced PDF might not be available in storage.</p>}
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
