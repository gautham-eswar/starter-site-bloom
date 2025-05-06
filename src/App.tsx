
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
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { AuthProvider } from "./components/auth/AuthProvider";
import { useAuth } from "./components/auth/AuthProvider";
import { ResumeProvider } from "./contexts/ResumeContext";

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
  return (
    <AuthProvider>
      <ResumeProvider>
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
          <Route path="/auth" element={<Auth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ResumeProvider>
    </AuthProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
