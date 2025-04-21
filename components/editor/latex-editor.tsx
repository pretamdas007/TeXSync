"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { CompilationStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  Bold, Italic, List, ListOrdered, Image, 
  AlignLeft, Table, Link as LinkIcon,
  Wand2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_LATEX = `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\title{My First Document}
\\author{TeXSync User}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
This is a sample LaTeX document created with TeXSync.

\\section{Equations}
LaTeX is great for typesetting mathematics:
\\begin{equation}
  E = mc^2
\\end{equation}

\\section{Lists}
\\begin{itemize}
  \\item Item 1
  \\item Item 2
  \\item Item 3
\\end{itemize}

\\end{document}`;

const COMPILATION_DELAY = 1000; // 1 second delay for compilation

export function LaTeXEditor() {
  const [content, setContent] = useState(DEFAULT_LATEX);
  const [compilationStatus, setCompilationStatus] = useState<CompilationStatus>("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastCompiledContent, setLastCompiledContent] = useState(content);
  const { toast } = useToast();
  
  // Memoized compilation function
  const compile = useCallback(async () => {
    if (content === lastCompiledContent) {
      return; // Skip if content hasn't changed since last compilation
    }

    setCompilationStatus("compiling");
    
    try {
      // Simulate compilation process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLastCompiledContent(content);
      setCompilationStatus("success");
      
      // Show success toast only for manual compilations
      if (content !== lastCompiledContent) {
        toast({
          title: "Compilation successful",
          description: "Your document has been updated",
        });
      }
    } catch (error) {
      setCompilationStatus("error");
      toast({
        title: "Compilation failed",
        description: "There was an error compiling your document",
        variant: "destructive",
      });
    }
  }, [content, lastCompiledContent, toast]);

  // Auto-compilation effect with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== lastCompiledContent) {
        compile();
      }
    }, COMPILATION_DELAY);

    return () => clearTimeout(timer);
  }, [content, lastCompiledContent, compile]);

  // Manual compilation handler
  const handleManualCompile = () => {
    compile();
  };

  // AI writing analysis
  const analyzeWriting = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      const demoSuggestions = [
        "Consider rephrasing 'This is a sample' to be more engaging",
        "Add more context to the Introduction section",
        "The equation could benefit from additional explanation",
        "Consider using a more descriptive list structure",
      ];
      setSuggestions(demoSuggestions);
      setIsAnalyzing(false);
      
      toast({
        title: "Writing Analysis Complete",
        description: "Review the suggestions to improve your document",
      });
    }, 2000);
  };
  
  const insertTemplate = (template: string) => {
    setContent((prev) => prev + template);
  };

  return (
    <div className="h-full">
      <div className="border-b border-gray-800 p-2 flex items-center gap-1 overflow-x-auto">
        <ToolbarButton icon={<Bold size={16} />} tooltip="Bold" onClick={() => insertTemplate("\\textbf{}")} />
        <ToolbarButton icon={<Italic size={16} />} tooltip="Italic" onClick={() => insertTemplate("\\textit{}")} />
        <div className="h-4 w-px bg-gray-800 mx-1" />
        <ToolbarButton icon={<List size={16} />} tooltip="Bulleted List" onClick={() => insertTemplate("\n\\begin{itemize}\n  \\item \n\\end{itemize}")} />
        <ToolbarButton icon={<ListOrdered size={16} />} tooltip="Numbered List" onClick={() => insertTemplate("\n\\begin{enumerate}\n  \\item \n\\end{enumerate}")} />
        <div className="h-4 w-px bg-gray-800 mx-1" />
        <ToolbarButton icon={<Image size={16} />} tooltip="Insert Image" onClick={() => insertTemplate("\n\\includegraphics{image.png}")} />
        <ToolbarButton icon={<Table size={16} />} tooltip="Insert Table" onClick={() => insertTemplate("\n\\begin{table}\n  \\centering\n  \\begin{tabular}{cc}\n    Cell 1 & Cell 2 \\\\\n    Cell 3 & Cell 4 \\\\\n  \\end{tabular}\n  \\caption{Table caption}\n\\end{table}")} />
        <ToolbarButton icon={<AlignLeft size={16} />} tooltip="Section" onClick={() => insertTemplate("\n\\section{}")} />
        <ToolbarButton icon={<LinkIcon size={16} />} tooltip="Citation" onClick={() => insertTemplate("\\cite{}")} />
        <div className="h-4 w-px bg-gray-800 mx-1" />
        <Button
          variant="outline"
          size="sm"
          className="ml-auto mr-2"
          onClick={handleManualCompile}
          disabled={compilationStatus === "compiling"}
        >
          {compilationStatus === "compiling" ? "Compiling..." : "Compile"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={analyzeWriting}
          disabled={isAnalyzing}
        >
          <Wand2 size={16} className="mr-2" />
          {isAnalyzing ? "Analyzing..." : "Analyze Writing"}
        </Button>
      </div>
      
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
              <textarea
                className="w-full h-full p-4 bg-gray-950 font-mono text-sm resize-none outline-none border-0"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck="false"
              />
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70}>
              <div className="h-full flex flex-col bg-gray-950 p-4">
                {compilationStatus === "compiling" ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-400">Compiling document...</div>
                  </div>
                ) : compilationStatus === "success" ? (
                  <div className="overflow-auto">
                    <div className="prose prose-invert max-w-none">
                      <h1 className="text-2xl font-bold mb-4">My First Document</h1>
                      <div className="text-sm text-gray-400 mb-8">
                        TeXSync User • {new Date().toLocaleDateString()}
                      </div>
                      
                      <h2 className="text-xl font-semibold mb-4">Introduction</h2>
                      <p className="mb-6">
                        This is a sample LaTeX document created with TeXSync.
                      </p>
                      
                      <h2 className="text-xl font-semibold mb-4">Equations</h2>
                      <p className="mb-4">LaTeX is great for typesetting mathematics:</p>
                      <div className="bg-gray-900 p-4 rounded-lg mb-6 font-mono">
                        E = mc²
                      </div>
                      
                      <h2 className="text-xl font-semibold mb-4">Lists</h2>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Item 1</li>
                        <li>Item 2</li>
                        <li>Item 3</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-400">
                      {compilationStatus === "error" 
                        ? "Compilation failed. Check for errors." 
                        : "Click Compile to preview"}
                    </div>
                  </div>
                )}
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={30}>
              <div className="h-full bg-gray-950 p-4 overflow-auto">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Writing Suggestions</h3>
                {suggestions.length > 0 ? (
                  <ul className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <li 
                        key={index}
                        className="bg-gray-900 p-3 rounded-lg text-sm border border-gray-800"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    {isAnalyzing 
                      ? "Analyzing your writing..." 
                      : "Click 'Analyze Writing' to get suggestions"}
                  </p>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
}

function ToolbarButton({ icon, tooltip, onClick }: ToolbarButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onClick}
      title={tooltip}
    >
      {icon}
    </Button>
  );
}