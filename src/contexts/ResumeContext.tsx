
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OptimizationResult } from '@/types/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiRequest } from '@/services/api';

const NOT_UPLOADED = 0,
  UPLOADING = 1,
  UPLOADED = 2,
  ENHANCING = 3,
  ENHANCED = 4,
  RENDERING = 5,
  RENDERED = 6;

const stateValuesArray = [NOT_UPLOADED, UPLOADING, UPLOADED, ENHANCING, ENHANCED, RENDERING, RENDERED] as const;
type PipelineState = typeof stateValuesArray[number];

type PipelineContextType = {

  pipelineState: PipelineState;
  setPipelineState: (state: PipelineState) => void;

  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  
  resumeId: string | null;
  setResumeId: (id: string | null) => void;
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

  // Data for UPLOADED stage
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [parsedResume, setParsedResume] = useState<Object | null>(null);

  // Data for ENHANCING Stage
  const [jobDescription, setJobDescription] = useState<string>('');

  // Data for ENHANCED Stage
  const [jobId, setJobId] = useState<string | null>(null);
  const [enhancements, setEnhancements] = useState<Object | null>(null);
  const [enhancedResumeId, setEnhancedResumeId] = useState<string | null>(null);
  
  // Data for RENDERING Stage

  // Data for RENDERED Stage
  const [enhancedResumeFile, setEnhancedResumeFile] = useState<File | null>(null);
  const [enhancedResumeFileId, setEnhancedResumeFileId] = useState<File | null>(null);
  
  const {
    user
  } = useAuth();

  const uploadResume = async (file: File) => {
    
    console.log(`Uploading resume ${file.filename} from user ID: ${userId}`)
    setPipelineState(UPLOADING)
  
    const formData = new FormData();
    formData.append("file", file);
    if (userId) {
        formData.append('user_id', user.id);
    }
    
    const{data, error} = await apiRequest("/upload", {
      method: "POST",
      headers: {}, // Let browser set content-type for FormData
      body: formData,
    });

    // Ignore older uploads
    if (file.filename != resumeFilename)
      return

    if (error) {
      setUploadState(NOT_UPLOADED);
      console.log(`Upload ${file.filename} from user ID: ${userId} failed. Error message: ${error}`)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive"
      });
    }

    setPipelineState(UPLOADED)
    setResumeId(data["resume_id"])
    setParsedResume(data["resume_id"])
    console.error(`Resume ${file.filename} uploaded successfully. Resume ID: ${data["resume_id"]}`)


  }

  return (
    <PipelineContext.Provider
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
