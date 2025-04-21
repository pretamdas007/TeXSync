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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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
  const { toast } = useToast();
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
    
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      
      if (Math.random() > 0.2) { // Simulate success (80% of the time)
        toast({
          title: isLogin ? "Logged in successfully" : "Account created successfully",
          description: isLogin 
            ? "Welcome back to TeXSync!" 
            : "Welcome to TeXSync! You can now start creating documents.",
        });
        
        // Redirect to dashboard/editor
        router.push("/editor");
      } else { // Simulate error
        toast({
          title: "An error occurred",
          description: isLogin 
            ? "Invalid email or password." 
            : "There was a problem creating your account. Please try again.",
          variant: "destructive",
        });
      }
    }, 1500);
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