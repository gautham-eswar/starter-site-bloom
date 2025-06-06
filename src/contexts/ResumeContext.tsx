import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OptimizationResult, EnhancementAnalysis } from '@/types/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiRequest } from '@/services/api';
import { toast } from '@/hooks/use-toast';

const NOT_UPLOADED = 0,
  UPLOADING = 1,
  UPLOADED = 2,
  ENHANCING = 3, // This state might become less used if we jump to ENHANCED
  ENHANCED = 4,
  RENDERING = 5,
  RENDERED = 6;

const stateValuesArray = [NOT_UPLOADED, UPLOADING, UPLOADED, ENHANCING, ENHANCED, RENDERING, RENDERED] as const;
export type PipelineState = typeof stateValuesArray[number];

type PipelineContextType = {
  pipelineState: PipelineState;
  resumeFilename: string | null;
  resumeId: string | null;
  jobDescription: string;
  jobId: string | null;
  enhancedResumeId: string | null;
  enhancementAnalysis: EnhancementAnalysis | null;
  enhancementPending: boolean;
  isAwaitingApiResponse: boolean; // New state for API call in flight
  
  uploadResume: (file: File) => Promise<void>;
  setJobDescription: (jd: string) => void;
  enhanceResume: (jd: string) => Promise<boolean>;
  renderEnhancedResume: () => Promise<void>;
  performApiHealthCheck: () => Promise<void>;
}

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

export const usePipelineContext = () => {
  const context = useContext(PipelineContext);
  if (!context) {
    throw new Error('usePipelineContext must be used within a PipelineProvider');
  }
  return context;
};

export const PipelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pipelineState, setPipelineState] = useState<PipelineState>(NOT_UPLOADED);
  
  // Data for UPLOADING stage
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);
  const [enhancementPending, setEnhancementPending] = useState(false);

  // Data for UPLOADED stage
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [parsedSelectedResume, setParsedSelectedResume] = useState<Object | null>(null);

  // Data for ENHANCING Stage (or attempting to enhance)
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isAwaitingApiResponse, setIsAwaitingApiResponse] = useState<boolean>(false); // New state

  // Data for ENHANCED Stage
  const [jobId, setJobId] = useState<string | null>(null);
  const [enhancementAnalysis, setEnhancementAnalysis] = useState<EnhancementAnalysis | null>(null);
  const [enhancedResumeId, setEnhancedResumeId] = useState<string | null>(null);
  
  // Data for RENDERING Stage
  // Data for RENDERED Stage
  const [enhancedResumeFile, setEnhancedResumeFile] = useState<File | null>(null);
  
  const { user } = useAuth();

  const performApiHealthCheck = async () => {
    console.log("[PipelineProvider] Attempting API health check...");
    try {
      // Using /api/health as a conventional health check endpoint
      const response = await apiRequest("/api/health", { method: "GET" }); 
      if (response && !response.error) {
        console.log("[PipelineProvider] API Health Check successful:", response);
      } else {
        console.error("[PipelineProvider] API Health Check failed:", response?.error);
        // Removed toast from here to avoid potential duplicate toasts if AppRoutes also handles it
        // Or, ensure only one place shows the toast. For now, AppRoutes' console log is sufficient.
      }
    } catch (error) {
      console.error("[PipelineProvider] Error during API health check:", error);
      // toast({ // Also removed this toast for same reason as above
      //   title: "API Error",
      //   description: "An error occurred while checking API status.",
      //   variant: "destructive",
      // });
    }
  };

  const uploadResume = async (file: File): Promise<void> => {
    if (!user?.id) {
      toast({
        title: "Not Authenticated",
        description: "Please sign in or signup to continue",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`Uploading ${file.name} from user ID: ${user.id}`);
    setPipelineState(UPLOADING);
    setResumeFilename(file.name);
    // enhancementPending is false by default, can be set true if user clicks enhance while uploading.
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append('user_id', user.id);
    
    try {
      const response = await apiRequest("/api/upload", {
        method: "POST",
        headers: {}, 
        body: formData,
      });

      if (response?.error || !response?.data?.resume_id) { // Check for error property or missing data
        console.error("Upload failed or invalid response format from API:", response);
        setPipelineState(NOT_UPLOADED); // Revert state
        setResumeFilename(null); // Clear filename on failure
        toast({
          title: "Upload failed",
          description: response?.error || "Received invalid response from server. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log(`${file.name} uploaded successfully! \nResume ID: ${response.data.resume_id}`);
      setPipelineState(UPLOADED);
      setResumeId(response.data.resume_id);
      setParsedSelectedResume(response.data.parsed_resume);
      
      // No change to enhancementPending here, the useEffect will handle it
    } catch (error) { // Catching unexpected errors during the upload process itself
      console.error(`Upload ${file.name} failed. Error:`, error);
      setPipelineState(NOT_UPLOADED);
      setResumeFilename(null);
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred during upload. Please try again.",
        variant: "destructive"
      });
    }
  };

  const enhanceResume = async (jd: string): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Not Authenticated",
        description: "Please sign in or signup to continue",
        variant: "destructive"
      });
      return false;
    }
    
    // Ensure jd is current for this attempt, though jobDescription state is source of truth for API
    // This function might be called with a jd, but we use the context's jobDescription for the API call.
    // If `jd` param is important, ensure `setJobDescription(jd)` was called before this.
    // For now, assuming `jobDescription` state is what we want.
    if (!jobDescription.trim()) { 
      toast({
        title: "No job description to enhance from",
        description: "Please type or paste a job listing and try again",
        variant: "destructive"
      });
      return false;
    }
    
    if (pipelineState === NOT_UPLOADED && !resumeId) { // Check resumeId as well
      toast({
        title: "No resume selected",
        description: "Please select or upload a resume and try again",
        variant: "destructive"
      });
      return false;
    }
    
    // Check if already in a final processing state or awaiting API for another enhancement
    if (isAwaitingApiResponse || pipelineState === ENHANCED || pipelineState === RENDERING) {
        toast({
            title: "Processing in progress",
            description: "Please wait for the current operation to complete.",
            variant: "destructive"
        });
        return false;
    }

    if (pipelineState === UPLOADING) {
      setEnhancementPending(true); // If resume is still uploading, mark pending
      console.log(`Waiting for ${resumeFilename || 'resume'} to finish uploading before starting optimization job`);
      // Modal will be triggered by UPLOADING state + enhancementPending in HeroSection
      return true; 
    } 

    if (!resumeId) {
      toast({
        title: "Resume ID missing",
        description: "Cannot enhance without a resume ID. Please upload a resume first.",
        variant: "destructive"
      });
      setPipelineState(UPLOADED); // Ensure state is stable if it was something else
      return false;
    }

    console.log(`Initializing enhancement for resume ID: ${resumeId} using job description.`);
    setIsAwaitingApiResponse(true); // Indicate API call is starting
    // We do NOT set pipelineState to ENHANCING here yet.
      
    const formData = new FormData();
    formData.append("resume_id", resumeId!);
    formData.append("user_id", user.id);
    formData.append("job_description", jobDescription);

    // Added logging for FormData entries
    console.log("FormData entries being sent to /api/optimize:");
    for (const pair of formData.entries()) {
      // Check if the value is a File object and log its name, otherwise log the value directly
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}: ${pair[1].name} (File)`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }
    
    try {
      const response = await apiRequest("/api/optimize", {
        method: "POST",
        headers: {}, 
        body: formData,
      });
      
      if (response?.error || !response?.data) { // Check for error property or missing data
        console.error("Enhancement API call failed or invalid response format:", response);
        setPipelineState(UPLOADED); // Revert to UPLOADED if API call itself fails
        toast({
          title: "Enhancement failed",
          description: response?.error || "Received invalid response from server during enhancement. Please try again.",
          variant: "destructive"
        });
        setIsAwaitingApiResponse(false);
        return false;
      }

      // API call was successful and returned data
      console.log(`Resume with ID ${resumeId} Enhanced successfully! \nJob Id: ${response.data.job_id}\nEnhanced Resume Id: ${response.data.enhanced_resume_id}`);
      
      setPipelineState(ENHANCED); // Now set to ENHANCED, this will trigger modal via HeroSection
      setJobId(response.data.job_id);
      setEnhancementAnalysis(response.data.analysis);
      setEnhancedResumeId(response.data.enhanced_resume_id);
      
      // Simulate rendering time for demo purposes, as backend returns PDF info quickly.
      // In a real scenario, if PDF rendering was a separate step, RENDERED state would be set after that.
      setTimeout(() => setPipelineState(RENDERED), 500); 
      setIsAwaitingApiResponse(false);
      return true;
      
    } catch (error) { // Catch unexpected errors during the enhancement process itself
      console.error(`Enhancement of resume with ID: ${resumeId} failed. Error:`, error);
      setPipelineState(UPLOADED); // Revert to stable state
      toast({
        title: "Enhancement failed",
        description: "An unexpected error occurred during enhancement. Please try again.",
        variant: "destructive"
      });
      setIsAwaitingApiResponse(false);
      return false;
    }
  };
  
  const renderEnhancedResume = async (): Promise<void> => {
    return;
  };

  useEffect(() => {
    // This effect handles auto-starting enhancement if it was pending after an upload.
    if (pipelineState === UPLOADED && enhancementPending && resumeId && jobDescription && !isAwaitingApiResponse) {
      console.log("[PipelineProvider useEffect] Conditions met for auto-enhancing after upload.");
      setEnhancementPending(false); // Clear pending flag
      enhanceResume(jobDescription); // Call with current jobDescription state
    }
  }, [pipelineState, enhancementPending, resumeId, jobDescription, isAwaitingApiResponse]); // Added isAwaitingApiResponse


  return (
    <PipelineContext.Provider
      value={{
        pipelineState,
        resumeFilename,
        resumeId,
        jobDescription,
        jobId,
        enhancedResumeId,
        enhancementAnalysis,
        enhancementPending,
        isAwaitingApiResponse, // Provide new state
        
        uploadResume,
        setJobDescription,
        enhanceResume,
        renderEnhancedResume,
        performApiHealthCheck,
      }}
    >
      {children}
    </PipelineContext.Provider>
  );
};

type ResumeContextType = {
  resumeId: string | null;
  setResumeId: (id: string | null) => void;
  jobId: string | null;
  setJobId: (id: string | null) => void;
  jobDescription: string;
  setJobDescription: (description: string) => void;
  optimizationResult: OptimizationResult | null;
  setOptimizationResult: (result: OptimizationResult | null) => void;
  isOptimizing: boolean;
  setIsOptimizing: (value: boolean) => void;
};

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const useResumeContext = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResumeContext must be used within a ResumeProvider');
  }
  return context;
};

export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  return (
    <ResumeContext.Provider
      value={{
        resumeId,
        setResumeId,
        jobId,
        setJobId,
        jobDescription,
        setJobDescription,
        optimizationResult,
        setOptimizationResult,
        isOptimizing,
        setIsOptimizing
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};
