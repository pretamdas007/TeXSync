import { DocumentConverter } from "@/components/converter/document-converter";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ConvertPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-800 bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo size="md" />
          <div className="space-x-4">
            <Button variant="outline" asChild>
              <Link href="/editor">Open Editor</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Convert Documents to LaTeX</h1>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
          Upload your Word documents or PDFs and our intelligent system will convert them to 
          properly structured LaTeX code that you can edit in TeXSync.
        </p>
        
        <DocumentConverter />
      </main>
      
      <footer className="bg-black py-10 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo className="mb-4 md:mb-0" />
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} TeXSync. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}