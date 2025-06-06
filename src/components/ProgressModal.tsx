
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CircleCheck, Rocket, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePipelineContext, PipelineState } from '@/contexts/ResumeContext';
import { toast } from '@/hooks/use-toast';

interface ProgressModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const NOT_UPLOADED = 0,
  UPLOADING = 1,
  UPLOADED = 2,
  ENHANCING = 3,
  ENHANCED = 4,
  RENDERING = 5,
  RENDERED = 6;

const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, onOpenChange }) => {
  const {
    pipelineState,
    resumeId,
    jobId,
    enhancedResumeId
  } = usePipelineContext();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { name: 'Uploading resume', icon: <Rocket className="text-draft-coral" /> },
    { name: 'Organizing content', icon: <Sparkles className="text-draft-purple" /> },
    { name: 'Applying template', icon: <CircleCheck className="text-draft-mint" /> }
  ];

  const handleNavigateToComparison = () => {
    if (resumeId && enhancedResumeId && jobId) {
      console.log(`[ProgressModal] Navigating with originalResumeId: ${resumeId}, enhancedResumeId: ${enhancedResumeId}, jobId: ${jobId}`);
      navigate(`/comparison?originalResumeId=${resumeId}&enhancedResumeId=${enhancedResumeId}&jobId=${jobId}`);
      onOpenChange(false);
    } else {
      console.error("[ProgressModal] Navigation error: Missing IDs for comparison page.", { resumeId, enhancedResumeId, jobId });
      toast({
        title: "Navigation Error",
        description: "Could not navigate to results. Required information is missing.",
        variant: "destructive",
      });
    }
  };

  const handleDoneClick = () => {
    console.log("[ProgressModal] 'View Results' button clicked. Attempting navigation.");
    handleNavigateToComparison();
  };

  // Update current step based on pipeline state
  useEffect(() => {
    console.log(`[ProgressModal] Pipeline state changed: ${pipelineState}, Current step: ${currentStep}`);
    if (pipelineState >= ENHANCING && currentStep === 0) {
      setCurrentStep(1);
      setProgress(0);
    } else if (pipelineState >= ENHANCED && currentStep === 1) {
      setCurrentStep(2);
      setProgress(0);
    } else if (pipelineState >= RENDERED && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [pipelineState, currentStep]);

  // Auto-navigate when enhancement is complete and all data is available
  useEffect(() => {
    if (pipelineState >= RENDERED && resumeId && enhancedResumeId && jobId && isOpen) {
      console.log('[ProgressModal] Auto-navigation check: State is RENDERED, all IDs present.');
      console.log(`[ProgressModal] IDs: resumeId=${resumeId}, enhancedResumeId=${enhancedResumeId}, jobId=${jobId}`);
      
      const timer = setTimeout(() => {
        if (isOpen) {
          console.log("[ProgressModal] Auto-navigating to comparison page now.");
          handleNavigateToComparison();
        } else {
          console.log("[ProgressModal] Auto-navigation skipped: Modal was closed before timer fired.");
        }
      }, 1500); // Longer delay to show completion
      
      return () => clearTimeout(timer);
    } else {
      if (isOpen) {
        console.log(`[ProgressModal] Auto-navigation conditions not met. State: ${pipelineState}, resumeId: ${!!resumeId}, enhancedResumeId: ${!!enhancedResumeId}, jobId: ${!!jobId}`);
      }
    }
  }, [pipelineState, resumeId, enhancedResumeId, jobId, isOpen]);
  
  const isComplete = (pipelineState >= RENDERED);

  // Progress animation
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (isOpen && !isComplete) {
        interval = setInterval(() => {
            setProgress(prev => {
                const holdAt95 = 
                    (currentStep === 1 && pipelineState < ENHANCED) ||
                    (currentStep === 2 && pipelineState < RENDERED);

                if (prev >= 100) return 100;
                if (holdAt95 && prev >= 95) return 95;

                return Math.min(prev + 5, 100);
            });
        }, 200);
    } else if (isComplete && progress < 100 && currentStep === steps.length) {
        setProgress(100);
    }
    
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [isOpen, pipelineState, currentStep, isComplete, progress]);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
    }}>
      <DialogContent className="bg-draft-bg border-draft-green sm:max-w-md">
        <DialogTitle className="DialogTitle" style={{display:"none"}}></DialogTitle>
        <div className="py-6">
          <h2 className="text-2xl font-serif text-draft-green text-center mb-8">
            Making your resume better
          </h2>
          
          <div className="space-y-8">
            {steps.map((step, index) => {
              const isActive = currentStep === index && pipelineState < RENDERED;
              const isVisuallyCompleted = currentStep > index || 
                                       (currentStep === index && index === steps.length -1 && pipelineState >= RENDERED) ||
                                       (pipelineState >= RENDERED && index < steps.length -1);
              
              let stepProgressValue = 0;
              if (isVisuallyCompleted) {
                stepProgressValue = 100;
              } else if (isActive) {
                stepProgressValue = progress;
              }

              return (
                <div 
                  key={index} 
                  className={`flex items-center ${isActive || isVisuallyCompleted ? 'opacity-100' : 'opacity-50'}`}
                >
                  <div className="mr-4 h-10 w-10 flex items-center justify-center rounded-full bg-[#f1f1eb]">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-draft-green">{step.name}</p>
                    {(isActive || isVisuallyCompleted) && (
                      <div className="mt-2">
                        <Progress 
                          value={stepProgressValue} 
                          className="h-2 bg-[#f1f1eb] bg-opacity-70"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 text-center">
            <div className="flex flex-col items-center gap-2">
              {!isComplete && (
                <p className="text-draft-green italic mb-4">
                  {currentStep === 1 && "Analyzing your resume..."}
                  {currentStep === 2 && "Optimizing content..."}
                  {currentStep === 3 && "Finalizing changes..."}
                </p>
              )}
              
              <Button 
                className="bg-draft-green hover:bg-draft-green/90 text-white"
                onClick={handleDoneClick}
                disabled={!isComplete} 
              >
                {isComplete ? "View Results" : "Processing..."}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressModal;
