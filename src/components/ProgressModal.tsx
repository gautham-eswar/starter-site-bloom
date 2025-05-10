
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { usePipelineContext, NOT_UPLOADED, UPLOADING, UPLOADED, ENHANCING, ENHANCED } from '@/contexts/ResumeContext';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

// Define props interface
interface ProgressModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, onOpenChange }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Optimizing your resume");
  const [hasError, setHasError] = useState(false);

  // Use the pipeline context to get the current state
  const { pipelineState, apiError, clearError } = usePipelineContext();
  
  // Reset error state when modal opens
  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setHasError(false);
      console.log("Progress modal opened, resetting state");
    }
  }, [isOpen]);
  
  // Update progress based on pipeline state
  useEffect(() => {
    console.log("Pipeline state updated:", pipelineState);
    // Reset error state when starting a new process
    if (pipelineState === ENHANCING) {
      setHasError(false);
      setProgress(40);
      setStatusText("Enhancing your resume to match the job description...");
      console.log("Enhancing resume, updating progress state");
    } else if (pipelineState === ENHANCED) {
      setProgress(100);
      setStatusText("Your resume is ready!");
      console.log("Resume enhanced, progress complete");
    } else if (apiError) {
      setHasError(true);
      setStatusText(apiError || "There was an error processing your request. Please try again.");
      console.log("Error in pipeline:", apiError);
    }
  }, [pipelineState, apiError]);

  // Simulate a gradual progress increase for smoother UX
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isOpen && progress < 95 && pipelineState === ENHANCING && !hasError) {
      interval = setInterval(() => {
        setProgress(prev => {
          // Only increment if we haven't reached the target yet
          if (prev < 90) {
            return prev + 0.5;
          }
          return prev;
        });
      }, 300);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, progress, pipelineState, hasError]);

  const handleTryAgain = () => {
    clearError();
    onOpenChange(false);
  };

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
              <Button onClick={handleTryAgain} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <Progress value={progress} className="h-2" />
              <p className="text-center mt-4 text-sm text-gray-600">{statusText}</p>
              <div className="flex justify-center mt-4">
                <Loader2 className="h-8 w-8 text-draft-green animate-spin" />
              </div>
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
