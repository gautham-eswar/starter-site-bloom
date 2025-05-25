
import { toast } from "@/hooks/use-toast";
import { uploadPdfFromBlob, checkPdfExists } from "./pdfStorage"; // Assuming pdfStorage.ts is still relevant
import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL = "https://draft-zero.onrender.com"; // Updated API Base URL

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error("API Error:", error);
  // The backend error format is { "error": "ErrorType", "message": "Detailed error message", ... }
  // error?.response?.data?.message should map to errorData.message from apiRequest
  const errorMessage = error?.response?.data?.message || error.message || "Something went wrong";
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
  return { error: errorMessage };
};

// Helper function for making API requests
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`; // Ensuring correct path joining
    
    // Set default headers if not provided, but FormData needs special handling
    if (!(options.body instanceof FormData) && !options.headers) {
      options.headers = {
        "Content-Type": "application/json",
      };
    } else if (options.body instanceof FormData) {
      // For FormData, Content-Type is set by the browser, so we ensure it's not explicitly set to application/json
      if (options.headers && (options.headers as Record<string, string>)['Content-Type'] === 'application/json') {
        delete (options.headers as Record<string, string>)['Content-Type'];
      }
    }
    
    // Add timeout management
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    if (!options.signal) {
      options.signal = controller.signal;
    }
    
    const response = await fetch(url, options);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      // Backend error: { "error": "ErrorType", "message": "Detailed error message", ... }
      // errorData.message will capture the detailed error message
      const errorMessage = errorData.message || `Request failed with status ${response.status}`;
      console.error(`API request to ${url} failed with status ${response.status}: ${errorMessage}`, errorData);
      toast({ // Added toast here for immediate feedback on API errors
        title: `API Error: ${response.status}`,
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage, data: errorData }; // Return errorData as well
    }
    
    const data = await response.json();
    return data; // Backend response: { data: { ... } } or { message: "...", ... } for success
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Request timed out');
      toast({
        title: "Error",
        description: "Request timed out. Please try again.",
        variant: "destructive",
      });
      return { error: 'Request timed out. Please try again.' };
    }
    // For other errors (network, etc.), use handleApiError
    return handleApiError(error);
  }
}

// Upload resume
export async function uploadResume(file: File, userId: string) {
  const formData = new FormData();
  
  formData.append("file", file);
  formData.append('user_id', userId);
  
  console.log(`Starting resume upload for user ID: ${userId} to ${API_BASE_URL}/api/upload`);
  return await apiRequest("/api/upload", { // Fixed: Added /api prefix
    method: "POST",
    // headers: {}, // Content-Type for FormData is set by the browser
    body: formData,
  });
}

// Optimize resume with job description
export async function optimizeResume(resumeId: string, jobDescription: string, userId: string) {
  console.log(`Optimizing resume ID: ${resumeId} for user ID: ${userId} with job description.`);
  const formData = new FormData();
  formData.append("resume_id", resumeId);
  formData.append("user_id", userId);
  formData.append("job_description", jobDescription);
  return await apiRequest("/api/optimize", { // Fixed: Added /api prefix
    method: "POST",
    // headers: {}, // Content-Type for FormData is set by the browser
    body: formData,
  });
}

// Removed getOptimizationResults and checkOptimizationStatus as they are no longer used by the new backend.
// The /api/optimize endpoint now returns complete results directly.

// Download optimized resume
export async function downloadResume(resumeId: string, format: string = "pdf") {
  try {
    // Get the current auth session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    const downloadUrl = `${API_BASE_URL}/api/download/${resumeId}/${format}`; // Fixed: Added /api prefix
    console.log(`Attempting to download resume from: ${downloadUrl}`);

    // If we have userId and format is PDF, check if it exists in our Supabase storage first
    // This caching logic might still be beneficial
    if (userId && format === "pdf") {
      const existsInSupabase = await checkPdfExists(resumeId, userId); // checkPdfExists comes from './pdfStorage'
      if (existsInSupabase) {
        console.log(`PDF ${resumeId} for user ${userId} found in Supabase storage. Preparing download.`);
        // If it exists in our storage, get it from there (or generate a signed URL if that's how pdfStorage works)
        // This part depends on how checkPdfExists and subsequent download from Supabase are implemented.
        // For now, let's assume direct download from API and cache after.
      }
    }
    
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Download failed with status ${response.status}`);
    }
    
    // If it's PDF, try to store it in Supabase for future use (caching)
    if (format === "pdf" && userId) {
      try {
        const blobCopy = await response.clone().blob(); // Clone response for caching
        // Assuming enhanced_resume_{resumeId}.pdf is the desired filename in storage
        await uploadPdfFromBlob(blobCopy, `enhanced_resume_${resumeId}.pdf`, resumeId, userId); // uploadPdfFromBlob from './pdfStorage'
        console.log(`Cached ${resumeId}.pdf to Supabase storage for user ${userId}.`);
      } catch (uploadError) {
        console.error("Failed to cache PDF in Supabase storage:", uploadError);
        // Continue with the download even if storage caching fails
      }
    }
    
    return response; // Return the original response for the client to handle (e.g., save file)
  } catch (error) {
    console.error("Download error:", error);
    toast({
      title: "Download Failed",
      description: error instanceof Error ? error.message : "Could not download the file.",
      variant: "destructive",
    });
    throw error; // Re-throw to be caught by calling function if necessary
  }
}

// Check API Health
export async function checkApiHealth() {
  console.log("Checking API health...");
  const response = await apiRequest("/api/health", { method: "GET" }); // Ensure GET is specified, though it's default for apiRequest if no body
  if (response && response.error) {
    console.error("API Health Check Failed:", response.error);
  } else {
    console.log("API Health Status:", response);
  }
  return response; // Directly return the response (success data or error object)
}
