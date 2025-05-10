
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OptimizationResult } from '@/types/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiRequest, optimizeResume as apiOptimizeResume } from '@/services/api';
import { toast } from '@/hooks/use-toast';

// Pipeline state constants
export const NOT_UPLOADED = 0;
export const UPLOADING = 1;
export const UPLOADED = 2;
export const ENHANCING = 3;
export const ENHANCED = 4;
export const RENDERING = 5;
export const RENDERED = 6;

export const stateValuesArray = [NOT_UPLOADED, UPLOADING, UPLOADED, ENHANCING, ENHANCED, RENDERING, RENDERED] as const;
export type PipelineState = typeof stateValuesArray[number];

type PipelineContextType = {
  pipelineState: PipelineState;
  resumeFilename: string | null;
  resumeId: string | null;
  jobDescription: string | null;
  jobId: string | null;
  enhancedResumeId: string | null;
  enhancementAnalysis: Object | null;
  apiError: string | null;
  
  uploadResume: (file: File) => Promise<void>;
  setJobDescription: (jd: string) => void;
  enhanceResume: (jd: string) => Promise<void>;
  renderEnhancedResume: () => Promise<void>;
  clearError: () => void;
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
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Data for UPLOADED stage
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [parsedResume, setParsedResume] = useState<Object | null>(null);

  // Data for ENHANCING Stage
  const [jobDescription, setJobDescription] = useState<string | null>(null);

  // Data for ENHANCED Stage
  const [jobId, setJobId] = useState<string | null>(null);
  const [enhancementAnalysis, setEnhancementAnalysis] = useState<Object | null>(null);
  const [enhancedResumeId, setEnhancedResumeId] = useState<string | null>(null);
  
  const { user } = useAuth();

  const clearError = () => {
    setApiError(null);
  };

  const uploadResume = async (file: File): Promise<void> => {
    if (!user?.id) {
      console.error("No user ID available for upload");
      toast({
        title: "Authentication required",
        description: "Please sign in to upload a resume",
        variant: "destructive"
      });
      return;
    }
    
    setApiError(null);
    console.log(`Uploading ${file.name} from user ID: ${user.id}`);
    setPipelineState(UPLOADING);
    setResumeFilename(file.name);
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append('user_id', user.id);
    
    try {
      const response = await apiRequest("/upload", {
        method: "POST",
        headers: {}, // Let browser set content-type for FormData
        body: formData,
      });
      
      console.log("Upload API response:", response);

      if (response.error) {
        setPipelineState(NOT_UPLOADED);
        setApiError(response.error);
        console.error(`Upload ${file.name} from user ID: ${user.id} failed. Error message: ${response.error}`);
        toast({
          title: "Upload failed",
          description: response.error || "There was an error uploading your resume. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      console.log(`${file.name} uploaded successfully! Resume ID: ${response.data.resume_id}`);
      setPipelineState(UPLOADED);
      setResumeId(response.data.resume_id);
      setParsedResume(response.data.parsed_resume);
      
      toast({
        title: "Upload successful",
        description: "Your resume has been uploaded successfully. Now add a job description to enhance it.",
      });
    } catch (error) {
      console.error("Error in uploadResume:", error);
      setPipelineState(NOT_UPLOADED);
      setApiError(error instanceof Error ? error.message : "Unknown error");
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Network error. Please check your connection and try again.",
        variant: "destructive"
      });
    }
  };

  const enhanceResume = async (jd: string): Promise<void> => {
    if (!user?.id) {
      toast({
        title: "Not Authenticated",
        description: "Please sign in or signup to continue",
        variant: "destructive"
      });
      return;
    }
    
    setApiError(null);
    
    if (!jd.trim()) {
      toast({
        title: "No job description to enhance from",
        description: "Please type or paste a job listing and try again",
        variant: "destructive"
      });
      return;
    }
    
    if (!resumeId) {
      toast({
        title: "No resume selected",
        description: "Please select or upload a resume and try again",
        variant: "destructive"
      });
      return;
    }

    console.log(`Initializing enhancement for resume with ID: ${resumeId}`);
    setPipelineState(ENHANCING);
    setJobDescription(jd);

    try {
      console.log(`Making API call to optimize resume ID: ${resumeId} with job description`);
      const response = await apiOptimizeResume(resumeId, jd, user.id);
      
      console.log("Enhance API response:", response);

      if (response.error) {
        setPipelineState(UPLOADED);
        setApiError(response.error);
        console.error(`Enhancement failed. Error: ${response.error}`);
        toast({
          title: "Enhancement failed",
          description: response.error || "There was an error enhancing your resume. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log(`Resume enhanced successfully! Job ID: ${response.data.job_id}, Enhanced Resume ID: ${response.data.enhanced_resume_id}`);
      setPipelineState(ENHANCED);
      setJobId(response.data.job_id);
      setEnhancementAnalysis(response.data.analysis);
      setEnhancedResumeId(response.data.enhanced_resume_id);
    } catch (error) {
      console.error("Error in enhanceResume:", error);
      setPipelineState(UPLOADED);
      setApiError(error instanceof Error ? error.message : "Unknown error");
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "Network error. Please check your connection and try again.",
        variant: "destructive"
      });
    }
  };
  
  const renderEnhancedResume = async (): Promise<void> => {
    // Placeholder for future implementation
    return Promise.resolve();
  };

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
        apiError,
        
        uploadResume,
        setJobDescription,
        enhanceResume,
        renderEnhancedResume,
        clearError,
      }}
    >
      {children}
    </PipelineContext.Provider>
  );
};

// Legacy context for comparison page
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
