
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import ComparisonPage from "./pages/ComparisonPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Technology from "./pages/Technology"; // Add Technology page
import FAQ from "./pages/FAQ"; // Add FAQ page
import Test2 from "./pages/Test2"; // Add new Test2 page
import Test3 from "./pages/Test3"; // Add new Test3 page
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { AuthProvider, useAuth } from "./components/auth/AuthProvider"; // Combined useAuth import
import { PipelineProvider, ResumeProvider, usePipelineContext } from "./contexts/ResumeContext"; // Import usePipelineContext
import React, { useEffect } from "react"; // Import useEffect

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

// App Routes component that uses AuthProvider
const AppRoutes = () => {
  const { performApiHealthCheck } = usePipelineContext(); // Get the health check function

  useEffect(() => {
    performApiHealthCheck();
  }, [performApiHealthCheck]); // Dependency array includes performApiHealthCheck as it's from context

  return (
    // AuthProvider and other providers are moved to wrap AppRoutes in the main App component
    // to ensure context is available where needed.
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/technology" element={<Technology />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/comparison" element={
        <ProtectedRoute>
          <ComparisonPage />
        </ProtectedRoute>
      } />
      <Route path="/test2" element={<Test2 />} />
      <Route path="/test3" element={<Test3 />} />
      <Route path="/auth" element={<Auth />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider> {/* AuthProvider now wraps PipelineProvider */}
            <PipelineProvider> {/* PipelineProvider now wraps ResumeProvider and AppRoutes */}
              <ResumeProvider> {/* ResumeProvider remains here */}
                <AppRoutes />
              </ResumeProvider>
            </PipelineProvider>
          </AuthProvider>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
