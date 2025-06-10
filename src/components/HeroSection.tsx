import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import ProgressModal from '@/components/ProgressModal';
import { usePipelineContext, PipelineState } from '@/contexts/ResumeContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { uploadResume, optimizeResume } from '@/services/api';

const NOT_UPLOADED = 0,
  UPLOADING = 1,
  UPLOADED = 2,
  ENHANCED = 4,
  RENDERING = 5;

const HeroSection: React.FC = () => {
  const [isWriteExpanded, setIsWriteExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleWriteExpanded = () => {
    setIsWriteExpanded(prev => !prev);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log(`File selected: ${file.name}`);
    // Check if file is PDF or DOCX
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'pdf' && fileType !== 'docx') {
      toast({
        title: "Invalid file format",
        description: "Please upload a PDF or DOCX file",
        variant: "destructive"
      });
      return;
    }
    
    setResumeFile(file);
    setIsWriteExpanded(true);
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };

  const handleMakeItBetter = async () => {
    // Validation
    if (!resumeFile) {
      toast({
        title: "No resume selected",
        description: "Please upload a resume file first.",
        variant: "destructive",
      });
      return;
    }

    if (!jobDescription.trim()) {
      toast({
        title: "Job description empty",
        description: "Please provide a job description to tailor your resume.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to continue.",
        variant: "destructive",
      });
      return;
    }

    console.log("Starting two-step resume processing...");
    setIsProcessing(true);

    try {
      // Step 1: Upload resume
      console.log("Step 1: Uploading resume...");
      const uploadResponse = await uploadResume(resumeFile, user.id);
      
      if (uploadResponse?.error || !uploadResponse?.data?.resume_id) {
        console.error("Upload failed:", uploadResponse?.error);
        toast({
          title: "Upload failed",
          description: uploadResponse?.error || "Failed to upload resume",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const resumeId = uploadResponse.data.resume_id;
      console.log("Upload successful, resume ID:", resumeId);

      // Step 2: Optimize resume
      console.log("Step 2: Optimizing resume...");
      let optimizeResponse;
      try {
        optimizeResponse = await optimizeResume(resumeId, jobDescription, user.id);
        console.log("OPTIMIZE RES", optimizeResponse);
      } catch (error) {
        console.log("NOT OPTIMIZED BC OF ", error);
        setIsProcessing(false);
        return;
      }
      
      if (optimizeResponse?.error) {
        console.error("Optimization failed:", optimizeResponse.error);
        toast({
          title: "Optimization failed",
          description: optimizeResponse.error,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      console.log("Optimization successful:", optimizeResponse);
      
      // Navigate to comparison page with job_id
      const jobId = optimizeResponse?.data?.job_id;
      if (jobId) {
        console.log("Navigating to comparison page with job_id:", jobId);
        // Reset processing state before navigation
        setIsProcessing(false);
        // Use React Router's navigate function instead of window.href
        navigate(`/comparison?job_id=${jobId}`);
      } else {
        console.error("No job_id in optimization response:", optimizeResponse);
        toast({
          title: "Processing incomplete",
          description: "Resume was processed but could not navigate to results.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
      
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Processing failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return <section className="py-16 md:py-24 px-8 md:px-12 lg:px-20">
      {/* Full-page loading overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-draft-green mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-draft-green">Processing your resume...</h3>
            <p className="text-draft-text mt-2">This may take a few moments.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left side - Hero text */}
        <div className="flex flex-col justify-center lg:sticky lg:top-24 lg:self-start">
          <div className="max-w-2xl mx-px px-[41px]">
            <h1 className="text-title font-serif font-medium text-draft-green dark:text-draft-yellow leading-tight">
              Build a resume that wins <span className="italic">every</span> time.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-draft-text dark:text-gray-200 opacity-90">
              Tailor your resume to match a job description in minutes
            </p>
            
          </div>
        </div>
        
        {/* Right side - How to section */}
        <div className="relative mx-[37px]">
          <div className="bg-[#f1f1eb] dark:bg-draft-green/30 inline-block px-4 py-2 rounded-md mb-8">
            <span className="text-draft-green dark:text-draft-yellow uppercase text-sm font-medium">How to</span>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="relative flex items-center h-24">
              <div>
                <h3 className="text-xl font-medium flex items-baseline gap-2">
                  <span className="text-draft-green dark:text-draft-yellow">1.</span> Upload resume
                </h3>
                <p className="text-draft-text dark:text-gray-300 opacity-70 mt-1">
                  We will use this resume as a base.
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,.docx" 
                  onChange={handleFileChange} 
                />
                
                <Button 
                  variant="ghost" 
                  className="pl-0 mt-4 text-draft-green dark:text-draft-yellow hover:bg-transparent hover:text-draft-green/80 dark:hover:text-draft-yellow/80 flex items-center gap-1" 
                  onClick={handleUploadClick}
                  disabled={isProcessing}
                >
                  {resumeFile ? "Change File" : "Upload"} <ArrowRight size={16} />
                </Button>
                {resumeFile && <p className="text-sm text-draft-green mt-2">
                    Selected file: {resumeFile.name}
                  </p>}
              </div>
              <div className="absolute right-0 h-full flex items-center">
                <img src="/lovable-uploads/c5522b82-cbba-4967-b071-9464b0ddf692.png" alt="Decorative element" className="w-24 h-24" />
              </div>
            </div>
            
            <div className="relative">
              <div className="flex items-center h-24 relative">
                <div>
                  <h3 className="text-xl font-medium flex items-baseline gap-2">
                    <span className="text-draft-green dark:text-draft-yellow">2.</span> Upload job description
                  </h3>
                  <p className="text-draft-text dark:text-gray-300 opacity-70 mt-1">Tailor your resume to this job description.</p>
                </div>
                <div className="absolute right-0 h-full flex items-center">
                  <img src="/lovable-uploads/fcc43085-9c29-4c70-8944-9781978da937.png" alt="Decorative element" className="w-24 h-24" />
                </div>
              </div>
              
              <div className="mt-4 h-[200px] relative flex flex-col">
                {isWriteExpanded ? (
                  <div className={`border rounded-md h-full flex flex-col transition-all duration-300 ease-in-out animate-fade-in ${
                    !jobDescription.trim() ? 'border-red-500' : 'border-draft-green dark:border-draft-yellow'
                  }`}>
                    <Textarea 
                      placeholder="Add description" 
                      className="flex-1 border-none focus-visible:ring-0 text-draft-green dark:text-draft-yellow resize-none dark:bg-draft-footer/70" 
                      value={jobDescription} 
                      onChange={handleJobDescriptionChange}
                    />
                    <div className="p-2">
                      <Button variant="ghost" size="icon" onClick={toggleWriteExpanded} className="p-0 hover:bg-transparent">
                        <ArrowLeft size={16} className="text-draft-green dark:text-draft-yellow" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-start">
                    <Button variant="ghost" onClick={toggleWriteExpanded} className="pl-0 text-draft-green dark:text-draft-yellow hover:bg-transparent hover:text-draft-green/80 dark:hover:text-draft-yellow/80 flex items-center gap-1">
                      Write <ArrowRight size={16} />
                    </Button>
                    
                    <Button 
                      onClick={handleMakeItBetter} 
                      disabled={isProcessing}
                      variant="outline" 
                      className="mt-4 self-center border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:border-draft-yellow dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50"
                    >
                      {isProcessing ? "Processing..." : "Make it better"}
                    </Button>
                  </div>
                )}
                
                {isWriteExpanded && (
                  <div className="mt-4 pt-4 flex justify-center">
                    <Button 
                      onClick={handleMakeItBetter} 
                      disabled={isProcessing}
                      variant="outline" 
                      className="mt-4 self-center border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:border-draft-yellow dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50"
                    >
                      {isProcessing ? "Processing..." : "Make it better"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};

export default HeroSection;
