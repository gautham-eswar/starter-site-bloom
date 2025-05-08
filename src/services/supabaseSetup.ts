
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Storage bucket name for resume PDFs
 */
export const RESUME_BUCKET = 'resume-pdfs';

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
