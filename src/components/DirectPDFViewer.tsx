
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader } from 'lucide-react';
// import { toast } from '@/hooks/use-toast'; // toast is not used anymore

interface DirectPDFViewerProps {
  url: string;
}

export const DirectPDFViewer: React.FC<DirectPDFViewerProps> = ({ url }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(() => Date.now()); // Ensure iframe reloads if URL changes

  useEffect(() => {
    // Reset states when URL changes
    setLoading(true);
    setError(null);
    setIframeKey(Date.now()); // Force iframe remount on url change
    console.log('[DirectPDFViewer] URL changed or component mounted. New URL:', url);
  }, [url]);

  // Download the PDF - opens in a new tab
  const downloadPdf = () => {
    if (url) {
      window.open(url, '_blank');
    } else {
      console.error('[DirectPDFViewer] Download attempt with no URL');
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Download button (floating in top-right corner) */}
      <Button
        variant="secondary"
        size="sm"
        onClick={downloadPdf}
        className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white shadow-md"
        disabled={!url || error !== null}
      >
        <Download className="h-4 w-4 mr-1" />
        Download
      </Button>

      {/* PDF viewer */}
      <div className="flex-1">
        {loading && !error && ( // Show loader only if no error
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <Loader className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        )}
        
        {error && ( // Show error message if error is set
          <div className="h-full flex items-center justify-center p-6 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
              <p className="text-red-700 font-semibold text-lg mb-2">Error loading PDF</p>
              <p className="text-red-600 text-sm">{error}</p>
              <p className="text-xs text-gray-500 mt-3">Please ensure the PDF exists and the link is valid. Try downloading it directly.</p>
            </div>
          </div>
        )}
        
        {!error && url && ( // Only render iframe if no error and URL exists
          <iframe
            key={iframeKey}
            src={`${url}#toolbar=0&navpanes=0&scrollbar=0`} // Common parameters to hide viewer controls
            className="w-full h-full border-0"
            onLoad={() => {
              console.log('[DirectPDFViewer] iframe onLoad triggered for URL:', url);
              setLoading(false);
              setError(null); // Clear any previous error on successful load
            }}
            onError={(e) => {
              console.error('[DirectPDFViewer] iframe onError triggered for URL:', url, 'Error event:', e);
              setError("Failed to load PDF in viewer. The file might be corrupted, inaccessible, or the URL might be invalid.");
              setLoading(false);
            }}
            title="PDF Viewer"
            frameBorder="0"
            allow="fullscreen"
          />
        )}
        {!url && !error && !loading && ( // Case where URL is null, not loading, and no error yet
             <div className="h-full flex items-center justify-center p-6 text-center">
                <p className="text-gray-500">No PDF URL provided.</p>
            </div>
        )}
      </div>
    </div>
  );
};
