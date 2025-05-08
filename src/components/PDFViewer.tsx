import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { getPdfUrl, checkPdfExists } from '@/services/pdfStorage';
import { useAuth } from '@/components/auth/AuthProvider';
import { Loader, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Configure the PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  resumeId?: string;
  userId?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  directUrl?: string; // New prop for direct URL testing
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  resumeId,
  userId: propUserId,
  width = '100%',
  height = '100%',
  className = '',
  directUrl // New prop
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfExists, setPdfExists] = useState<boolean | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  
  const { user } = useAuth();
  const userId = propUserId || user?.id;
  
  useEffect(() => {
    const loadPdf = async () => {
      // If a direct URL is provided, use it instead of fetching from storage
      if (directUrl) {
        setPdfUrl(directUrl);
        setPdfExists(true);
        setLoading(false);
        return;
      }
      
      if (!resumeId || !userId) {
        setError('Resume ID or User ID not provided');
        setLoading(false);
        return;
      }
      
      try {
        // Check if PDF exists
        const exists = await checkPdfExists(resumeId, userId);
        setPdfExists(exists);
        
        if (!exists) {
          setError('PDF not found');
          setLoading(false);
          return;
        }
        
        // Get PDF URL
        const url = await getPdfUrl(resumeId, userId);
        setPdfUrl(url);
        setLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setError(error instanceof Error ? error.message : 'Failed to load PDF');
        setLoading(false);
      }
    };
    
    setLoading(true);
    loadPdf();
  }, [resumeId, userId, directUrl]);
  
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
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
        <div className="flex flex-col items-center justify-center gap-2 text-center max-w-md">
          <p className="text-draft-coral font-medium">Resume PDF not available</p>
          <p className="text-draft-text text-sm">
            The enhanced PDF for this resume is not available yet. This could be because the optimization is still in progress.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col h-full ${className}`} style={{ width, height }}>
      <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => setError('Error loading PDF')}
          loading={<Loader className="h-8 w-8 animate-spin text-draft-green" />}
          className="shadow-lg"
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
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
