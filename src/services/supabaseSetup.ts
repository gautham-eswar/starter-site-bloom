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
 * Following the structure: Resumes/{userId}/{resumeId}/enhanced_resume_{resumeId}.pdf
 * @param userId User ID
 * @param resumeId Resume ID (typically the enhanced_resume_id)
 * @param format File format (pdf or docx)
 * @returns Storage path
 */
export function generateResumePath(userId: string, resumeId: string, format: 'pdf' | 'docx' = 'pdf'): string {
  return `Resumes/${userId}/${resumeId}/enhanced_resume_${resumeId}.${format}`;
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
 * @param download Whether to get a download URL (forces download if true)
 * @returns Promise resolving to URL string
 */
export async function getResumeUrl(
  userId: string, 
  resumeId: string, 
  format: 'pdf' | 'docx' = 'pdf',
  download: boolean = false // Default is false, meaning for viewing
): Promise<string | null> {
  try {
    const path = generateResumePath(userId, resumeId, format);
    
    // Prepare options for createSignedUrl.
    // Only include the 'download' property if download is explicitly true.
    // An empty options object or omitting options should result in a URL for inline viewing.
    const signedUrlOptions: { download?: string } = {};
    if (download) {
      signedUrlOptions.download = `enhanced_resume_${resumeId}.${format}`;
    }
    
    const { data, error } = await supabase.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(path, 60 * 60, signedUrlOptions); // Pass the conditionally built options
    
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
    const { data: resumeRow, error } = await supabase
      .from('resumes')
      .select('id, user_id, data') // Changed from 'data->name'
      .eq('id', resumeId)
      .single();
    
    if (error || !resumeRow) {
      // It's possible the resume simply doesn't exist, which isn't always an error to log loudly.
      // console.error('Error verifying resume JSON or resume not found:', error); 
      return null;
    }
    
    // resumeRow.data is the JSONB field. It is of type `Json | null`.
    const jsonData = resumeRow.data;
    let nameValue: string | null = null;

    // Check if jsonData is a non-null object and has a 'name' property
    if (jsonData && typeof jsonData === 'object' && !Array.isArray(jsonData) && jsonData !== null) {
      if (Object.prototype.hasOwnProperty.call(jsonData, 'name')) {
        const parsedName = jsonData.name; // Access the 'name' property
        if (typeof parsedName === 'string') {
          nameValue = parsedName;
        } else if (parsedName === null) {
          // Explicitly allow null if the 'name' property is null
          nameValue = null;
        }
        // If jsonData.name is undefined or some other type, nameValue remains null as initialized.
      }
    }
    
    return {
      id: resumeRow.id,
      user_id: resumeRow.user_id,
      name: nameValue, // Use the extracted and type-checked name
    };
  } catch (error) {
    console.error('Exception in verifyResumeJsonExists:', error);
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
