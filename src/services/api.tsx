import React from 'react'; // Added for JSX in toast
import { toast } from "@/hooks/use-toast";
import { uploadPdfFromBlob, checkPdfExists } from "./pdfStorage"; // Assuming pdfStorage.ts is still relevant
import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL = "https://draft-zero.onrender.com"; // Updated API Base URL

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error("API Error:", error);
  const errorMessage = error?.response?.data?.message || error.message || "Something went wrong";

  const isNetworkError = /failed to fetch|networkerror/i.test(error.message?.toLowerCase() || '');

  if (isNetworkError) {
    toast({
      title: <span className="text-draft-green dark:text-draft-yellow">Service Unreachable</span> as React.ReactNode,
      description: "We're having trouble connecting. Please check your internet connection or try again shortly.",
      variant: "default",
    });
  } else {
    toast({
      title: <span className="text-draft-green dark:text-draft-yellow">An Error Occurred</span> as React.ReactNode,
      description: errorMessage,
      variant: "default", // Changed from "destructive" for a less alarming default
    });
  }
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
      if (options.headers && (options.headers as Record<string, string>)['Content-Type'] === 'application/json') {
        delete (options.headers as Record<string, string>)['Content-Type'];
      }
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      const errorMessage = errorData.message || `Request failed with status ${response.status}`;
      console.error(`API request to ${url} failed with status ${response.status}: ${errorMessage}`, errorData);
      toast({
        title: `API Error: ${response.status}` as React.ReactNode, // Also cast here if this title could be JSX later
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage, data: errorData };
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("API Request Exception:", error); 
    return handleApiError(error); 
  }
}

// Upload resume
export async function uploadResume(file: File, userId: string) {
  const formData = new FormData();
  
  formData.append("file", file);
  formData.append('user_id', userId);
  
  console.log(`Starting resume upload for user ID: ${userId} to ${API_BASE_URL}/api/upload`);
  return await apiRequest("/api/upload", {
    method: "POST",
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
  return await apiRequest("/api/optimize", {
    method: "POST",
    body: formData,
  });
}

// Download optimized resume
export async function downloadResume(resumeId: string, format: string = "pdf") {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    const downloadUrl = `${API_BASE_URL}/api/download/${resumeId}/${format}`;
    console.log(`Attempting to download resume from: ${downloadUrl}`);

    if (userId && format === "pdf") {
      const existsInSupabase = await checkPdfExists(resumeId, userId);
      if (existsInSupabase) {
        console.log(`PDF ${resumeId} for user ${userId} found in Supabase storage. Preparing download.`);
      }
    }
    
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Download failed with status ${response.status}`);
    }
    
    if (format === "pdf" && userId) {
      try {
        const blobCopy = await response.clone().blob();
        await uploadPdfFromBlob(blobCopy, `enhanced_resume_${resumeId}.pdf`, resumeId, userId);
        console.log(`Cached ${resumeId}.pdf to Supabase storage for user ${userId}.`);
      } catch (uploadError) {
        console.error("Failed to cache PDF in Supabase storage:", uploadError);
      }
    }
    
    return response;
  } catch (error) {
    console.error("Download error:", error);
    toast({
      title: "Download Failed" as React.ReactNode, // Also cast here
      description: error instanceof Error ? error.message : "Could not download the file.",
      variant: "destructive",
    });
    throw error;
  }
}
