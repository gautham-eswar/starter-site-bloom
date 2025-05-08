
import React from 'react';
import Header from '@/components/Header';
import PDFViewer from '@/components/PDFViewer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TestPDFViewer: React.FC = () => {
  const navigate = useNavigate();
  
  // The direct URL to the PDF from Supabase storage
  const pdfUrl = "https://mlvlovbfzgvdggoudgsr.supabase.co/storage/v1/object/public/resumes/41600801-46c5-4d56-a248-f8c3585cc486/f92b9a89-7189-4796-b009-bb700e9f8266/ABHIRAJ%20SINGH_Resume%20-%20Supply%20Chain.pdf";
  
  return (
    <div className="min-h-screen bg-draft-bg">
      <Header />
      
      <main className="px-8 py-6 md:px-12 lg:px-20">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <div>
            <h2 className="text-2xl font-serif text-draft-green mb-6">PDF Viewer Test</h2>
            <div className="bg-white rounded-lg h-[700px] overflow-hidden shadow-md">
              <PDFViewer 
                directUrl={pdfUrl}
                height="100%"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestPDFViewer;
