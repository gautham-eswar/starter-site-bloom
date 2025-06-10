
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ComparisonPage from "./pages/ComparisonPage";
import Comparison2Page from "./pages/Comparison2Page";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Technology from "./pages/Technology";
import FAQ from "./pages/FAQ";
import Test2 from "./pages/Test2";
import Test3 from "./pages/Test3";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { AuthProvider, useAuth } from "./components/auth/AuthProvider";
import { PipelineProvider, ResumeProvider, usePipelineContext } from "./contexts/ResumeContext";
import React, { useEffect } from "react";

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
  // This component can now safely use contexts provided above it.
  const { performApiHealthCheck } = usePipelineContext(); 

  useEffect(() => {
    console.log("[AppRoutes useEffect] Effect triggered. Checking performApiHealthCheck...");
    if (typeof performApiHealthCheck === 'function') {
      console.log("[AppRoutes useEffect] performApiHealthCheck is a function. Calling it...");
      performApiHealthCheck()
        .then(() => {
          console.log("[AppRoutes useEffect] performApiHealthCheck call completed or its promise resolved.");
        })
        .catch(error => {
          console.error("[AppRoutes useEffect] Error caught from performApiHealthCheck promise:", error);
        });
    } else {
      console.error("[AppRoutes useEffect] performApiHealthCheck is not a function or is undefined. This might indicate an issue with PipelineContext.");
    }
  }, [performApiHealthCheck]);

  return (
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
      <Route path="/comparison2" element={
        <ProtectedRoute>
          <Comparison2Page />
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
          <AuthProvider> {/* Moved AuthProvider up */}
            <PipelineProvider> {/* Moved PipelineProvider up */}
              <ResumeProvider> {/* Moved ResumeProvider up */}
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
