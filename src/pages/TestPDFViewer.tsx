
import React, { useState } from 'react';
import Header from '@/components/Header';
import SimpleResumeViewer from '@/components/SimpleResumeViewer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';

const TestPDFViewer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumeId, setResumeId] = useState<string>("41600801-46c5-4d56-a248-f8c3585cc486");
  const [fileName, setFileName] = useState<string>("ABHIRAJ SINGH_Resume - Supply Chain.pdf");
  
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
            <h2 className="text-2xl font-serif text-draft-green mb-6">Simple PDF Viewer Test</h2>
            
            <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Resume ID</label>
                  <Input 
                    value={resumeId}
                    onChange={(e) => setResumeId(e.target.value)}
                    className="w-full border-gray-300"
                    placeholder="Enter resume ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">File Name</label>
                  <Input 
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full border-gray-300"
                    placeholder="Enter file name"
                  />
                </div>
                
                <Button 
                  variant="default"
                  onClick={() => {
                    toast({
                      title: "Settings Applied",
                      description: "PDF Viewer will use the updated resume ID and file name",
                    });
                  }}
                  className="w-full bg-draft-green hover:bg-draft-green/90"
                >
                  Apply Settings
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg h-[700px] overflow-hidden shadow-md relative border border-gray-200">
              <SimpleResumeViewer 
                resumeId={resumeId}
                fileName={fileName}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestPDFViewer;
