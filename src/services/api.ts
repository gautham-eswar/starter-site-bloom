
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";

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
  throw error;
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
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
}

// Upload resume
export async function uploadResume(file: File, userId: String) {
  const formData = new FormData();
  
  formData.append("file", file);
  if (userId) {
      formData.append('user_id', userId);
  }
  
  return apiRequest("/upload", {
    method: "POST",
    headers: {}, // Let browser set content-type for FormData
    body: formData,
  });
}

// Optimize resume with job description
export async function optimizeResume(resumeId: string, jobDescription: string) {
  return apiRequest("/optimize", {
    method: "POST",
    body: JSON.stringify({
      resume_id: resumeId,
      job_description: jobDescription,
    }),
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
  const response = await fetch(`${API_BASE_URL}/download/${resumeId}/${format}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Download failed with status ${response.status}`);
  }
  return response;
}
