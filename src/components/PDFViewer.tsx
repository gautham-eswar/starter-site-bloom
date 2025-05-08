
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { getPdfUrl, checkPdfExists } from '@/services/pdfStorage';
import { useAuth } from '@/components/auth/AuthProvider';
import { Loader, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';

// Configure the PDF.js worker source with a more reliable CDN link
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PDFViewerProps {
  resumeId?: string;
  userId?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  directUrl?: string; // Prop for direct URL testing
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  resumeId,
  userId: propUserId,
  width = '100%',
  height = '100%',
  className = '',
  directUrl
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfExists, setPdfExists] = useState<boolean | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const userId = propUserId || user?.id;
  
  // Function to get the direct Supabase storage URL
  const getSupabaseStorageUrl = (resumeId: string, fileName: string) => {
    if (!resumeId) return null;
    
    const bucketName = 'resumes';
    const storagePath = `${resumeId}/f92b9a89-7189-4796-b009-bb700e9f8266/${fileName}`;
    
    // Create a public URL for the file
    const { data } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(storagePath);
      
    return data?.publicUrl || null;
  };
  
  useEffect(() => {
    const loadPdf = async () => {
      setError(null);
      setLoadingError(null);
      
      try {
        // If a direct URL is provided, use it instead of fetching from storage
        if (directUrl) {
          console.log("Loading PDF from direct URL:", directUrl);
          setPdfUrl(directUrl);
          setPdfExists(true);
          setLoading(false);
          return;
        }
        
        if (!resumeId) {
          setError('Resume ID not provided');
          setLoading(false);
          return;
        }
        
        // First try to access directly from Supabase storage
        // For testing, we're using a hardcoded filename
        const fileName = "ABHIRAJ SINGH_Resume - Supply Chain.pdf";
        const storageUrl = getSupabaseStorageUrl(resumeId, fileName);
        
        if (storageUrl) {
          console.log("Loading PDF from Supabase storage:", storageUrl);
          setPdfUrl(storageUrl);
          setPdfExists(true);
          setLoading(false);
          return;
        }
        
        // If not found in storage directly, try our existing methods
        if (userId) {
          // First try to see if the PDF exists in our storage
          try {
            const exists = await checkPdfExists(resumeId, userId);
            setPdfExists(exists);
            
            if (exists) {
              // If it exists in storage, get the URL
              const url = await getPdfUrl(resumeId, userId);
              setPdfUrl(url);
              setLoading(false);
              return;
            }
          } catch (storageError) {
            console.warn('Storage check failed, trying API instead:', storageError);
          }
        }
        
        // If not in storage, try to fetch it from the API
        try {
          console.log(`Fetching PDF from API for resume ID: ${resumeId}`);
          const response = await fetch(`https://latest-try-psti.onrender.com/api/download/${resumeId}/pdf`);
          
          if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
          }
          
          // Create a blob URL from the response
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setPdfExists(true);
          setLoading(false);
        } catch (apiError) {
          console.error('API fetch failed:', apiError);
          setError('Failed to fetch PDF from API');
          setPdfExists(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
        setError(error instanceof Error ? error.message : 'Failed to load PDF');
        setLoading(false);
      }
    };
    
    setLoading(true);
    loadPdf();
    
    // Clean up object URL on unmount
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [resumeId, userId, directUrl]);
  
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log("PDF loaded successfully with", numPages, "pages");
    setNumPages(numPages);
    setPageNumber(1);
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
  
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full w-full ${className}`} style={{ height }}>
        <div className="flex flex-col items-center justify-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-draft-green" />
          <p className="text-draft-green">Loading PDF...</p>
        </div>
      </div>
    );
  }
  
  if (error || !pdfExists) {
    return (
      <div className={`flex items-center justify-center h-full w-full ${className}`} style={{ height }}>
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Resume PDF not available</AlertTitle>
          <AlertDescription>
            {error || "The enhanced PDF for this resume is not available yet. This could be because the optimization is still in progress."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col h-full ${className}`} style={{ width, height }}>
      <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
        {pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => {
              console.error("Error loading document:", error);
              setLoadingError('Error loading PDF. Please try again later.');
            }}
            loading={<Loader className="h-8 w-8 animate-spin text-draft-green" />}
            className="shadow-lg"
          >
            {loadingError ? (
              <div className="p-4 bg-white rounded shadow-md">
                <p className="text-red-500">{loadingError}</p>
              </div>
            ) : (
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                renderTextLayer={true}
                renderAnnotationLayer={true}
                error={<div className="p-4 bg-white rounded shadow-md">
                  <p className="text-red-500">Error loading page {pageNumber}.</p>
                </div>}
              />
            )}
          </Document>
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
          
          <span className="text-sm">
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
