
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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, selectFile] = useState<File | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {user} = useAuth();
  
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
        variant: "destructive",
      });
      return;
    }
    console.log(`File selected: ${file.name}`)
    selectFile(file)
    
  };
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    
    if (!selectedFile){
      return;
    }
    
    setIsUploading(true);
    setUploadedFileName(file.name);
    
    try {
      const response = await uploadResume(file, user.id);
      if (response && response.resume_id) {
        setResumeId(response.resume_id);
        toast({
          title: "Resume uploaded",
          description: "Your resume has been successfully uploaded",
        });
        console.log(`Resume successfully uploaded with ID ${response.resume_id}`)
        // Auto expand the job description textarea
        if (!isWriteExpanded) {
          setIsWriteExpanded(true);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive",
      });
      setUploadedFileName(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };

  const handleMakeItBetter = async () => {
    if (!resumeId) {
      toast({
        title: "No resume uploaded",
        description: "Please upload a resume first",
        variant: "destructive",
      });
      return;
    }
    
    if (!jobDescription.trim()) {
      toast({
        title: "No job description",
        description: "Please enter a job description",
        variant: "destructive",
      });
      return;
    }
    
    setIsOptimizing(true);
    setIsProgressModalOpen(true);
    
    try {
      const response = await optimizeResume(resumeId, jobDescription);
      if (response && response.job_id) {
        setJobId(response.job_id);
      }
    } catch (error) {
      console.error("Optimization error:", error);
      toast({
        title: "Optimization failed",
        description: "There was an error optimizing your resume. Please try again.",
        variant: "destructive",
      });
      setIsProgressModalOpen(false);
      setIsOptimizing(false);
    }
  };

  return <section className="py-16 md:py-24 px-8 md:px-12 lg:px-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left side - Hero text */}
        <div className="flex flex-col justify-center lg:sticky lg:top-24 lg:self-start">
          <div className="max-w-2xl">
            <h1 className="text-title font-serif font-medium text-draft-green dark:text-draft-yellow leading-tight">
              Build a resume that wins <span className="italic">every</span> time.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-draft-text dark:text-gray-200 opacity-90">
              Tailor your resume to match a job description in minutes
            </p>
          </div>
        </div>
        
        {/* Right side - How to section */}
        <div className="relative">
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
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : selectedFile ? "Change File" : "Upload"} <ArrowRight size={16} />
                </Button>
                {
                  selectedFile && (
                    uploadedFileName == selectedFile.name ?
                    <p className="text-sm text-draft-green mt-2">
                      Uploaded and ready for enhancement: {uploadedFileName}
                    </p> : isUploading ?
                    <p className="text-sm text-draft-green mt-2">
                      Uploading: {uploadedFileName}
                    </p> :
                    <Button 
                      variant="ghost" 
                      className="pl-0 mt-4 text-draft-green dark:text-draft-yellow hover:bg-transparent hover:text-draft-green/80 dark:hover:text-draft-yellow/80 flex items-center"
                      onClick={handleFileUpload}
                    >
                    {isUploading ? `Uploading ${selectedFile.name}` : `Upload ${selectedFile.name}`} <ArrowRight size={16} />
                  </Button>
                  )
                  
                }
                
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
              
              <div className="mt-4 h-[200px]">
                {isWriteExpanded ? 
                  <div className="border border-draft-green dark:border-draft-yellow rounded-md h-full flex flex-col transition-all duration-300 ease-in-out animate-fade-in">
                    <Textarea 
                      placeholder="Add description" 
                      className="flex-1 border-none focus-visible:ring-0 text-draft-green dark:text-draft-yellow resize-none dark:bg-draft-footer/70"
                      value={jobDescription}
                      onChange={handleJobDescriptionChange}
                      disabled={!resumeId}
                    />
                    <div className="border-t border-draft-green dark:border-draft-yellow p-3">
                      <Button variant="ghost" size="icon" onClick={toggleWriteExpanded} className="p-0 hover:bg-transparent">
                        <ArrowLeft size={16} className="text-draft-green dark:text-draft-yellow" />
                      </Button>
                    </div>
                  </div>
                  : 
                  <div className="h-full flex items-start">
                    <Button 
                      variant="ghost" 
                      onClick={toggleWriteExpanded} 
                      disabled={!resumeId}
                      className="pl-0 text-draft-green dark:text-draft-yellow hover:bg-transparent hover:text-draft-green/80 dark:hover:text-draft-yellow/80 flex items-center gap-1"
                    >
                      Write <ArrowRight size={16} />
                    </Button>
                  </div>
                }
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                onClick={handleMakeItBetter} 
                className="bg-[#0A2218] text-white hover:bg-[#0A2218]/90 dark:bg-draft-yellow dark:text-draft-green dark:hover:bg-draft-yellow/90 w-fit"
                disabled={!resumeId || !jobDescription.trim() || isUploading}
              >
                Make it better
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Modal */}
      <ProgressModal 
        isOpen={isProgressModalOpen} 
        onOpenChange={setIsProgressModalOpen} 
      />
    </section>;
};

export default HeroSection;
