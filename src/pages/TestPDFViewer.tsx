
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PDFViewer from '@/components/PDFViewer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/services/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';

const TestPDFViewer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumeId, setResumeId] = useState<string>("41600801-46c5-4d56-a248-f8c3585cc486");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  return (
    <div className="min-h-screen bg-draft-bg">
      <Header />
      
      <main className="px-8 py-6 md:px-12 lg:px-20">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <div>
            <h2 className="text-2xl font-serif text-draft-green mb-6">PDF Viewer Test</h2>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium mb-2">Resume ID</label>
              <div className="flex gap-3">
                <Input 
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  className="flex-1"
                  placeholder="Enter resume ID"
                />
                <Button 
                  variant="default" 
                  onClick={async () => {
                    if (!user) {
                      toast({
                        title: "Authentication Required",
                        description: "Please login to view resumes",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    setIsLoading(true);
                    setErrorMessage(null);
                    
                    try {
                      // Fetch the PDF from your backend API
                      const response = await apiRequest(`/download/${resumeId}/pdf`);
                      if (!response) {
                        throw new Error('Failed to fetch PDF');
                      }
                      setIsLoading(false);
                    } catch (error) {
                      console.error('Error fetching PDF:', error);
                      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Fetch PDF'}
                </Button>
              </div>
              {errorMessage && (
                <p className="text-red-500 mt-2 text-sm">{errorMessage}</p>
              )}
            </div>
            
            <div className="bg-white rounded-lg h-[700px] overflow-hidden shadow-md">
              <PDFViewer 
                resumeId={resumeId}
                userId={user?.id}
                height="100%"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestPDFViewer;
