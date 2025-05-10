import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OptimizationResult, EnhancementAnalysis } from '@/types/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiRequest } from '@/services/api';
import { toast } from '@/hooks/use-toast';

const NOT_UPLOADED = 0,
  UPLOADING = 1,
  UPLOADED = 2,
  ENHANCING = 3,
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
  
  uploadResume: (file: File) => Promise<void>;
  setJobDescription: (jd: string) => void;
  enhanceResume: (jd: string) => Promise<void>;
  renderEnhancedResume: () => Promise<void>;
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

  // Data for ENHANCING Stage
  const [jobDescription, setJobDescription] = useState<string>('');

  // Data for ENHANCED Stage
  const [jobId, setJobId] = useState<string | null>(null);
  const [enhancementAnalysis, setEnhancementAnalysis] = useState<EnhancementAnalysis | null>(null);
  const [enhancedResumeId, setEnhancedResumeId] = useState<string | null>(null);
  
  // Data for RENDERING Stage
  // Data for RENDERED Stage
  const [enhancedResumeFile, setEnhancedResumeFile] = useState<File | null>(null);
  
  const { user } = useAuth();

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
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append('user_id', user.id);
    
    try {
      const response = await apiRequest("/upload", {
        method: "POST",
        headers: {}, // Let browser set content-type for FormData
        body: formData,
      });

      if (!response || !response.data || !response.data.resume_id) {
        console.error("Invalid response format from API:", response);
        setPipelineState(NOT_UPLOADED);
        toast({
          title: "Upload failed",
          description: "Received invalid response from server",
          variant: "destructive"
        });
        return;
      }

      console.log(`${file.name} uploaded successfully! \nResume ID: ${response.data.resume_id}`);
      setPipelineState(UPLOADED);
      setResumeId(response.data.resume_id);
      setParsedSelectedResume(response.data.parsed_resume);
      
      if (enhancementPending) {
        setEnhancementPending(false);
        enhanceResume(jobDescription);
      }
    } catch (error) {
      console.error(`Upload ${file.name} failed. Error:`, error);
      setPipelineState(NOT_UPLOADED);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
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
    
    if (!jd.trim()) {
      toast({
        title: "No job description to enhance from",
        description: "Please type or paste a job listing and try again",
        variant: "destructive"
      });
      return;
    }
    
    if (pipelineState === NOT_UPLOADED) {
      toast({
        title: "No resume selected",
        description: "Please select or upload a resume and try again",
        variant: "destructive"
      });
      return;
    }

    if (pipelineState === ENHANCING) {
      toast({
        title: "Already enhancing a resume",
        description: "Please wait for the current optimization job to finish before starting a new one",
        variant: "destructive"
      });
      return;
    }

    setJobDescription(jd);
    
    if (pipelineState === UPLOADING) {
      setEnhancementPending(true);
      console.log(`Waiting for ${resumeFilename} to finish uploading before starting optimization job`);
      return;
    } 

    console.log(`Initializing enhancement for resume with ID: ${resumeId}`);
    setPipelineState(ENHANCING);
      
    const formData = new FormData();
    formData.append("resume_id", resumeId!);
    formData.append("user_id", user.id);
    formData.append("job_description", jd);
    
    try {
      const response = await apiRequest("/optimize", {
        method: "POST",
        headers: {}, // Let browser set content-type for FormData
        body: formData,
      });
      
      if (!response || !response.data) {
        console.error("Invalid response format from API:", response);
        setPipelineState(UPLOADED);
        toast({
          title: "Enhancement failed",
          description: "Received invalid response from server",
          variant: "destructive"
        });
        return;
      }

      console.log(`Resume with ID ${resumeId} Enhanced successfully! \nJob Id: ${response.data.job_id}\nEnhanced Resume Id: ${response.data.enhanced_resume_id}`);
      setPipelineState(ENHANCED);
      setJobId(response.data.job_id);
      setEnhancementAnalysis(response.data.analysis);
      setEnhancedResumeId(response.data.enhanced_resume_id);
      
      // Set to RENDERED state to automatically trigger navigation in ProgressModal
      setTimeout(() => setPipelineState(RENDERED), 500);
      
    } catch (error) {
      console.error(`Enhancement of resume with ID: ${resumeId} failed. Error:`, error);
      setPipelineState(UPLOADED);
      toast({
        title: "Enhancement failed",
        description: "There was an error enhancing your resume. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const renderEnhancedResume = async (): Promise<void> => {
    // This can be implemented in the future if needed
    return;
  };

  useEffect(() => {
    if (pipelineState === UPLOADED && enhancementPending) {
      setEnhancementPending(false);
      enhanceResume(jobDescription);
    }
  }, [pipelineState, enhancementPending]);

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
        
        uploadResume,
        setJobDescription,
        enhanceResume,
        renderEnhancedResume,
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
