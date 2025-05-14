
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Loader, Link as LinkIcon, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DirectPDFViewer } from '@/components/DirectPDFViewer';
import { toast } from '@/hooks/use-toast';
import { 
  RESUME_BUCKET, 
  getResumeUrl, 
  checkResumeExists, 
  verifyResumeJsonExists,
  getPdfMetadata,
  uploadPdf
} from '@/services/supabaseSetup';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const Test3: React.FC = () => {
  const navigate = useNavigate();
  
  // Configuration - updated to use the resume-pdfs bucket
  const folderPath = "41600801-46c5-4d56-a248-f8c3585cc486/f92b9a89-7189-4796-b009-bb700e9f8266";
  const bucketName = RESUME_BUCKET; // Using the standardized bucket name
  
  // State for files listing
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [customLink, setCustomLink] = useState<string>('');

  // State for API-based resume verification
  const [resumeId, setResumeId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [jsonExists, setJsonExists] = useState<boolean | null>(null);
  const [pdfExists, setPdfExists] = useState<boolean | null>(null);
  const [pdfMetadata, setPdfMetadata] = useState<{size: number, lastModified: string} | null>(null);
  const [apiPdfUrl, setApiPdfUrl] = useState<string | null>(null);

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

  // Verify resume JSON and PDF using Supabase directly
  const verifyResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a resume ID",
        variant: "destructive"
      });
      return;
    }

    setApiLoading(true);
    setJsonExists(null);
    setPdfExists(null);
    setPdfMetadata(null);
    setApiPdfUrl(null);
    
    try {
      // Step 1: Verify JSON exists in the database
      const resumeData = await verifyResumeJsonExists(resumeId);
      const jsonFound = !!resumeData;
      setJsonExists(jsonFound);
      
      if (jsonFound && resumeData) {
        setUserId(resumeData.user_id);
        
        // Step 2: Check if PDF exists in storage
        const pdfFound = await checkResumeExists(resumeData.user_id, resumeId);
        setPdfExists(pdfFound);
        
        if (pdfFound) {
          // Step 3: Get PDF metadata
          const metadata = await getPdfMetadata(resumeData.user_id, resumeId);
          setPdfMetadata(metadata);
          
          // Step 4: Generate signed URL
          const url = await getResumeUrl(resumeData.user_id, resumeId);
          setApiPdfUrl(url);
        }
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error",
        description: `Verification failed: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setApiLoading(false);
    }
  };

  // Simulate API endpoint call for downloading PDF
  const handleApiDownload = async () => {
    if (!resumeId.trim() || !userId) {
      toast({
        title: "Error",
        description: "Resume ID and user ID are required",
        variant: "destructive"
      });
      return;
    }

    setApiLoading(true);
    
    try {
      // Simulate API call to /api/download/{resumeId}/pdf
      // In a real implementation, this would be a fetch to your API endpoint
      
      // Mock API response delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if resume exists
      const resumeData = await verifyResumeJsonExists(resumeId);
      
      if (!resumeData) {
        throw new Error("Resume not found");
      }
      
      // Check if PDF exists
      const pdfExists = await checkResumeExists(resumeData.user_id, resumeId);
      
      if (!pdfExists) {
        throw new Error("PDF file not found");
      }
      
      // Generate signed URL
      const signedUrl = await getResumeUrl(resumeData.user_id, resumeId);
      
      if (!signedUrl) {
        throw new Error("Failed to generate signed URL");
      }
      
      // Set the URL and clear any previous PDF view
      setPdfUrl(signedUrl);
      setSelectedFile(null);
      setCustomLink("");
      
      toast({
        title: "Success",
        description: "PDF retrieved successfully via API simulation",
        variant: "default"
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast({
        title: "API Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setApiLoading(false);
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

        {/* Resume Verification Section */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Verify Resume Exists
          </h2>
          
          <form onSubmit={verifyResume} className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input
              type="text"
              placeholder="Enter resume ID"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={apiLoading}>
              {apiLoading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Verify
            </Button>
          </form>
          
          {/* API Download Button */}
          {jsonExists && pdfExists && (
            <Button 
              onClick={handleApiDownload} 
              disabled={apiLoading || !userId || !resumeId}
              className="w-full mb-4"
            >
              {apiLoading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Download via API Simulation
            </Button>
          )}
          
          {/* Verification Results */}
          {(jsonExists !== null || pdfExists !== null) && (
            <div className="border rounded-md p-3 bg-gray-50 mb-4">
              <h3 className="font-medium mb-2">Verification Results:</h3>
              
              <div className="space-y-2 text-sm">
                {/* Resume JSON Status */}
                <div className="flex items-center gap-2">
                  {jsonExists === null ? (
                    <Loader className="h-4 w-4 text-gray-400 animate-spin" />
                  ) : jsonExists ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>Resume JSON in database: </span>
                  <span className={`font-medium ${jsonExists ? 'text-green-600' : 'text-red-600'}`}>
                    {jsonExists === null ? 'Checking...' : jsonExists ? 'Found' : 'Not found'}
                  </span>
                </div>
                
                {/* PDF File Status */}
                <div className="flex items-center gap-2">
                  {pdfExists === null ? (
                    <Loader className="h-4 w-4 text-gray-400 animate-spin" />
                  ) : pdfExists ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>PDF file in storage: </span>
                  <span className={`font-medium ${pdfExists ? 'text-green-600' : 'text-red-600'}`}>
                    {pdfExists === null ? 'Checking...' : pdfExists ? 'Found' : 'Not found'}
                  </span>
                </div>
                
                {/* User ID */}
                {jsonExists && userId && (
                  <div className="flex items-center gap-2">
                    <span>User ID: </span>
                    <code className="bg-gray-200 px-1 rounded text-xs">{userId}</code>
                  </div>
                )}
                
                {/* PDF Metadata */}
                {pdfExists && pdfMetadata && (
                  <>
                    <div className="flex items-center gap-2">
                      <span>Size: </span>
                      <span className="font-medium">{(pdfMetadata.size / 1024).toFixed(2)} KB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Last Modified: </span>
                      <span className="font-medium">{new Date(pdfMetadata.lastModified).toLocaleString()}</span>
                    </div>
                  </>
                )}
                
                {/* Signed URL */}
                {apiPdfUrl && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span>Signed URL: </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 py-0 px-2 text-xs"
                        onClick={() => {
                          setPdfUrl(apiPdfUrl);
                          setSelectedFile(null);
                          setCustomLink("");
                          toast({
                            title: "PDF Loaded",
                            description: "Signed URL loaded into the viewer",
                            variant: "default"
                          });
                        }}
                      >
                        View in PDF Viewer
                      </Button>
                    </div>
                    <div className="text-xs bg-gray-200 p-1 rounded overflow-x-auto">
                      <code className="break-all">{apiPdfUrl}</code>
                    </div>
                  </div>
                )}
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
            {loadingFile || apiLoading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Loader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            ) : !pdfUrl ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500">
                  Select a PDF file from the list, paste a Supabase link, or use the verification tool
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
