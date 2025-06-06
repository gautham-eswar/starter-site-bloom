import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { uploadResume as uploadResumeAPI, optimizeResume as optimizeResumeAPI } from '@/services/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { OptimizationResult, EnhancementAnalysis, Modification } from '@/types/api';

export type PipelineState = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const NOT_UPLOADED = 0,
  UPLOADING = 1,
  UPLOADED = 2,
  ENHANCING = 3,
  ENHANCED = 4,
  RENDERING = 5,
  RENDERED = 6;

interface ResumeContextType {
  resumeId: string | null;
  setResumeId: (id: string | null) => void;
  jobId: string | null;
  setJobId: (id: string | null) => void;
  optimizationResult: OptimizationResult | null;
  setOptimizationResult: (result: OptimizationResult | null) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);

  return (
    <ResumeContext.Provider value={{
      resumeId,
      setResumeId,
      jobId,
      setJobId,
      optimizationResult,
      setOptimizationResult,
    }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResumeContext = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResumeContext must be used within a ResumeProvider');
  }
  return context;
};

// PipelineContext
interface PipelineContextType {
  pipelineState: PipelineState;
  resumeId: string | null;
  enhancedResumeId: string | null;
  jobId: string | null;
  resumeFilename: string | null;
  jobDescription: string;
  enhancementPending: boolean;
  isAwaitingApiResponse: boolean;
  enhancementAnalysis: EnhancementAnalysis | null;
  uploadResume: (file: File) => Promise<void>;
  setJobDescription: (description: string) => void;
  enhanceResume: (jobDescription: string) => Promise<void>;
  performApiHealthCheck: () => Promise<void>;
}

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

export const PipelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pipelineState, setPipelineState] = useState<PipelineState>(NOT_UPLOADED);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [enhancedResumeId, setEnhancedResumeId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [enhancementPending, setEnhancementPending] = useState(false);
  const [isAwaitingApiResponse, setIsAwaitingApiResponse] = useState(false);
  const [enhancementAnalysis, setEnhancementAnalysis] = useState<EnhancementAnalysis | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const performApiHealthCheck = useCallback(async () => {
    console.log("[PipelineContext] Performing API health check...");
    // Health check implementation if needed
  }, []);

  const uploadResume = useCallback(async (file: File) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload your resume.",
        variant: "destructive",
      });
      return;
    }

    try {
      setPipelineState(UPLOADING);
      setResumeFilename(file.name);
      console.log(`[PipelineContext] Starting upload for file: ${file.name}`);

      const response = await uploadResumeAPI(file, user.id);
      
      if (response.error) {
        throw new Error(response.error);
      }

      console.log("[PipelineContext] Upload successful:", response);
      setResumeId(response.resume_id);
      setPipelineState(UPLOADED);
      
      toast({
        title: "Upload successful",
        description: "Your resume has been uploaded successfully.",
      });
    } catch (error) {
      console.error("[PipelineContext] Upload failed:", error);
      setPipelineState(NOT_UPLOADED);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload resume.",
        variant: "destructive",
      });
    }
  }, [user?.id]);

  const enhanceResume = useCallback(async (jobDesc: string) => {
    if (!resumeId || !user?.id) {
      toast({
        title: "Missing information",
        description: "Please upload a resume first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAwaitingApiResponse(true);
      setEnhancementPending(true);
      setPipelineState(ENHANCING);
      
      console.log(`[PipelineContext] Starting enhancement for resume ID: ${resumeId}`);

      const response = await optimizeResumeAPI(resumeId, jobDesc, user.id);
      
      if (response.error) {
        throw new Error(response.error);
      }

      console.log("[PipelineContext] Optimization response:", response);

      // Check if the response indicates immediate success
      if (response.status === 'success' && response.data) {
        const { job_id, enhanced_resume_id } = response.data;
        
        console.log(`[PipelineContext] Optimization complete! Job ID: ${job_id}, Enhanced Resume ID: ${enhanced_resume_id}`);
        
        setJobId(job_id);
        setEnhancedResumeId(enhanced_resume_id);
        setPipelineState(RENDERED);
        
        // Navigate to comparison page
        const comparisonUrl = `/comparison?originalResumeId=${resumeId}&enhancedResumeId=${enhanced_resume_id}&jobId=${job_id}`;
        console.log(`[PipelineContext] Redirecting to: ${comparisonUrl}`);
        
        navigate(comparisonUrl);
        
        toast({
          title: "Enhancement complete",
          description: "Your resume has been successfully optimized!",
        });
      } else {
        // Handle other response scenarios
        console.log("[PipelineContext] Optimization response not immediately successful, may need polling");
        toast({
          title: "Processing",
          description: "Your resume is being optimized. Please wait...",
        });
      }

    } catch (error) {
      console.error("[PipelineContext] Enhancement failed:", error);
      setPipelineState(UPLOADED);
      setEnhancementPending(false);
      
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "Failed to enhance resume.",
        variant: "destructive",
      });
    } finally {
      setIsAwaitingApiResponse(false);
    }
  }, [resumeId, user?.id, navigate]);

  return (
    <PipelineContext.Provider value={{
      pipelineState,
      resumeId,
      enhancedResumeId,
      jobId,
      resumeFilename,
      jobDescription,
      enhancementPending,
      isAwaitingApiResponse,
      enhancementAnalysis,
      uploadResume,
      setJobDescription,
      enhanceResume,
      performApiHealthCheck,
    }}>
      {children}
    </PipelineContext.Provider>
  );
};

export const usePipelineContext = () => {
  const context = useContext(PipelineContext);
  if (context === undefined) {
    throw new Error('usePipelineContext must be used within a PipelineProvider');
  }
  return context;
};
