
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent,DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CircleCheck, Rocket, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useResumeContext } from '@/contexts/ResumeContext';
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
      resumeFilename,
      resumeId,
      jobDescription,
      jobId,
      enhancementPending,
      enhancedResumeId,
      enhancementAnalysis,
      uploadResume,
      setJobDescription,
      enhanceResume,
      renderEnhancedResume,
    } = usePipelineContext();
  const navigate = useNavigate();
  
  // const [isComplete, setIsComplete] = useState(false);
  // const [optimizationStatus, setOptimizationStatus] = useState<OptimizationStatus | null>(null);
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
    setIsOptimizing(false);
  };

  if (currentStep == 0 && pipelineState >= UPLOADED){
    setCurrentStep(1)
    setProgress(0)
  } else if (currentStep == 1 && pipelineState >= ENHANCED){
    setCurrentStep(2)
    setProgress(0)
  } else if (currentStep == 2 && pipelineState >= RENDERED){
    setCurrentStep(3)
  }
  
  const isComplete = (pipelineState >= RENDERED);

  useEffect( ()=>{
    const t = setInterval(2000, ()=>{
      setProgress(prev => (prev >= 100) ? 0 : prev + 5);
    })
    return clearInterval(t)
  }, [pipelineState, enhancementPending, currentStep])
  

  // // Poll for optimization status
  // useEffect(() => {
  //   if (!isOpen || !jobId || !isOptimizing) return;

  //   let interval: NodeJS.Timeout;
  //   const checkStatus = async () => {
  //     try {
  //       const status = await checkOptimizationStatus(jobId);
  //       setOptimizationStatus(status);
        
  //       // Update current step based on status
  //       if (status.status === 'pending') {
  //         setCurrentStep(0);
  //       } else if (status.status === 'processing') {
  //         setCurrentStep(1);
  //       } else if (status.status === 'completed') {
  //         setCurrentStep(2);
  //         setIsComplete(true);
  //         clearInterval(interval);
  //         toast({
  //           title: "Optimization complete",
  //           description: "Your resume has been optimized successfully!",
  //         });
  //       } else if (status.status === 'error') {
  //         clearInterval(interval);
  //         toast({
  //           title: "Optimization failed",
  //           description: status.message || "There was an error optimizing your resume",
  //           variant: "destructive",
  //         });
  //         onOpenChange(false);
  //         setIsOptimizing(false);
  //       }
        
  //       // Update progress if available
  //       if (status.progress !== undefined) {
  //         setProgress(status.progress);
  //       } else {
  //         // Simulate progress if not provided by API
  //         setProgress(prev => (prev >= 100) ? 0 : prev + 5);
  //       }
  //     } catch (error) {
  //       console.error("Error checking optimization status:", error);
  //     }
  //   };
    
  //   // Initial check
  //   checkStatus();
    
  //   // Set up polling interval
  //   interval = setInterval(checkStatus, 2000);
    
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [isOpen, jobId, isOptimizing, onOpenChange, setIsOptimizing]);

  // Reset state when modal closes
  // useEffect(() => {
  //   if (!isOpen) {
  //     if (!isComplete) {
  //       setCurrentStep(0);
  //       setProgress(0);
  //     }
  //   }
  // }, [isOpen, isComplete]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing if complete or error
      onOpenChange(open);
      if (isComplete) {
      }
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
