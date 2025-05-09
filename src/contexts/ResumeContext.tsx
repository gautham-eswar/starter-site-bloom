
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OptimizationResult } from '@/types/api';

const NOT_UPLOADED = 0,
  UPLOADING = 1,
  UPLOADED = 2,
  ENHANCING = 3,
  ENHANCED = 4,
  RENDERING = 5,
  RENDERED = 6;

const stateValuesArray = [NOT_UPLOADED, UPLOADING, UPLOADED, ENHANCING, ENHANCED, RENDERING, RENDERED] as const;
type PipelineState = typeof stateValuesArray[number];

type ProcessContextType = {

  pipelineState: PipelineState;
  setPipelineState: (state: PipelineState) => void;

  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  
  resumeId: string | null;
  setResumeId: (id: string | null) => void;
  
}

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
