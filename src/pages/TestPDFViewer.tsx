
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TestPDFViewer: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the new Test2 page
    navigate('/test2');
  }, [navigate]);
  
  return <div className="h-screen flex items-center justify-center">Redirecting...</div>;
};

export default TestPDFViewer;
