
import { setupStorage } from './supabaseSetup';

let initialized = false;

/**
 * Initializes the application
 * - Sets up storage buckets and policies
 * - Performs any other necessary initialization tasks
 */
export async function initializeApp(): Promise<void> {
  if (initialized) {
    return;
  }
  
  try {
    // Set up storage
    await setupStorage();
    
    // Add any other initialization tasks here
    
    initialized = true;
    console.log('App initialization complete');
  } catch (error) {
    console.error('App initialization failed:', error);
  }
}
