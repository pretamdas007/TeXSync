"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Cookies from 'js-cookie';

// Define types
interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, redirectTo?: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, redirectTo?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { toast } = useToast();  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[AUTH PROVIDER] Starting initial auth check...');
      const storedToken = Cookies.get('auth_token');
      console.log('[AUTH PROVIDER] Stored token:', storedToken ? 'found' : 'not found');
      
      if (storedToken) {
        try {
          console.log('[AUTH PROVIDER] Validating stored token...');
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('[AUTH PROVIDER] Token validation successful, setting user:', data.user);
            setUser(data.user);
            setToken(storedToken);
          } else {
            console.log('[AUTH PROVIDER] Token validation failed, clearing token');
            // Clear invalid token
            Cookies.remove('auth_token');
          }
        } catch (error) {
          console.error('[AUTH PROVIDER] Error checking authentication:', error);
          Cookies.remove('auth_token');
        }
      }
      
      console.log('[AUTH PROVIDER] Initial auth check completed, setting isLoading to false');
      setIsLoading(false);
    };

    checkAuth();
  }, []);
  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('[AUTH PROVIDER] Login function called with email:', email);
    setIsLoading(true);
    
    try {
      console.log('[AUTH PROVIDER] Making API request to /api/auth/login...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('[AUTH PROVIDER] API response:', { 
        status: response.status, 
        ok: response.ok, 
        data: data 
      });

      if (response.ok) {
        console.log('[AUTH PROVIDER] Login successful, updating state...');
        console.log('[AUTH PROVIDER] User data:', data.user);
        console.log('[AUTH PROVIDER] Token:', data.token ? 'received' : 'missing');
          // Update state
        setUser(data.user);
        setToken(data.token);
        
        // Set cookie for authentication
        Cookies.set('auth_token', data.token, { 
          expires: 7, 
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        console.log('[AUTH PROVIDER] Cookie set successfully');
        
        // Give a small delay to ensure cookie is written and state is updated
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Show success toast
        toast({
          title: "Logged in successfully",
          description: "Welcome back to TeXSync!",
        });
        
        setIsLoading(false);
        
        // Verify state update
        console.log('[AUTH PROVIDER] Final state check:', {
          userSet: !!data.user,
          tokenSet: !!data.token
        });
        
        return true;
      } else {
        console.log('[AUTH PROVIDER] Login failed:', data.error);
        toast({
          title: "Login failed",
          description: data.error || "Invalid email or password.",
          variant: "destructive",
        });
        
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('[AUTH PROVIDER] Login error:', error);
      
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      
      setIsLoading(false);
      return false;
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        
        // Set cookie for authentication
        Cookies.set('auth_token', data.token, { 
          expires: 7, 
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        toast({
          title: "Account created successfully",
          description: "Welcome to TeXSync! You can now start creating documents.",
        });
        
        setIsLoading(false);
        return true;
      } else {
        toast({
          title: "Signup failed",
          description: data.error || "There was a problem creating your account.",
          variant: "destructive",
        });
        
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove('auth_token');
    router.push('/login');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  // Debug logging for state changes
  useEffect(() => {
    console.log('[AUTH PROVIDER] Auth state changed:', {
      user: user ? { id: user.id, email: user.email } : null,
      token: token ? 'present' : 'absent',
      isLoading
    });
  }, [user, token, isLoading]);

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
