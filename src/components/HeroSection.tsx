import React, { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import ProgressModal from '@/components/ProgressModal';
import { useResumeContext } from '@/contexts/ResumeContext';
import { uploadResume, optimizeResume } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';

const HeroSection: React.FC = () => {
  const [isWriteExpanded, setIsWriteExpanded] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    user
  } = useAuth();
  const {
    resumeId,
    setResumeId,
    setJobId,
    jobDescription,
    setJobDescription,
    setIsOptimizing
  } = useResumeContext();
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

    // Just store the file for later processing
    console.log(`File selected: ${file.name}`);
    setSelectedFile(file);

    // Auto expand the job description textarea when a file is selected
    if (!isWriteExpanded) {
      setIsWriteExpanded(true);
    }
  };
  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };
  const handleMakeItBetter = async () => {
    if (!selectedFile) {
      toast({
        title: "No resume selected",
        description: "Please select a resume file first",
        variant: "destructive"
      });
      return;
    }
    if (!jobDescription.trim()) {
      toast({
        title: "No job description",
        description: "Please enter a job description",
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);
    setIsProgressModalOpen(true);
    setIsOptimizing(true);
    try {
      // First upload the resume
      const uploadResponse = await uploadResume(selectedFile, user.id);
      if (!uploadResponse || !uploadResponse.resume_id) {
        throw new Error("Failed to upload resume");
      }

      // Store the resume ID
      setResumeId(uploadResponse.resume_id);

      // Then optimize it
      const optimizeResponse = await optimizeResume(uploadResponse.resume_id, jobDescription);
      if (!optimizeResponse || !optimizeResponse.job_id) {
        throw new Error("Failed to optimize resume");
      }

      // Store the job ID
      setJobId(optimizeResponse.job_id);
    } catch (error) {
      console.error("Process error:", error);
      toast({
        title: "Process failed",
        description: "There was an error processing your resume. Please try again.",
        variant: "destructive"
      });
      setIsProgressModalOpen(false);
      setIsOptimizing(false);
    } finally {
      setIsProcessing(false);
    }
  };
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
                <Button variant="ghost" className="pl-0 mt-4 text-draft-green dark:text-draft-yellow hover:bg-transparent hover:text-draft-green/80 dark:hover:text-draft-yellow/80 flex items-center gap-1" onClick={handleUploadClick} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : selectedFile ? "Change File" : "Upload"} <ArrowRight size={16} />
                </Button>
                {selectedFile && <p className="text-sm text-draft-green mt-2">
                      Selected: {selectedFile.name}
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
              
              <div className="mt-4 h-[200px] relative">
                {isWriteExpanded ? (
                  <div className="border border-draft-green dark:border-draft-yellow rounded-md h-full flex flex-col transition-all duration-300 ease-in-out animate-fade-in">
                    <Textarea 
                      placeholder="Add description" 
                      className="flex-1 border-none focus-visible:ring-0 text-draft-green dark:text-draft-yellow resize-none dark:bg-draft-footer/70" 
                      value={jobDescription} 
                      onChange={handleJobDescriptionChange} 
                    />
                    <div className="border-t border-draft-green dark:border-draft-yellow p-3">
                      <Button variant="ghost" size="icon" onClick={toggleWriteExpanded} className="p-0 hover:bg-transparent">
                        <ArrowLeft size={16} className="text-draft-green dark:text-draft-yellow" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-start">
                    <Button 
                      variant="ghost" 
                      onClick={toggleWriteExpanded} 
                      className="pl-0 text-draft-green dark:text-draft-yellow hover:bg-transparent hover:text-draft-green/80 dark:hover:text-draft-yellow/80 flex items-center gap-1"
                    >
                      Write <ArrowRight size={16} />
                    </Button>
                  </div>
                )}
                
                {/* Make it better button - styled like sign-in button */}
                <div className={`mt-4 ${isWriteExpanded ? 'pt-4' : ''}`}>
                  <Button 
                    onClick={handleMakeItBetter} 
                    disabled={!selectedFile || !jobDescription.trim() || isProcessing}
                    className="bg-draft-green hover:bg-draft-green/90 text-white dark:bg-draft-yellow dark:text-draft-green dark:hover:bg-draft-yellow/90"
                  >
                    {isProcessing ? "Processing..." : "Make it better"}
                  </Button>
                </div>
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
