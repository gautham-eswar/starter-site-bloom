
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
export type PipelineState = typeof stateValuesArray[number];

type PipelineContextType = {
  pipelineState: PipelineState;
  resumeFilename: string | null;
  resumeId: string | null;
  jobDescription: string | null;
  jobId: string | null;
  enhancedResumeId: str | null;
  enhancementAnalysis: Object | null;
  
  uploadResume: (file: File) => void;
  setJobDescription: (string) => void;
  enhanceResume: () => void;
  renderEnhancedResume: () => void;
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
  const [enhancementPending, setEnhancementPending] = useState(false)

  // Data for UPLOADED stage
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [parsedSelectedResume, setParsedSelectedResume] = useState<Object | null>(null);

  // Data for ENHANCING Stage
  const [jobDescription, setJobDescription] = useState<string>('');

  // Data for ENHANCED Stage
  const [jobId, setJobId] = useState<string | null>(null);
  const [enhancementAnalysis, setEnhancementAnalysis] = useState<Object | null>(null);
  const [enhancedResumeId, setEnhancedResumeId] = useState<string | null>(null);
  
  // Data for RENDERING Stage

  // Data for RENDERED Stage
  const [enhancedResumeFile, setEnhancedResumeFile] = useState<File | null>(null);
  const [enhancedResumeFileId, setEnhancedResumeFileId] = useState<File | null>(null);
  
  const {
    user
  } = useAuth();

  const renderEnhancedResume = async () => {
    return
  }

  const enhanceResume = async () => {

    if (!user.id){
      toast({
        title: "Not Authenticated",
        description: "Please sign in or singup to continue",
        variant: "destructive"
      });
      return;
    }
    if (!jobDescription.trim()){
      toast({
        title: "No job description to enhance from",
        description: "Please type or paste a job listing and try again",
        variant: "destructive"
      });
      return;
    }
    if (pipelineState == NOT_UPLOADED){
      toast({
        title: "No resume selected",
        description: "Please select or upload a resume and try again",
        variant: "destructive"
      });
      return;
    }

    if (pipelineState == ENHANCING){
      toast({
        title: "Already enhancing a resume",
        description: "Please wait for the current optimization job to finish before starting a new one",
        variant: "destructive"
      });
      return;
    }
    
    if (pipelineState == UPLOADING){
      setEnhancementPending(true)
      console.log(`Waiting for resume ${resumeFilename} to finish uploading before starting optimization job`)
      return
    } 

    console.log(`Initializing enhancement for resume with ID: ${resumeID}`)
    setPipelineState(ENHANCING)

    const currentResumeId = resumeId;
    const currentJobDescription = jobDescription; 
      
    const formData = new FormData();
    formData.append("resume_id", resumeId)
    formData.append("user_id", user.id)
    formData.append("job_description", jd)
    const {data, error} await apiRequest("/optimize", {
      method: "POST",
      headers: {}, // Let browser set content-type for FormData
      body: formData,
    });

    // Ignore optimization if another one was started (although it shouldn't)
    if (currentResumeId != resumeId || currentJobDescription != jobDescription) return

    if (error) {
      setUploadState(UPLOADED);
      console.error(`Enhancement of resume with ID: ${currentResumeId} failed. Error message: ${error}`)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive"
      });
    }

    setPipelineState(ENHANCED)
    setJobId(data["job_id"])
    setEnhancementAnalysis(data["analysis"])
    setEnhancedResumeId(data["enhanced_resume_id"]) 
  }

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
      console.error(`Upload ${file.filename} from user ID: ${userId} failed. Error message: ${error}`)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive"
      });
    }

    setPipelineState(UPLOADED)
    setSelectedResumeId(data["resume_id"])
    setParsedSelectedResume(data["resume_id"])
    console.log(`Resume ${file.filename} uploaded successfully. Resume ID: ${data["resume_id"]}`)

    if (enhancementPending){
      await enhanceResume(jobDescription)
    }
  }

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
