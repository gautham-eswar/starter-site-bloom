import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import { useResumeContext } from '@/contexts/ResumeContext';
import { usePipelineContext } from '@/contexts/ResumeContext'; 
import { getOptimizationResults } from '@/services/api';
import { Modification, OptimizationResult, EnhancementAnalysis } from '@/types/api';
import { toast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
import PDFViewer from '@/components/PDFViewer';
import { downloadPdf, checkPdfExists } from '@/services/pdfStorage';
import { useAuth } from '@/components/auth/AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from '@/components/ui/accordion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

// Helper interface for grouped modifications
interface GroupedModifications {
  [key: string]: {
    company: string;
    position: string;
    modifications: Modification[];
  }
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
    enhancementAnalysis,
  } = usePipelineContext();

  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx'>('pdf');
  const [pdfExists, setPdfExists] = useState<boolean | null>(null);

  // Use URL params if available, otherwise use context
  const resumeId = resumeIdParam || contextResumeId || pipelineResumeId;
  const jobId = jobIdParam || contextJobId || pipelineJobId;

  // Check if PDF exists
  useEffect(() => {
    const checkPdf = async () => {
      if (resumeId && user?.id) {
        const exists = await checkPdfExists(resumeId, user.id);
        setPdfExists(exists);
      }
    };
    
    checkPdf();
  }, [resumeId, user?.id]);

  // Fetch optimization results
  useEffect(() => {
    const fetchResults = async () => {
      if (!resumeId || !jobId) {
        setIsLoading(false);
        return;
      }

      try {
        // Update context with URL params if they exist
        if (resumeIdParam && resumeIdParam !== contextResumeId) {
          setResumeId(resumeIdParam);
        }
        if (jobIdParam && jobIdParam !== contextJobId) {
          setJobId(jobIdParam);
        }

        // Check if we already have enhancement data from PipelineContext
        if (enhancementAnalysis) {
          console.log("Using data from PipelineContext:", enhancementAnalysis);
          
          // Convert enhancementAnalysis to match OptimizationResult structure
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
          setOptimizationResult(pipelineData);
          setIsLoading(false);
          return;
        }
        
        // Fetch results from API if not available in PipelineContext
        setIsLoading(true);
        const results = await getOptimizationResults(resumeId, jobId);
        console.log("Optimization results:", results);
        setOptimizationResult(results);
      } catch (error) {
        console.error("Error fetching optimization results:", error);
        
        // If API call fails but we have enhancementAnalysis, use that
        if (enhancementAnalysis) {
          console.log("API call failed, using PipelineContext data instead");
          
          const fallbackData: OptimizationResult = {
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
          setOptimizationResult(fallbackData);
        } else {
          toast({
            title: "Error fetching results",
            description: "There was an error fetching your optimization results.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [resumeId, jobId, resumeIdParam, jobIdParam, contextResumeId, contextJobId, setResumeId, setJobId, setOptimizationResult, enhancementAnalysis]);

  // Handle download
  const handleDownload = async (format: 'pdf' | 'docx' = 'pdf') => {
    if (!resumeId) {
      toast({
        title: "Download failed",
        description: "Resume ID is missing.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    setDownloadFormat(format);

    try {
      if (format === 'pdf' && pdfExists && user?.id) {
        // Download from Supabase storage if PDF exists there
        const blob = await downloadPdf(resumeId, user.id);
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `optimized_resume.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      } else {
        // Fall back to the API if PDF doesn't exist in storage or format is not PDF
        const response = await getOptimizationResults(resumeId, jobId);
        
        // Create a blob from the response
        const blob = await response.blob();
        
        // Create a link element to trigger the download
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `optimized_resume.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }
      
      toast({
        title: "Download successful",
        description: `Your optimized resume has been downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-draft-bg">
        <Header />
        <div className="h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-draft-green mb-4" />
            <p className="text-draft-green">Loading optimization results...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no results found
  if (!optimizationResult && !isLoading) {
    return (
      <div className="min-h-screen bg-draft-bg">
        <Header />
        <div className="px-8 py-10 md:px-12 lg:px-20">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-serif text-draft-green mb-4">No Results Found</h2>
            <p className="text-draft-text mb-6">
              We couldn't find optimization results for this resume. Please try optimizing your resume again.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-draft-green hover:bg-draft-green/90 text-white"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
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
  
  improvementData.forEach((mod) => {
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

  return (
    <div className="min-h-screen bg-draft-bg">
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
                  <p className="text-draft-green text-sm mb-2 font-medium">Original Score</p>
                  <p className="text-4xl font-bold text-draft-green">
                    {analysisData.old_score}/100
                  </p>
                </div>
                
                <div className="bg-white border border-draft-green/20 rounded-xl shadow-sm p-6 flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-draft-green/40">
                  <p className="text-draft-green text-sm mb-2 font-medium">Enhanced Score</p>
                  <p className="text-4xl font-bold text-draft-green">
                    {analysisData.improved_score}/100
                  </p>
                </div>
                
                <div className="bg-white border border-draft-green/20 rounded-xl shadow-sm p-6 flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-draft-green/40">
                  <p className="text-draft-green text-sm mb-2 font-medium">Job Match</p>
                  <p className="text-4xl font-bold text-draft-green">
                    {analysisData.match_percentage}%
                  </p>
                </div>
              </div>
            </div>
            
            {/* Keyword Summary */}
            <div className="bg-white border border-draft-green/10 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-draft-green">Keyword Optimization</h3>
                <div className="text-sm text-draft-green/80">
                  <span className="font-medium">{analysisData.keyword_matches}</span> of {analysisData.total_keywords} keywords
                </div>
              </div>
              <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-draft-green h-full rounded-full"
                  style={{ width: `${analysisData.total_keywords > 0 ? (analysisData.keyword_matches / analysisData.total_keywords) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            {/* Improvements by Company */}
            <div>
              <h2 className="text-2xl font-serif text-draft-green mb-6">Resume Enhancements</h2>
              
              {Object.keys(groupedImprovements).length > 0 ? (
                <Accordion 
                  type="multiple" 
                  defaultValue={Object.keys(groupedImprovements).map((_, i) => `item-${i}`)} 
                  className="space-y-4"
                >
                  {Object.entries(groupedImprovements).map(([key, group], index) => (
                    <AccordionItem 
                      value={`item-${index}`} 
                      key={index} 
                      className="border border-draft-green/10 rounded-xl overflow-hidden bg-white shadow-sm transition-all hover:shadow-md"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-draft-green/5 data-[state=open]:bg-draft-green/5">
                        <div className="text-left">
                          <h3 className="font-medium text-draft-green text-lg">{group.company}</h3>
                          {group.position && (
                            <p className="text-sm text-draft-green/70">{group.position}</p>
                          )}
                        </div>
                      </AccordionTrigger>
                      
                      <AccordionContent className="px-6 pb-6 pt-2">
                        <div className="space-y-6">
                          {group.modifications.map((mod, idx) => (
                            <div key={idx} className="border border-draft-green/10 rounded-lg overflow-hidden shadow-sm">
                              <div className={`grid ${isMobile ? 'grid-cols-1 gap-0' : 'grid-cols-2 gap-0'}`}>
                                <div className="bg-[#F1F0FB] p-5 border-b md:border-b-0 md:border-r border-draft-green/10">
                                  <h4 className="uppercase text-xs font-semibold text-draft-green/70 mb-3 tracking-wider">Original Bullet Point</h4>
                                  <p className="font-serif text-draft-text leading-relaxed">{mod.original}</p>
                                </div>
                                
                                <div className="bg-[#F2FCE2] p-5">
                                  <h4 className="uppercase text-xs font-semibold text-draft-green mb-3 tracking-wider">Enhanced Bullet Point</h4>
                                  <p className="font-serif text-draft-green leading-relaxed">{mod.improved}</p>
                                </div>
                              </div>
                              
                              {mod.type && (
                                <div className="bg-white px-5 py-3 border-t border-draft-green/10">
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                    mod.type === 'Major' 
                                      ? 'bg-draft-coral bg-opacity-10 text-draft-coral' 
                                      : 'bg-draft-mint bg-opacity-10 text-draft-green'
                                  }`}>
                                    {mod.type} Enhancement
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="bg-white p-8 text-center rounded-lg border border-draft-green/10">
                  <p className="text-draft-green/70">No enhancements found</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Resume Preview */}
          <div>
            <div className="sticky top-24 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif text-draft-green">Enhanced Resume</h2>
                <div className="flex gap-3">
                  <Button 
                    className="bg-draft-green hover:bg-draft-green/90 text-white"
                    onClick={() => handleDownload('pdf')}
                    disabled={isDownloading}
                  >
                    {isDownloading && downloadFormat === 'pdf' ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    PDF
                  </Button>
                  <Button 
                    className="bg-draft-green hover:bg-draft-green/90 text-white"
                    onClick={() => handleDownload('docx')}
                    disabled={isDownloading}
                  >
                    {isDownloading && downloadFormat === 'docx' ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
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
                  />
                ) : (
                  <div className="p-6 h-full">
                    <div className="space-y-6">
                      <div className="text-center">
                        <h1 className="text-2xl font-bold text-draft-green">Enhanced Resume Preview</h1>
                        <p className="text-draft-green/70">Resume preview not available</p>
                      </div>
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
