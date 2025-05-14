import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Loader, Link as LinkIcon, FileDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DirectPDFViewer } from '@/components/DirectPDFViewer';
import { toast } from '@/hooks/use-toast';
import { RESUME_BUCKET } from '@/services/supabaseSetup';

const Test3: React.FC = () => {
  const navigate = useNavigate();
  
  // Configuration - updated to use the resume-pdfs bucket
  const folderPath = "41600801-46c5-4d56-a248-f8c3585cc486/f92b9a89-7189-4796-b009-bb700e9f8266";
  const bucketName = RESUME_BUCKET; // Using the standardized bucket name
  
  // State
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [customLink, setCustomLink] = useState<string>('');
  
  // New state for API-based PDF functionality
  const [resumeId, setResumeId] = useState<string>('');
  const [apiPdfUrl, setApiPdfUrl] = useState<string | null>(null);
  const [apiPdfLoading, setApiPdfLoading] = useState<boolean>(false);
  const [apiPdfError, setApiPdfError] = useState<string | null>(null);

  // Fetch list of files in the folder
  const fetchFiles = async () => {
    setLoading(true);
    setFiles([]);
    
    try {
      const { data, error } = await supabase.storage.from(bucketName).list(folderPath);
      
      if (error) {
        toast({
          title: "Error",
          description: `Failed to fetch files: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      if (!data || data.length === 0) {
        return;
      }
      
      setFiles(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch PDF URL
  const fetchPdfUrl = async (fileName: string) => {
    if (!fileName) return;
    
    setLoadingFile(true);
    setPdfUrl(null);
    
    try {
      const filePath = `${folderPath}/${fileName}`;
      
      // Create a signed URL with 1 hour expiration
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600);
      
      if (error || !data?.signedUrl) {
        throw new Error(`Failed to get signed URL: ${error?.message || 'No URL returned'}`);
      }
      
      setPdfUrl(data.signedUrl);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error",
        description: `Failed to load PDF: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoadingFile(false);
    }
  };

  // Handle file selection and load PDF
  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
    if (fileName.toLowerCase().endsWith('.pdf')) {
      fetchPdfUrl(fileName);
    } else {
      setPdfUrl(null);
      toast({
        title: "Not Supported",
        description: "Only PDF files can be viewed in the viewer",
        variant: "default"
      });
    }
  };

  // Handle custom link submission
  const handleCustomLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    setLoadingFile(true);
    setPdfUrl(null);
    setSelectedFile(null);
    
    try {
      // Check if the link is valid
      const url = new URL(customLink);
      setPdfUrl(customLink);
      toast({
        title: "Success",
        description: "Custom PDF link loaded",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
    } finally {
      setLoadingFile(false);
    }
  };

  // Download the current PDF directly in a new tab
  const downloadPdf = async () => {
    if (!selectedFile || !pdfUrl) return;
    
    // Simply open the signed URL in a new tab
    window.open(pdfUrl, '_blank');
  };

  // New function to download PDF from API
  const handleApiDownloadPdf = async () => {
    if (!resumeId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Resume ID",
        variant: "destructive"
      });
      return;
    }
    
    setApiPdfError(null);
    setApiPdfLoading(true);
    setApiPdfUrl(null);
    
    try {
      const res = await fetch(`/api/download/${resumeId}/pdf`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to generate PDF");
      }
      
      // On success, backend provides a signed URL for the PDF
      setApiPdfUrl(data.signedUrl);
      
      toast({
        title: "Success",
        description: "PDF loaded successfully",
        variant: "default"
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setApiPdfError(errorMessage);
      
      toast({
        title: "Error",
        description: `Failed to load PDF: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setApiPdfLoading(false);
    }
  };
  
  // Load files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="px-4 py-6 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        {/* API-based PDF Download Section */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
            <FileDown className="h-5 w-5 text-blue-600" />
            API PDF Download
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="Enter Resume ID"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleApiDownloadPdf} 
              disabled={apiPdfLoading}
            >
              {apiPdfLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load PDF"
              )}
            </Button>
          </div>
          
          {apiPdfError && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {apiPdfError}
              <Button 
                variant="link" 
                className="text-red-700 p-0 h-auto text-sm ml-2" 
                onClick={handleApiDownloadPdf}
              >
                Retry
              </Button>
            </div>
          )}
          
          {apiPdfUrl && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="font-medium text-sm text-gray-700 mb-2">PDF Preview Available</h3>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setPdfUrl(apiPdfUrl);
                    setSelectedFile(null);
                    toast({
                      title: "PDF Loaded",
                      description: "The PDF from the API is now displayed in the viewer",
                      variant: "default"
                    });
                  }}
                >
                  View in PDF Viewer
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(apiPdfUrl, '_blank')}
                >
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Custom Link Input Form */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-blue-600" />
            Paste Supabase PDF Link
          </h2>
          <form onSubmit={handleCustomLinkSubmit} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="url"
              placeholder="Paste Supabase PDF link here"
              value={customLink}
              onChange={(e) => setCustomLink(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Load PDF</Button>
          </form>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File List Panel */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Select a PDF
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            ) : files.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No files found in this folder</p>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div 
                    key={file.name} 
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFile === file.name 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => handleFileSelect(file.name)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className={`h-5 w-5 ${file.name.toLowerCase().endsWith('.pdf') ? 'text-red-500' : 'text-gray-500'}`} />
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedFile && pdfUrl && (
              <Button 
                className="mt-4 w-full" 
                variant="outline"
                onClick={downloadPdf}
              >
                <Download className="h-4 w-4 mr-2" /> Open PDF in New Tab
              </Button>
            )}
          </div>
          
          {/* PDF Viewer Panel */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[700px]">
            {loadingFile ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Loader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            ) : !pdfUrl ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500">
                  Select a PDF file from the list or paste a Supabase link
                </p>
              </div>
            ) : (
              <DirectPDFViewer url={pdfUrl} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Test3;
