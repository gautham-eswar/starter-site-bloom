
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PDFViewer from '@/components/PDFViewer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const TestPDFViewer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumeId, setResumeId] = useState<string>("41600801-46c5-4d56-a248-f8c3585cc486");
  const [fileName, setFileName] = useState<string>("ABHIRAJ SINGH_Resume - Supply Chain.pdf");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [directUrl, setDirectUrl] = useState<string | null>(null);
  const [pdfLoaded, setPdfLoaded] = useState<boolean>(false);
  
  // Attempt to load the PDF automatically when the component mounts
  useEffect(() => {
    if (resumeId && fileName) {
      fetchDirectUrl();
    }
  }, []);
  
  // Function to get the direct Supabase storage URL
  const fetchDirectUrl = async () => {
    if (!resumeId || !fileName) {
      toast({
        title: "Missing Information",
        description: "Both Resume ID and File Name are required",
        variant: "destructive"
      });
      return null;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    setPdfLoaded(false);
    
    try {
      const bucketName = 'resumes';
      const storagePath = `${resumeId}/f92b9a89-7189-4796-b009-bb700e9f8266/${fileName}`;
      
      // Create a public URL for the file
      const { data } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(storagePath);
        
      if (!data?.publicUrl) {
        throw new Error('Failed to generate public URL');
      }
      
      console.log("Generated public URL:", data.publicUrl);
      setDirectUrl(data.publicUrl);
      
      toast({
        title: "PDF URL Generated",
        description: "Successfully generated public URL for the PDF",
      });
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error generating URL:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate URL');
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate URL',
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfLoadSuccess = () => {
    setPdfLoaded(true);
    toast({
      title: "PDF Loaded Successfully",
      description: "The PDF document has been loaded and is now displaying",
    });
  };
  
  const handlePdfLoadError = (error: Error) => {
    setErrorMessage(`Failed to load PDF: ${error.message}`);
    toast({
      title: "PDF Load Error",
      description: error.message,
      variant: "destructive"
    });
  };
  
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
                  onClick={fetchDirectUrl}
                  disabled={isLoading}
                  className="w-full bg-draft-green hover:bg-draft-green/90"
                >
                  {isLoading ? 'Loading...' : 'Load PDF from Supabase Storage'}
                </Button>
              </div>
              
              {isLoading && (
                <div className="mt-4">
                  <Progress value={75} className="h-2 animate-pulse" />
                  <p className="text-sm text-gray-600 mt-2">Generating PDF URL...</p>
                </div>
              )}
              
              {errorMessage && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 font-medium">{errorMessage}</p>
                </div>
              )}
              
              {directUrl && !errorMessage && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600 font-medium">PDF URL generated successfully!</p>
                  <p className="text-sm text-green-500 mt-1 truncate">{directUrl}</p>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg h-[700px] overflow-hidden shadow-md relative border border-gray-200">
              {!directUrl && !isLoading ? (
                <div className="h-full flex items-center justify-center text-gray-700 font-medium">
                  Generate a PDF URL to view the document
                </div>
              ) : isLoading ? (
                <div className="h-full flex items-center justify-center flex-col gap-4">
                  <Skeleton className="w-1/2 h-4 bg-gray-300" />
                  <Skeleton className="w-1/3 h-4 bg-gray-300" />
                  <p className="text-gray-500 mt-4">Loading PDF viewer...</p>
                </div>
              ) : (
                <PDFViewer 
                  directUrl={directUrl}
                  height="100%"
                  onLoadSuccess={handlePdfLoadSuccess}
                  onLoadError={handlePdfLoadError}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestPDFViewer;
