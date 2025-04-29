"use client";

import { useState } from "react";
import { Button, Progress, Logo } from "@/components/client-wrappers";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { 
  FileUp, FileText, AlertCircle, Download, Copy, 
  Sparkles, Loader2, FileType2, Bot
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { convertToLatex } from "@/lib/gemini";

export default function SmartConversionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedContent, setConvertedContent] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [conversionStage, setConversionStage] = useState("");
  const { toast } = useToast();

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      if (fileType !== 'docx' && fileType !== 'pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a .docx or .pdf file",
          variant: "destructive",
        });
        return;
      }
      setFile(file);
      setConvertedContent(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const handleConversion = async () => {
    if (!file) return;

    setIsConverting(true);
    setProgress(0);
    
    try {
      // Simulate conversion stages with progress updates
      const updateProgress = (stage: string, value: number) => {
        setConversionStage(stage);
        setProgress(value);
      };

      // Processing stages
      updateProgress("Analyzing document structure...", 10);
      await sleep(800);
      
      updateProgress("Extracting text content...", 25);
      await sleep(600);
      
      updateProgress("Processing mathematical formulas...", 40);
      await sleep(1000);
      
      updateProgress("Converting to LaTeX format...", 60);
      await sleep(700);
      
      updateProgress("Generating structured document...", 80);
      
      // Actual Gemini API conversion
      const latexContent = await convertToLatex(file);
      
      updateProgress("Finalizing conversion...", 95);
      await sleep(300);
      
      setConvertedContent(latexContent);
      updateProgress("Conversion complete!", 100);
      
      toast({
        title: "Conversion successful",
        description: "Your document has been converted to LaTeX using AI",
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "There was an error converting your document",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const copyToClipboard = () => {
    if (convertedContent) {
      navigator.clipboard.writeText(convertedContent);
      toast({
        title: "Copied to clipboard",
        description: "The LaTeX code has been copied to your clipboard",
      });
    }
  };

  const downloadTeX = () => {
    if (convertedContent && file) {
      const element = document.createElement("a");
      const fileBlob = new Blob([convertedContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(fileBlob);
      element.download = `${file.name.replace(/\.[^/.]+$/, '')}.tex`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  // Helper function to simulate processing time
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
        <h1 className="text-3xl font-bold text-center mb-4">AI-Powered Document Conversion</h1>
        <div className="flex items-center justify-center mb-8 gap-2">
          <Sparkles className="h-5 w-5 text-red-500" />
          <p className="text-red-500 text-sm font-medium">Powered by Google's Gemini AI</p>
        </div>
        
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
          Upload your Word documents or PDFs and our AI system will intelligently convert them to 
          properly structured LaTeX code with accurate formatting of text, math, and tables.
        </p>

        <div className="max-w-4xl mx-auto">
          {!convertedContent ? (
            <div className="space-y-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed ${
                  isDragActive ? 'border-red-600 bg-red-950/10' : 'border-gray-800'
                } rounded-lg p-10 text-center transition-colors duration-200 cursor-pointer hover:border-red-600/70 hover:bg-red-950/5`}
              >
                <input {...getInputProps()} />
                <FileUp className="h-10 w-10 text-gray-500 mx-auto mb-4" />
                <p className="text-sm text-gray-500 mb-2">
                  {isDragActive
                    ? "Drop your document here"
                    : "Drag and drop your document here, or click to browse"}
                </p>
                <p className="text-xs text-gray-600 mb-3">Supports .docx and .pdf files</p>
                <Button variant="outline" className="mt-2">
                  Browse Files
                </Button>
              </div>

              {file && (
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {file.name.endsWith('.pdf') ? (
                        <FileType2 className="h-6 w-6 text-red-500" />
                      ) : (
                        <FileText className="h-6 w-6 text-blue-500" />
                      )}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB · {file.type}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleConversion}
                      disabled={isConverting}
                      className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border-none"
                    >
                      {isConverting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Convert with AI
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {isConverting && (
                    <div className="mt-4 space-y-2 bg-gray-950 p-4 rounded-md border border-gray-800">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-red-500 animate-pulse" />
                          <span className="text-sm font-medium">{conversionStage}</span>
                        </div>
                        <span className="text-xs text-gray-500">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1" indicatorClassName="bg-gradient-to-r from-red-600 to-red-400" />
                    </div>
                  )}
                </div>
              )}
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mt-8">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-red-500" />
                  AI-Powered Conversion Features
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-red-500/20 p-1 mt-0.5">
                      <svg className="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-300">Mathematical formula detection and conversion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-red-500/20 p-1 mt-0.5">
                      <svg className="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-300">Table structure preservation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-red-500/20 p-1 mt-0.5">
                      <svg className="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-300">Smart document structure detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-red-500/20 p-1 mt-0.5">
                      <svg className="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-300">Bibliography and citation handling</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Converted LaTeX Code</h3>
                    <span className="bg-gradient-to-r from-red-600 to-red-800 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI Generated
                    </span>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadTeX}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <pre className="text-sm font-mono whitespace-pre-wrap overflow-auto max-h-[60vh] p-4 bg-gray-950 rounded border border-gray-800">
                  {convertedContent}
                </pre>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => {
                  setFile(null);
                  setConvertedContent(null);
                  setProgress(0);
                }}>
                  Convert Another Document
                </Button>
                <Button 
                  className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border-none"
                  asChild
                >
                  <Link href="/editor">
                    Open in Editor
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
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