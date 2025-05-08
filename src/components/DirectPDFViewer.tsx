
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader } from 'lucide-react';
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
        const response = await fetch(url, { method: 'HEAD' });
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
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

  // Download the PDF
  const downloadPdf = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = url.substring(url.lastIndexOf('/') + 1);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Download button (floating in top-right corner) */}
      <Button 
        variant="secondary"
        size="sm"
        onClick={downloadPdf}
        className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white shadow-md"
      >
        <Download className="h-4 w-4 mr-1" />
        Download
      </Button>

      {/* PDF viewer */}
      <div className="flex-1">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <Loader className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        )}
        
        {error ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
              <p className="text-red-600 font-medium">Error loading PDF</p>
            </div>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            src={url}
            className="w-full h-full border-0"
            onLoad={() => {
              setLoading(false);
            }}
            onError={() => {
              setError("Failed to load PDF");
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
