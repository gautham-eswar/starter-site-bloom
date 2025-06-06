
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
  ENHANCED = 4, // API call for enhancement is successful
  RENDERING = 5,
  RENDERED = 6; // PDF is fully rendered and confirmed

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
      console.log(`[ProgressModal] Navigating with originalResumeId: ${resumeId}, enhancedResumeId: ${enhancedResumeId}, jobId: ${jobId}`);
      navigate(`/comparison?originalResumeId=${resumeId}&enhancedResumeId=${enhancedResumeId}&jobId=${jobId}`);
      onOpenChange(false); // Close modal on navigation
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
    // This button is primarily a fallback or for manual action if auto-navigation doesn't occur.
    // It becomes enabled when isComplete (pipelineState >= RENDERED) is true.
    // If auto-navigation already happened, clicking this would re-navigate.
    console.log("[ProgressModal] 'View Results' button clicked. Attempting navigation.");
    handleNavigateToComparison();
  };

  // Update current step based on pipeline state
  useEffect(() => {
    console.log(`[ProgressModal] Pipeline state changed: ${pipelineState}, Current step: ${currentStep}`);
    if (pipelineState >= UPLOADED && currentStep === 0) {
      setCurrentStep(1);
      setProgress(0); // Reset progress for the new step
    } else if (pipelineState >= ENHANCED && currentStep === 1) {
      setCurrentStep(2);
      setProgress(0); // Reset progress for the new step
    } else if (pipelineState >= RENDERED && currentStep === 2) {
      // This logic visually completes the steps in the modal
      setCurrentStep(3); // Indicates completion of all visual steps
    }
  }, [pipelineState, currentStep]);

  // Auto-navigate when enhancement is complete (ENHANCED state) and all data is available
  useEffect(() => {
    // Navigate as soon as enhancement is done and IDs are available
    if (pipelineState >= ENHANCED && resumeId && enhancedResumeId && jobId && isOpen) {
      console.log('[ProgressModal] Auto-navigation check: All IDs present. resumeId:', resumeId, 'enhancedResumeId:', enhancedResumeId, 'jobId:', jobId);
      console.log("[ProgressModal] Enhancement process ENHANCED or further, attempting auto-navigation.");
      // Adding a slight delay to ensure UI updates and then navigate
      const timer = setTimeout(() => {
        if (isOpen) { // Double check isOpen before navigating
            console.log("[ProgressModal] Auto-navigating now.");
            handleNavigateToComparison();
        } else {
            console.log("[ProgressModal] Auto-navigation skipped: Modal was closed before timer fired.");
        }
      }, 500); // Reduced delay, can be adjusted
      return () => clearTimeout(timer);
    } else {
        if (isOpen) {
            console.log(`[ProgressModal] Auto-navigation conditions not met yet. State: ${pipelineState}, resumeId: ${!!resumeId}, enhancedResumeId: ${!!enhancedResumeId}, jobId: ${!!jobId}`);
        }
    }
  }, [pipelineState, resumeId, enhancedResumeId, jobId, isOpen, navigate, onOpenChange]); // Dependencies for auto-navigation
  
  // isComplete for the button state still waits for RENDERED,
  // as "View Results" implies everything, including PDF, is fully ready.
  // However, auto-navigation will occur sooner.
  const isComplete = (pipelineState >= RENDERED);

  // Progress animation
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    // Animate progress if modal is open and the overall process (up to RENDERED) is not yet complete.
    // Or if the current visual step is not yet at 100% even if RENDERED is not met.
    if (isOpen && !isComplete) { // Continue animation as long as modal is open & RENDERED state not met
        interval = setInterval(() => {
            setProgress(prev => {
                // Stop filling at 95% if the underlying state for the current step hasn't been reached.
                // This prevents the bar from showing 100% prematurely.
                const holdAt95 = 
                    (currentStep === 0 && pipelineState < UPLOADED) ||
                    (currentStep === 1 && pipelineState < ENHANCED) ||
                    (currentStep === 2 && pipelineState < RENDERED);

                if (prev >= 100) return 100; // Already full for this step
                if (holdAt95 && prev >= 95) return 95; // Hold if step not truly complete

                return Math.min(prev + 5, 100); // Increment progress
            });
        }, 200);
    } else if (isComplete && progress < 100 && currentStep === steps.length) {
        // If all steps are visually complete (currentStep = 3) and pipeline is RENDERED, ensure progress bar shows 100%.
        setProgress(100);
    }
    
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [isOpen, pipelineState, currentStep, isComplete, progress]); // Added progress to dependencies
  
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
              // A step is visually active if it's the currentStep and the overall process isn't fully RENDERED yet.
              const isActive = currentStep === index && pipelineState < RENDERED;
              // A step is visually completed if currentStep has passed it,
              // OR if it's the last step and the overall process is RENDERED,
              // OR if the overall process is RENDERED and this step is before the last.
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
              {!isComplete && ( // Show encouraging messages until RENDERED
                <p className="text-draft-green italic mb-4">
                  {currentStep === 0 && "Preparing to make magic..."}
                  {currentStep === 1 && "Finding the perfect words..."}
                  {currentStep === 2 && "Adding that special touch..."}
                  {/* Message for currentStep === 3 removed as it implies all visual steps done, covered by button text */}
                </p>
              )}
              
              <Button 
                className="bg-draft-green hover:bg-draft-green/90 text-white"
                onClick={handleDoneClick}
                // Button is enabled when RENDERED state is reached. Auto-nav happens at ENHANCED.
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
