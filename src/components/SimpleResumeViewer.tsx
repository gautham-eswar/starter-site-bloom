import React, { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from 'lucide-react';
import { RESUME_BUCKET } from '@/services/supabaseSetup'; // Import RESUME_BUCKET

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface SimpleResumeViewerProps {
  resumeId: string; // This should be the folder path, e.g., "user123/actual-resume-id"
  fileName: string; // This is the actual file name, e.g., "enhanced_resume.pdf"
}

const SimpleResumeViewer: React.FC<SimpleResumeViewerProps> = ({ resumeId, fileName }) => {
  // State for PDF viewing
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  
  // State for loading and errors
  const [loading, setLoading] = useState<boolean>(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Debug state
  const [logs, setLogs] = useState<string[]>([]);
  const [viewLogs, setViewLogs] = useState<boolean>(true); // Default to true for easier debugging initially
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Helper function to add logs
  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [
      `${new Date().toLocaleTimeString()}: ${message}`,
      ...prev.slice(0, 49) // Keep max 50 logs
    ]);
  };

  // Memoize PDF.js options to prevent unnecessary reloads
  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/standard_fonts/'
  }), []);

  // Function to fetch PDF URL
  const fetchPdfUrl = async () => {
    setLoading(true);
    setError(null);
    setPdfUrl(null); // Clear previous URL
    addLog(`Starting fetch for resumeId (path prefix): ${resumeId}, fileName: ${fileName}`);
    
    try {
      if (!resumeId || !fileName) {
        throw new Error('Resume ID (path prefix) and file name are required');
      }
      
      const bucketName = RESUME_BUCKET; // Use imported RESUME_BUCKET
      const storagePath = `${resumeId}/${fileName}`; // Corrected storage path
      addLog(`Accessing bucket: ${bucketName}, path: ${storagePath}`);

      // First attempt: Try public URL
      addLog('Attempting to get public URL...');
      const { data: publicData } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(storagePath);
      
      if (publicData && publicData.publicUrl) {
        addLog(`Got public URL: ${publicData.publicUrl}`);
        // Test if URL is accessible before setting it
        const testResponse = await fetch(publicData.publicUrl, { method: 'HEAD' });
        if (testResponse.ok) {
          addLog(`Public URL is accessible (${testResponse.status}). Setting PDF URL.`);
          setPdfUrl(publicData.publicUrl);
          return;
        } else {
          addLog(`Public URL not accessible (${testResponse.status}). Trying signed URL.`);
        }
      } else {
        addLog('No public URL returned or structure is unexpected. Trying signed URL.');
      }
      
      // Second attempt: Try signed URL
      addLog('Attempting to get signed URL...');
      const { data: signedData, error: signedError } = await supabase
        .storage
        .from(bucketName)
        .createSignedUrl(storagePath, 3600); // 1 hour expiry
        
      if (signedError) {
        addLog(`Signed URL error: ${signedError.message}. Trying download.`);
        // Don't throw yet, try download as a last resort
      } else if (signedData && signedData.signedUrl) {
        addLog(`Got signed URL: ${signedData.signedUrl}`);
        setPdfUrl(signedData.signedUrl);
        return;
      } else {
        addLog('No signed URL returned. Trying download.');
      }
      
      // Third attempt: Direct download
      addLog('Attempting direct download...');
      const { data: downloadData, error: downloadError } = await supabase
        .storage
        .from(bucketName)
        .download(storagePath);
        
      if (downloadError) {
        addLog(`Download error: ${downloadError.message}`);
        throw downloadError; // If all methods fail, this is the final error
      }
      
      if (downloadData) {
        addLog(`Download successful, creating blob URL...`);
        const url = URL.createObjectURL(downloadData);
        addLog(`Created blob URL: ${url}`);
        setPdfUrl(url);
        return;
      } else {
        addLog('No download data returned.');
      }
      
      throw new Error('All attempts to fetch PDF failed. Check bucket, path, and permissions.');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred while fetching PDF';
      addLog(`Error in fetchPdfUrl: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  // Check if the file exists
  const checkFileExists = async () => {
    try {
      addLog(`Checking if file exists: bucket=${RESUME_BUCKET}, pathPrefix=${resumeId}, fileName=${fileName}`);
      
      const bucketName = RESUME_BUCKET;
      // `resumeId` prop is now the folderPath itself
      const folderPathToList = resumeId; 
      
      const { data, error: listError } = await supabase
        .storage
        .from(bucketName)
        .list(folderPathToList, {
          limit: 100, // List more files in the directory for debugging
          search: fileName // Search for the specific file
        });
        
      if (listError) {
        addLog(`List error during file check: ${listError.message}`);
        setError(`Failed to check file existence: ${listError.message}`);
        return;
      }
      
      if (!data || data.length === 0) {
        addLog(`File "${fileName}" NOT found in path: "${folderPathToList}" within bucket "${bucketName}". (Searched using .list())`);
        setError(`File "${fileName}" not found at path "${folderPathToList}".`);
        return;
      }

      const targetFile = data.find(file => file.name === fileName);
      
      if (targetFile) {
        addLog(`File "${fileName}" found in "${folderPathToList}"! Size: ${targetFile.metadata?.size || 'unknown'} bytes. Last modified: ${targetFile.metadata?.last_modified || 'unknown'}`);
      } else {
        addLog(`File "${fileName}" NOT found in the listed files from "${folderPathToList}". Check if search pattern in .list() is too restrictive or filename is exact.`);
        addLog('Files found in directory:');
        data.forEach(file => addLog(`- ${file.name}`));
        setError(`File "${fileName}" not found in directory "${folderPathToList}", though other files might exist.`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      addLog(`Check file existence error: ${message}`);
      setError(`Error checking file: ${message}`);
    }
  };

  // Test the URL to see if it's accessible
  const testUrl = async () => {
    if (!pdfUrl) {
      addLog('No URL to test');
      return;
    }
    
    addLog(`Testing URL: ${pdfUrl}`);
    try {
      const response = await fetch(pdfUrl, { method: 'HEAD' });
      addLog(`URL test: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const contentType = response.headers.get('Content-Type');
        addLog(`URL is accessible! Content-Type: ${contentType || 'unknown'}`);
      } else {
        addLog('URL returned error status');
      }
    } catch (err) {
      addLog(`URL test failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Fetch PDF on component mount and when resumeId or fileName change
  useEffect(() => {
    if (resumeId && fileName) { // Ensure both are present before fetching
      fetchPdfUrl();
    } else {
      addLog("resumeId or fileName is missing, not fetching PDF.");
      setError("Resume ID (path prefix) or File Name not provided.");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, fileName]); // Removed pdfOptions from dependency array as it's stable
  
  // Handle PDF load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false); // Ensure loading is false on success
    setError(null); // Clear any previous errors
    addLog(`PDF loaded successfully with ${numPages} pages`);
  };
  
  // Navigation functions
  const previousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };
  
  const nextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };
  
  // Zoom functions
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);

  return (
    <div className="flex flex-col bg-white border rounded-lg shadow-lg h-full">
      {/* Controls header */}
      <div className="p-3 border-b bg-gray-50 flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPdfUrl}
            disabled={loading || !resumeId || !fileName}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={checkFileExists}
            disabled={!resumeId || !fileName}
          >
            Check File Exists
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={testUrl}
            disabled={!pdfUrl || loading}
          >
            Test URL
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setViewLogs(!viewLogs)}
          >
            {viewLogs ? 'Hide Logs' : 'Show Logs'}
          </Button>
        </div>
      </div>
      
      {/* Debug logs */}
      {viewLogs && (
        <div className="bg-gray-900 text-gray-300 p-2 text-xs font-mono max-h-32 overflow-y-auto">
          <div className="flex justify-between mb-1">
            <span className="font-bold">Debug Logs</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 py-0 px-1 text-gray-400 hover:text-white"
              onClick={() => setLogs([])}
            >
              Clear
            </Button>
          </div>
          {logs.length > 0 ? (
            <ul className="space-y-1">
              {logs.map((log, i) => (
                <li key={i} className="leading-tight">{log}</li>
              ))}
            </ul>
          ) : (
            <p className="italic text-gray-500">No logs yet</p>
          )}
        </div>
      )}
      
      {/* Main PDF viewer */}
      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader className="h-8 w-8 animate-spin text-gray-700 mb-2" />
            <p className="text-gray-700 font-medium">Loading PDF...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-white rounded-lg shadow-md max-w-md text-center">
            <p className="text-xl font-bold text-red-600 mb-2">Error Loading PDF</p>
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{error}</p>
            <Button onClick={fetchPdfUrl} disabled={!resumeId || !fileName}>Try Again</Button>
          </div>
        ) : !pdfUrl ? (
          <div className="p-6 bg-white rounded-lg shadow-md max-w-md text-center">
            <p className="text-lg font-medium text-gray-700 mb-4">No PDF URL available or still loading.</p>
            <Button onClick={fetchPdfUrl} disabled={!resumeId || !fileName}>Try Fetching PDF</Button>
          </div>
        ) : (
          <div className="shadow-xl bg-white rounded-lg overflow-hidden">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(pdfJsError) => {
                addLog(`PDF.js load error: ${pdfJsError.message} (URL: ${pdfUrl})`);
                setError(`Failed to load PDF content: ${pdfJsError.message}. Please check if the URL is valid and the file is a proper PDF.`);
                setLoading(false); // Ensure loading is false on error
              }}
              loading={
                <div className="flex flex-col items-center justify-center p-6">
                  <Loader className="h-8 w-8 animate-spin text-gray-700 mb-2" />
                  <p className="text-gray-700 font-medium">Loading PDF content from URL...</p>
                </div>
              }
              options={pdfOptions}
              key={pdfUrl} // Add key to force re-render when URL changes
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="pdf-page"
                onRenderError={(error) => {
                    addLog(`PDF.js page render error: ${error.message}`);
                    setError(`Failed to render PDF page: ${error.message}`);
                }}
              />
            </Document>
          </div>
        )}
      </div>
      
      {/* Navigation footer */}
      {!loading && !error && pdfUrl && numPages && (
        <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={pageNumber <= 1}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium">
              Page {pageNumber} of {numPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={pageNumber >= numPages}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetZoom}
            >
              {Math.round(scale * 100)}%
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= 2.5}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleResumeViewer;
