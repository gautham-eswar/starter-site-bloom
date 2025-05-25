import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Storage bucket name for resume PDFs
 */
export const RESUME_BUCKET = 'resume-pdfs';

// Removed CustomStorageError interface

/**
 * Sets up the necessary Supabase storage buckets and policies
 * This function checks if the required buckets exist and creates them if needed
 */
export async function setupStorage(): Promise<boolean> {
  try {
    // Check if the resume-pdfs bucket exists
    const { data: buckets, error: fetchError } = await supabase.storage.listBuckets();
    
    if (fetchError) {
      console.error('Error fetching storage buckets:', fetchError);
      return false;
    }
    
    const resumeBucketExists = buckets.some(bucket => bucket.name === RESUME_BUCKET);
    
    if (!resumeBucketExists) {
      // Bucket already created via SQL migration, but we're adding this check for safety
      console.warn('Resume bucket not found. It should have been created by the SQL migration.');
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up storage:', error);
    toast({
      title: 'Storage Setup Failed',
      description: 'Failed to initialize storage. Some features may not work correctly.',
      variant: 'destructive',
    });
    return false;
  }
}

/**
 * Generates the storage path for a resume PDF
 * Following the exact structure: resume-pdfs/{userId}/{resumeId}/enhanced_resume_{resumeId}.pdf
 * @param userId User ID
 * @param resumeId Resume ID
 * @param format File format (pdf or docx)
 * @returns Storage path
 */
export function generateResumePath(userId: string, resumeId: string, format: 'pdf' | 'docx' = 'pdf'): string {
  return `${userId}/${resumeId}/enhanced_resume_${resumeId}.${format}`;
}

/**
 * Checks if a resume PDF exists at the given path
 * @param userId User ID
 * @param resumeId Resume ID
 * @param format File format (pdf or docx)
 * @returns Promise resolving to boolean indicating if file exists
 */
export async function checkResumeExists(userId: string, resumeId: string, format: 'pdf' | 'docx' = 'pdf'): Promise<boolean> {
  try {
    const path = generateResumePath(userId, resumeId, format);
    
    // Use .list() with prefix instead of getMetadata to check if file exists
    const { data, error } = await supabase.storage
      .from(RESUME_BUCKET)
      .list(path.split('/').slice(0, -1).join('/'), {
        limit: 1,
        search: path.split('/').pop() || ''
      });
    
    if (error) {
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Gets a URL for a resume PDF
 * @param userId User ID
 * @param resumeId Resume ID
 * @param format File format (pdf or docx)
 * @param download Whether to get a download URL
 * @returns Promise resolving to URL string
 */
export async function getResumeUrl(
  userId: string, 
  resumeId: string, 
  format: 'pdf' | 'docx' = 'pdf',
  download: boolean = false
): Promise<string | null> {
  try {
    const path = generateResumePath(userId, resumeId, format);
    const { data, error } = await supabase.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(path, 60 * 60, { download: download ? `enhanced_resume_${resumeId}.${format}` : undefined });
    
    if (error || !data?.signedUrl) {
      console.error('Error getting signed URL:', error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting resume URL:', error);
    return null;
  }
}

/**
 * Verifies if a resume JSON exists in the database
 * @param resumeId Resume ID to check
 * @returns Promise resolving to the resume data if found, null otherwise
 */
export async function verifyResumeJsonExists(resumeId: string): Promise<{ id: string; user_id: string; name: string | null } | null> {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('id, user_id, data->name')
      .eq('id', resumeId)
      .single();
    
    if (error || !data) {
      console.error('Error verifying resume JSON:', error);
      return null;
    }
    
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name
    };
  } catch (error) {
    console.error('Error verifying resume JSON:', error);
    return null;
  }
}

/**
 * Gets PDF metadata from storage
 * @param userId User ID
 * @param resumeId Resume ID
 * @returns Promise resolving to metadata object or null
 */
export async function getPdfMetadata(userId: string, resumeId: string): Promise<{size: number, lastModified: string} | null> {
  try {
    const path = generateResumePath(userId, resumeId);
    
    const { data, error } = await supabase.storage
      .from(RESUME_BUCKET)
      .list(path.split('/').slice(0, -1).join('/'), {
        limit: 1,
        search: path.split('/').pop() || ''
      });
    
    if (error || !data || data.length === 0) {
      return null;
    }
    
    const fileData = data[0];
    
    return {
      size: fileData.metadata?.size || 0,
      lastModified: fileData.metadata?.lastModified || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting PDF metadata:', error);
    return null;
  }
}

/**
 * Define a more specific error type for storage uploads, extending Error
 */
interface SupabaseStorageUploadError extends Error {
  status?: number; // HTTP status code, if available from the error
}

/**
 * Upload a PDF from a Blob or File to storage
 * @param blob Blob or File to upload
 * @param userId User ID
 * @param resumeId Resume ID
 * @returns Promise resolving to the URL of the uploaded file or null on error
 */
export async function uploadPdf(blob: Blob | File, userId: string, resumeId: string): Promise<string | null> {
  try {
    const path = generateResumePath(userId, resumeId);
    
    // Explicitly type the expected result of the upload operation
    const uploadResult: { 
      data: { path: string } | null; 
      error: SupabaseStorageUploadError | null; // Use the more specific error interface
    } = await supabase.storage
        .from(RESUME_BUCKET)
        .upload(path, blob, {
          cacheControl: '3600',
          upsert: true, // Creates the file if it does not exist, or replaces it if it does.
        });

    // Access properties directly instead of destructuring
    if (uploadResult.error) {
      console.error('Error uploading PDF:', uploadResult.error);
      toast({
        title: 'PDF Upload Failed',
        description: uploadResult.error.message || 'Could not upload the PDF file.',
        variant: 'destructive',
      });
      return null;
    }
    
    if (!uploadResult.data || !uploadResult.data.path) {
      console.error('Error uploading PDF: No path returned in data despite successful upload status.');
      toast({
        title: 'PDF Upload Failed',
        description: 'Upload was reported as successful, but no file path was returned.',
        variant: 'destructive',
      });
      return null;
    }
    
    console.log('Successfully uploaded PDF, path:', uploadResult.data.path);
    return await getResumeUrl(userId, resumeId, 'pdf'); // Specify format for getResumeUrl
  } catch (error) {
    console.error('Error in uploadPdf function (outer catch):', error);
    let errorMessage = 'An unexpected error occurred during upload.';
    if (error instanceof Error) { 
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = String((error as { message: unknown }).message);
    }
    toast({
      title: 'PDF Upload Failed',
      description: errorMessage,
      variant: 'destructive',
    });
    return null;
  }
}
