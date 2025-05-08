
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, RefreshCw, Loader } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DirectPDFViewerProps {
  url: string;
}

export const DirectPDFViewer: React.FC<DirectPDFViewerProps> = ({ url }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  // Test if URL is accessible
  useEffect(() => {
    const testUrl = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Testing PDF URL: ${url}`);
        const response = await fetch(url, { method: 'HEAD' });
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('Content-Type');
        console.log(`Content-Type: ${contentType || 'not specified'}`);
        
        if (contentType && !contentType.includes('pdf')) {
          console.warn(`URL does not appear to be a PDF (Content-Type: ${contentType})`);
        }
        
        // URL is valid, we can proceed
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Error testing PDF URL: ${errorMessage}`);
        setError(`Cannot access PDF: ${errorMessage}`);
        setLoading(false);
        
        toast({
          title: "PDF Access Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    };
    
    if (url) {
      testUrl();
    }
  }, [url]);

  // Handle refresh
  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
    setLoading(true);
    setError(null);
  };

  // Open in new tab
  const openInNewTab = () => {
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controls header */}
      <div className="p-2 bg-gray-50 border-b flex justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Reload
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={openInNewTab}
          className="flex items-center gap-1"
        >
          <ExternalLink className="h-4 w-4" />
          Open in New Tab
        </Button>
      </div>

      {/* PDF viewer */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-center">
              <Loader className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}
        
        {error ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 max-w-md">
              <p className="text-red-600 font-medium mb-2">Error loading PDF</p>
              <p className="text-gray-700 text-sm">{error}</p>
            </div>
            <div className="flex flex-col space-y-2">
              <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" /> Try Again
              </Button>
              <Button variant="ghost" onClick={openInNewTab} className="text-sm">
                Open in New Tab
              </Button>
            </div>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            src={url}
            className="w-full h-full border-0"
            onLoad={() => {
              console.log("PDF iframe loaded");
              setLoading(false);
              toast({
                title: "PDF Loaded",
                description: "The PDF document has loaded successfully",
                variant: "default"
              });
            }}
            onError={(e) => {
              console.error("PDF iframe error:", e);
              setError("Failed to load PDF in viewer");
              setLoading(false);
            }}
            title="PDF Viewer"
            allow="fullscreen"
          />
        )}
      </div>
    </div>
  );
};
