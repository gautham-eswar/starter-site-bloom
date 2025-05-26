import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import ProgressModal from '@/components/ProgressModal';
import { usePipelineContext, PipelineState } from '@/contexts/ResumeContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';

const NOT_UPLOADED = 0,
  UPLOADING = 1,
  UPLOADED = 2,
  ENHANCED = 4,
  RENDERING = 5;

const HeroSection: React.FC = () => {
  const [isWriteExpanded, setIsWriteExpanded] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
      pipelineState,
      resumeFilename,
      jobDescription,
      enhancementPending,
      isAwaitingApiResponse,
      uploadResume,
      setJobDescription,
      enhanceResume,
    } = usePipelineContext();
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
    
    setIsWriteExpanded(true);
    await uploadResume(file)
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };

  const handleMakeItBetter = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job description empty",
        description: "Please provide a job description to tailor your resume.",
        variant: "destructive",
      });
      return;
    }
    // enhanceResume now handles setting isAwaitingApiResponse and pipelineState appropriately.
    // Modal opening is now solely driven by pipelineState changes in the useEffect below.
    await enhanceResume(jobDescription); 
  };

  const isUploadingFile = pipelineState === UPLOADING;
  const isResumeNotUploaded = pipelineState === NOT_UPLOADED; // Used for "Couldn't upload file" message

  // Determine if the system is busy with an operation relevant to the "Make it Better" button
  const isSystemBusy = 
    isAwaitingApiResponse || // Waiting for optimize API response
    pipelineState === UPLOADING || // Resume is uploading
    pipelineState === ENHANCED || // Enhancement succeeded, modal likely showing progress
    pipelineState === RENDERING;   // Rendering PDF, modal likely showing progress

  // Determine if the modal should be open based on pipeline state
  // These are states where the ProgressModal is relevant.
  const isModalRelevantState =
    pipelineState === UPLOADING ||
    pipelineState === ENHANCED ||
    pipelineState === RENDERING;

  useEffect(() => {
    if (isModalRelevantState && !isProgressModalOpen) {
      console.log(`[HeroSection useEffect] Opening modal. State: ${pipelineState}, ModalOpen: ${isProgressModalOpen}`);
      setIsProgressModalOpen(true);
    } else if (!isModalRelevantState && isProgressModalOpen) {
      console.log(`[HeroSection useEffect] Closing modal. State: ${pipelineState}, ModalOpen: ${isProgressModalOpen}`);
      setIsProgressModalOpen(false);
    }
  }, [isModalRelevantState, isProgressModalOpen, pipelineState]); // Added pipelineState to ensure re-evaluation when it changes
  
  
  return <section className="py-16 md:py-24 px-8 md:px-12 lg:px-20">
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
                
                <Button variant="ghost" className="pl-0 mt-4 text-draft-green dark:text-draft-yellow hover:bg-transparent hover:text-draft-green/80 dark:hover:text-draft-yellow/80 flex items-center gap-1" onClick={handleUploadClick} disabled={isUploadingFile}>
                  {isUploadingFile ? "Uploading..." : resumeFilename ? "Change File" : "Upload"} <ArrowRight size={16} />
                </Button>
                {resumeFilename && <p className="text-sm text-draft-green mt-2">
                    { isResumeNotUploaded && !isUploadingFile ? // Show "Couldn't upload" only if NOT_UPLOADED and not currently trying to upload
                      "Couldn't upload file: " : "Selected file: "
                    }
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
                    <Textarea placeholder="Add description" className="flex-1 border-none focus-visible:ring-0 text-draft-green dark:text-draft-yellow resize-none dark:bg-draft-footer/70" value={jobDescription} onChange={handleJobDescriptionChange} />
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
                      disabled={!jobDescription.trim() || isSystemBusy}
                      variant="outline" 
                      className="mt-4 self-center border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:border-draft-yellow dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50"
                    >
                      {isAwaitingApiResponse ? "Submitting..." : (isSystemBusy ? "Processing..." : "Make it better")}
                    </Button>
                  </div>
                )}
                
                {isWriteExpanded && (
                  <div className="mt-4 pt-4 flex justify-center">
                    <Button 
                      onClick={handleMakeItBetter} 
                      disabled={!jobDescription.trim() || isSystemBusy}
                      variant="outline" 
                      className="mt-4 self-center border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:border-draft-yellow dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50"
                    >
                      {isAwaitingApiResponse ? "Submitting..." : (isSystemBusy ? "Processing..." : "Make it better")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Modal */}
      <ProgressModal isOpen={isProgressModalOpen} onOpenChange={setIsProgressModalOpen} />
    </section>;
};

export default HeroSection;
