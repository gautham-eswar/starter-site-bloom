import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Loader, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DirectPDFViewer } from '@/components/DirectPDFViewer';
import { toast } from '@/hooks/use-toast';

const Test2: React.FC = () => {
  const navigate = useNavigate();
  
  // Configuration
  const folderPath = "41600801-46c5-4d56-a248-f8c3585cc486/f92b9a89-7189-4796-b009-bb700e9f8266";
  const bucketName = "resumes";
  
  // State
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Helper function for logging
  const logMessage = (message: string) => {
    console.log(message);
    setLogs(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev]);
  };

  // Fetch list of files in the folder
  const fetchFiles = async () => {
    setLoading(true);
    setFiles([]);
    logMessage(`Fetching files from bucket: ${bucketName}, folder: ${folderPath}`);
    
    try {
      const { data, error } = await supabase.storage.from(bucketName).list(folderPath);
      
      if (error) {
        logMessage(`Error fetching files: ${error.message}`);
        toast({
          title: "Error",
          description: `Failed to fetch files: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      if (!data || data.length === 0) {
        logMessage("No files found in the folder");
        return;
      }
      
      logMessage(`Found ${data.length} files in folder`);
      setFiles(data);
      
      // We no longer auto-select the first PDF file
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logMessage(`Exception during file fetch: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch PDF URL
  const fetchPdfUrl = async (fileName: string) => {
    if (!fileName) return;
    
    setLoadingFile(true);
    setPdfUrl(null);
    logMessage(`Fetching PDF URL for file: ${fileName}`);
    
    try {
      const filePath = `${folderPath}/${fileName}`;
      
      // Try to get public URL first
      logMessage("Attempting to get public URL...");
      const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      
      if (publicData?.publicUrl) {
        logMessage(`Got public URL: ${publicData.publicUrl}`);
        setPdfUrl(publicData.publicUrl);
      } else {
        throw new Error("Failed to get public URL");
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logMessage(`Error fetching PDF URL: ${errorMessage}`);
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
      logMessage("Selected file is not a PDF");
      toast({
        title: "Not Supported",
        description: "Only PDF files can be viewed in the viewer",
        variant: "default"
      });
    }
  };

  // Download the current PDF
  const downloadPdf = async () => {
    if (!selectedFile) return;
    
    logMessage(`Initiating download for: ${selectedFile}`);
    try {
      const filePath = `${folderPath}/${selectedFile}`;
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);
        
      if (error) {
        throw error;
      }
      
      if (data) {
        logMessage("Download successful, creating download link");
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logMessage(`Download error: ${errorMessage}`);
      toast({
        title: "Download Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Load files on component mount
  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="px-4 py-6 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          
          <h1 className="text-2xl font-medium text-center">PDF Viewer Test (Direct Access)</h1>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={fetchFiles}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File List Panel */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 order-2 lg:order-1">
            <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Available Files
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            ) : files.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No files found in this folder</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className={`h-5 w-5 ${file.name.toLowerCase().endsWith('.pdf') ? 'text-red-500' : 'text-gray-500'}`} />
                        <span className="text-sm font-medium truncate max-w-[180px]">{file.name}</span>
                      </div>
                      
                      {selectedFile === file.name && file.name.toLowerCase().endsWith('.pdf') && (
                        <Button size="sm" variant="ghost" onClick={downloadPdf}>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      {(file.metadata?.size && parseInt(file.metadata.size) > 0) 
                        ? `${(parseInt(file.metadata.size) / 1024).toFixed(1)} KB` 
                        : 'Unknown size'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* PDF Viewer Panel */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[700px] order-1 lg:order-2">
            {loadingFile ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Loader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            ) : !selectedFile || !pdfUrl ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No PDF Selected</h3>
                <p className="text-gray-500 max-w-md">
                  Select a PDF file from the list to view it here
                </p>
              </div>
            ) : (
              <DirectPDFViewer url={pdfUrl} />
            )}
          </div>
        </div>
        
        {/* Logs Panel */}
        <div className="mt-6 bg-gray-900 text-gray-300 rounded-lg shadow-sm overflow-hidden border border-gray-700">
          <div className="p-2 bg-gray-800 flex items-center justify-between">
            <span className="font-mono font-medium px-2">Debug Logs</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-gray-400 hover:text-white hover:bg-gray-700"
              onClick={() => setLogs([])}
            >
              Clear Logs
            </Button>
          </div>
          <div className="p-3 font-mono text-xs overflow-x-auto max-h-[300px] overflow-y-auto">
            {logs.length > 0 ? (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="leading-tight">{log}</div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic py-3 text-center">No logs yet</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Test2;
