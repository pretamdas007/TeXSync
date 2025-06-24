"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

type AuthMode = "login" | "signup";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const router = useRouter();
  
  const isLogin = mode === "login";
  const formSchema = isLogin ? loginSchema : signupSchema;
  
  const form = useForm<LoginFormValues | SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isLogin 
      ? { email: "", password: "" }
      : { name: "", email: "", password: "", confirmPassword: "" },
  });
  
  const onSubmit = async (values: LoginFormValues | SignupFormValues) => {
    setIsLoading(true);
    
    try {
      let success = false;
      
      console.log('[AUTH FORM] Starting authentication process...');
      console.log('[AUTH FORM] Mode:', mode);
      console.log('[AUTH FORM] Form values:', { email: values.email, ...(isLogin ? {} : { name: (values as SignupFormValues).name }) });
      
      if (isLogin) {
        console.log('[AUTH FORM] Calling login function...');
        success = await login(values.email, values.password);
        console.log('[AUTH FORM] Login function completed, success:', success);
      } else {
        const signupValues = values as SignupFormValues;
        console.log('[AUTH FORM] Calling signup function...');
        success = await signup(signupValues.name, signupValues.email, signupValues.password);
        console.log('[AUTH FORM] Signup function completed, success:', success);
      }
      
      if (success) {
        console.log('[AUTH FORM] Authentication successful, preparing navigation...');
        
        // Get callback URL
        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get('callbackUrl') || '/editor';
        console.log('[AUTH FORM] Navigation target:', callbackUrl);
        
        // Give the auth provider a moment to update state before navigating
        console.log('[AUTH FORM] Waiting for auth state to propagate...');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Use router.push for client-side navigation first, then fallback to window.location
        console.log('[AUTH FORM] Attempting client-side navigation to:', callbackUrl);
        try {
          router.push(callbackUrl);
          
          // If client-side navigation doesn't work after a short delay, use window.location as fallback
          setTimeout(() => {
            console.log('[AUTH FORM] Fallback navigation with window.location.href');
            window.location.href = callbackUrl;
          }, 500);
        } catch (err) {
          console.log('[AUTH FORM] Client-side navigation failed, using window.location.href');
          window.location.href = callbackUrl;
        }
        return; // Don't continue execution
      } else {
        console.log('[AUTH FORM] Authentication failed');
      }
    } catch (error) {
      console.error('[AUTH FORM] Error in form submission:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-md">
        {!isLogin && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} disabled={isLoading} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {!isLogin && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading 
            ? (isLogin ? "Logging in..." : "Creating account...") 
            : (isLogin ? "Log in" : "Sign up")}
        </Button>
      </form>
    </Form>
  );
}