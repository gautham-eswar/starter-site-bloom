import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Upload, Square, Circle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import ProgressModal from '@/components/ProgressModal';
import OptimizationLoadingModal from '@/components/OptimizationLoadingModal';
import { usePipelineContext, PipelineState } from '@/contexts/ResumeContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { uploadResume, optimizeResume } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';

const NOT_UPLOADED = 0,
  UPLOADING = 1,
  UPLOADED = 2,
  ENHANCED = 4,
  RENDERING = 5;

const HeroSection: React.FC = () => {
  const [isWriteExpanded, setIsWriteExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isPollingForCompletion, setIsPollingForCompletion] = useState(false);
  const [optimizationJobId, setOptimizationJobId] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);
  const [rowFound, setRowFound] = useState<boolean>(false);
  const [hasWaitedInitially, setHasWaitedInitially] = useState<boolean>(false);
  const [currentResumeId, setCurrentResumeId] = useState<string>(''); // Track the current resume ID
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
      
      // Reset processing state before navigation
      setIsProcessing(false);
      
      // Navigate to comparison page with job_id
      const jobId = optimizeResponse?.data?.job_id;
      if (jobId) {
        console.log("Navigating to comparison page with job_id:", jobId);
        navigate(`/comparison?job_id=${jobId}`);
      } else {
        console.error("No job_id in optimization response:", optimizeResponse);
        toast({
          title: "Processing incomplete",
          description: "Resume was processed but could not navigate to results.",
          variant: "destructive",
        });
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

  const handleOptimizeResume = async () => {
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

    console.log("Starting optimization process...");
    setIsOptimizing(true);

    try {
      // Step 1: Upload resume
      const uploadResponse = await uploadResume(resumeFile, user.id);
      
      if (uploadResponse?.error || !uploadResponse?.data?.resume_id) {
        console.error("Upload failed:", uploadResponse?.error);
        toast({
          title: "Upload failed",
          description: uploadResponse?.error || "Failed to upload resume",
          variant: "destructive",
        });
        setIsOptimizing(false);
        return;
      }

      const resumeId = uploadResponse.data.resume_id;
      console.log("Upload successful, resume ID:", resumeId);

      // Step 2: Optimize resume
      const optimizeResponse = await optimizeResume(resumeId, jobDescription, user.id);
      
      if (optimizeResponse?.error) {
        console.error("Optimization failed:", optimizeResponse.error);
        toast({
          title: "Optimization failed",
          description: optimizeResponse.error,
          variant: "destructive",
        });
        setIsOptimizing(false);
        return;
      }

      const jobId = optimizeResponse?.data?.job_id;
      if (jobId) {
        setOptimizationJobId(jobId);
        // Start checking status
        checkOptimizationStatus(jobId);
      } else {
        console.error("No job_id in optimization response:", optimizeResponse);
        toast({
          title: "Processing incomplete",
          description: "Resume was processed but could not get job ID.",
          variant: "destructive",
        });
        setIsOptimizing(false);
      }
      
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Processing failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsOptimizing(false);
    }
  };

  const handleSquareButtonOptimize = async () => {
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

    console.log("Starting square button optimization process...");
    setIsPollingForCompletion(true);
    setCurrentStatus('Starting optimization...');
    setPollingStartTime(Date.now());
    setRowFound(false);
    setHasWaitedInitially(false);
    setCurrentResumeId(''); // Reset resume ID

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
        setIsPollingForCompletion(false);
        return;
      }

      const resumeId = uploadResponse.data.resume_id;
      console.log("Upload successful, resume ID:", resumeId);
      setCurrentResumeId(resumeId); // Store the resume ID
      setCurrentStatus('Resume uploaded, starting optimization...');

      // Step 2: Optimize resume
      console.log("Step 2: Optimizing resume...");
      const optimizeResponse = await optimizeResume(resumeId, jobDescription, user.id);
      
      if (optimizeResponse?.error) {
        console.error("Optimization failed:", optimizeResponse.error);
        toast({
          title: "Optimization failed",
          description: optimizeResponse.error,
          variant: "destructive",
        });
        setIsPollingForCompletion(false);
        return;
      }

      console.log("Optimization request sent, starting to poll for completion...");
      setCurrentStatus('Optimization started, waiting 20 seconds before checking status...');
      
      // Wait 20 seconds before starting to check
      setTimeout(() => {
        setHasWaitedInitially(true);
        pollForCompletionAndNavigate(resumeId);
      }, 20000);
      
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Processing failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsPollingForCompletion(false);
    }
  };

  const pollForCompletionAndNavigate = async () => {
    const startTime = pollingStartTime || Date.now();
    const timeLimit = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    // Check if we've exceeded the time limit
    if (Date.now() - startTime > timeLimit) {
      console.log('Polling timeout reached (5 minutes)');
      setIsPollingForCompletion(false);
      setCurrentStatus('timeout');
      toast({
        title: "Processing Timeout",
        description: "The optimization is taking longer than expected. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`=== DEBUGGING: Let's see what's actually in the table ===`);
      console.log(`Current user ID: ${user?.id}`);
      
      // First, let's see ALL jobs for this user (no filters except user_id)
      const { data: allUserJobs, error: allUserError } = await supabase
        .from('optimization_jobs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      console.log('ALL jobs for this user:', allUserJobs);
      console.log('Error fetching all user jobs:', allUserError);

      // Now let's see ALL jobs in the table (no user filter) to check if anything exists
      const { data: allJobs, error: allJobsError } = await supabase
        .from('optimization_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('ALL recent jobs in table (any user):', allJobs);
      console.log('Error fetching all jobs:', allJobsError);

      // Now let's try different approaches to find a completed job for this user
      console.log(`=== TRYING DIFFERENT SEARCH APPROACHES ===`);
      
      // Approach 1: Look for ANY status for this user
      const { data: anyStatus, error: anyStatusError } = await supabase
        .from('optimization_jobs')
        .select('*')
        .eq('user_id', user?.id);

      console.log('Approach 1 - Any status for user:', anyStatus);
      console.log('Approach 1 error:', anyStatusError);

      // Approach 2: Look for completed status (any user) to see if completed jobs exist at all
      const { data: anyCompleted, error: anyCompletedError } = await supabase
        .from('optimization_jobs')
        .select('*')
        .eq('status', 'completed')
        .limit(5);

      console.log('Approach 2 - Any completed jobs (any user):', anyCompleted);
      console.log('Approach 2 error:', anyCompletedError);

      // Approach 3: Look for this user's jobs from the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentJobs, error: recentError } = await supabase
        .from('optimization_jobs')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', oneHourAgo);

      console.log('Approach 3 - Recent jobs for user (last hour):', recentJobs);
      console.log('Approach 3 error:', recentError);

      // Update status with what we found
      if (allUserJobs && allUserJobs.length > 0) {
        const latestJob = allUserJobs[0];
        setCurrentStatus(`Found ${allUserJobs.length} job(s). Latest status: "${latestJob.status}"`);
        setRowFound(true);
        
        // If we found a completed job, navigate to it
        if (latestJob.status === 'completed' && latestJob.enhanced_resume_id) {
          console.log('SUCCESS: Found completed job, navigating to comparison3');
          setIsPollingForCompletion(false);
          navigate(`/comparison3?resume_id=${latestJob.enhanced_resume_id}`);
          return;
        }
      } else {
        setCurrentStatus(`No jobs found for user. Total jobs in table: ${allJobs?.length || 0}`);
        setRowFound(false);
      }

      // Continue polling every 5 seconds
      setTimeout(() => pollForCompletionAndNavigate(), 5000);
      
    } catch (error) {
      console.error('Error in debugging poll:', error);
      setCurrentStatus(`Error: ${error}`);
      setIsPollingForCompletion(false);
      toast({
        title: "Error",
        description: "Failed to check optimization status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const checkOptimizationStatus = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('optimization_jobs')
        .select('status')
        .eq('id', jobId)
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error checking status:', error);
        setIsOptimizing(false);
        return;
      }

      if (data?.status === 'completed') {
        console.log('Optimization completed, navigating to comparison2');
        setIsOptimizing(false);
        navigate(`/comparison2?job_id=${jobId}`);
      } else {
        // Continue checking every 2 seconds
        setTimeout(() => checkOptimizationStatus(jobId), 2000);
      }
    } catch (error) {
      console.error('Error checking optimization status:', error);
      setIsOptimizing(false);
    }
  };

  // Calculate elapsed time for display
  const getElapsedTime = () => {
    if (!pollingStartTime) return '0s';
    const elapsed = Math.floor((Date.now() - pollingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
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

      {/* Polling for completion loading overlay with detailed status */}
      {isPollingForCompletion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center max-w-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-draft-green mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-draft-green">Processing your resume...</h3>
            <p className="text-draft-text mt-2">Please wait while we optimize your resume and prepare the PDF viewer.</p>
            
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Resume ID:</strong> <span className="font-mono text-draft-green">{currentResumeId || 'generating...'}</span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Current Status:</strong> <span className="font-mono text-draft-green">{currentStatus || 'initializing...'}</span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Supabase Row Found:</strong> <span className={`font-mono ${rowFound ? 'text-green-600' : 'text-red-600'}`}>
                  {rowFound ? 'Yes' : 'No'}
                </span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Initial Wait Complete:</strong> <span className={`font-mono ${hasWaitedInitially ? 'text-green-600' : 'text-orange-600'}`}>
                  {hasWaitedInitially ? 'Yes' : 'Waiting...'}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                <strong>Elapsed:</strong> <span className="font-mono">{getElapsedTime()}</span>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {hasWaitedInitially ? 'Checking every 5 seconds (max 5 minutes)' : 'Will check after 20 second initial wait'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Optimization loading modal */}
      <OptimizationLoadingModal 
        isOpen={isOptimizing} 
        onOpenChange={setIsOptimizing}
      />

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
                  disabled={isProcessing || isOptimizing || isPollingForCompletion}
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
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={handleMakeItBetter} 
                        disabled={isProcessing || isOptimizing || isPollingForCompletion}
                        variant="outline" 
                        className="border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:border-draft-yellow dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50"
                      >
                        {isProcessing ? "Processing..." : "Make it better"}
                      </Button>
                      
                      <Button 
                        onClick={handleOptimizeResume} 
                        disabled={isProcessing || isOptimizing || isPollingForCompletion}
                        variant="outline" 
                        size="icon"
                        className="border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:border-draft-yellow dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50 rounded-full"
                      >
                        <Circle size={16} />
                      </Button>

                      <Button 
                        onClick={handleSquareButtonOptimize} 
                        disabled={isProcessing || isOptimizing || isPollingForCompletion}
                        variant="outline" 
                        size="icon"
                        className="border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:border-draft-yellow dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50"
                      >
                        <Square size={16} />
                      </Button>
                    </div>
                  </div>
                )}
                
                {isWriteExpanded && (
                  <div className="mt-4 pt-4 flex justify-center gap-2">
                    <Button 
                      onClick={handleMakeItBetter} 
                      disabled={isProcessing || isOptimizing || isPollingForCompletion}
                      variant="outline" 
                      className="border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:border-draft-yellow dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50"
                    >
                      {isProcessing ? "Processing..." : "Make it better"}
                    </Button>
                    
                    <Button 
                      onClick={handleOptimizeResume} 
                      disabled={isProcessing || isOptimizing || isPollingForCompletion}
                      variant="outline" 
                      size="icon"
                      className="border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:border-draft-yellow dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50 rounded-full"
                    >
                      <Circle size={16} />
                    </Button>

                    <Button 
                      onClick={handleSquareButtonOptimize} 
                      disabled={isProcessing || isOptimizing || isPollingForCompletion}
                      variant="outline" 
                      size="icon"
                      className="border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:border-draft-yellow dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50"
                    >
                      <Square size={16} />
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
