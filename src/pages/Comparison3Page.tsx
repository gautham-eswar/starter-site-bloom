

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LinkIcon, Loader, FileText } from 'lucide-react';
import Header from '@/components/Header';
import { DirectPDFViewer } from '@/components/DirectPDFViewer';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RESUME_BUCKET } from '@/services/supabaseSetup';
import { useSearchParams } from 'react-router-dom';

const Comparison3Page: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // State for PDF link and loading
  const [pdfLink, setPdfLink] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for resume ID lookup
  const [resumeId, setResumeId] = useState('');
  const [isLoadingResume, setIsLoadingResume] = useState(false);

  // Check for resume_id URL parameter on component mount
  useEffect(() => {
    const resumeIdFromUrl = searchParams.get('resume_id');
    if (resumeIdFromUrl && user?.id) {
      console.log('Found resume_id in URL:', resumeIdFromUrl);
      setResumeId(resumeIdFromUrl);
      // Automatically trigger the resume lookup
      handleLoadResumeFromId(resumeIdFromUrl);
    }
  }, [searchParams, user?.id]);

  // Handle PDF link submission
  const handleLoadPdf = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pdfLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Supabase PDF link",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Validate the URL
      const url = new URL(pdfLink);
      
      // Check if it's a Supabase URL (basic validation)
      if (!url.hostname.includes('supabase')) {
        toast({
          title: "Invalid Link",
          description: "Please enter a valid Supabase link",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      setPdfUrl(pdfLink);
      
      toast({
        title: "Success",
        description: "PDF link loaded successfully",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resume ID lookup - now supports both old and enhanced resume IDs
  const handleLoadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid resume ID",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view resumes",
        variant: "destructive"
      });
      return;
    }

    await handleLoadResumeFromId(resumeId.trim());
  };

  // Extracted function to handle resume loading by ID (used by both form submission and URL parameter)
  const handleLoadResumeFromId = async (targetResumeId: string) => {
    setIsLoadingResume(true);
    
    try {
      let finalResumeId = targetResumeId;
      
      // First, check if this is an old resume ID by looking it up in optimization_jobs
      console.log(`Checking if ${targetResumeId} is an old resume ID...`);
      
      const { data: optimizationJob, error: jobError } = await supabase
        .from('optimization_jobs')
        .select('enhanced_resume_id')
        .eq('resume_id', targetResumeId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (jobError) {
        console.error('Error checking optimization jobs:', jobError);
      }
      
      if (optimizationJob?.enhanced_resume_id) {
        console.log(`Found enhanced resume ID: ${optimizationJob.enhanced_resume_id}`);
        finalResumeId = optimizationJob.enhanced_resume_id;
        
        // Update the resumeId state with the enhanced resume ID
        setResumeId(finalResumeId);
        
        toast({
          title: "Enhanced Resume Found",
          description: `Updated to enhanced resume ID: ${finalResumeId}`,
          variant: "default"
        });
      } else {
        console.log(`No enhanced resume found, treating ${targetResumeId} as direct resume ID`);
      }
      
      const bucketName = RESUME_BUCKET;
      const fileName = `enhanced_resume_${finalResumeId}.pdf`;
      const storagePath = `Resumes/${user.id}/${finalResumeId}/${fileName}`;
      
      console.log(`Checking for resume at path: ${storagePath}`);
      
      // First check if file exists
      const { data: files, error: listError } = await supabase
        .storage
        .from(bucketName)
        .list(`Resumes/${user.id}/${finalResumeId}`, {
          limit: 100,
          search: fileName
        });
        
      if (listError) {
        console.error('List error:', listError);
        throw new Error(`Failed to check file existence: ${listError.message}`);
      }
      
      if (!files || files.length === 0) {
        throw new Error(`File "${fileName}" not found in path "Resumes/${user.id}/${finalResumeId}".`);
      }

      const targetFile = files.find(file => file.name === fileName);
      
      if (!targetFile) {
        throw new Error(`File "${fileName}" not found in directory.`);
      }

      console.log(`File found! Size: ${targetFile.metadata?.size || 'unknown'} bytes`);
      
      // Get public URL
      const { data: publicData } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(storagePath);
      
      if (publicData && publicData.publicUrl) {
        console.log(`Generated public URL: ${publicData.publicUrl}`);
        
        // Automatically populate the PDF link field and load it
        setPdfLink(publicData.publicUrl);
        setPdfUrl(publicData.publicUrl);
        
        toast({
          title: "Resume Found!",
          description: finalResumeId === targetResumeId ? 
            "Resume loaded successfully from storage" : 
            `Enhanced resume loaded successfully (ID: ${finalResumeId})`,
          variant: "default"
        });
      } else {
        throw new Error('Failed to generate public URL for the resume');
      }
      
    } catch (err) {
      console.error('Resume lookup error:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load resume",
        variant: "destructive"
      });
    } finally {
      setIsLoadingResume(false);
    }
  };

  // Clear all viewers
  const handleClear = () => {
    setPdfLink('');
    setPdfUrl(null);
    setResumeId('');
  };

  return (
    <div className="min-h-screen bg-draft-bg">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-draft-green mb-2">PDF Viewer</h1>
          <p className="text-draft-text">Paste a Supabase PDF link or enter a resume ID to view documents</p>
        </div>

        {/* PDF Link Input Section */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-draft-green flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Supabase PDF Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLoadPdf} className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    type="url"
                    placeholder="Paste your Supabase PDF link here (e.g., https://your-project.supabase.co/storage/v1/object/sign/...)"
                    value={pdfLink}
                    onChange={(e) => setPdfLink(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-draft-green hover:bg-draft-green/90"
                  >
                    {isLoading ? (
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <LinkIcon className="h-4 w-4 mr-2" />
                    )}
                    Load PDF
                  </Button>
                </div>
                <p className="text-sm text-draft-text/70">
                  Enter a valid Supabase storage signed URL for a PDF file
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Resume ID Input Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-draft-green flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume ID Lookup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLoadResume} className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    type="text"
                    placeholder="Enter resume ID (e.g., resume_1749550838_31a24cf1)"
                    value={resumeId}
                    onChange={(e) => setResumeId(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoadingResume || !user?.id}
                    className="bg-draft-green hover:bg-draft-green/90"
                  >
                    {isLoadingResume ? (
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Find & Load Resume
                  </Button>
                  {pdfUrl && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleClear}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <p className="text-sm text-draft-text/70">
                  Enter a resume ID to automatically find and load the PDF
                </p>
                {!user?.id && (
                  <p className="text-sm text-red-600">
                    Please log in to use resume ID lookup
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <main className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left side - Instructions and Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-draft-green">How to Use</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-draft-green mb-2">Option 1: Supabase PDF Link</h3>
                    <p className="text-sm text-draft-text">
                      Navigate to your Supabase storage bucket and copy the signed URL for your PDF file.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-draft-green mb-2">Option 2: Resume ID Lookup</h3>
                    <p className="text-sm text-draft-text">
                      Enter a resume ID to automatically find and load the PDF. This will populate the PDF link above.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-draft-green mb-2">Step 3: View your PDF</h3>
                    <p className="text-sm text-draft-text">
                      Your document will be displayed in the viewer on the right.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Current PDF Info */}
              {pdfUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-draft-green">Current Document</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-draft-text">PDF URL:</span>
                        <div className="text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                          {pdfUrl}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Document loaded successfully
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Right side - PDF Viewer */}
            <div>
              <div className="sticky top-24 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl">PDF Viewer</h2>
                </div>
                
                <div className="bg-white border border-draft-green/10 rounded-xl overflow-hidden h-[680px] shadow-lg">
                  {isLoading || isLoadingResume ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <Loader className="h-12 w-12 text-draft-green animate-spin mb-4" />
                      <p className="text-draft-text">
                        {isLoadingResume ? "Finding resume..." : "Loading PDF..."}
                      </p>
                    </div>
                  ) : pdfUrl ? (
                    <DirectPDFViewer url={pdfUrl} />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                      <div className="mb-4">
                        <LinkIcon className="h-16 w-16 text-gray-300 mb-2" />
                        <FileText className="h-16 w-16 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-bold text-draft-green font-serif mb-2">No Document Loaded</h3>
                      <p className="text-draft-text font-serif">
                        Use either option above to view a PDF document
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Comparison3Page;
