import { Logo } from "@/components/common/logo";
import { AuthForm } from "@/components/auth/auth-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-800 bg-background">
        <div className="container mx-auto px-4 py-4">
          <Logo size="md" />
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create an account</h1>
            <p className="text-gray-400">Get started with TeXSync</p>
          </div>
          
          <AuthForm mode="signup" />
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <span>Already have an account? </span>
            <Link 
              href="/login" 
              className="text-red-600 hover:text-red-500 font-medium"
            >
              Log in
            </Link>
          </div>
          
          <div className="mt-12 text-center">
            <Button variant="ghost" asChild size="sm">
              <Link href="/">
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}