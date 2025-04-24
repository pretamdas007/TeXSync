"use client";

import { useState, useEffect, useRef } from "react";
import { EditorLayout } from "@/components/editor/editor-layout";
import { Button } from "@/components/ui/button";
import { 
  Loader2, FileDown, Copy, Save, Play, 
  Sparkles, ChevronUp, ChevronDown, Share2, User, Users, X, Mail, Link as LinkIcon, Copy as CopyIcon, UserPlus, Shield 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Split from "react-split";
import { Input } from "@/components/ui/input"; // You'll need this component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LaTeXEditor } from "@/components/editor/latex-editor";

const initialLatex = `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\title{My Document}
\\author{TeXSync User}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
Write your introduction here.

\\section{Methodology}
$$E = mc^2$$

\\section{Conclusion}
Concluding remarks go here.

\\end{document}`;

export default function EditorPage() {
  const [latex, setLatex] = useState(initialLatex);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Add document metadata state
  const [documentTitle, setDocumentTitle] = useState("My Document");
  const [documentAuthor, setDocumentAuthor] = useState("TeXSync User");
  
  // Add these state variables
  const [documentHistory, setDocumentHistory] = useState<string[]>([initialLatex]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Add these state variables to track which panel is visible
  const [showSnippetsPanel, setShowSnippetsPanel] = useState(false);
  const [showTemplatesPanel, setShowTemplatesPanel] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);

  // Add this state variable with your other state variables:
  const [collaborators, setCollaborators] = useState<Array<{id: string; name: string; email: string; role: string; active: boolean}>>([
    { id: "1", name: "Alex Johnson", email: "alex@example.com", role: "editor", active: true },
    { id: "2", name: "Taylor Smith", email: "taylor@example.com", role: "viewer", active: false }
  ]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("editor");
  const [documentLink, setDocumentLink] = useState("https://texsync.com/d/shared-doc-12345");

  // Add this helper function to ensure only one panel shows at a time
  const togglePanel = (panel: 'ai' | 'snippets' | 'templates' | 'collaboration' | null) => {
      setShowAiPanel(panel === 'ai');
      setShowSnippetsPanel(panel === 'snippets');
      setShowTemplatesPanel(panel === 'templates');
      setShowCollaborationPanel(panel === 'collaboration');
    };

  // Compile on demand (not auto)
  const compilePdf = async () => {
    // Existing compilation logic
    setIsCompiling(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPdfUrl("https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf");
      toast({
        title: "Compilation successful",
        description: "Your LaTeX document has been compiled",
      });
    } catch (error) {
      toast({
        title: "Compilation failed",
        description: "There was an error compiling your document",
        variant: "destructive",
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const downloadPdf = () => {
    toast({
      title: "Download started",
      description: "Your PDF is being downloaded",
    });
  };

  const copyLatex = () => {
    navigator.clipboard.writeText(latex);
    toast({
      title: "Copied to clipboard",
      description: "LaTeX code has been copied to clipboard",
    });
  };

  const saveDocument = () => {
    toast({
      title: "Document saved",
      description: "Your document has been saved successfully",
    });
  };

  // AI assistance panel logic
  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    
    try {
      toast({
        title: "AI assistance requested",
        description: "Processing your request...",
      });
      
      // Replace the simulation with a real API call
      const response = await fetch("/api/ai-latex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Assuming the API returns LaTeX in data.latex
      // Modify this based on your API's response structure
      const generatedLatex = data.latex || data.content || data.result;
      
      setLatex(prevLatex => `${prevLatex}\n\n${generatedLatex}`);
      setAiPrompt("");
      
      toast({
        title: "Generated successfully",
        description: "LaTeX content has been added to your document.",
      });
    } catch (error) {
      console.error("API error:", error);
      toast({
        title: "Generation failed",
        description: "There was an error processing your request.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate stats whenever LaTeX changes
  useEffect(() => {
    // Simple word count (approximate for LaTeX)
    const textOnly = latex.replace(/\\[a-z]+(\{.*?\})*|\$.*?\$|\\begin\{.*?\}[\s\S]*?\\end\{.*?\}/g, ' ');
    const words = textOnly.split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
    
    // Save to history if it's a significant change
    if (latex !== documentHistory[historyIndex] && 
        (documentHistory.length === 0 || Math.abs(latex.length - documentHistory[historyIndex].length) > 10)) {
      const newHistory = [...documentHistory.slice(0, historyIndex + 1), latex];
      if (newHistory.length > 30) newHistory.shift(); // limit history size
      setDocumentHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [latex]);
  
  // Add undo/redo functionality
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLatex(documentHistory[historyIndex - 1]);
    }
  };
  
  const redo = () => {
    if (historyIndex < documentHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLatex(documentHistory[historyIndex + 1]);
    }
  };

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDocument();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        compilePdf();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, documentHistory]);

  // Enhanced templates
  const templates = {
    article: initialLatex,
    report: `\\documentclass{report}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\title{Comprehensive Report}
\\author{${documentAuthor}}
\\date{\\today}

\\begin{document}

\\maketitle
\\tableofcontents

\\chapter{Introduction}
Write your introduction here.

\\chapter{Literature Review}
Review of existing literature.

\\chapter{Methodology}
$$E = mc^2$$

\\chapter{Results}
Your results go here.

\\chapter{Discussion}
Discuss your findings.

\\chapter{Conclusion}
Concluding remarks go here.

\\appendix
\\chapter{Additional Material}

\\end{document}`,
    presentation: `\\documentclass{beamer}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\title{Presentation Title}
\\author{${documentAuthor}}
\\date{\\today}

\\begin{document}

\\begin{frame}
\\titlepage
\\end{frame}

\\begin{frame}{Outline}
\\tableofcontents
\\end{frame}

\\section{Introduction}
\\begin{frame}{Introduction}
Key points:
\\begin{itemize}
\\item First point
\\item Second point
\\item Third point
\\end{itemize}
\\end{frame}

\\section{Main Content}
\\begin{frame}{Equation Example}
$$E = mc^2$$
\\end{frame}

\\end{document}`
  };

  // More LaTeX snippets
  const insertLatexSnippet = (snippetType: string) => {
    let snippet = '';
    
    switch(snippetType) {
      case 'equation':
        snippet = `\\begin{equation}\n  f(x) = y\n\\end{equation}`;
        break;
      case 'matrix':
        snippet = `\\begin{bmatrix}\n  a & b \\\\\n  c & d\n\\end{bmatrix}`;
        break;
      case 'integral':
        snippet = `\\int_{a}^{b} f(x) \\, dx`;
        break;
      case 'figure':
        snippet = `\\begin{figure}[h]\n  \\centering\n  \\includegraphics[width=0.8\\textwidth]{filename}\n  \\caption{Caption text}\n  \\label{fig:label}\n\\end{figure}`;
        break;
      case 'table':
        snippet = `\\begin{table}[h]\n  \\centering\n  \\caption{Table Caption}\n  \\begin{tabular}{|c|c|c|}\n    \\hline\n    Header 1 & Header 2 & Header 3 \\\\ \\hline\n    Cell 1 & Cell 2 & Cell 3 \\\\ \\hline\n    Cell 4 & Cell 5 & Cell 6 \\\\ \\hline\n  \\end{tabular}\n  \\label{tab:label}\n\\end{table}`;
        break;
      case 'itemize':
        snippet = `\\begin{itemize}\n  \\item First item\n  \\item Second item\n  \\item Third item\n\\end{itemize}`;
        break;
      case 'enumerate':
        snippet = `\\begin{enumerate}\n  \\item First item\n  \\item Second item\n  \\item Third item\n\\end{enumerate}`;
        break;
      case 'reference':
        snippet = `\\cite{reference}`;
        break;
      default:
        snippet = '';
    }
    
    if (snippet) {
      setLatex(prevLatex => `${prevLatex}\n\n${snippet}`);
      toast({
        title: "Snippet inserted",
        description: `Added ${snippetType} snippet to your document`,
      });
    }
  };

  // Add these collaboration functions:
  const addCollaborator = () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: "Invalid email address",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
  
    const newId = (collaborators.length + 1).toString();
    const name = newEmail.split('@')[0].split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    
    setCollaborators([...collaborators, { id: newId, name, email: newEmail, role: newRole, active: false }]);
    setNewEmail("");
    
    toast({
      title: "Collaborator added",
      description: `Invitation sent to ${newEmail}`
    });
  };
  
  const removeCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(documentLink);
    toast({
      title: "Link copied",
      description: "The collaboration link has been copied to clipboard"
    });
  };

  // Add this helper function for collaboration status:
  const getActiveCollaborators = () => {
    return collaborators.filter(c => c.active).length;
  };
  
  // Modified return section with enhanced UI
  return (
    <EditorLayout>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* Main Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
          <div className="flex items-center gap-3">
            <div className="font-bold text-lg">TeXSync Editor</div>
            
            {/* Document actions group */}
            <div className="border-l pl-3 flex gap-2">
              <Button size="sm" onClick={saveDocument} title="Save (Ctrl+S)">
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
              <Button size="sm" variant="outline" onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M3 13c0-4.97 4.03-9 9-9a9 9 0 0 1 9 9s-2 4-9 4c-4 0-9-2-9-5z"></path></svg>
              </Button>
              <Button size="sm" variant="outline" onClick={redo} disabled={historyIndex >= documentHistory.length - 1} title="Redo (Ctrl+Y)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"></path><path d="M21 13c0-4.97-4.03-9-9-9a9 9 0 0 0-9 9s2 4 9 4c4 0 9-2 9-5z"></path></svg>
              </Button>
              <Button size="sm" variant="outline" onClick={copyLatex}>
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Compile group */}
            <div className="border-r pr-3 mr-3">
              <Button 
                size="sm" 
                variant="default" 
                onClick={compilePdf} 
                disabled={isCompiling} 
                title="Compile (Ctrl+Enter)"
                className="bg-red-600 hover:bg-red-700"
              >
                {isCompiling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Compiling...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" /> Compile
                  </>
                )}
              </Button>
            </div>
            
            {/* Tools group */}
            <Button 
              size="sm" 
              variant={showSnippetsPanel ? "default" : "outline"} 
              onClick={() => togglePanel(showSnippetsPanel ? null : 'snippets')}
            >
              {showSnippetsPanel ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />} Snippets
            </Button>
            <Button 
              size="sm" 
              variant={showTemplatesPanel ? "default" : "outline"} 
              onClick={() => togglePanel(showTemplatesPanel ? null : 'templates')}
            >
              {showTemplatesPanel ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />} Templates
            </Button>
            <Button 
              size="sm" 
              variant={showAiPanel ? "default" : "outline"} 
              onClick={() => togglePanel(showAiPanel ? null : 'ai')}
            >
              {showAiPanel ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />} AI Assist
            </Button>
            <Button 
              size="sm" 
              variant={showCollaborationPanel ? "default" : "outline"} 
              onClick={() => togglePanel(showCollaborationPanel ? null : 'collaboration')}
            >
              {showCollaborationPanel ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />} Collaboration
            </Button>
            <Button 
              size="sm" 
              variant={showSettings ? "default" : "outline"} 
              onClick={() => setShowSettings(!showSettings)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={showSettings ? "mr-2" : "mr-2"}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              {showSettings && "Settings"}
            </Button>
          </div>
        </div>
        
        {/* Action Panels */}
        {showSnippetsPanel && (
          <div className="p-4 border-b bg-background">
            <h3 className="font-medium mb-2">LaTeX Snippets</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => insertLatexSnippet('equation')}>Equation</Button>
              <Button variant="outline" size="sm" onClick={() => insertLatexSnippet('matrix')}>Matrix</Button>
              <Button variant="outline" size="sm" onClick={() => insertLatexSnippet('integral')}>Integral</Button>
              <Button variant="outline" size="sm" onClick={() => insertLatexSnippet('figure')}>Figure</Button>
              <Button variant="outline" size="sm" onClick={() => insertLatexSnippet('table')}>Table</Button>
              <Button variant="outline" size="sm" onClick={() => insertLatexSnippet('itemize')}>Bullet List</Button>
              <Button variant="outline" size="sm" onClick={() => insertLatexSnippet('enumerate')}>Numbered List</Button>
              <Button variant="outline" size="sm" onClick={() => insertLatexSnippet('reference')}>Citation</Button>
            </div>
          </div>
        )}

        {showTemplatesPanel && (
          <div className="p-4 border-b bg-background">
            <h3 className="font-medium mb-2">Document Templates</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="border rounded p-4 hover:border-primary cursor-pointer transition-colors" onClick={() => setLatex(templates.article)}>
                <h4 className="font-medium">Basic Article</h4>
                <p className="text-sm text-muted-foreground">Simple academic article template with basic sections</p>
              </div>
              <div className="border rounded p-4 hover:border-primary cursor-pointer transition-colors" onClick={() => setLatex(templates.report)}>
                <h4 className="font-medium">Full Report</h4>
                <p className="text-sm text-muted-foreground">Comprehensive report template with chapters and ToC</p>
              </div>
              <div className="border rounded p-4 hover:border-primary cursor-pointer transition-colors" onClick={() => setLatex(templates.presentation)}>
                <h4 className="font-medium">Presentation</h4>
                <p className="text-sm text-muted-foreground">Beamer presentation slides for academic talks</p>
              </div>
            </div>
          </div>
        )}

        {showAiPanel && (
          <div className="p-4 border-b bg-background">
            <h3 className="font-medium mb-2">AI Assistant</h3>
            <form onSubmit={handleAiSubmit} className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask the AI for LaTeX code (e.g., 'Create a matrix for a linear system')"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isGenerating || !aiPrompt.trim()}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Example prompts: "Create an equation for the quadratic formula", 
                "Make a table with 3 columns for data comparison", 
                "Create a TikZ diagram of a basic flowchart"
              </div>
            </form>
          </div>
        )}

        {showCollaborationPanel && (
          <div className="p-4 border-b bg-background">
            <h3 className="font-medium mb-2">Collaboration</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Enter collaborator's email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <Button onClick={addCollaborator}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Active Collaborators: {getActiveCollaborators()}
              </div>
              <div className="flex flex-col space-y-2">
                {collaborators.map(collaborator => (
                  <div key={collaborator.id} className="flex items-center justify-between border rounded p-2">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${collaborator.email}`} alt={collaborator.name} />
                        <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{collaborator.name}</div>
                        <div className="text-xs text-muted-foreground">{collaborator.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge>{collaborator.role}</Badge>
                      <Button variant="outline" size="sm" onClick={() => removeCollaborator(collaborator.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  value={documentLink}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={copyLink}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        )}

        {showSettings && (
          <div className="p-4 border-b bg-background">
            <h3 className="font-medium mb-2">Document Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Document Title</label>
                <Input 
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Author</label>
                <Input 
                  value={documentAuthor}
                  onChange={(e) => setDocumentAuthor(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <Button 
              size="sm" 
              className="mt-4" 
              onClick={() => {
                // Update the LaTeX with new metadata
                const updatedLatex = latex
                  .replace(/\\title\{.*?\}/, `\\title{${documentTitle}}`)
                  .replace(/\\author\{.*?\}/, `\\author{${documentAuthor}}`);
                setLatex(updatedLatex);
                toast({
                  title: "Settings updated",
                  description: "Document metadata has been updated",
                });
              }}
            >
              Apply Changes
            </Button>
          </div>
        )}
        
        {/* Split Pane */}
        <Split className="flex flex-1" minSize={300} sizes={[50, 50]} gutterSize={8}>
          <div className="h-full overflow-auto bg-background p-4 flex flex-col">
            <LaTeXEditor value={latex} onChange={setLatex} />
          </div>
          <div className="h-full overflow-auto bg-gray-100 dark:bg-gray-900 p-4 flex flex-col relative rounded-r">
            <div className="absolute top-2 right-2 z-10">
              <Button size="sm" variant="outline" onClick={downloadPdf} disabled={!pdfUrl || isCompiling}>
                <FileDown className="h-4 w-4 mr-2" /> Download PDF
              </Button>
            </div>
            {isCompiling ? (
              <div className="flex-1 flex items-center justify-center bg-black/10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0 rounded"
                title="PDF Preview"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">Preview will appear here after compilation</div>
            )}
          </div>
        </Split>
        
        {/* Status Bar */}
        <div className="px-4 py-1 border-t bg-background flex justify-between text-xs text-gray-500">
          <div>
            Words: {wordCount} | Document Version: {historyIndex + 1}/{documentHistory.length}
          </div>
          <div>
            {isCompiling ? "Compiling..." : "Ready"}
          </div>
        </div>
      </div>
    </EditorLayout>
  );
}