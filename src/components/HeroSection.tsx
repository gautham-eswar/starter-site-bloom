import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import ProgressModal from '@/components/ProgressModal';
import { usePipelineContext, NOT_UPLOADED, UPLOADING, UPLOADED, ENHANCING, ENHANCED } from '@/contexts/ResumeContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';

const HeroSection: React.FC = () => {
  const [isWriteExpanded, setIsWriteExpanded] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    pipelineState,
    resumeFilename,
    resumeId,
    jobDescription,
    jobId,
    enhancedResumeId,
    uploadResume,
    setJobDescription,
    enhanceResume,
    apiError,
  } = usePipelineContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Effect to navigate to comparison page when enhancement is complete
  useEffect(() => {
    if (pipelineState === ENHANCED && enhancedResumeId && jobId) {
      console.log("Enhancement complete, navigating to comparison page");
      setIsProgressModalOpen(false);
      navigate(`/comparison?resumeId=${enhancedResumeId}&jobId=${jobId}`);
    }
  }, [pipelineState, enhancedResumeId, jobId, navigate]);

  // Close the progress modal if there's an error
  useEffect(() => {
    if (apiError && isProgressModalOpen) {
      // Keep the modal open to show the error
      // The user can close it manually
      console.log("Error encountered during process:", apiError);
    }
  }, [apiError, isProgressModalOpen]);

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
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload a resume",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
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
    
    setIsWriteExpanded(true);
    
    try {
      console.log("Starting resume upload");
      await uploadResume(file);
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };
  
  const handleMakeItBetter = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to enhance your resume",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!jobDescription?.trim()) {
      toast({
        title: "Job description required",
        description: "Please enter a job description to enhance your resume.",
        variant: "destructive"
      });
      return;
    }

    if (pipelineState !== UPLOADED) {
      toast({
        title: "No resume available",
        description: "Please upload a resume first before enhancing.",
        variant: "destructive"
      });
      return;
    }
    
    // Show progress modal before starting the enhancement
    setIsProgressModalOpen(true);
    
    try {
      console.log("Starting resume enhancement");
      await enhanceResume(jobDescription);
    } catch (error) {
      console.error("Error enhancing resume:", error);
      // Error will be handled by the pipeline context and shown in the modal
    }
  };

  const isUploading = pipelineState === UPLOADING;
  const isNotStarted = pipelineState === NOT_UPLOADED;
  const isEnhancing = pipelineState === ENHANCING;
  
  return (
    <section className="py-16 md:py-24 px-8 md:px-12 lg:px-20">
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
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                
                <Button variant="ghost" className="pl-0 mt-4 text-draft-green dark:text-draft-yellow hover:bg-transparent hover:text-draft-green/80 dark:hover:text-draft-yellow/80 flex items-center gap-1" onClick={handleUploadClick} disabled={isUploading}>
                  {isUploading ? "Uploading..." : resumeFilename ? "Change File" : "Upload"} <ArrowRight size={16} />
                </Button>
                {resumeFilename && <p className="text-sm text-draft-green mt-2">
                    {isNotStarted ? "Couldn't upload file:" : "Selected file: "}
                    {resumeFilename}
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
                  <div className="border border-draft-green dark:border-draft-yellow rounded-md h-full flex flex-col transition-all duration-300 ease-in-out animate-fade-in">
                    <Textarea placeholder="Add description" className="flex-1 border-none focus-visible:ring-0 text-draft-green dark:text-draft-yellow resize-none dark:bg-draft-footer/70" value={jobDescription || ''} onChange={handleJobDescriptionChange} />
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
                    
                    {/* Make it better button - centered below Write button when collapsed */}
                    <Button 
                      onClick={handleMakeItBetter} 
                      disabled={!jobDescription?.trim() || isEnhancing || pipelineState !== UPLOADED}
                      variant="outline" 
                      className="mt-4 self-center border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:border-draft-yellow dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50"
                    >
                      {isEnhancing ? "Processing..." : "Make it better"}
                    </Button>
                  </div>
                )}
                
                {/* Make it better button - only shown when textarea is expanded */}
                {isWriteExpanded && (
                  <div className="mt-4 pt-4 flex justify-center">
                    <Button 
                      onClick={handleMakeItBetter} 
                      disabled={!jobDescription?.trim() || isEnhancing || pipelineState !== UPLOADED}
                      variant="outline" 
                      className="mt-4 self-center border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:border-draft-yellow dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50"
                    >
                      {isEnhancing ? "Processing..." : "Make it better"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Modal - only shown during enhancement */}
      <ProgressModal isOpen={isProgressModalOpen} onOpenChange={setIsProgressModalOpen} />
    </section>
  );
};

export default HeroSection;
