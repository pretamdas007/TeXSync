"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { 
  Save, FileSymlink, Download, Settings, User, 
  ChevronLeft, ChevronRight, Share2, HomeIcon 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import Link from 'next/link';

interface EditorLayoutProps {
  children: React.ReactNode;
}

export function EditorLayout({ children }: EditorLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCompiling, setIsCompiling] = useState(false);
  const { toast } = useToast();
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const handleSave = () => {
    toast({
      title: "Document saved",
      description: "Your document has been saved successfully.",
    });
  };
  
  const handleCompile = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      toast({
        title: "Compilation complete",
        description: "Your document was compiled successfully.",
      });
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top navbar */}
      <header className="border-b border-gray-800 bg-background">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <div className="h-6 w-px bg-gray-800" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleSidebar}
              className="h-8 w-8 p-0"
            >
              {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </Button>
            <span className="text-gray-400 text-sm">My Document.tex</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0" 
              onClick={handleSave}
            >
              <Save size={16} />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
            >
              <Share2 size={16} />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
            >
              <Download size={16} />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
            >
              <Settings size={16} />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="ml-2" 
              onClick={handleCompile}
              disabled={isCompiling}
            >
              {isCompiling ? "Compiling..." : "Compile"}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 ml-2 rounded-full"
            >
              <User size={16} />
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar */}
          {isSidebarOpen && (
            <>
              <ResizablePanel 
                defaultSize={20} 
                minSize={15} 
                maxSize={30}
                className="bg-gray-950 border-r border-gray-800"
              >
                <div className="p-4">
                  <h2 className="font-semibold mb-4">Project Files</h2>
                  <div className="space-y-2">
                    <div className="bg-gray-900 p-2 rounded text-sm cursor-pointer hover:bg-gray-800">
                      main.tex
                    </div>
                    <div className="p-2 rounded text-sm cursor-pointer hover:bg-gray-900">
                      references.bib
                    </div>
                    <div className="p-2 rounded text-sm cursor-pointer hover:bg-gray-900">
                      images/
                    </div>
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}
          
          {/* Main content */}
          <ResizablePanel defaultSize={isSidebarOpen ? 80 : 100}>
            {children}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}