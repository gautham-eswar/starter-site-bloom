
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

  const handleDoneClick = () => {
    onOpenChange(false);
    if (resumeId && jobId) {
      navigate(`/comparison?resumeId=${resumeId}&jobId=${jobId}`);
    }
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
      setCurrentStep(3);
    }
  }, [pipelineState, currentStep]);

  // Auto-navigate when enhancement is complete
  useEffect(() => {
    if (pipelineState >= ENHANCED && resumeId && jobId) {
      console.log("Enhancement complete, navigating to comparison page");
      setTimeout(() => {
        onOpenChange(false);
        navigate(`/comparison?resumeId=${resumeId}&jobId=${jobId}`);
      }, 1000);
    }
  }, [pipelineState, resumeId, jobId, navigate, onOpenChange]);
  
  const isComplete = (pipelineState >= RENDERED);

  // Progress animation
  useEffect(() => {
    let interval = setInterval(function () {
      setProgress(prev => (prev >= 100) ? 0 : prev + 5);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isOpen, pipelineState, currentStep]);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing if complete or error
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
              const isActive = currentStep === index;
              const isCompleted = currentStep > index;
              
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
                    {isActive && (
                      <div className="mt-2">
                        <Progress 
                          value={progress} 
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
