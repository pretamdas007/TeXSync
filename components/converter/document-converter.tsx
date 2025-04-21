"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConversionResult } from "@/lib/types";

export function DocumentConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if file is .docx or .pdf
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExt !== 'docx' && fileExt !== 'pdf') {
        toast({
          title: "Invalid file format",
          description: "Please upload a .docx or .pdf file",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      setResult(null);
    }
  };
  
  const handleConversion = () => {
    if (!file) return;
    
    setIsConverting(true);
    
    // Simulate conversion process
    setTimeout(() => {
      setIsConverting(false);
      
      // For demo purposes, random success/fail with dummy content
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        setResult({
          status: 'success',
          content: `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\title{${file.name.replace(/\.[^/.]+$/, '')}}
\\author{TeXSync User}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
This is the converted content of your document.

\\section{Content}
Your document has been successfully converted to LaTeX format.

\\end{document}`
        });
        
        toast({
          title: "Conversion successful",
          description: "Your document has been converted to LaTeX",
        });
      } else {
        setResult({
          status: 'error',
          error: "There was an error processing your document. Please try again."
        });
        
        toast({
          title: "Conversion failed",
          description: "There was an error converting your document",
          variant: "destructive",
        });
      }
    }, 2000);
  };
  
  const handleDownload = () => {
    if (!result?.content) return;
    
    const element = document.createElement("a");
    const file = new Blob([result.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "converted-document.tex";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Document Converter</CardTitle>
        <CardDescription>
          Convert .docx or .pdf files to structured LaTeX code
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!result ? (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-800 rounded-lg p-10 text-center">
              <FileUp className="h-10 w-10 text-gray-500 mx-auto mb-4" />
              <p className="text-sm text-gray-500 mb-2">
                Drag and drop your document here, or click to browse
              </p>
              <input
                type="file"
                className="hidden"
                id="file-upload"
                onChange={handleFileChange}
                accept=".docx,.pdf"
              />
              <Button asChild variant="outline" className="mt-2">
                <label htmlFor="file-upload">Browse Files</label>
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
                  {isConverting ? "Converting..." : "Convert"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {result.status === 'success' ? (
              <>
                <div className="bg-gray-900 p-4 rounded-lg overflow-auto max-h-96">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {result.content}
                  </pre>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setResult(null)}>
                    Convert Another
                  </Button>
                  <Button onClick={handleDownload}>
                    Download .tex File
                  </Button>
                </div>
              </>
            ) : (
              <div className="bg-red-950/30 border border-red-900 p-4 rounded-lg flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-500">Conversion Failed</h4>
                  <p className="text-sm text-gray-400 mt-1">{result.error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setResult(null)}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}