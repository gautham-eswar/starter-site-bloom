
import React, { useState, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, RefreshCw, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface DirectPDFViewerProps {
  url: string;
}

export const DirectPDFViewer: React.FC<DirectPDFViewerProps> = ({ url }) => {
  // PDF view state
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Memoize PDF options to prevent unnecessary rerenders
  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/standard_fonts/'
  }), []);

  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log(`PDF loaded successfully with ${numPages} pages`);
    setNumPages(numPages);
    setPageNumber(1);
    setError(null);
    setLoading(false);
  };

  // Log the URL being used
  console.log('Attempting to load PDF from URL:', url);

  // Navigation functions
  const previousPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const nextPage = () => setPageNumber(prev => numPages ? Math.min(prev + 1, numPages) : prev);
  
  // Zoom functions
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);
  
  // Refresh function - forces reload of PDF
  const handleRefresh = () => {
    setError(null);
    setLoading(true);
    // Force re-render by adding timestamp to URL
    const refreshedUrl = url.includes('?') 
      ? `${url}&refresh=${Date.now()}` 
      : `${url}?refresh=${Date.now()}`;
    window.open(refreshedUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-full">
      {/* PDF document */}
      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-4">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => {
            console.error('PDF load error:', err);
            setError(`Failed to load PDF: ${err.message}`);
            setLoading(false);
          }}
          options={pdfOptions}
          loading={
            <div className="flex flex-col items-center justify-center p-8">
              <Loader className="h-10 w-10 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-700">Loading PDF document...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 max-w-md">
                <p className="text-red-600 font-medium mb-2">Error loading PDF</p>
                <p className="text-gray-700 text-sm">{error || "Unable to load document"}</p>
              </div>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" /> Try Again
              </Button>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="pdf-page"
          />
        </Document>
      </div>
      
      {/* Controls footer */}
      {numPages && (
        <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
          {/* Page navigation */}
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
          
          {/* Zoom controls */}
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
