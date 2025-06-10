"use client";

import { useState, useEffect, createContext, useCallback } from "react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { 
  Save, FileSymlink, Download, Settings, User, 
  ChevronLeft, ChevronRight, Share2, HomeIcon,
  Sparkles, X, FileText, Menu
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { AIChat } from "./ai-chat";
import { CompilationStatus } from "@/lib/types";
import Link from 'next/link';
import { useMediaQuery } from "@/hooks/use-media-query";
import FileExplorer, { FileItem, FileType } from "./file-explorer";

// Create a context to pass file content to children
export const FileContentContext = createContext<{
  fileContent: string;
  setFileContent: (content: string) => void;
  selectedFile: FileItem | null;
  compilationStatus?: CompilationStatus;
}>({
  fileContent: "",
  setFileContent: () => {},
  selectedFile: null
});

interface EditorLayoutProps {
  children: React.ReactNode;
}

export function EditorLayout({ children }: EditorLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAIChatMinimized, setIsAIChatMinimized] = useState(true);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationStatus, setCompilationStatus] = useState<CompilationStatus>('idle');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  
  // Add state for file content management
  const [selectedFile, setSelectedFile] = useState<FileItem | null>({
    id: "main",
    name: "main.tex",
    type: "tex",
    parentId: null
  });
  const [fileContent, setFileContent] = useState<string>("");

  // Responsive layout handling
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
    if (isMobile && isAIChatOpen && !isAIChatMinimized) {
      setIsAIChatMinimized(true);
    }
  }, [isMobile]);
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const toggleAIChat = useCallback(() => {
    if (isAIChatOpen) {
      // If chat is open but minimized, maximize it instead of closing
      if (isAIChatMinimized) {
        setIsAIChatMinimized(false);
      } else {
        // Otherwise close it
        setIsAIChatOpen(false);
      }
    } else {
      // Open the chat
      setIsAIChatOpen(true);
      setIsAIChatMinimized(false);
    }
  }, [isAIChatOpen, isAIChatMinimized]);
  
  const minimizeAIChat = useCallback(() => {
    setIsAIChatMinimized(true);
  }, []);
  
  const handleSave = () => {
    toast({
      title: "Document saved",
      description: "Your document has been saved successfully.",
    });
  };
  
  const handleCompile = () => {
    setIsCompiling(true);
    setCompilationStatus('compiling');
    setTimeout(() => {
      setIsCompiling(false);
      setCompilationStatus('success');
      toast({
        title: "Compilation complete",
        description: "Your document was compiled successfully.",
      });
    }, 1500);
  };

  const handleInsertCode = useCallback((code: string) => {
    setFileContent((prev) => {
      // Insert at cursor position or append to end
      // In a real implementation, you would insert at the editor's cursor position
      return prev + "\n" + code;
    });
    
    toast({
      title: "Code inserted",
      description: "LaTeX code has been inserted into your document",
    });
  }, [toast]);

  return (
    <FileContentContext.Provider value={{ 
      fileContent, 
      setFileContent, 
      selectedFile,
      compilationStatus
    }}>
      <div className="flex flex-col h-screen bg-background">        {/* Enhanced top navbar with improved styling */}
        <header className="border-b border-gray-800 bg-gradient-to-r from-background via-background/95 to-background">          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="sm" className="text-red-500" />
              
              <div className="hidden sm:block h-6 w-px bg-gray-800/70" />
              
              {/* Document status indicator */}
              <div className="hidden md:flex items-center h-6 px-2 rounded-full bg-gray-900/50 border border-gray-800 text-xs">
                <span className={`flex items-center ${compilationStatus === 'success' ? 'text-green-500' : 'text-gray-400'}`}>
                  <svg viewBox="0 0 24 24" className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12.5l2 2 6-6" />
                  </svg>
                  TeX
                </span>
                <span className="mx-1.5 text-gray-600">•</span>
                <span className="text-blue-400 flex items-center">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  2
                </span>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSidebar}
                className="hidden sm:flex h-8 w-8 p-0 hover:bg-gray-800/30 transition-colors"
                title={isSidebarOpen ? "Hide file explorer" : "Show file explorer"}
              >
                {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </Button>
              
              <Button                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden h-8 w-8 p-0 hover:bg-gray-800/30"
              >
                <Menu size={16} />
              </Button>
              
              <div className="flex flex-col">
                <span className="truncate text-white font-medium text-sm max-w-[150px] sm:max-w-xs">
                  {selectedFile?.name || "My Document.tex"}
                </span>
                <span className="text-gray-400 text-xs hidden sm:block">
                  {compilationStatus === 'success' ? 'Last compiled: Just now' : 
                   compilationStatus === 'compiling' ? 'Compiling...' : 
                   'Not compiled yet'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 hidden sm:flex hover:bg-green-900/20 hover:text-green-500 transition-all" 
                onClick={handleSave}
                title="Save document"
              >
                <Save size={16} />
              </Button>
              
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 hidden sm:flex hover:bg-blue-900/20 hover:text-blue-500 transition-all"
                title="Share document"
              >
                <Share2 size={16} />
              </Button>
              
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 hidden sm:flex hover:bg-purple-900/20 hover:text-purple-500 transition-all"
                title="Download document"
              >
                <Download size={16} />
              </Button>
                <Button 
                size="sm" 
                variant="outline" 
                className={`hidden sm:flex items-center gap-1.5 transition-all ${
                  compilationStatus === 'compiling' 
                    ? 'bg-amber-900/20 text-amber-400 border-amber-800/50' 
                    : compilationStatus === 'success'
                    ? 'bg-green-900/20 text-green-400 border-green-800/50 hover:bg-green-900/30' 
                    : compilationStatus === 'error'
                    ? 'bg-red-900/20 text-red-400 border-red-800/50'
                    : 'hover:bg-gray-800 hover:text-white border-gray-700'
                }`} 
                onClick={handleCompile}
                disabled={isCompiling}
              >
                {isCompiling ? (
                  <>
                    <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
                    </svg>
                    Compiling...
                  </>
                ) : "Compile"}
              </Button>
              
              <div className="h-6 mx-1 w-px bg-gray-800/70 hidden sm:block"></div>
              
              <Button 
                size="sm" 
                variant="ghost" 
                className={`h-8 w-8 p-0 ${isAIChatOpen && !isAIChatMinimized ? 'bg-red-900/30 text-red-400 hover:bg-red-900/40' : 'hover:bg-red-900/20 hover:text-red-400'} transition-all`}
                onClick={toggleAIChat}
                title="TeXSync AI Assistant"
              >
                <Sparkles size={16} />
              </Button>
              
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 ml-2 rounded-full overflow-hidden border border-transparent hover:border-gray-700 transition-all"
              >
                <div className="bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-medium h-full w-full">
                  TX
                </div>
              </Button>
            </div>
          </div>
            {/* Mobile menu overlay */}
          {isMobileMenuOpen && (
            <div className="fixed top-16 left-0 right-0 bottom-0 bg-background/95 backdrop-blur-sm border-b border-gray-800 p-4 z-50 sm:hidden animate-in slide-in-from-top-5 duration-300">
              <div className="space-y-3 max-w-xs mx-auto">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full justify-start bg-gray-900/50 border-gray-700 hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setIsSidebarOpen(!isSidebarOpen);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <FileText size={16} className="mr-2 text-red-400" />
                  {isSidebarOpen ? "Hide" : "Show"} File Browser
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full justify-start bg-green-900/20 border-green-800/50 hover:bg-green-900/30 text-green-200 transition-colors"
                  onClick={handleSave}
                >
                  <Save size={16} className="mr-2" />
                  Save Document
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={`w-full justify-start transition-colors ${
                    compilationStatus === 'compiling' 
                      ? 'bg-amber-900/20 text-amber-400 border-amber-800/50' 
                      : compilationStatus === 'success'
                      ? 'bg-green-900/20 text-green-400 border-green-800/50 hover:bg-green-900/30' 
                      : compilationStatus === 'error'
                      ? 'bg-red-900/20 text-red-400 border-red-800/50'
                      : 'bg-gray-900/50 border-gray-700 hover:bg-gray-800 text-gray-100'
                  }`}
                  onClick={handleCompile}
                  disabled={isCompiling}
                >
                  {isCompiling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilePdf size={16} className="mr-2" />}
                  {isCompiling ? "Compiling..." : "Compile Document"}
                </Button>
                  <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full justify-start bg-blue-900/20 border-blue-800/50 hover:bg-blue-900/30 text-blue-200 transition-colors"
                >
                  <Share2 size={16} className="mr-2" />
                  Share Document
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full justify-start bg-purple-900/20 border-purple-800/50 hover:bg-purple-900/30 text-purple-200 transition-colors"
                >
                  <Download size={16} className="mr-2" />
                  Download PDF
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={`w-full justify-start transition-colors ${
                    isAIChatOpen && !isAIChatMinimized 
                      ? 'bg-red-900/30 text-red-300 border-red-800/50'
                      : 'bg-red-900/20 border-red-800/50 hover:bg-red-900/30 text-red-200'
                  }`}
                  onClick={() => {
                    setIsAIChatOpen(!isAIChatOpen);
                    setIsAIChatMinimized(false);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Sparkles size={16} className="mr-2" />
                  {isAIChatOpen && !isAIChatMinimized ? "Hide" : "Show"} AI Assistant
                </Button>
                
                <div className="h-px bg-gray-800 my-2"></div>
                
                <Link href="/" passHref>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full justify-start bg-gray-900/50 border-gray-700 hover:bg-gray-800 text-gray-100 transition-colors"
                  >
                    <HomeIcon size={16} className="mr-2 text-gray-400" />
                    Back to Home
                  </Button>
                </Link>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full mt-2 text-gray-400 hover:bg-gray-800/50 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X size={16} className="mr-2" />
                  Close Menu
                </Button>
              </div>
            </div>
          )}
        </header>
        
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            {/* Left Sidebar */}
            {isSidebarOpen && (
              <>
                <ResizablePanel 
                  defaultSize={20} 
                  minSize={15} 
                  maxSize={30}
                  className="bg-gray-950 border-r border-gray-800"
                >
                  <FileExplorer 
                    onFileSelect={(file) => {
                      setSelectedFile(file);
                      // In a real implementation, load the file content here
                      if (file.content) {
                        setFileContent(file.content);
                      } else {
                        // Set default content based on file type
                        if (file.type === 'tex') {
                          setFileContent('\\documentclass{article}\n\\begin{document}\n\n\\end{document}');
                        } else if (file.type === 'bib') {
                          setFileContent('@article{example,\n  author = {Author, A.},\n  title = {Example Article},\n  journal = {Journal of Examples},\n  year = {2023},\n}');
                        } else {
                          setFileContent('');
                        }
                      }
                    }}
                    selectedFile={selectedFile}
                  />
                </ResizablePanel>
                <ResizableHandle withHandle />
              </>
            )}
            
            {/* Main content */}
            <ResizablePanel defaultSize={isSidebarOpen ? (isAIChatOpen && !isAIChatMinimized ? 60 : 80) : 100}>
              {children}
            </ResizablePanel>

            {/* Right AI Chat Sidebar */}
            {isAIChatOpen && !isAIChatMinimized && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel 
                  defaultSize={20} 
                  minSize={15} 
                  maxSize={40}
                >
                  <AIChat 
                    latex={fileContent}
                    onInsertCode={handleInsertCode}
                    isMinimized={false}
                    onToggleMinimize={minimizeAIChat}
                  />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
        
        {/* Minimized AI chat */}
        {isAIChatOpen && isAIChatMinimized && (
          <AIChat 
            latex={fileContent}
            onInsertCode={handleInsertCode}
            isMinimized={true}
            onToggleMinimize={() => setIsAIChatMinimized(false)}
          />
        )}
      </div>
    </FileContentContext.Provider>
  );
}

// Additional icons for mobile view
function FilePdf(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 13v-1h6v1" />
      <path d="M11 18h2" />
      <path d="M12 12v6" />
    </svg>
  );
}

function Loader2(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={`animate-spin ${props.className || ''}`}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}