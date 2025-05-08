
import React, { useState, useMemo, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, RefreshCw, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

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
  const [key, setKey] = useState<number>(0); // Key to force re-render
  
  // Memoize PDF options to prevent unnecessary rerenders
  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/standard_fonts/'
  }), []);

  // Force re-render when URL changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    setKey(prev => prev + 1);
    console.log('URL changed or component mounted. New URL:', url);
  }, [url]);

  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log(`PDF loaded successfully with ${numPages} pages`);
    setNumPages(numPages);
    setPageNumber(1);
    setError(null);
    setLoading(false);
    toast({
      title: "PDF Loaded",
      description: `Document loaded with ${numPages} pages`,
      variant: "default"
    });
  };

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
    setKey(prev => prev + 1);
    console.log('Manual refresh requested');
    
    // Open in new tab as fallback
    const refreshedUrl = url.includes('?') 
      ? `${url}&refresh=${Date.now()}` 
      : `${url}?refresh=${Date.now()}`;
    window.open(refreshedUrl, '_blank');
  };

  // Test if URL is valid
  const testUrl = async () => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`URL test result: ${response.status} ${response.statusText}`);
      if (response.ok) {
        const contentType = response.headers.get('Content-Type');
        console.log(`Content-Type: ${contentType || 'not specified'}`);
      }
    } catch (err) {
      console.error('Error testing URL:', err);
    }
  };

  // Test URL on component mount
  useEffect(() => {
    if (url) {
      testUrl();
    }
  }, [url]);

  return (
    <div className="flex flex-col h-full">
      {/* PDF document */}
      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-4">
        {loading && (
          <div className="absolute z-10 bg-white/50 inset-0 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
              <Loader className="h-8 w-8 text-blue-500 animate-spin mb-2" />
              <p className="text-gray-700">Loading PDF...</p>
            </div>
          </div>
        )}
        
        <Document
          key={key}
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => {
            console.error('PDF load error:', err);
            setError(`Failed to load PDF: ${err.message}`);
            setLoading(false);
            toast({
              title: "Error Loading PDF",
              description: err.message,
              variant: "destructive"
            });
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
              <div className="flex flex-col space-y-2">
                <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" /> Try Again
                </Button>
                <Button variant="ghost" onClick={() => window.open(url, '_blank')} className="text-sm">
                  Open in New Tab
                </Button>
              </div>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="pdf-page shadow-lg"
            error={<p className="text-red-500 p-4 bg-red-50 rounded-lg mt-2">Error rendering page {pageNumber}</p>}
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
