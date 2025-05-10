import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader } from 'lucide-react';
import Header from '@/components/Header';
import { useResumeContext } from '@/contexts/ResumeContext';
import { getOptimizationResults, downloadResume as apiDownloadResume } from '@/services/api';
import { OptimizationResult } from '@/types/api';
import { toast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
import PDFViewer from '@/components/PDFViewer';
import { downloadPdf, checkPdfExists } from '@/services/pdfStorage';
import { useAuth } from '@/components/auth/AuthProvider';
import SummaryPanel from '@/components/comparison/SummaryPanel';
import BulletComparisonContainer from '@/components/comparison/BulletComparisonContainer';
import ComparisonSkeleton from '@/components/comparison/ComparisonSkeleton';

const ComparisonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const resumeIdParam = searchParams.get('resumeId');
  const jobIdParam = searchParams.get('jobId');

  const { 
    resumeId: contextResumeId, 
    setResumeId,
    jobId: contextJobId,
    setJobId,
    optimizationResult,
    setOptimizationResult
  } = useResumeContext();

  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx'>('pdf');
  const [pdfExists, setPdfExists] = useState<boolean | null>(null);

  // Use URL params if available, otherwise use context
  const resumeId = resumeIdParam || contextResumeId;
  const jobId = jobIdParam || contextJobId;

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

        // Fetch results
        setIsLoading(true);
        const results = await getOptimizationResults(resumeId, jobId);
        setOptimizationResult(results);
      } catch (error) {
        console.error("Error fetching optimization results:", error);
        toast({
          title: "Error fetching results",
          description: "There was an error fetching your optimization results.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [resumeId, jobId, resumeIdParam, jobIdParam, contextResumeId, contextJobId, setResumeId, setJobId, setOptimizationResult]);

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
        const response = await apiDownloadResume(resumeId, format);
        
        if (response instanceof Response) {
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
        } else {
          throw new Error("Invalid response format from API");
        }
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
        <div className="px-8 py-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
            {/* Left side - Loading skeleton */}
            <div className="space-y-8">
              <h2 className="text-2xl font-serif text-draft-green">Improvements</h2>
              <ComparisonSkeleton />
            </div>
            
            {/* Right side - Loading state */}
            <div className="space-y-4 bg-[#F7F4ED] p-6 rounded-lg">
              <h2 className="text-2xl font-serif text-draft-green">Resume Preview</h2>
              <div className="bg-white rounded-lg h-[600px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Loader className="h-8 w-8 animate-spin text-draft-green mb-4" />
                  <p className="text-draft-green">Loading resume preview...</p>
                </div>
              </div>
            </div>
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

  // Prepare the data for the comparison
  const modifications = optimizationResult?.modifications || [];

  return (
    <div className="min-h-screen bg-draft-bg">
      <Header />
      
      <main className="px-8 py-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          {/* Left side - Improvements */}
          <div className="space-y-8">
            <h2 className="text-2xl font-serif text-draft-green">Improvements</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-draft-green bg-white rounded-lg p-4 flex flex-col items-center justify-center">
                <p className="text-draft-green mb-2">Old Score</p>
                <p className="text-4xl font-bold text-draft-green">
                  {optimizationResult?.analysis_data.old_score || 0}/100
                </p>
              </div>
              
              <div className="border border-draft-green bg-white rounded-lg p-4 flex flex-col items-center justify-center">
                <p className="text-draft-green mb-2">Improved Score</p>
                <p className="text-4xl font-bold text-draft-green">
                  {optimizationResult?.analysis_data.improved_score || 0}/100
                </p>
              </div>
              
              <div className="border border-draft-green bg-white rounded-lg p-4 flex flex-col items-center justify-center">
                <p className="text-draft-green mb-2">Match Rate</p>
                <p className="text-4xl font-bold text-draft-green">
                  {optimizationResult?.analysis_data.match_percentage || 0}%
                </p>
              </div>
            </div>
            
            {/* Summary Panel */}
            <SummaryPanel modifications={modifications} />
            
            {/* Bullet Comparisons */}
            <BulletComparisonContainer modifications={modifications} />
          </div>
          
          {/* Right side - Resume Preview */}
          <div className="space-y-4 bg-[#F7F4ED] p-6 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif text-draft-green">Resume Preview</h2>
              <div className="flex gap-2">
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
            
            <div className="bg-white rounded-lg h-[600px] overflow-hidden">
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
                      <h1 className="text-2xl font-bold text-draft-green">Lucy Cheng</h1>
                      <p>CPA</p>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <p>Phone: 942-957-0000</p>
                        <p>Email: lucy@gmail.com</p>
                      </div>
                      <div>
                        <p>LinkedIn: linkedin.com/in/lucycheng</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm">Results-focused senior CPA and CMA with 10 years of experience at Mastercard and Oracle. Seeking to leverage proven skills in account reconciliation and cloud-based accounting for Goldman Sachs. Enhanced Oracle's cloud computing process to save 900 department hours per year. Identified and rectified a recurring issue that saved $1.3 million annually.</p>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-medium text-draft-green border-b border-draft-green pb-1">Experience</h2>
                      
                      <div className="mt-3">
                        <div className="flex justify-between">
                          <p className="font-medium">Senior CPA</p>
                          <p>2017-07 - present</p>
                        </div>
                        <p>Oracle, Chicago</p>
                        <ul className="list-disc ml-5 mt-1 text-sm">
                          <li>Supervised general accounting functions for monthly close process</li>
                          <li>Improved use of cloud computing best practices to enhance data security and save 900 hours per year, saving the department $800,000 annually.</li>
                          <li>Identified and resolved a company-wide process issue that saved $2 million per year.</li>
                        </ul>
                      </div>
                      
                      <div className="mt-5">
                        <div className="flex justify-between">
                          <p className="font-medium">CPA, Capital Accounting</p>
                          <p>2010-06 - 2015-06</p>
                        </div>
                        <p>Mastercard, Chicago</p>
                        <ul className="list-disc ml-5 mt-1 text-sm">
                          <li>Key member of accounting month-end close process.</li>
                          <li>Through account analysis, identified opportunity to reduce certain variable costs by 15%, saving the company a total of $1.2 million annually.</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-medium text-draft-green border-b border-draft-green pb-1">Education</h2>
                      
                      <div className="mt-3">
                        <div className="flex justify-between">
                          <p className="font-medium">MBA, Illinois State University</p>
                          <p>2006-09 - 2010-06</p>
                        </div>
                        <ul className="list-disc ml-5 mt-1 text-sm">
                          <li>Concentration in accounting</li>
                          <li>Dean's List</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-medium text-draft-green border-b border-draft-green pb-1">Skills</h2>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-sm">Financial payments</p>
                          <div className="flex mt-1">
                            {Array(5).fill(0).map((_, i) => (
                              <div key={i} className="w-5 h-2 bg-draft-green mr-1"></div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm">Payroll</p>
                          <div className="flex mt-1">
                            {Array(5).fill(0).map((_, i) => (
                              <div key={i} className="w-5 h-2 bg-draft-green mr-1"></div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm">IT skills</p>
                          <div className="flex mt-1">
                            {Array(5).fill(0).map((_, i) => (
                              <div key={i} className="w-5 h-2 bg-draft-green mr-1"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComparisonPage;
