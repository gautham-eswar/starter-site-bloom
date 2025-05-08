
import React, { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { getPdfUrl, checkPdfExists } from '@/services/pdfStorage';
import { useAuth } from '@/components/auth/AuthProvider';
import { Loader, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

// Configure the PDF.js worker source to use a local worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  resumeId?: string;
  userId?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  directUrl?: string | null;
  onLoadSuccess?: () => void;
  onLoadError?: (error: Error) => void;
  showDebugLogs?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  resumeId,
  userId: propUserId,
  width = '100%',
  height = '100%',
  className = '',
  directUrl,
  onLoadSuccess,
  onLoadError,
  showDebugLogs = false
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfExists, setPdfExists] = useState<boolean | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  const { user } = useAuth();
  const userId = propUserId || user?.id;
  
  // Function to add a log entry
  const addLog = (message: string) => {
    console.log(message); // Also log to console
    setDebugLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].slice(0, -1)}: ${message}`]);
  };
  
  // Memoize PDF.js options to prevent unnecessary reloads
  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/standard_fonts/'
  }), []);
  
  // Function to get the direct Supabase storage URL
  const getSupabaseStorageUrl = (resumeId: string, fileName: string) => {
    if (!resumeId) return null;
    
    const bucketName = 'resumes';
    const storagePath = `${resumeId}/f92b9a89-7189-4796-b009-bb700e9f8266/${fileName}`;
    
    addLog(`Getting public URL from bucket: ${bucketName}, path: ${storagePath}`);
    
    // Create a public URL for the file
    const { data } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(storagePath);
      
    if (data?.publicUrl) {
      addLog(`Successfully got publicUrl: ${data.publicUrl}`);
    } else {
      addLog(`Failed to get publicUrl`);
    }
    
    return data?.publicUrl || null;
  };
  
  useEffect(() => {
    const loadPdf = async () => {
      setError(null);
      setLoadingError(null);
      addLog("Starting PDF load process");
      
      try {
        // If a direct URL is provided, use it instead of fetching from storage
        if (directUrl) {
          addLog(`Using provided direct URL: ${directUrl}`);
          setPdfUrl(directUrl);
          setPdfExists(true);
          setLoading(false);
          return;
        }
        
        if (!resumeId) {
          addLog("No resumeId provided");
          setError('Resume ID not provided');
          setLoading(false);
          return;
        }
        
        // First try to access directly from Supabase storage
        // For testing, we're using a hardcoded filename
        const fileName = "ABHIRAJ SINGH_Resume - Supply Chain.pdf";
        addLog(`Trying to get Supabase storage URL for resumeId: ${resumeId}, fileName: ${fileName}`);
        const storageUrl = getSupabaseStorageUrl(resumeId, fileName);
        
        if (storageUrl) {
          addLog(`Found URL in Supabase storage: ${storageUrl}`);
          setPdfUrl(storageUrl);
          setPdfExists(true);
          setLoading(false);
          return;
        } else {
          addLog("Failed to get URL from Supabase storage");
        }
        
        // If not found in storage directly, try our existing methods
        if (userId) {
          addLog(`Checking if PDF exists for resumeId: ${resumeId}, userId: ${userId}`);
          // First try to see if the PDF exists in our storage
          try {
            const exists = await checkPdfExists(resumeId, userId);
            addLog(`PDF exists check returned: ${exists}`);
            setPdfExists(exists);
            
            if (exists) {
              addLog("PDF exists, getting URL");
              // If it exists in storage, get the URL
              const url = await getPdfUrl(resumeId, userId);
              addLog(`Got PDF URL: ${url}`);
              setPdfUrl(url);
              setLoading(false);
              return;
            } else {
              addLog("PDF doesn't exist in storage");
            }
          } catch (storageError) {
            addLog(`Storage check failed: ${storageError instanceof Error ? storageError.message : String(storageError)}`);
            console.warn('Storage check failed, trying API instead:', storageError);
          }
        } else {
          addLog("No userId available");
        }
        
        // If not in storage, try to fetch it from the API
        try {
          addLog(`Fetching PDF from API for resume ID: ${resumeId}`);
          const response = await fetch(`https://latest-try-psti.onrender.com/api/download/${resumeId}/pdf`);
          
          addLog(`API response status: ${response.status}`);
          if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
          }
          
          // Create a blob URL from the response
          const blob = await response.blob();
          addLog(`Got blob from API, size: ${blob.size} bytes`);
          const url = URL.createObjectURL(blob);
          addLog(`Created object URL: ${url}`);
          setPdfUrl(url);
          setPdfExists(true);
          setLoading(false);
        } catch (apiError) {
          addLog(`API fetch failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
          console.error('API fetch failed:', apiError);
          setError('Failed to fetch PDF from API');
          setPdfExists(false);
          setLoading(false);
        }
      } catch (error) {
        addLog(`Error in loadPdf: ${error instanceof Error ? error.message : String(error)}`);
        console.error('Error loading PDF:', error);
        setError(error instanceof Error ? error.message : 'Failed to load PDF');
        if (onLoadError && error instanceof Error) {
          onLoadError(error);
        }
        setLoading(false);
      }
    };
    
    setLoading(true);
    loadPdf();
    
    // Clean up object URL on unmount
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
        addLog(`Revoked object URL: ${pdfUrl}`);
      }
    };
  }, [resumeId, userId, directUrl, onLoadError]);
  
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    addLog(`PDF loaded successfully with ${numPages} pages`);
    setNumPages(numPages);
    setPageNumber(1);
    if (onLoadSuccess) {
      onLoadSuccess();
    }
  };
  
  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return newPageNumber > 0 && newPageNumber <= (numPages || 1) ? newPageNumber : prevPageNumber;
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);
  
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);
  
  // Function to test the URL directly
  const testUrl = async () => {
    if (!pdfUrl) {
      addLog("No PDF URL to test");
      return;
    }
    
    addLog(`Testing URL: ${pdfUrl}`);
    try {
      const response = await fetch(pdfUrl, { method: 'HEAD' });
      addLog(`URL test result: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        addLog(`URL is accessible, Content-Type: ${response.headers.get('Content-Type')}`);
      } else {
        addLog(`URL returned error status`);
      }
    } catch (error) {
      addLog(`URL test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full w-full ${className}`} style={{ height }}>
        <div className="flex flex-col items-center justify-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-gray-700" />
          <p className="text-gray-700 font-medium">Loading PDF...</p>
          
          {/* Show debug logs if enabled */}
          {showDebugLogs && (
            <div className="mt-4 max-h-40 w-full max-w-md overflow-y-auto p-2 bg-gray-900 text-gray-100 rounded-md font-mono text-xs">
              <p className="font-bold mb-1">Debug Logs:</p>
              {debugLogs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap mb-1">{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (error || !pdfExists) {
    return (
      <div className={`flex items-center justify-center h-full w-full ${className}`} style={{ height }}>
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Resume PDF not available</AlertTitle>
            <AlertDescription>
              {error || "The enhanced PDF for this resume is not available yet. This could be because the optimization is still in progress."}
            </AlertDescription>
          </Alert>
          
          {/* Show debug logs and test button if enabled */}
          {showDebugLogs && (
            <div className="mt-4">
              <Button onClick={testUrl} size="sm" className="mb-2">Test URL</Button>
              <div className="max-h-40 overflow-y-auto p-2 bg-gray-900 text-gray-100 rounded-md font-mono text-xs">
                <p className="font-bold mb-1">Debug Logs:</p>
                {debugLogs.map((log, i) => (
                  <div key={i} className="whitespace-pre-wrap mb-1">{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col h-full ${className}`} style={{ width, height }}>
      {/* Debug logs section if enabled */}
      {showDebugLogs && (
        <div className="p-2 bg-gray-800 text-gray-200 text-xs font-mono">
          <div className="flex justify-between mb-1">
            <span className="font-bold">Debug Info</span>
            <Button onClick={testUrl} size="sm" variant="outline" className="h-6 text-xs py-0 px-2">Test URL</Button>
          </div>
          <div className="bg-gray-900 p-2 rounded max-h-20 overflow-y-auto">
            <p className="mb-1">PDF URL: {pdfUrl || 'None'}</p>
            <p>Latest logs:</p>
            {debugLogs.slice(-5).map((log, i) => (
              <div key={i} className="whitespace-pre-wrap text-xs opacity-80">{log}</div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-4">
        {pdfUrl && (
          <div className="shadow-xl bg-white rounded-lg overflow-hidden">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                addLog(`Error loading document: ${error.message}`);
                console.error("Error loading document:", error);
                setLoadingError('Error loading PDF. Please try again later.');
                if (onLoadError) {
                  onLoadError(error);
                }
              }}
              loading={
                <div className="flex flex-col items-center justify-center p-6 bg-white rounded shadow-md">
                  <Loader className="h-8 w-8 animate-spin text-gray-700 mb-2" />
                  <p className="text-gray-700 font-medium">Loading PDF content...</p>
                </div>
              }
              className="max-h-full"
              options={pdfOptions}
            >
              {loadingError ? (
                <div className="p-6 bg-white rounded shadow-md">
                  <p className="text-red-500 font-medium">{loadingError}</p>
                  {showDebugLogs && (
                    <div className="mt-2 bg-gray-100 p-2 rounded text-xs font-mono">
                      {debugLogs.slice(-3).map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale} 
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="pdf-page"
                  error={
                    <div className="p-6 bg-white rounded shadow-md">
                      <p className="text-red-500 font-medium">Error loading page {pageNumber}.</p>
                      {showDebugLogs && (
                        <Button onClick={testUrl} size="sm" className="mt-2">Test URL</Button>
                      )}
                    </div>
                  }
                />
              )}
            </Document>
          </div>
        )}
      </div>
      
      <div className="bg-white p-3 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousPage}
            disabled={pageNumber <= 1}
            aria-label="Previous page"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-700 font-medium">
            Page {pageNumber} of {numPages || 1}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={pageNumber >= (numPages || 1)}
            aria-label="Next page"
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
            aria-label="Zoom out"
          >
            -
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetZoom}
            aria-label="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 2.5}
            aria-label="Zoom in"
          >
            +
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
