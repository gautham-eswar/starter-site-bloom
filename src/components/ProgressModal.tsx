
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CircleCheck, Rocket, Sparkles } from 'lucide-react';

interface ProgressModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, onOpenChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { name: 'Uploading resume', icon: <Rocket className="text-draft-coral" /> },
    { name: 'Organizing content', icon: <Sparkles className="text-draft-purple" /> },
    { name: 'Applying template', icon: <CircleCheck className="text-draft-mint" /> }
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    // Simulate progress through the steps
    const timer = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 100) {
          setCurrentStep(prevStep => {
            if (prevStep >= steps.length - 1) {
              clearInterval(timer);
              return prevStep;
            }
            return prevStep + 1;
          });
          return 0;
        }
        return prevProgress + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isOpen, steps.length]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-draft-bg border-draft-green sm:max-w-md">
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
                          className="h-2 bg-[#f1f1eb]"
                          style={{
                            "--tw-bg-opacity": 0.7
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-draft-green italic">
              {currentStep === 0 && "Preparing to make magic..."}
              {currentStep === 1 && "Finding the perfect words..."}
              {currentStep === 2 && "Adding that special touch..."}
              {currentStep === 3 && "Almost ready to shine!"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressModal;
