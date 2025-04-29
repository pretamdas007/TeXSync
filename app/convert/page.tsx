"use client";

import { DocumentConverter } from "@/components/converter/document-converter";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function ConvertPage() {
  const [isConverting, setIsConverting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [convertedContent, setConvertedContent] = useState("");

  const handleConversion = async () => {
    if (!file) return;
    
    setIsConverting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', file.type);
      
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setConvertedContent(data.latex);
      // Rest of your success handling
    } catch (error) {
      // Error handling
    } finally {
      setIsConverting(false);
    }
  };

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
            <Link href="/convert" className="hover:text-primary transition-colors">
              Document Converter
            </Link>
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