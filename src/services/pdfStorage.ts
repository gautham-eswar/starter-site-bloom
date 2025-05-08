
import { supabase } from '@/integrations/supabase/client';
import { RESUME_BUCKET, generateResumePath, checkResumeExists } from './supabaseSetup';
import { toast } from '@/hooks/use-toast';

// Type for URL cache entries
interface CachedUrl {
  url: string;
  expires: number;
}

// Cache for URLs to prevent repeated requests
const urlCache: Record<string, CachedUrl> = {};
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

/**
 * Uploads a PDF file to Supabase storage
 * @param file File to upload
 * @param resumeId Resume ID
 * @param userId User ID
 * @returns Promise resolving to the URL of the uploaded file
 */
export async function uploadPdf(file: File, resumeId: string, userId: string): Promise<string> {
  try {
    const path = generateResumePath(userId, resumeId);
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(RESUME_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });
    
    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }
    
    // Get the URL of the uploaded file
    const url = await getPdfUrl(resumeId, userId);
    if (!url) {
      throw new Error('Failed to get URL for uploaded PDF');
    }
    
    return url;
  } catch (error) {
    console.error('Error in uploadPdf:', error);
    toast({
      title: 'Upload Failed',
      description: error instanceof Error ? error.message : 'Failed to upload PDF',
      variant: 'destructive',
    });
    throw error;
  }
}

/**
 * Gets a URL for viewing a PDF
 * @param resumeId Resume ID
 * @param userId User ID
 * @returns Promise resolving to the URL of the PDF
 */
export async function getPdfUrl(resumeId: string, userId: string): Promise<string> {
  try {
    const cacheKey = `${userId}-${resumeId}-pdf`;
    
    // Check if URL is in cache and not expired
    if (urlCache[cacheKey] && urlCache[cacheKey].expires > Date.now()) {
      return urlCache[cacheKey].url;
    }
    
    const path = generateResumePath(userId, resumeId);
    
    // Create a signed URL for the file
    const { data, error } = await supabase.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(path, 60 * 60); // 1 hour expiration
    
    if (error || !data?.signedUrl) {
      throw new Error(`Failed to get PDF URL: ${error?.message || 'No URL returned'}`);
    }
    
    // Cache the URL
    urlCache[cacheKey] = {
      url: data.signedUrl,
      expires: Date.now() + CACHE_DURATION,
    };
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error in getPdfUrl:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to get PDF URL');
  }
}

/**
 * Downloads a PDF as a blob
 * @param resumeId Resume ID
 * @param userId User ID
 * @returns Promise resolving to the PDF blob
 */
export async function downloadPdf(resumeId: string, userId: string): Promise<Blob> {
  try {
    const exists = await checkPdfExists(resumeId, userId);
    if (!exists) {
      throw new Error('PDF not found');
    }
    
    const url = await getPdfUrl(resumeId, userId);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error in downloadPdf:', error);
    toast({
      title: 'Download Failed',
      description: error instanceof Error ? error.message : 'Failed to download PDF',
      variant: 'destructive',
    });
    throw error;
  }
}

/**
 * Checks if a PDF exists
 * @param resumeId Resume ID
 * @param userId User ID
 * @returns Promise resolving to true if the PDF exists
 */
export async function checkPdfExists(resumeId: string, userId: string): Promise<boolean> {
  return checkResumeExists(userId, resumeId);
}

/**
 * Uploads a PDF from a blob
 * @param blob Blob data
 * @param fileName File name
 * @param resumeId Resume ID
 * @param userId User ID
 * @returns Promise resolving to the URL of the uploaded PDF
 */
export async function uploadPdfFromBlob(
  blob: Blob, 
  fileName: string, 
  resumeId: string, 
  userId: string
): Promise<string> {
  const file = new File([blob], fileName, { type: 'application/pdf' });
  return uploadPdf(file, resumeId, userId);
}
