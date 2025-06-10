
import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';

interface OptimizationLoadingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const OptimizationLoadingModal: React.FC<OptimizationLoadingModalProps> = ({ 
  isOpen, 
  onOpenChange 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-draft-bg border-draft-green sm:max-w-md">
        <DialogTitle className="DialogTitle" style={{display:"none"}}></DialogTitle>
        <div className="py-6">
          <h2 className="text-2xl font-serif text-draft-green text-center mb-8">
            Optimizing your resume
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-center">
              <div className="mr-4 h-10 w-10 flex items-center justify-center rounded-full bg-[#f1f1eb]">
                <Sparkles className="text-draft-green" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-draft-green">Processing optimization</p>
                <div className="mt-2">
                  <Progress 
                    value={75} 
                    className="h-2 bg-[#f1f1eb] bg-opacity-70"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-draft-green italic mb-4">
              Finding the perfect improvements...
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OptimizationLoadingModal;
