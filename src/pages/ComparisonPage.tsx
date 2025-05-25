import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import { useResumeContext } from '@/contexts/ResumeContext';
import { usePipelineContext } from '@/contexts/ResumeContext';
import { OptimizationResult, EnhancementAnalysis, Modification } from '@/types/api';
import { toast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
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
  const resumeIdParam = searchParams.get('resumeId');
  const jobIdParam = searchParams.get('jobId');

  // Import from both contexts
  const {
    resumeId: contextResumeId,
    setResumeId,
    jobId: contextJobId,
    setJobId,
    optimizationResult,
    setOptimizationResult
  } = useResumeContext();

  // Get data from PipelineContext as a fallback
  const {
    resumeId: pipelineResumeId,
    jobId: pipelineJobId,
    enhancementAnalysis
  } = usePipelineContext();
  const {
    user
  } = useAuth();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx'>('pdf');
  const [pdfExists, setPdfExists] = useState<boolean | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Use URL params if available, otherwise use context
  const resumeId = resumeIdParam || contextResumeId || pipelineResumeId;
  const jobId = jobIdParam || contextJobId || pipelineJobId;

  // Check if PDF exists and get URL
  useEffect(() => {
    const checkPdf = async () => {
      if (resumeId && user?.id) {
        try {
          const exists = await checkPdfExists(resumeId, user.id);
          setPdfExists(exists);
          
          if (exists) {
            const url = await getPdfUrl(resumeId, user.id);
            setPdfUrl(url);
          }
        } catch (err) {
          console.error('Error checking PDF:', err);
        }
      }
    };
    checkPdf();
  }, [resumeId, user?.id]);

  // Fetch optimization results (now relies on context)
  useEffect(() => {
    const processResults = () => {
      setIsLoading(true);

      if (!resumeId || !jobId) {
        toast({
          title: "Missing Information",
          description: "Resume ID or Job ID is missing. Cannot display results.",
          variant: "destructive",
        });
        setOptimizationResult(null);
        setIsLoading(false);
        return;
      }

      // Update context with URL params if they exist
      if (resumeIdParam && resumeIdParam !== contextResumeId) {
        setResumeId(resumeIdParam);
      }
      if (jobIdParam && jobIdParam !== contextJobId) {
        setJobId(jobIdParam);
      }

      // If optimizationResult is already in ResumeContext, use it
      if (optimizationResult) {
        console.log("Using optimizationResult from ResumeContext:", optimizationResult);
        setIsLoading(false);
        return;
      }
      
      // If not in ResumeContext, try enhancementAnalysis from PipelineContext
      if (enhancementAnalysis) {
        console.log("Using enhancementAnalysis from PipelineContext as fallback:", enhancementAnalysis);
        const pipelineData: OptimizationResult = {
          resume_id: resumeId || '',
          job_id: jobId || '',
          status: 'completed',
          created_at: new Date().toISOString(),
          modifications: enhancementAnalysis.modifications_summary || [],
          analysis_data: {
            old_score: enhancementAnalysis.old_score || 0,
            improved_score: enhancementAnalysis.improved_score || 0,
            match_percentage: enhancementAnalysis.match_percentage || 0,
            keyword_matches: enhancementAnalysis.keyword_matches || 0,
            total_keywords: enhancementAnalysis.total_keywords || 0
          }
        };
        setOptimizationResult(pipelineData); // Populate ResumeContext
        setIsLoading(false);
        return;
      }
      
      // If no data in either context, set loading to false.
      // The UI will show "No Results Found" if optimizationResult remains null.
      console.log("No optimization results found in context for ComparisonPage.");
      setIsLoading(false);
    };

    processResults();
  }, [resumeId, jobId, resumeIdParam, jobIdParam, contextResumeId, contextJobId, setResumeId, setJobId, optimizationResult, setOptimizationResult, enhancementAnalysis]);

  // Handle download
  const handleDownload = async (format: 'pdf' | 'docx' = 'pdf') => {
    if (!resumeId || !user?.id) {
      toast({
        title: "Download failed",
        description: "Resume ID or user ID is missing.",
        variant: "destructive"
      });
      return;
    }
    
    setIsDownloading(true);
    setDownloadFormat(format);
    
    try {
      // Get a signed URL that will open directly
      const url = await getPdfUrl(resumeId, user.id);
      if (!url) {
        throw new Error('Could not generate download URL');
      }
      
      // Open the PDF in a new tab
      window.open(url, '_blank');
      
      toast({
        title: "Download successful",
        description: `Your optimized resume has been opened in a new tab`
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your resume. Please try again.",
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

  // Show error if no results found
  if (!optimizationResult && !isLoading) {
    return <div className="min-h-screen bg-draft-bg">
        <Header />
        <div className="px-8 py-10 md:px-12 lg:px-20">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-serif text-draft-green mb-4">No Results Found</h2>
            <p className="text-draft-text mb-6 font-serif">
              We couldn't find optimization results for this resume. Please try optimizing your resume again.
            </p>
            <Button onClick={() => window.location.href = '/'} className="bg-draft-green hover:bg-draft-green/90 text-white">
              Back to Home
            </Button>
          </div>
        </div>
      </div>;
  }

  // Extract modifications data from the optimizationResult
  // Check for both standard API response structure and the enhancementAnalysis format
  const improvementData = optimizationResult?.modifications || [];
  console.log("Improvements data:", improvementData);

  // Extract analysis data
  const analysisData = optimizationResult?.analysis_data || {
    old_score: 0,
    improved_score: 0,
    match_percentage: 0,
    keyword_matches: 0,
    total_keywords: 0
  };

  // Group modifications by company and position
  // Handle both standard modifications and bullet-specific modifications
  const groupedImprovements: GroupedModifications = {};
  improvementData.forEach(mod => {
    // Check if this is from the API format (bullet_idx, enhanced_bullet exist)
    const originalText = mod.original || mod.original_bullet || '';
    const improvedText = mod.improved || mod.enhanced_bullet || '';

    // Create a unique key for each company+position combination
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

    // Create a normalized modification object
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
                  <p className="text-draft-green/70 font-serif">No enhancements found</p>
                </div>}
            </div>
          </div>
          
          {/* Right side - Resume Preview */}
          <div>
            <div className="sticky top-24 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif text-draft-green">Enhanced Resume</h2>
                <div className="flex gap-3">
                  <Button className="bg-draft-green hover:bg-draft-green/90 text-white" onClick={() => handleDownload('pdf')} disabled={isDownloading}>
                    {isDownloading && downloadFormat === 'pdf' ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    PDF
                  </Button>
                  <Button className="bg-draft-green hover:bg-draft-green/90 text-white" onClick={() => handleDownload('docx')} disabled={isDownloading}>
                    {isDownloading && downloadFormat === 'docx' ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    DOCX
                  </Button>
                </div>
              </div>
              
              <div className="bg-white border border-draft-green/10 rounded-xl overflow-hidden h-[680px] shadow-lg">
                {resumeId && user?.id ? (
                  <PDFViewer 
                    resumeId={resumeId} 
                    userId={user.id} 
                    height="100%" 
                    directUrl={pdfUrl} 
                  />
                ) : (
                  <div className="p-6 h-full">
                    <div className="space-y-6">
                      <div className="text-center">
                        <h1 className="text-2xl font-bold text-draft-green font-serif">Enhanced Resume Preview</h1>
                        <p className="text-draft-green/70 font-serif">Resume preview not available</p>
                      </div>
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
