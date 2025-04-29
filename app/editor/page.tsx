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
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const initialLatex = `\\documentclass{article}
\\usepackage{amsmath, amssymb, amsfonts}
\\usepackage{tikz} % TikZ is okay with pdflatex
\\usepackage{hyperref}
\\usepackage{geometry}
\\geometry{margin=1in}

\\title{\\textbf{Complex Equations Showcase \\\\ for TeXSync Website}}
\\author{Developed with \\LaTeX\\ by TeXSync}
\\date{\\today}

\\begin{document}

\\maketitle

\\tableofcontents
\\newpage

\\section{Introduction}

Welcome to \\textbf{TeXSync}, the online \\LaTeX\\ editor.  
Here we showcase the capability to render highly complex mathematical structures.

\\section{Calculus}

\\subsection{Complex Differentiation}

Let \\( f(z) = u(x, y) + i v(x, y) \\), then the complex derivative is:
\\[
f'(z) = \\lim_{\\Delta z \\to 0} \\frac{f(z + \\Delta z) - f(z)}{\\Delta z}
\\]

The Cauchy-Riemann equations are:
\\[
\\frac{\\partial u}{\\partial x} = \\frac{\\partial v}{\\partial y}, \\quad \\frac{\\partial u}{\\partial y} = -\\frac{\\partial v}{\\partial x}
\\]

\\subsection{Multivariable Integration}

The volume under a surface \\( z = f(x,y) \\) is:

\\[
V = \\iint_D f(x,y) \\, dx\\, dy
\\]

Where \\( D \\) is the domain of integration.

\\subsection{Line Integrals}

For a vector field \\( \\vec{F} \\), the line integral along curve \\( C \\) is:

\\[
\\oint_C \\vec{F} \\cdot d\\vec{r} = \\oint_C \\left( F_x \\, dx + F_y \\, dy + F_z \\, dz \\right)
\\]

\\section{Series and Summations}

The infinite geometric series:

\\[
\\sum_{n=0}^{\\infty} ar^n = \\frac{a}{1-r}, \\quad \\text{for} \\quad |r| < 1
\\]

The Taylor series expansion for \\( e^x \\) is:

\\[
e^x = \\sum{n=0}^{\\infty} \\frac{x^n}{n!}
\\]

\\section{Linear Algebra and Matrices}

A system of linear equations:

\\[
\\begin{aligned}
2x + 3y - z &= 7 \\\\
4x - y + 5z &= 3 \\\\
-6x + 2y + 3z &= 8
\\end{aligned}
\\]

In matrix form:

\\[
\\begin{bmatrix}
2 & 3 & -1 \\\\
4 & -1 & 5 \\\\
-6 & 2 & 3
\\end{bmatrix}
\\begin{bmatrix}
x \\\\ y \\\\ z
\\end{bmatrix}
=
\\begin{bmatrix}
7 \\\\ 3 \\\\ 8
\\end{bmatrix}
\\]

\\section{Tensor Calculus (Advanced)}

The Riemann curvature tensor:

\\[
R^\\rho_{\\sigma\\mu\\nu} = \\partial_\\mu \\Gamma^\\rho_{\\nu\\sigma} - \\partial_\\nu \\Gamma^\\rho_{\\mu\\sigma} + \\Gamma^\\rho_{\\mu\\lambda} \\Gamma^\\lambda_{\\nu\\sigma} - \\Gamma^\\rho_{\\nu\\lambda} \\Gamma^\\lambda_{\\mu\\sigma}
\\]

Einstein field equations:

\\[
R_{\\mu\\nu} - \\frac{1}{2} R g_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}
\\]

\\section{Physics: Quantum Mechanics}

The time-dependent Schrödinger equation:

\\[
i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\left( -\\frac{\\hbar^2}{2m} \\nabla^2 + V(\\mathbf{r}, t) \\right) \\Psi(\\mathbf{r}, t)
\\]

\\section{Graphics: TikZ Example}

\\begin{center}
\\begin{tikzpicture}
\\draw[thick,->] (0,0) -- (3,0) node[right] {$x$};
\\draw[thick,->] (0,0) -- (0,3) node[above] {$y$};
\\draw[thick,domain=0:2.5,smooth,variable=\\x,blue] plot ({\\x},{0.5*\\x*\\x});
\\node at (1.5,2) {$y = \\frac{1}{2}x^2$};
\\end{tikzpicture}
\\end{center}

\\end{document}`;

export default function EditorPage() {
  const [latex, setLatex] = useState(initialLatex);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
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

  // Add this state variable with your other state variables:
  const [collaborators, setCollaborators] = useState<Array<{id: string; name: string; email: string; role: string; active: boolean}>>([
    { id: "1", name: "Alex Johnson", email: "alex@example.com", role: "editor", active: true },
    { id: "2", name: "Taylor Smith", email: "taylor@example.com", role: "viewer", active: false }
  ]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("editor");
  const [documentLink, setDocumentLink] = useState("https://texsync.com/d/shared-doc-12345");

  // Add this helper function to ensure only one panel shows at a time
  const togglePanel = (panel: 'snippets' | 'templates' | null) => {
      setShowSnippetsPanel(panel === 'snippets');
      setShowTemplatesPanel(panel === 'templates');
    };

  // Add this to your state variables
  // Set XeLaTeX as default for better Unicode support with the heart symbol
  const [latexEngine, setLatexEngine] = useState<'pdflatex' | 'xelatex' | 'lualatex'>('xelatex');

  // Initialize Gemini AI (ideally, the API key should be stored securely in env variables)
  const genAI = new GoogleGenerativeAI("AIzaSyAS7mnSqmz_bi5sI4gAtDIVc0PYJhB9FRg");
  
  // Add this function for Gemini integration
  const generateLatexWithGemini = async (prompt: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Prepare the prompt with context for better LaTeX generation
      const fullPrompt = `You are a LaTeX expert. Generate LaTeX code for the following request. 
      Only include valid LaTeX code without explanations or markdown formatting. 
      Request: ${prompt}`;
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        success: true,
        latex: text
      };
    } catch (error) {
      console.error("Gemini API error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred"
      };
    }
  };

  // Update the compilePdf function to include the engine
  const compilePdf = async () => {
    setIsCompiling(true);
    try {
      // Send the LaTeX content to the backend for compilation
      const response = await fetch("http://localhost:5000/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          latex,
          engine: latexEngine  // Add this line to send the engine parameter
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Set the URL of the compiled PDF
        setPdfUrl(data.pdfUrl);
        toast({
          title: "Compilation successful",
          description: "Your LaTeX document has been compiled",
        });
      } else {
        toast({
          title: "Compilation failed",
          description: data.errors || "There was an error compiling your document",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during compilation:", error);
      toast({
        title: "Compilation failed",
        description: "There was an error connecting to the compilation service",
        variant: "destructive",
      });
    } finally {
      setIsCompiling(false);
    }
  };

const downloadPdf = () => {
  if (!pdfUrl) {
    toast({
      title: "No PDF available",
      description: "Please compile your document first",
      variant: "destructive"
    });
    return;
  }
  
  // Create a temporary anchor element to trigger the download
  const a = document.createElement('a');
  a.href = pdfUrl;
  a.download = `${documentTitle.replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
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
      // Use Gemini instead of local endpoint
      const data = await generateLatexWithGemini(aiPrompt);
      
      if (data.success) {
        setLatex(prevLatex => `${prevLatex}\n\n${data.latex}`);
        setAiPrompt("");
        
        toast({
          title: "LaTeX generated with Gemini",
          description: "AI-generated content has been added to your document.",
        });
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error("API error:", error);
      toast({
        title: "Generation failed",
        description: "There was an error processing your request with Gemini.",
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

    // Define generateLetterTemplate function
    const generateLetterTemplate = () => {
      return `\\documentclass{letter}
  \\usepackage{hyperref}
  
  \\signature{${documentAuthor}}
  \\address{Your Address Here}
  
  \\begin{document}
  
  \\begin{letter}{Recipient Name \\newline Recipient Address}
  
  \\opening{Dear [Recipient Name],}
  
  Write your letter content here.
  
  \\closing{Sincerely,}
  
  \\end{letter}
  
  \\end{document}`;
    };
  
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

\\end{document}`,
    academicCV: `\\documentclass[11pt]{article}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\title{Curriculum Vitae}
\\author{${documentAuthor}}
\\date{}

\\begin{document}

\\maketitle

\\section*{Education}
\\begin{itemize}
  \\item Degree, Institution, Year
  \\item Degree, Institution, Year
\\end{itemize}

\\section*{Experience}
\\begin{itemize}
  \\item Job Title, Company, Year--Year
  \\item Job Title, Company, Year--Year
\\end{itemize}

\\section*{Skills}
\\begin{itemize}
  \\item Skill 1
  \\item Skill 2
\\end{itemize}

\\end{document}`,
    book: `\\documentclass{book}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\title{Book Title}
\\author{${documentAuthor}}
\\date{\\today}

\\begin{document}

\\frontmatter
\\maketitle
\\tableofcontents

\\mainmatter
\\chapter{Introduction}
Write your introduction here.

\\chapter{Main Content}
Your main content goes here.

\\backmatter
\\chapter{References}
Your references go here.

\\end{document}`,
    letter: `\\documentclass{letter}
\\usepackage{hyperref}

\\signature{${documentAuthor}}
\\address{Your Address Here}

\\begin{document}

\\begin{letter}{Recipient Name \\newline Recipient Address}

\\opening{Dear [Recipient Name],}

Write your letter content here.

\\closing{Sincerely,}

\\end{letter}

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
  // Removed duplicate declaration of addCollaborator
  
  const removeCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
  };
  
  // Removed duplicate declaration of copyLink

  // Add this helper function for collaboration status:
  const getActiveCollaborators = () => {
    return collaborators.filter(c => c.active).length;
  };
  
  // Add this UI component to select the LaTeX engine
  // This could be placed near your compilation button
  const EngineSelector = () => (
    <div className="flex items-center space-x-2">
      <label htmlFor="engine-select" className="text-sm font-medium">
        Compiler:
      </label>
      <select 
        id="engine-select"
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        value={latexEngine}
        onChange={(e) => setLatexEngine(e.target.value as 'pdflatex' | 'xelatex' | 'lualatex')}
      >
        <option value="pdflatex">pdfLaTeX</option>
        <option value="xelatex">XeLaTeX</option>
        <option value="lualatex">LuaLaTeX</option>
      </select>
    </div>
  );

  // Enhanced collaboration functions
  const addCollaborator = () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
  
    const newId = (collaborators.length + 1).toString();
    const name = newEmail.split('@')[0].split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
    
    setCollaborators(prev => [...prev, { 
      id: newId, 
      name, 
      email: newEmail, 
      role: newRole, 
      active: false 
    }]);
    
    setNewEmail("");
    
    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${newEmail}`,
      variant: "default",
    });
  };
  
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(documentLink);
      toast({
        title: "Link copied",
        description: "Share link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please select and copy the link manually",
        variant: "destructive",
      });
    }
  };
  
  // Add this to simulate real-time collaboration
  const simulateCollaboratorJoining = () => {
    if (collaborators.length > 0) {
      const randomIndex = Math.floor(Math.random() * collaborators.length);
      setCollaborators(prev => 
        prev.map((c, idx) => idx === randomIndex ? {...c, active: true} : c)
      );
      
      toast({
        title: "Collaborator joined",
        description: `${collaborators[randomIndex].name} is now viewing the document`,
      });
    }
  };

  // Add this function with your other functions
  const generateBookTemplate = () => {
    return `\\documentclass{book}
  \\usepackage{amsmath}
  \\usepackage{graphicx}
  \\usepackage{hyperref}
  \\title{Book Title}
  \\author{${documentAuthor}}
  \\date{\\today}
  
  \\begin{document}
  
  \\frontmatter
  \\maketitle
  \\tableofcontents
  
  \\mainmatter
  \\chapter{Introduction}
  Write your introduction here.
  
  \\chapter{Main Content}
  Your main content goes here.
  
  \\backmatter
  \\chapter{References}
  Your references go here.
  
  \\end{document}`;
  };
const applyQuickTemplate = (templateType: string) => {
  // This would ideally load templates from a larger collection
  let templateContent = '';
  
  switch(templateType) {
    case "conferencePaper":
      templateContent = `\\documentclass[conference]{IEEEtran}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}

\\title{Conference Paper Title}
\\author{${documentAuthor}}

\\begin{document}
\\maketitle

\\begin{abstract}
This is the abstract of your conference paper.
\\end{abstract}

\\section{Introduction}
Introduction to your conference paper.

\\end{document}`;
      break;
    
    case "labReport":
      templateContent = `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{siunitx}
\\usepackage{booktabs}

\\title{Lab Report: Experiment Title}
\\author{${documentAuthor}}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Objective}
State the objective of the experiment.

\\section{Apparatus}
List the equipment used.

\\section{Procedure}
1. First step
2. Second step

\\section{Results}
Present your findings.

\\section{Discussion}
Analyze the results.

\\section{Conclusion}
Summarize your findings.

\\end{document}`;
      break;
      
    default:
      templateContent = templates.article;
  }
  
  setLatex(templateContent);
  toast({
    title: "Template applied",
    description: `${templateType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} template has been applied`,
  });
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
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center text-lg">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-full p-1 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    </div>
                    Document Templates
                  </DialogTitle>
                  <DialogDescription>
                    Choose a template to start your document or insert at the cursor position.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
                  {/* Article Template */}
                  <TemplateCard
                    title="Article"
                    description="Standard academic article format with sections and mathematical content."
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
                    }
                    onClick={() => {
                      setLatex(templates.article);
                      toast({
                        title: "Template applied",
                        description: "Article template has been applied to your document",
                      });
                    }}
                    previewImage="/templates/article-preview.png"
                  />
                  
                  {/* Report Template */}
                  <TemplateCard
                    title="Report"
                    description="Comprehensive report with chapters, table of contents, and appendices."
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3a2 2 0 0 0-2 2"></path><path d="M19 3a2 2 0 0 1 2 2"></path><path d="M21 19a2 2 0 0 1-2 2"></path><path d="M5 21a2 2 0 0 1-2-2"></path><path d="M9 3h1"></path><path d="M9 21h1"></path><path d="M14 3h1"></path><path d="M14 21h1"></path><path d="M3 9v1"></path><path d="M21 9v1"></path><path d="M3 14v1"></path><path d="M21 14v1"></path><line x1="7" y1="8" x2="17" y2="8"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="7" y1="16" x2="17" y2="16"></line></svg>
                    }
                    onClick={() => {
                      setLatex(templates.report);
                      toast({
                        title: "Template applied",
                        description: "Report template has been applied to your document",
                      });
                    }}
                    previewImage="/templates/report-preview.png"
                  />
                  
                  {/* Presentation Template */}
                  <TemplateCard
                    title="Presentation"
                    description="Beamer presentation with title slide, outline, and content frames."
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path></svg>
                    }
                    onClick={() => {
                      setLatex(templates.presentation);
                      toast({
                        title: "Template applied",
                        description: "Presentation template has been applied to your document",
                      });
                    }}
                    previewImage="/templates/presentation-preview.png"
                  />

                  {/* Academic CV */}
                  <TemplateCard
                    title="Academic CV"
                    description="Professional curriculum vitae format for academic purposes."
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><path d="M12 14c1.66 0 3-1.34 3-3V7c0-1.66-1.34-3-3-3s-3 1.34-3 3v4c0 1.66 1.34 3 3 3z"></path><path d="M8 15h8"></path><path d="M8 19h8"></path></svg>
                    }
                    onClick={() => {
                      setLatex(templates.academicCV);
                      toast({
                        title: "Template applied",
                        description: "Academic CV template has been applied",
                      });
                    }}
                    previewImage="/templates/cv-preview.png"
                  />

                  {/* Letter */}
                  <TemplateCard
                    title="Formal Letter"
                    description="Professional letter template with proper formatting and structure."
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                    }
                    onClick={() => {
                      setLatex(templates.letter || generateLetterTemplate());
                      toast({
                        title: "Template applied",
                        description: "Letter template has been applied",
                      });
                    }}
                    previewImage="/templates/letter-preview.png"
                  />

                  {/* Book */}
                  <TemplateCard
                    title="Book"
                    description="Complete book structure with chapters, parts, and front/back matter."
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                    }
                    onClick={() => {
                      setLatex(templates.book || generateBookTemplate());
                      toast({
                        title: "Template applied",
                        description: "Book template has been applied",
                      });
                    }}
                    previewImage="/templates/book-preview.png"
                  />
                </div>

                <Tabs defaultValue="academic" className="w-full mt-3">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="scientific">Scientific</TabsTrigger>
                    <TabsTrigger value="professional">Professional</TabsTrigger>
                    <TabsTrigger value="custom">My Templates</TabsTrigger>
                  </TabsList>
                  <TabsContent value="academic" className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <TemplateChip 
                        name="Conference Paper" 
                        onClick={() => applyQuickTemplate("conferencePaper")} 
                      />
                      <TemplateChip 
                        name="Lab Report" 
                        onClick={() => applyQuickTemplate("labReport")} 
                      />
                      <TemplateChip 
                        name="Research Proposal" 
                        onClick={() => applyQuickTemplate("researchProposal")} 
                      />
                      <TemplateChip 
                        name="Thesis" 
                        onClick={() => applyQuickTemplate("thesis")} 
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="scientific" className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <TemplateChip 
                        name="Journal Article" 
                        onClick={() => applyQuickTemplate("journalArticle")} 
                      />
                      <TemplateChip 
                        name="Technical Documentation" 
                        onClick={() => applyQuickTemplate("technicalDoc")} 
                      />
                      <TemplateChip 
                        name="Math Assignment" 
                        onClick={() => applyQuickTemplate("mathAssignment")} 
                      />
                      <TemplateChip 
                        name="Physics Paper" 
                        onClick={() => applyQuickTemplate("physicsPaper")} 
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter className="mt-6 gap-3 flex-wrap items-center">
                  <div className="mr-auto flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    <span className="text-muted-foreground">Templates maintain your author name and document metadata</span>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Open dialog to create/save current document as template
                      toast({
                        title: "Feature coming soon",
                        description: "Save as template will be available in the next update",
                      });
                    }}
                  >
                    Save Current as Template
                  </Button>
                  <Button onClick={() => {
                    // Maybe use this button to browse community templates
                    toast({
                      title: "More templates",
                      description: "Community templates will be available soon",
                    });
                  }}>
                    Browse More Templates
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                >
                  <Sparkles className="h-4 w-4 mr-2" /> AI Assist
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center text-lg">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full p-1 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </div>
                    Gemini AI Assistant
                    <Badge variant="outline" className="ml-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200">
                      2.0
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    Let AI help you generate LaTeX code for complex equations, diagrams, and more.
                  </DialogDescription>
                </DialogHeader>

                {/* The rest of your AI panel content goes here */}
                <form onSubmit={handleAiSubmit} className="space-y-4 mt-2">
                  <div className="flex space-x-2">
                    <div className="relative flex-1 group">
                      <Input
                        placeholder="Describe the LaTeX content you need..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="pr-24 border-2 focus:border-blue-500 transition-all"
                        disabled={isGenerating}
                        autoFocus
                      />
                      {aiPrompt && (
                        <button 
                          type="button" 
                          onClick={() => setAiPrompt('')}
                          className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-xs opacity-50 pointer-events-none">
                        Enter ↵
                      </kbd>
                    </div>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 min-w-[130px]"
                    >
                      {isGenerating ? (
                        <>
                          <div className="mr-2 h-4 w-4 relative">
                            <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></div>
                            <div className="absolute inset-0 rounded-full border-t-2 border-white animate-spin"></div>
                          </div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <div className="mr-2 relative h-4 w-4">
                            <Sparkles className="h-4 w-4 absolute animate-pulse" />
                          </div>
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground font-medium">Suggested prompts</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs text-blue-500 hover:text-blue-600"
                        onClick={() => {
                          const examples = [
                            "Create a complex integral with solution steps",
                            "Generate a TikZ diagram of a finite state machine",
                            "Write a formal proof using mathematical induction",
                            "Create a professional academic CV template",
                            "Design a flowchart showing a binary search algorithm",
                            "Generate a probability distribution table with explanation",
                            "Create a commutative diagram for category theory",
                            "Write pseudocode for merge sort algorithm"
                          ];
                          const randomPrompt = examples[Math.floor(Math.random() * examples.length)];
                          setAiPrompt(randomPrompt);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
                        Surprise Me
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      <PromptCard
                        icon="matrix"
                        title="Matrix Equation"
                        onClick={() => setAiPrompt("Create a 3x3 matrix equation for eigenvalues")}
                      />
                      <PromptCard
                        icon="diagram"
                        title="Neural Network"
                        onClick={() => setAiPrompt("Generate a TikZ diagram of a simple neural network")}
                      />
                      <PromptCard
                        icon="table"
                        title="Algorithm Table"
                        onClick={() => setAiPrompt("Create a table comparing algorithm complexities")}
                      />
                      <PromptCard
                        icon="chemistry"
                        title="Chemical Equation"
                        onClick={() => setAiPrompt("Generate a chemical equation with reaction conditions")}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t">
                    <Tabs defaultValue="math" className="w-full max-w-md">
                      <TabsList>
                        <TabsTrigger value="math">Mathematics</TabsTrigger>
                        <TabsTrigger value="diagrams">Diagrams</TabsTrigger>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                      </TabsList>
                      <TabsContent value="math" className="mt-2">
                        <div className="flex flex-wrap gap-2">
                          <PromptChip text="Integral calculus" onClick={setAiPrompt} />
                          <PromptChip text="Differential equations" onClick={setAiPrompt} />
                          <PromptChip text="Linear algebra" onClick={setAiPrompt} />
                          <PromptChip text="Probability table" onClick={setAiPrompt} />
                        </div>
                      </TabsContent>
                      <TabsContent value="diagrams" className="mt-2">
                        <div className="flex flex-wrap gap-2">
                          <PromptChip text="Circuit diagram" onClick={setAiPrompt} />
                          <PromptChip text="Tree structure" onClick={setAiPrompt} />
                          <PromptChip text="State machine" onClick={setAiPrompt} />
                          <PromptChip text="Flow chart" onClick={setAiPrompt} />
                        </div>
                      </TabsContent>
                      <TabsContent value="templates" className="mt-2">
                        <div className="flex flex-wrap gap-2">
                          <PromptChip text="Theorem environment" onClick={setAiPrompt} />
                          <PromptChip text="Bibliography setup" onClick={setAiPrompt} />
                          <PromptChip text="APA citation format" onClick={setAiPrompt} />
                          <PromptChip text="Letter template" onClick={setAiPrompt} />
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                      <div className="h-5 w-5 mr-1.5 relative">
                        <img 
                          src="https://lh3.googleusercontent.com/a/AATXAJwKx5jUEN3u1PVLJz3g6mceFSxAHUi9qJO6wPF1=s96-c" 
                          className="w-full h-full object-contain opacity-90"
                          alt="Gemini logo"
                        />
                      </div>
                      <span>
                        Powered by <span className="font-medium">Google Gemini</span>
                      </span>
                    </div>
                  </div>
                </form>

                <DialogFooter className="mt-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-xs text-blue-700 dark:text-blue-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
                    Generated content is automatically inserted at the cursor position in your document.
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                >
                  <Users className="h-4 w-4 mr-2" /> Collaborate
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center text-lg">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full p-1 mr-3">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    Collaboration Tools
                    <Badge variant="outline" className="ml-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-200">
                      {getActiveCollaborators()} Online
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    Invite others to view or edit your document in real-time.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Invite section */}
                  <div className="bg-muted/40 rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-3">Invite Collaborators</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Enter email address"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="h-10 py-2 px-3 border rounded-md bg-background text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="editor">Can Edit</option>
                        <option value="viewer">Can View</option>
                      </select>
                      <Button onClick={addCollaborator} className="bg-indigo-600 hover:bg-indigo-700">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Collaborator
                      </Button>
                    </div>
                  </div>

                  {/* Collaborators list */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Current Collaborators</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {collaborators.length > 0 ? (
                        collaborators.map(collaborator => (
                          <div key={collaborator.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-muted transition-shadow hover:shadow-sm">
                            <div className="flex items-center space-x-3">
                              <Avatar className={collaborator.active ? "ring-2 ring-green-500" : ""}>
                                <AvatarImage src={`https://i.pravatar.cc/150?u=${collaborator.email}`} alt={collaborator.name} />
                                <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium flex items-center">
                                  {collaborator.name}
                                  {collaborator.active && (
                                    <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">{collaborator.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={collaborator.role === "editor" ? "default" : "outline"} className="text-xs">
                                {collaborator.role === "editor" ? "Editor" : "Viewer"}
                              </Badge>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removeCollaborator(collaborator.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>No collaborators yet</p>
                          <p className="text-sm">Start by inviting someone above</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Share link section */}
                  <div className="bg-muted/40 rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-3">Share Document Link</h3>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <LinkIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={documentLink}
                          readOnly
                          className="pl-10 pr-20"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 text-indigo-600"
                          onClick={copyLink}
                        >
                          <CopyIcon className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <select
                        className="h-8 py-1 px-2 border rounded-md bg-background text-xs"
                        defaultValue="anyone-with-link"
                      >
                        <option value="anyone-with-link">Anyone with the link</option>
                        <option value="specific-people">Only invited people</option>
                        <option value="organization">Anyone in my organization</option>
                      </select>
                      <select
                        className="h-8 py-1 px-2 border rounded-md bg-background text-xs"
                        defaultValue="can-view"
                      >
                        <option value="can-edit">Can edit</option>
                        <option value="can-view">Can view</option>
                        <option value="can-comment">Can comment</option>
                      </select>
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        <Shield className="h-3.5 w-3.5 mr-1" />
                        Advanced Settings
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-2 text-xs text-indigo-700 dark:text-indigo-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
                    Changes to collaborator permissions take effect immediately
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        )

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
        <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-64px)]">
          <ResizablePanel defaultSize={50} minSize={30} className="overflow-auto">
            {/* LaTeX Editor */}
            <LaTeXEditor value={latex} onChange={setLatex} />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={50} minSize={30} className="overflow-auto">
            {/* PDF Preview */}
            {isCompiling ? (
              <div className="h-full flex items-center justify-center bg-neutral-800">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-red-500" />
                  <p className="text-white">Compiling PDF...</p>
                </div>
              </div>
            ) : (
              <div className="h-full w-full pdf-container" style={{ overflow: 'auto' }}>
                <PDFViewer pdfUrl={pdfUrl} />
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
        
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

      {/* Scroll controls */}
      <div className="fixed right-6 bottom-6 flex flex-col gap-2 z-50">
        <Button 
          size="icon"
          variant="secondary"
          className="rounded-full shadow-lg bg-opacity-70 backdrop-blur-sm" 
          onClick={() => {
            // Find both editor and PDF containers
            const editorContainer = document.querySelector('.cm-content');
            const pdfContainer = document.querySelector('.pdf-container');
            
            // Scroll to top
            editorContainer?.scrollTo({ top: 0, behavior: 'smooth' });
            pdfContainer?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
        </Button>
        
        <Button 
          size="icon"
          variant="secondary" 
          className="rounded-full shadow-lg bg-opacity-70 backdrop-blur-sm"
          onClick={() => {
            // Find both editor and PDF containers
            const editorContainer = document.querySelector('.cm-content');
            const pdfContainer = document.querySelector('.pdf-container');
            
            // Scroll to bottom
            if (editorContainer) {
              editorContainer.scrollTo({ 
                top: editorContainer.scrollHeight, 
                behavior: 'smooth' 
              });
            }
            if (pdfContainer) {
              pdfContainer.scrollTo({ 
                top: pdfContainer.scrollHeight, 
                behavior: 'smooth' 
              });
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </Button>
      </div>
    </EditorLayout>
  );
}

// PDF Viewer component definition
const PDFViewer = ({ pdfUrl }: { pdfUrl: string }) => {
  if (!pdfUrl) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-center p-8">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground mb-4 opacity-50">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <h3 className="font-medium mb-2">No PDF to display</h3>
          <p className="text-sm text-muted-foreground">Click the Compile button to generate a PDF preview</p>
        </div>
      </div>
    );
  }

  return (
    // Fix iframe with explicit styling 
    <iframe 
      src={`${pdfUrl}#view=FitH&toolbar=0&navpanes=0`}
      className="w-full h-full min-h-[600px] border-0" 
      title="PDF Preview"
      style={{ height: '100%', minHeight: '600px', display: 'block' }}
    />
  );
};

// Add these component definitions near the top of your file:

const PromptCard = ({ icon, title, onClick }: { icon: string, title: string, onClick: () => void }) => {
  const icons = {
    matrix: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
    ),
    diagram: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="12" y1="8" x2="5" y2="16"/><line x1="12" y1="8" x2="19" y2="16"/></svg>
    ),
    table: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line></svg>
    ),
    chemistry: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"></path><path d="M14 9.3V2"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6 6 0 1 1-4 0"></path><path d="M5.17 14.83l4.24-4.24"></path></svg>
    )
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
    >
      <div className="text-blue-500 mb-2 group-hover:scale-110 transition-transform duration-200">
        {icons[icon as keyof typeof icons]}
      </div>
      <span className="text-sm font-medium">{title}</span>
    </button>
  );
};

const PromptChip = ({ text, onClick }: { text: string, onClick: (text: string) => void }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(`Generate LaTeX code for ${text}`)}
      className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
    >
      {text}
    </button>
  );
};

// Add these component definitions with your other components:

interface TemplateCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  previewImage?: string;
}

const TemplateCard = ({ title, description, icon, onClick, previewImage }: TemplateCardProps) => {
  return (
    <div className="border rounded-lg overflow-hidden hover:border-amber-400 transition-all duration-200 hover:shadow-md group cursor-pointer" onClick={onClick}>
      <div className="aspect-[4/3] bg-muted/40 relative overflow-hidden flex items-center justify-center">
        {previewImage ? (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
        ) : null}
        {previewImage ? (
          <img 
            src={previewImage} 
            alt={`${title} template preview`} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-4xl text-muted-foreground">{icon}</div>
        )}
        <div className="absolute bottom-3 left-3 right-3 z-20">
          <h3 className={`font-semibold text-lg ${previewImage ? 'text-white' : ''}`}>{title}</h3>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
            Use Template
          </Button>
        </div>
      </div>
    </div>
  );
};

interface TemplateChipProps {
  name: string;
  onClick: () => void;
}

const TemplateChip = ({ name, onClick }: TemplateChipProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-3 border rounded-lg text-sm hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors text-left flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
      {name}
    </button>
  );
};