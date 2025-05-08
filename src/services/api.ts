import { toast } from "@/hooks/use-toast";
import { uploadPdfFromBlob, checkPdfExists } from "./pdfStorage";
import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL = "https://latest-try-psti.onrender.com/api";

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error("API Error:", error);
  const errorMessage = error?.response?.data?.message || error.message || "Something went wrong";
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
};

// Helper function for making API requests
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set default headers if not provided
    if (!options.headers) {
      options.headers = {
        "Content-Type": "application/json",
      };
    }
    
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
}

// Upload resume
export async function uploadResume(file: File, userId: string) {
  const formData = new FormData();
  
  formData.append("file", file);
  if (userId) {
      formData.append('user_id', userId);
  }
  console.log(`Starting resume upload from user ID: ${userId}`)
  return await apiRequest("/upload", {
    method: "POST",
    headers: {}, // Let browser set content-type for FormData
    body: formData,
  });
}

// Optimize resume with job description
export async function optimizeResume(resumeId: string, jobDescription: string, userId: string) {
  console.log(userId)
  const formData = new FormData();
  formData.append("resume_id", resumeId)
  formData.append("user_id", userId)
  formData.append("job_description", jobDescription)
  return await apiRequest("/optimize", {
    method: "POST",
    headers: {}, // Let browser set content-type for FormData
    body: formData,
  });
}

// Get optimization results
export async function getOptimizationResults(resumeId: string, jobId: string) {
  return apiRequest(`/results/${resumeId}/${jobId}`);
}

// Check optimization status
export async function checkOptimizationStatus(jobId: string) {
  return apiRequest(`/status/${jobId}`);
}

// Download optimized resume
export async function downloadResume(resumeId: string, format: string = "pdf") {
  try {
    // Get the current auth session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    // If we have userId and format is PDF, check if it exists in our storage
    if (userId && format === "pdf") {
      const exists = await checkPdfExists(resumeId, userId);
      if (exists) {
        // If it exists in our storage, get it from there
        const response = await fetch(`${API_BASE_URL}/download/${resumeId}/${format}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Download failed with status ${response.status}`);
        }
        
        // Store the PDF in Supabase storage for future use
        const blob = await response.blob();
        try {
          await uploadPdfFromBlob(blob, `enhanced_resume_${resumeId}.pdf`, resumeId, userId);
        } catch (uploadError) {
          console.error("Failed to cache PDF in storage:", uploadError);
          // Continue with the download even if storage fails
        }
        
        return response;
      }
    }
    
    // Otherwise fetch directly from API
    const response = await fetch(`${API_BASE_URL}/download/${resumeId}/${format}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Download failed with status ${response.status}`);
    }
    
    // If it's PDF, try to store it for future use
    if (format === "pdf" && userId) {
      try {
        const blobCopy = await response.clone().blob();
        await uploadPdfFromBlob(blobCopy, `enhanced_resume_${resumeId}.pdf`, resumeId, userId);
      } catch (uploadError) {
        console.error("Failed to cache PDF in storage:", uploadError);
        // Continue with the download even if storage fails
      }
    }
    
    return response;
  } catch (error) {
    console.error("Download error:", error);
    throw error;
  }
}
