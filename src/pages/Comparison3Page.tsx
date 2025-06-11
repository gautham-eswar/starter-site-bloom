
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LinkIcon, Loader, FileText } from 'lucide-react';
import Header from '@/components/Header';
import { DirectPDFViewer } from '@/components/DirectPDFViewer';
import SimpleResumeViewer from '@/components/SimpleResumeViewer';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';

const Comparison3Page: React.FC = () => {
  const { user } = useAuth();
  
  // State for PDF link and loading
  const [pdfLink, setPdfLink] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for resume ID lookup
  const [resumeId, setResumeId] = useState('');
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [showResumeViewer, setShowResumeViewer] = useState(false);

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
      setShowResumeViewer(false); // Hide resume viewer when showing PDF link
      
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

  // Handle resume ID lookup
  const handleLoadResume = (e: React.FormEvent) => {
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

    setIsLoadingResume(true);
    
    try {
      // Show the resume viewer with the specified format
      setShowResumeViewer(true);
      setPdfUrl(null); // Hide PDF link viewer when showing resume
      
      toast({
        title: "Loading Resume",
        description: "Attempting to load resume from storage",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load resume",
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
    setShowResumeViewer(false);
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
                    Load Resume
                  </Button>
                  {(pdfUrl || showResumeViewer) && (
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
                  Enter a resume ID to look up the PDF in Supabase storage (format: Resumes/user_id/resume_id)
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
                      Enter a resume ID to automatically look up the PDF in storage using the format: Resumes/user_id/resume_id/enhanced_resume_resume_id.pdf
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
              {(pdfUrl || showResumeViewer) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-draft-green">Current Document</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {pdfUrl && (
                        <div>
                          <span className="text-sm font-medium text-draft-text">Source:</span>
                          <div className="text-xs bg-gray-100 p-2 rounded mt-1">
                            Direct PDF Link
                          </div>
                          <div className="text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                            {pdfUrl}
                          </div>
                        </div>
                      )}
                      {showResumeViewer && (
                        <div>
                          <span className="text-sm font-medium text-draft-text">Source:</span>
                          <div className="text-xs bg-gray-100 p-2 rounded mt-1">
                            Resume ID Lookup
                          </div>
                          <div className="text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                            Resumes/{user?.id}/{resumeId}/enhanced_resume_{resumeId}.pdf
                          </div>
                        </div>
                      )}
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
                      <p className="text-draft-text">Loading PDF...</p>
                    </div>
                  ) : showResumeViewer && user?.id ? (
                    <SimpleResumeViewer 
                      resumeId={`Resumes/${user.id}/${resumeId}`}
                      fileName={`enhanced_resume_${resumeId}.pdf`}
                    />
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
