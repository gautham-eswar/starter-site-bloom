import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/components/auth/AuthProvider';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Check for error parameter in URL (from OAuth redirect)
  useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      toast({
        title: 'Authentication error',
        description: errorDescription || 'There was an error during authentication',
        variant: 'destructive',
      });
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleEmailAuth = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { email, password } = values;
      
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          }
        });
        
        if (error) throw error;
        
        toast({
          title: 'Sign up successful',
          description: 'Please check your email for a confirmation link.',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: 'Sign in successful',
          description: 'Welcome back!',
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: 'Authentication error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            prompt: 'select_account',
          }
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Google auth error:", error);
      toast({
        title: 'Google authentication error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-draft-bg flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-medium text-draft-green dark:text-draft-yellow">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="mt-3 text-draft-text dark:text-gray-300 opacity-70">
              {isSignUp 
                ? 'Sign up to start creating better resumes' 
                : 'Sign in to continue with your resume optimization'}
            </p>
          </div>

          <div className="bg-white dark:bg-draft-footer/30 p-8 rounded-lg shadow-sm border border-[#e6e6e0] dark:border-draft-footer">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEmailAuth)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-draft-green dark:text-draft-yellow">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your@email.com" 
                          disabled={isLoading}
                          className="bg-[#F7F4ED] dark:bg-draft-footer/50 border-[#e6e6e0] dark:border-draft-footer"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-draft-green dark:text-draft-yellow">Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="••••••••" 
                          type="password" 
                          disabled={isLoading}
                          className="bg-[#F7F4ED] dark:bg-draft-footer/50 border-[#e6e6e0] dark:border-draft-footer"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#0A2218] text-white hover:bg-[#0A2218]/90 dark:bg-draft-yellow dark:text-draft-green dark:hover:bg-draft-yellow/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </Button>
              </form>
            </Form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e6e6e0] dark:border-draft-footer"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white dark:bg-draft-footer/30 px-4 text-sm text-draft-text dark:text-gray-300 opacity-70">
                  or continue with
                </span>
              </div>
            </div>
            
            <Button 
              onClick={handleGoogleAuth} 
              variant="outline" 
              className="w-full border-[#e6e6e0] dark:border-draft-footer hover:bg-[#F7F4ED] dark:hover:bg-draft-footer/50"
              disabled={isLoading}
            >
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" className="w-5 h-5 mr-2" alt="Google logo" />
              Google
            </Button>
            
            <div className="mt-6 text-center text-sm">
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)} 
                className="text-draft-green dark:text-draft-yellow hover:underline focus:outline-none"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
