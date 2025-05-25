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
    resumeId, // This is the original resume ID
    jobId,
    enhancedResumeId // This is the ID of the enhanced resume
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
      console.log(`Navigating with originalResumeId: ${resumeId}, enhancedResumeId: ${enhancedResumeId}, jobId: ${jobId}`);
      navigate(`/comparison?originalResumeId=${resumeId}&enhancedResumeId=${enhancedResumeId}&jobId=${jobId}`);
      onOpenChange(false);
    } else {
      console.error("Navigation error: Missing IDs for comparison page.", { resumeId, enhancedResumeId, jobId });
      toast({
        title: "Navigation Error",
        description: "Could not navigate to results. Required information is missing.",
        variant: "destructive",
      });
    }
  };

  const handleDoneClick = () => {
    handleNavigateToComparison();
  };

  // Update current step based on pipeline state
  useEffect(() => {
    if (pipelineState >= UPLOADED && currentStep === 0) {
      setCurrentStep(1);
      setProgress(0);
    } else if (pipelineState >= ENHANCED && currentStep === 1) {
      setCurrentStep(2);
      setProgress(0);
    } else if (pipelineState >= RENDERED && currentStep === 2) {
      setCurrentStep(3); // Indicates completion of all steps for UI
    }
  }, [pipelineState, currentStep]);

  // Auto-navigate when enhancement is complete and all data is available
  useEffect(() => {
    if (pipelineState >= RENDERED && resumeId && enhancedResumeId && jobId && isOpen) { // Check isOpen to prevent navigation if modal was closed
      console.log("Enhancement process RENDERED, attempting auto-navigation.");
      // Adding a slight delay to ensure UI updates and then navigate
      const timer = setTimeout(() => {
        if (isOpen) { // Double check isOpen before navigating
            handleNavigateToComparison();
        }
      }, 1000); 
      return () => clearTimeout(timer);
    }
  }, [pipelineState, resumeId, enhancedResumeId, jobId, navigate, onOpenChange, isOpen]);
  
  const isComplete = (pipelineState >= RENDERED);

  // Progress animation
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isOpen && !isComplete) {
        interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    // If a step is visually "complete" but the actual process (like ENHANCED state) isn't hit yet,
                    // this could reset progress. We might want to hold at 100 or rely on currentStep.
                    // For now, let's keep it simple and let it cycle if a step takes longer.
                    return prev >= 95 && (currentStep === 0 && pipelineState < UPLOADED || currentStep === 1 && pipelineState < ENHANCED || currentStep === 2 && pipelineState < RENDERED) ? prev : prev + 5 > 100 ? 100 : prev + 5;
                }
                return prev + 5;
            });
        }, 200); // Reduced interval for faster visual progress
    } else if (isComplete) {
        setProgress(100); // Ensure progress is 100% when complete
    }
    
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [isOpen, pipelineState, currentStep, isComplete]);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing if complete or error, or if user explicitly closes
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
              const isActive = currentStep === index && !isComplete; // Active means current and not all steps done
              const isCompleted = currentStep > index || (currentStep === index && isComplete && index === steps.length -1) || (isComplete && index < steps.length -1) ;
              
              let stepProgress = 0;
              if (isCompleted) {
                stepProgress = 100;
              } else if (isActive) {
                stepProgress = progress;
              }

              return (
                <div 
                  key={index} 
                  className={`flex items-center ${isActive || isCompleted ? 'opacity-100' : 'opacity-50'}`}
                >
                  <div className="mr-4 h-10 w-10 flex items-center justify-center rounded-full bg-[#f1f1eb]">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-draft-green">{step.name}</p>
                    {(isActive || isCompleted) && ( // Show progress bar if active or completed
                      <div className="mt-2">
                        <Progress 
                          value={stepProgress} 
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
                  {currentStep === 0 && "Preparing to make magic..."}
                  {currentStep === 1 && "Finding the perfect words..."}
                  {currentStep === 2 && "Adding that special touch..."}
                  {currentStep === 3 && "Finalizing enhancements..."} 
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
