"use client";

import { useState } from "react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { FileUp, FileText, AlertCircle, Download, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SmartConversionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedContent, setConvertedContent] = useState<string | null>(null);
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
    try {
      // Simulated conversion for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const demoContent = `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\title{${file.name.replace(/\.[^/.]+$/, '')}}
\\author{TeXSync User}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
This document was automatically converted from ${file.name} using TeXSync's smart conversion system.

\\section{Content}
The original content has been preserved and formatted according to LaTeX conventions.

\\begin{itemize}
  \\item Automatic structure detection
  \\item Mathematical formula conversion
  \\item Figure and table preservation
  \\item Bibliography handling
\\end{itemize}

\\end{document}`;

      setConvertedContent(demoContent);
      toast({
        title: "Conversion successful",
        description: "Your document has been converted to LaTeX format",
      });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "There was an error converting your document",
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
    if (convertedContent) {
      const element = document.createElement("a");
      const file = new Blob([convertedContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${file?.name.replace(/\.[^/.]+$/, '')}.tex`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
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
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Smart Document Conversion</h1>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
          Upload your Word documents or PDFs and our intelligent system will convert them to 
          properly structured LaTeX code that you can edit in TeXSync.
        </p>

        <div className="max-w-4xl mx-auto">
          {!convertedContent ? (
            <div className="space-y-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed ${
                  isDragActive ? 'border-red-600' : 'border-gray-800'
                } rounded-lg p-10 text-center transition-colors duration-200 cursor-pointer`}
              >
                <input {...getInputProps()} />
                <FileUp className="h-10 w-10 text-gray-500 mx-auto mb-4" />
                <p className="text-sm text-gray-500 mb-2">
                  {isDragActive
                    ? "Drop your document here"
                    : "Drag and drop your document here, or click to browse"}
                </p>
                <Button variant="outline" className="mt-2">
                  Browse Files
                </Button>
              </div>

              {file && (
                <div className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-red-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleConversion}
                    disabled={isConverting}
                  >
                    {isConverting ? "Converting..." : "Convert to LaTeX"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Converted LaTeX Code</h3>
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
                }}>
                  Convert Another Document
                </Button>
                <Button asChild>
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