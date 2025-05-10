
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { usePipelineContext } from '@/contexts/ResumeContext';
import { AlertCircle } from 'lucide-react';

// Define constants for pipeline states
const NOT_UPLOADED = 0,
  UPLOADING = 1,
  UPLOADED = 2,
  ENHANCING = 3,
  ENHANCED = 4,
  RENDERING = 5,
  RENDERED = 6;

// Define props interface
interface ProgressModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, onOpenChange }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Starting optimization");
  const [hasError, setHasError] = useState(false);

  // Use the pipeline context to get the current state
  const { pipelineState } = usePipelineContext();

  // Update progress based on pipeline state
  useEffect(() => {
    console.log("ProgressModal: Pipeline state changed to", pipelineState);
    
    // Reset error state when starting a new process
    if (pipelineState === UPLOADING || pipelineState === ENHANCING) {
      setHasError(false);
    }
    
    if (pipelineState === UPLOADING) {
      setProgress(10);
      setStatusText("Uploading your resume...");
    } else if (pipelineState === UPLOADED) {
      setProgress(30);
      setStatusText("Resume uploaded successfully. Preparing for optimization...");
    } else if (pipelineState === ENHANCING) {
      setProgress(50);
      setStatusText("Enhancing your resume to match the job description...");
    } else if (pipelineState === ENHANCED) {
      setProgress(80);
      setStatusText("Enhancement complete! Preparing results...");
    } else if (pipelineState === RENDERING) {
      setProgress(90);
      setStatusText("Rendering your enhanced resume...");
    } else if (pipelineState === RENDERED) {
      setProgress(100);
      setStatusText("Your resume is ready!");
    } else if (pipelineState === NOT_UPLOADED && progress > 0) {
      // Only show error if we were in the middle of a process
      setHasError(true);
      setStatusText("There was an error processing your request. Please try again.");
    }
  }, [pipelineState, progress]);

  // Simulate a gradual progress increase for smoother UX
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    // Fix the comparison using explicit constant checks for all pipeline states
    if (isOpen && progress < 95 && 
        pipelineState !== NOT_UPLOADED &&
        pipelineState !== ENHANCED && 
        pipelineState !== RENDERING &&
        pipelineState !== RENDERED) {
      interval = setInterval(() => {
        setProgress(prev => {
          // Calculate the target based on pipelineState
          let target = 0;
          if (pipelineState === UPLOADING) target = 28;
          else if (pipelineState === UPLOADED) target = 45;
          else if (pipelineState === ENHANCING) target = 75;
          else if (pipelineState === ENHANCED) target = 95;
          else if (pipelineState >= RENDERING) target = 100;
          
          // Only increment if we haven't reached the target yet
          if (prev < target) {
            return prev + 0.5;
          }
          return prev;
        });
      }, 300);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, progress, pipelineState]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {hasError ? "Processing Error" : "Optimizing Your Resume"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {hasError 
              ? "We encountered an issue while processing your resume." 
              : "Please wait while we tailor your resume to match the job description."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          {hasError ? (
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
              <p className="text-sm text-gray-600">{statusText}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                This may be due to a network issue or server unavailability. Please try again later.
              </p>
            </div>
          ) : (
            <>
              <Progress value={progress} className="h-2" />
              <p className="text-center mt-4 text-sm text-gray-600">{statusText}</p>
              <div className="text-center mt-4">
                <p className="text-xs text-muted-foreground">
                  This may take a minute or two. Please don't close this window.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressModal;
