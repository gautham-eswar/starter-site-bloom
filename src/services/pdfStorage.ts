
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
        cacheControl: '3600', // Keep browser cache for 1 hour
        upsert: true, // Overwrite if file exists
        contentType: file.type || 'application/pdf' // Set content type
      });
    
    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }
    
    // Get the URL of the uploaded file
    // We'll get a signed URL for viewing, as public URLs might have caching/content-type issues
    // as seen, unless metadata is perfectly set.
    const url = await getPdfUrl(resumeId, userId); 
    if (!url) {
      throw new Error('Failed to get URL for uploaded PDF');
    }
    
    // Invalidate any cached URL for this PDF after upload
    const cacheKey = `${userId}-${resumeId}-pdf`;
    delete urlCache[cacheKey];
    
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
    console.log(`[getPdfUrl] Starting with resumeId: ${resumeId}, userId: ${userId}`);
    
    const cacheKey = `${userId}-${resumeId}-pdf`;
    
    // Check if URL is in cache and not expired
    if (urlCache[cacheKey] && urlCache[cacheKey].expires > Date.now()) {
      console.log(`[getPdfUrl] Using cached URL for ${resumeId}`);
      return urlCache[cacheKey].url;
    }
    
    const path = generateResumePath(userId, resumeId);
    console.log(`[getPdfUrl] Generated path: ${path}`);
    
    // First check if the file exists
    const exists = await checkResumeExists(userId, resumeId, 'pdf');
    console.log(`[getPdfUrl] File exists check: ${exists}`);
    
    if (!exists) {
      console.log(`[getPdfUrl] File does not exist at path: ${path}`);
      throw new Error(`PDF file not found at path: ${path}`);
    }
    
    // Create a signed URL for the file with exactly 1 hour expiration
    const { getResumeUrl } = await import('./supabaseSetup');
    const signedUrl = await getResumeUrl(userId, resumeId, 'pdf', false);
    console.log(`[getPdfUrl] getResumeUrl returned: ${signedUrl}`);

    if (!signedUrl) {
      throw new Error('Failed to get PDF URL: No URL returned from getResumeUrl');
    }
    
    // Cache the URL
    urlCache[cacheKey] = {
      url: signedUrl,
      expires: Date.now() + CACHE_DURATION,
    };
    
    console.log(`[getPdfUrl] Successfully generated and cached URL for ${resumeId}`);
    return signedUrl;
  } catch (error) {
    console.error('[getPdfUrl] Error:', error);
    // Ensure a more specific error is thrown if it's not already an error object
    const thrownError = error instanceof Error ? error : new Error('Failed to get PDF URL');
    // Log the specific error message if available
    if (thrownError.message.includes('No URL returned')) {
         console.error('[getPdfUrl] Detailed error: getResumeUrl in supabaseSetup returned null.');
    }
    throw thrownError;
  }
}

/**
 * Downloads a PDF by opening the signed URL in a new tab
 * @param resumeId Resume ID
 * @param userId User ID
 */
export async function downloadPdf(resumeId: string, userId: string): Promise<void> {
  try {
    const exists = await checkPdfExists(resumeId, userId);
    if (!exists) {
      toast({
        title: 'File Not Found',
        description: 'The PDF file does not seem to exist in storage.',
        variant: 'destructive',
      });
      throw new Error('PDF not found');
    }
    
    // Get a signed URL specifically for downloading
    const url = await import('./supabaseSetup').then(module => module.getResumeUrl(userId, resumeId, 'pdf', true));

    if (!url) {
      toast({
        title: 'Download Failed',
        description: 'Could not generate a download link for the PDF.',
        variant: 'destructive',
      });
      throw new Error('Failed to get download URL for PDF');
    }
    
    // Open URL in new tab
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error in downloadPdf:', error);
    if (!(error instanceof Error && error.message.includes('Failed to get download URL'))) {
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred while preparing the PDF for download.',
        variant: 'destructive',
      });
    }
    // Re-throw to allow higher-level error handling if needed
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
  // This function directly uses checkResumeExists from supabaseSetup
  // which handles PDF existence checks.
  return checkResumeExists(userId, resumeId, 'pdf');
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
  // Ensure the file type is explicitly application/pdf for blobs
  const file = new File([blob], fileName, { type: 'application/pdf' });
  return uploadPdf(file, resumeId, userId);
}
