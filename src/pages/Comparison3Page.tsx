
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LinkIcon, Loader } from 'lucide-react';
import Header from '@/components/Header';
import { DirectPDFViewer } from '@/components/DirectPDFViewer';
import { toast } from '@/hooks/use-toast';

const Comparison3Page: React.FC = () => {
  // State for PDF link and loading
  const [pdfLink, setPdfLink] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  // Clear the PDF viewer
  const handleClear = () => {
    setPdfLink('');
    setPdfUrl(null);
  };

  return (
    <div className="min-h-screen bg-draft-bg">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-draft-green mb-2">PDF Viewer</h1>
          <p className="text-draft-text">Paste a Supabase PDF link to view the document</p>
        </div>

        {/* PDF Link Input Section */}
        <div className="mb-8">
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
                  Enter a valid Supabase storage signed URL for a PDF file
                </p>
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
                    <h3 className="font-medium text-draft-green mb-2">Step 1: Get your Supabase PDF link</h3>
                    <p className="text-sm text-draft-text">
                      Navigate to your Supabase storage bucket and copy the signed URL for your PDF file.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-draft-green mb-2">Step 2: Paste the link</h3>
                    <p className="text-sm text-draft-text">
                      Paste the complete Supabase storage URL in the input field above.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-draft-green mb-2">Step 3: View your PDF</h3>
                    <p className="text-sm text-draft-text">
                      Click "Load PDF" to display your document in the viewer on the right.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Current PDF Info */}
              {pdfUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-draft-green">Current PDF</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-draft-text">URL:</span>
                        <div className="text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                          {pdfUrl}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        PDF loaded successfully
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
                  {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <Loader className="h-12 w-12 text-draft-green animate-spin mb-4" />
                      <p className="text-draft-text">Loading PDF...</p>
                    </div>
                  ) : !pdfUrl ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                      <LinkIcon className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-xl font-bold text-draft-green font-serif mb-2">No PDF Loaded</h3>
                      <p className="text-draft-text font-serif">
                        Paste a Supabase PDF link above to view the document
                      </p>
                    </div>
                  ) : (
                    <DirectPDFViewer url={pdfUrl} />
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
