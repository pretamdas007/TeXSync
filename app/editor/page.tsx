"use client";

import { useState, useEffect, useRef } from "react";
import { EditorLayout } from "@/components/editor/editor-layout";
import { Button } from "@/components/ui/button";
import { 
  Loader2, FileDown, Copy, Save, Play, 
  Sparkles, ChevronUp, ChevronDown, Share2, User, Users, X, Mail, Link as LinkIcon, Copy as CopyIcon, UserPlus, Shield, MessageSquare, Send, Bot, Mic, MicOff, Search, MoreVertical, Settings, Download, Palette
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Split from "react-split";
import { Input } from "@/components/ui/input"; // You'll need this component
import { Textarea } from "@/components/ui/textarea";
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

function EditorPageComponent() {
  const [latex, setLatex] = useState(initialLatex);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

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
  // Floating AI Chat Window state
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [isFloatingChatMinimized, setIsFloatingChatMinimized] = useState(false);  // AI Chat specific state
  const [chatMessages, setChatMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: Date, isStreaming?: boolean, reactions?: string[]}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);  const [chatPosition, setChatPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showQuickActions, setShowQuickActions] = useState(false);  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: Date, isStreaming?: boolean, reactions?: string[]}>>([]);
  const [chatTheme, setChatTheme] = useState<'default' | 'dark' | 'neon' | 'minimal'>('default');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [autoSuggestions, setAutoSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [chatHistoryIndex, setChatHistoryIndex] = useState(-1);  const [isRecording, setIsRecording] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [messageThreads, setMessageThreads] = useState<{[key: string]: string[]}>({});
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'normal' | 'code' | 'equation' | 'debug'>('normal');
  const [savedPrompts, setSavedPrompts] = useState<Array<{id: string, name: string, prompt: string}>>([
    { id: '1', name: 'Matrix Help', prompt: 'Help me create a matrix in LaTeX' },
    { id: '2', name: 'Equation Format', prompt: 'How do I format complex equations?' },
    { id: '3', name: 'Bibliography', prompt: 'Help me set up bibliography and citations' }
  ]);
  const [showSavedPrompts, setShowSavedPrompts] = useState(false);
  const [chatStats, setChatStats] = useState({ messagesCount: 0, codeBlocksGenerated: 0, helpfulResponses: 0 });
  const [messageQueue, setMessageQueue] = useState<Array<{id: string, content: string, delay: number}>>([]);  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  
  // Enhanced chat features
  const [chatBookmarks, setChatBookmarks] = useState<string[]>([]);
  const [chatLabels, setChatLabels] = useState<{[messageId: string]: string[]}>({});
  const [chatFavorites, setChatFavorites] = useState<string[]>([]);
  const [smartMode, setSmartMode] = useState(true);
  const [contextAware, setContextAware] = useState(true);
  const [chatLanguage, setChatLanguage] = useState('en');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [chatPersonality, setChatPersonality] = useState('helpful');
  const [autoComplete, setAutoComplete] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [messageFormatting, setMessageFormatting] = useState('rich');
  const [chatBackup, setChatBackup] = useState(true);
  const [collaborativeMode, setCollaborativeMode] = useState(false);
  const [messageEdit, setMessageEdit] = useState<{messageId: string, content: string} | null>(null);
  const [chatAnalytics, setChatAnalytics] = useState({
    totalSessions: 0,
    averageResponseTime: 0,
    popularQueries: [] as string[],
    userSatisfaction: 0
  });
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);  // Initialize chat messages after component mounts to avoid hydration errors
  useEffect(() => {
    setIsMounted(true);
    setChatMessages([{
      id: 'welcome',
      role: 'assistant',
      content: '# ✨ Welcome to TeXSync AI! ✨\n\n🚀 **Your LaTeX writing companion is here!**\n\nI can help you with:\n• Creating complex equations and formulas\n• Document formatting and structure\n• LaTeX code optimization\n• TikZ diagrams and figures\n• Bibliography management\n• Error debugging\n\n💡 **What would you like to create today?**',
      timestamp: new Date(),
      reactions: []
    }]);
  }, []);

  // Prevent hydration mismatch by not rendering interactive elements on first render
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Drag functionality for floating chat
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!chatRef.current) return;
    const rect = chatRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setChatPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);  // Filter messages based on search query
  useEffect(() => {
    if (!chatMessages) return;
    if (!chatSearchQuery.trim()) {
      setFilteredMessages(chatMessages);
    } else {
      const filtered = chatMessages.filter(message =>
        message.content.toLowerCase().includes(chatSearchQuery.toLowerCase())
      );
      setFilteredMessages(filtered);
    }
  }, [chatMessages, chatSearchQuery]);

  // Auto-suggestions for common LaTeX queries
  const latexSuggestions = [
    "How do I create a matrix?",
    "How to add citations?",
    "Create a table",
    "Mathematical symbols",
    "How to include images?",
    "Bibliography setup",
    "Equation numbering",
    "Page formatting",
    "Custom commands",
    "TikZ diagrams"
  ];

  useEffect(() => {
    if (chatInput.length > 2) {
      const suggestions = latexSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(chatInput.toLowerCase())
      );
      setAutoSuggestions(suggestions.slice(0, 3));
    } else {
      setAutoSuggestions([]);
    }
  }, [chatInput]);

  // Keyboard shortcuts for chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showFloatingChat) return;

      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !isFloatingChatMinimized) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search chat..."]') as HTMLInputElement;
        searchInput?.focus();
      }

      // Escape to close quick actions or emoji picker
      if (e.key === 'Escape') {
        setShowQuickActions(false);
        setShowEmojiPicker(null);
        setShowChatSettings(false);
      }

      // Arrow keys for suggestion navigation
      if (autoSuggestions.length > 0 && document.activeElement === inputRef.current) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedSuggestion(prev => (prev + 1) % autoSuggestions.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedSuggestion(prev => prev <= 0 ? autoSuggestions.length - 1 : prev - 1);
        } else if (e.key === 'Tab' && selectedSuggestion >= 0) {
          e.preventDefault();
          setChatInput(autoSuggestions[selectedSuggestion]);
          setAutoSuggestions([]);
          setSelectedSuggestion(-1);
        }
      }      // Chat history navigation
      if (document.activeElement === inputRef.current && !chatInput.trim()) {
        if (e.key === 'ArrowUp' && e.ctrlKey) {
          e.preventDefault();
          if (chatHistoryIndex < chatHistory.length - 1) {
            const newIndex = chatHistoryIndex + 1;
            setChatHistoryIndex(newIndex);
            setChatInput(chatHistory[chatHistory.length - 1 - newIndex]);
          }
        } else if (e.key === 'ArrowDown' && e.ctrlKey) {
          e.preventDefault();
          if (chatHistoryIndex > 0) {
            const newIndex = chatHistoryIndex - 1;
            setChatHistoryIndex(newIndex);
            setChatInput(chatHistory[chatHistory.length - 1 - newIndex]);
          } else if (chatHistoryIndex === 0) {
            setChatHistoryIndex(-1);
            setChatInput('');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);    }, [showFloatingChat, isFloatingChatMinimized, autoSuggestions, selectedSuggestion, chatInput, chatHistory, chatHistoryIndex]);

  // Close quick actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showQuickActions && chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showQuickActions]);

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

  // Add this to your state variables  // Set XeLaTeX as default for better Unicode support with the heart symbol
  const [latexEngine, setLatexEngine] = useState<'pdflatex' | 'xelatex' | 'lualatex'>('xelatex');
  // Get backend URL from environment variable (for Vercel/Render deployment)
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Update the compilePdf function to include the engine
  const compilePdf = async () => {
    setIsCompiling(true);
    
    // Debug: Log the backend URL
    console.log('Backend URL:', BACKEND_URL);
    
    try {
      // Send the LaTeX content to the backend for compilation
      const response = await fetch(`${BACKEND_URL}/api/compile`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ 
          latex,
          engine: latexEngine  // Add this line to send the engine parameter
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
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

  // Function to highlight search terms
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        `<mark class="bg-violet-400/30 text-violet-200 px-1 rounded">${part}</mark>` : 
        part
    ).join('');
  };
  // Quick Actions for chat
  const quickActionsList = [
    {
      icon: "📝",
      label: "Insert Code",
      action: () => {
        const lastMessage = chatMessages[chatMessages.length - 1];
        if (lastMessage?.role === 'assistant') {
          const codeBlocks = lastMessage.content.match(/```[\s\S]*?```/g);
          if (codeBlocks) {
            const cleanCode = codeBlocks[0].replace(/```(latex|tex)?\n?|\n?```/g, '');
            setLatex(prev => prev + '\n\n' + cleanCode);
            toast({ title: "Code inserted into document" });
          }
        }
        setShowQuickActions(false);
      }
    },
    {
      icon: "🗑️",
      label: "Clear Chat",
      action: () => {        setChatMessages([{
          id: 'welcome',
          role: 'assistant',
          content: '# ✨ Welcome to TeXSync AI! ✨\n\n🚀 **Your LaTeX writing companion is here!**\n\nI can help you with:\n• Creating complex equations and formulas\n• Document formatting and structure\n• LaTeX code optimization\n• TikZ diagrams and figures\n• Bibliography management\n• Error debugging\n\n💡 **What would you like to create today?**',
          timestamp: new Date(),
          reactions: []
        }]);
        setShowQuickActions(false);
        toast({ title: "Chat cleared" });
      }
    },
    {
      icon: "📋",
      label: "Export Chat",
      action: () => {
        const chatText = chatMessages.map(m => 
          `${m.role.toUpperCase()}: ${m.content}\n---\n`
        ).join('\n');
        navigator.clipboard.writeText(chatText);
        setShowQuickActions(false);
        toast({ title: "Chat exported to clipboard" });
      }
    },
    {
      icon: "�",
      label: "Save as PDF",
      action: () => {
        const chatContent = chatMessages.map(m => 
          `**${m.role.toUpperCase()}** (${m.timestamp.toLocaleString()})\n${m.content}\n\n`
        ).join('');
        
        // Create a simple HTML for PDF generation
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head><title>TeXSync AI Chat Export</title></head>
          <body style="font-family: Arial, sans-serif; margin: 40px;">
            <h1>TeXSync AI Chat Export</h1>
            <p><strong>Exported on:</strong> ${new Date().toLocaleString()}</p>
            <hr>
            <pre style="white-space: pre-wrap;">${chatContent}</pre>
          </body>
          </html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `texsync-chat-${new Date().toISOString().split('T')[0]}.html`;
        a.click();
        URL.revokeObjectURL(url);
        
        setShowQuickActions(false);
        toast({ title: "Chat exported as HTML" });
      }
    },
    {
      icon: "🎨",
      label: "Change Theme",
      action: () => {
        const themes: Array<'default' | 'dark' | 'neon' | 'minimal'> = ['default', 'dark', 'neon', 'minimal'];
        const currentIndex = themes.indexOf(chatTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        setChatTheme(nextTheme);
        setShowQuickActions(false);
        toast({ title: `Theme changed to ${nextTheme}` });
      }
    },
    {
      icon: "⚙️",
      label: "Settings",
      action: () => {
        setShowChatSettings(true);
        setShowQuickActions(false);
      }
    }
  ];  const sendChatMessage = async () => {
    if (!chatInput.trim() || isAITyping) return;    // Add to history
    if (chatInput.trim() && !chatHistory.includes(chatInput.trim())) {
      setChatHistory(prev => [chatInput.trim(), ...prev.slice(0, 49)]); // Keep last 50
    }
    setChatHistoryIndex(-1);

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: chatInput,
      timestamp: new Date(),
      reactions: []
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAITyping(true);
    setAutoSuggestions([]);

    try {
      const response = await fetch('/api/ai-latex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          context: 'LaTeX and academic writing assistant - TeXSync AI chat within editor',
          conversationHistory: chatMessages.slice(-6)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: data.response,
          timestamp: new Date(),
          reactions: []
        };
        
        setChatMessages(prev => [...prev, aiMessage]);
        
        // If the response contains LaTeX code, offer to insert it
        if (data.response.includes('\\') || data.response.includes('$')) {
          toast({
            title: "LaTeX code detected",
            description: "Click to insert the generated code into your document",
            action: (
              <Button 
                size="sm" 
                onClick={() => {
                  const codeBlocks = data.response.match(/```[\s\S]*?```/g);
                  if (codeBlocks) {
                    const cleanCode = codeBlocks[0].replace(/```(latex|tex)?\n?|\n?```/g, '');
                    setLatex(prev => prev + '\n\n' + cleanCode);
                  }
                }}
              >
                Insert
              </Button>
            )
          });
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        reactions: []
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAITyping(false);
    }
  };  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'k') {
        e.preventDefault();
        const searchElement = document.querySelector('[placeholder*="search"]') as HTMLInputElement;
        if (searchElement) {
          searchElement.focus();
          searchElement.select();
        }
        return;
      }
      if (e.key === 'l') {
        e.preventDefault();
        setChatMessages([]);
        return;
      }
    }

    // Handle suggestion navigation
    if (autoSuggestions.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev <= 0 ? autoSuggestions.length - 1 : prev - 1
        );
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev >= autoSuggestions.length - 1 ? 0 : prev + 1
        );
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          setChatInput(autoSuggestions[selectedSuggestion]);
          setAutoSuggestions([]);
          setSelectedSuggestion(-1);
        }
        return;
      }
      if (e.key === 'Escape') {
        setAutoSuggestions([]);
        setSelectedSuggestion(-1);
        return;
      }
    }

    // Handle message history navigation
    if (e.key === 'ArrowUp' && e.ctrlKey && chatInput.trim() === '') {
      e.preventDefault();
      if (chatHistory.length > 0) {
        const newIndex = Math.min(chatHistoryIndex + 1, chatHistory.length - 1);
        setChatHistoryIndex(newIndex);
        setChatInput(chatHistory[newIndex] || '');
      }
      return;
    }
    if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      if (chatHistoryIndex > 0) {
        const newIndex = chatHistoryIndex - 1;
        setChatHistoryIndex(newIndex);
        setChatInput(chatHistory[newIndex] || '');
      } else if (chatHistoryIndex === 0) {
        setChatHistoryIndex(-1);
        setChatInput('');
      }
      return;
    }

    // Handle Enter key for sending
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (selectedSuggestion >= 0 && autoSuggestions.length > 0) {
        setChatInput(autoSuggestions[selectedSuggestion]);
        setAutoSuggestions([]);
        setSelectedSuggestion(-1);
      } else if (chatInput.trim()) {
        sendChatMessage();
      }
    }
  };
  // Add reaction to message
  const addReaction = (messageId: string, emoji: string) => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingIndex = reactions.indexOf(emoji);
        if (existingIndex >= 0) {
          // Remove reaction if it already exists
          return { ...msg, reactions: reactions.filter((_: string, i: number) => i !== existingIndex) };
        } else {
          // Add new reaction
          return { ...msg, reactions: [...reactions, emoji] };
        }
      }
      return msg;
    }));
    setShowEmojiPicker(null);
  };

  // Get theme styles
  const getThemeStyles = () => {
    switch (chatTheme) {
      case 'dark':
        return {
          container: 'from-slate-950/98 via-gray-900/60 to-black/80',
          header: 'from-gray-800/30 via-slate-800/30 to-gray-900/30',
          border: 'border-gray-600/40',
          accent: 'from-gray-500 to-slate-600'
        };
      case 'neon':
        return {
          container: 'from-purple-950/95 via-pink-900/50 to-cyan-900/60',
          header: 'from-purple-600/20 via-pink-600/20 to-cyan-600/20',
          border: 'border-cyan-400/50',
          accent: 'from-cyan-500 to-purple-500'
        };
      case 'minimal':
        return {
          container: 'from-white/95 via-gray-50/50 to-slate-100/60',
          header: 'from-gray-100/20 via-slate-100/20 to-gray-200/20',
          border: 'border-gray-300/50',
          accent: 'from-gray-600 to-slate-700'
        };
      default:
        return {
          container: 'from-slate-900/95 via-violet-900/50 to-indigo-900/60',
          header: 'from-violet-600/20 via-purple-600/20 to-indigo-600/20',
          border: 'border-violet-400/50',
          accent: 'from-violet-500 to-purple-500'
        };
    }
  };
  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Enhanced chat functions
  const bookmarkMessage = (messageId: string) => {
    setChatBookmarks(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const favoriteMessage = (messageId: string) => {
    setChatFavorites(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const addLabelToMessage = (messageId: string, label: string) => {
    setChatLabels(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), label]
    }));
  };

  const removeLabelFromMessage = (messageId: string, label: string) => {
    setChatLabels(prev => ({
      ...prev,
      [messageId]: (prev[messageId] || []).filter(l => l !== label)
    }));
  };

  const editMessage = (messageId: string, newContent: string) => {
    setChatMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: newContent, edited: true }
        : msg
    ));
    setMessageEdit(null);
  };

  const pinMessage = (messageId: string) => {
    // Implementation for pinning important messages
    const message = chatMessages.find(m => m.id === messageId);
    if (message) {
      toast({
        title: "Message Pinned",
        description: "Important message saved for quick access",
      });
    }
  };

  const generateSmartSuggestions = (input: string) => {
    const suggestions = [
      'How do I create a matrix in LaTeX?',
      'Help me format mathematical equations',
      'Show me TikZ diagram examples',
      'How to add bibliography and citations?',
      'Create a theorem environment',
      'Format tables in LaTeX',
      'Add hyperlinks to my document',
      'Debug LaTeX compilation errors',
      'Insert mathematical symbols',
      'Create numbered lists and enumerations'
    ];
    
    const filtered = suggestions.filter(s => 
      s.toLowerCase().includes(input.toLowerCase())
    );
    
    setAutoSuggestions(filtered.slice(0, 5));
  };

  const exportChatAsMarkdown = () => {
    const markdown = chatMessages.map(msg => {
      const timestamp = msg.timestamp.toLocaleString();
      const role = msg.role === 'user' ? '👤 **User**' : '🤖 **TeXSync AI**';
      const bookmarked = chatBookmarks.includes(msg.id) ? ' 🔖' : '';
      const favorited = chatFavorites.includes(msg.id) ? ' ⭐' : '';
      const labels = chatLabels[msg.id]?.length 
        ? ` 🏷️ ${chatLabels[msg.id].join(', ')}` 
        : '';
      
      return `## ${role}${bookmarked}${favorited}${labels}\n*${timestamp}*\n\n${msg.content}\n\n---\n`;
    }).join('\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `texsync-chat-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const analyzeChat = () => {
    const totalMessages = chatMessages.length;
    const userMessages = chatMessages.filter(m => m.role === 'user').length;
    const aiMessages = chatMessages.filter(m => m.role === 'assistant').length;
    const averageMessageLength = chatMessages.reduce((acc, msg) => acc + msg.content.length, 0) / totalMessages;
    
    const queryTypes = chatMessages
      .filter(m => m.role === 'user')
      .map(m => {
        const content = m.content.toLowerCase();
        if (content.includes('matrix') || content.includes('table')) return 'matrix/table';
        if (content.includes('equation') || content.includes('formula')) return 'equations';
        if (content.includes('tikz') || content.includes('diagram')) return 'diagrams';
        if (content.includes('bibliography') || content.includes('citation')) return 'citations';
        if (content.includes('error') || content.includes('debug')) return 'debugging';
        return 'general';
      });

    const queryCounts = queryTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setChatAnalytics(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + 1,
      popularQueries: Object.keys(queryCounts).sort((a, b) => queryCounts[b] - queryCounts[a])
    }));

    return {
      totalMessages,
      userMessages,
      aiMessages,
      averageMessageLength: Math.round(averageMessageLength),
      queryTypes: queryCounts
    };
  };

  const translateMessage = async (messageId: string, targetLang: string) => {
    // Placeholder for translation functionality
    toast({
      title: "Translation Feature",
      description: "Message translation coming soon!",
    });
  };

  const shareMessage = (messageId: string) => {
    const message = chatMessages.find(m => m.id === messageId);
    if (message && navigator.share) {
      navigator.share({
        title: 'TeXSync AI Chat Message',
        text: message.content,
        url: window.location.href
      });
    } else if (message) {
      navigator.clipboard.writeText(message.content);
      toast({
        title: "Message Copied",
        description: "Message content copied to clipboard",
      });
    }
  };

  const voiceToText = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(prev => prev + transcript);
      };
      
      recognition.start();
    } else {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition",
      });
    }
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
};  // Modified return section with enhanced UI
  return (
    <>
      {!isMounted ? (
        // Render a loading state or placeholder to prevent hydration errors
        <div className="h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            <p className="text-sm text-muted-foreground">Loading TeXSync Editor...</p>
          </div>
        </div>      ) : (
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
            </Dialog>            <Dialog>
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
      </div>      {/* Scroll controls - Only render after hydration */}
      {hasHydrated && (
        <div className="fixed right-6 bottom-6 flex flex-col gap-2 z-50" suppressHydrationWarning>
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
      )}
        </EditorLayout>
      )}      {/* Floating AI Chat Button - Only render after hydration */}
      {hasHydrated && !showFloatingChat && (
        <Button 
          onClick={() => setShowFloatingChat(true)}
          className="fixed bottom-6 right-6 z-50 h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-700 shadow-2xl hover:shadow-violet-500/40 transition-all duration-300 hover:scale-110 p-0 animate-pulse border border-violet-400/30"
          title="Open TeXSync AI Chat"
          suppressHydrationWarning
        >
          <div className="flex flex-col items-center justify-center space-y-1">
            <Sparkles className="h-6 w-6 text-white animate-pulse" />
            <span className="text-[10px] text-white font-bold leading-tight text-center">TeXSync<br/>AI</span>
          </div>
        </Button>
      )}      {/* Floating AI Chat Window - Only render after hydration */}
      {hasHydrated && showFloatingChat && (
        <div 
          ref={chatRef}
          className={`fixed z-50 bg-gradient-to-br ${getThemeStyles().container} backdrop-blur-3xl border-2 ${getThemeStyles().border} rounded-3xl shadow-2xl shadow-violet-500/40 transition-all duration-500 hover:shadow-violet-400/50 ${
            isFloatingChatMinimized ? 'w-80 h-16' : 'w-[480px] h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]'
          } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            left: chatPosition.x || 'calc(100vw - 520px)',
            bottom: chatPosition.y || '1rem',
            right: 'auto',
            top: 'auto'
          }}
          suppressHydrationWarning
        >
          {/* Chat Header */}
          <div 
            className={`flex items-center justify-between p-4 border-b ${getThemeStyles().border} bg-gradient-to-r ${getThemeStyles().header} rounded-t-3xl cursor-grab active:cursor-grabbing`}
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-violet-500/40 animate-pulse">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              {!isFloatingChatMinimized && (
                <div>
                  <h3 className="text-white font-bold text-lg bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                    TeXSync AI
                  </h3>
                  <p className="text-gray-300 text-xs flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full animate-pulse"></div>
                    <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Ready to help with LaTeX</span>
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {!isFloatingChatMinimized && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    className="h-8 w-8 p-0 hover:bg-violet-700/50 text-violet-300 hover:text-white transition-colors rounded-xl mr-1"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  
                  {showQuickActions && (
                    <div className="absolute right-0 top-10 bg-slate-800/95 backdrop-blur-xl border border-violet-400/30 rounded-xl shadow-xl shadow-violet-500/20 py-2 min-w-[160px] z-10">
                      {quickActionsList.map((action, index) => (
                        <button
                          key={index}
                          onClick={action.action}
                          className="w-full px-4 py-2 text-left hover:bg-violet-600/30 transition-colors flex items-center gap-3 text-white text-sm"
                        >
                          <span className="text-lg">{action.icon}</span>
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFloatingChatMinimized(!isFloatingChatMinimized)}
                className="h-8 w-8 p-0 hover:bg-violet-700/50 text-violet-300 hover:text-white transition-colors rounded-xl"
              >
                {isFloatingChatMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFloatingChat(false)}
                className="h-8 w-8 p-0 hover:bg-violet-700/50 text-violet-300 hover:text-white transition-colors rounded-xl"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>          {/* Chat Content */}
          {!isFloatingChatMinimized && (
            <div className="h-[calc(100%-4rem)] flex flex-col">
              {/* Search Bar */}
              {chatMessages.length > 2 && (
                <div className="px-4 pt-2 pb-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-violet-400" />
                    <input
                      type="text"
                      placeholder="Search chat..."
                      value={chatSearchQuery}
                      onChange={(e) => setChatSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-violet-400/30 rounded-xl text-white placeholder-violet-300/60 focus:outline-none focus:border-violet-400 transition-colors text-sm"
                    />
                    {chatSearchQuery && (
                      <button
                        onClick={() => setChatSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-violet-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll-container scrollbar-thin scrollbar-thumb-violet-500/50 scrollbar-track-transparent hover:scrollbar-thumb-violet-400/70">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/40">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : ''}`}>
                      <div
                        className={`p-4 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 border border-violet-400/30'
                            : 'bg-slate-800/90 text-gray-100 border border-violet-400/30 shadow-lg shadow-violet-500/15 backdrop-blur-sm'
                        }`}
                      >                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm prose-invert max-w-none">
                            {message.content.split('\n').map((line, i) => {
                              const highlightedLine = highlightSearchTerm(line, chatSearchQuery);
                              if (line.startsWith('# ')) {
                                return <h3 key={i} className="text-lg font-semibold text-violet-200 mb-2" dangerouslySetInnerHTML={{__html: highlightedLine.replace('# ', '')}} />;
                              } else if (line.startsWith('## ')) {
                                return <h4 key={i} className="text-base font-medium text-violet-300 mb-1" dangerouslySetInnerHTML={{__html: highlightedLine.replace('## ', '')}} />;
                              } else if (line.startsWith('• ')) {
                                return <p key={i} className="text-sm text-gray-300 mb-1 ml-2" dangerouslySetInnerHTML={{__html: highlightedLine}} />;
                              } else if (line.trim() === '') {
                                return <br key={i} />;
                              } else {
                                return <p key={i} className="text-sm text-gray-200 mb-1" dangerouslySetInnerHTML={{__html: highlightedLine}} />;
                              }
                            })}
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{__html: highlightSearchTerm(message.content, chatSearchQuery)}} />
                        )}
                      </div>                      <div className="flex items-center justify-between gap-2 mt-2 px-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-violet-400/80" suppressHydrationWarning>
                            {hasHydrated ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </span>
                          
                          {/* Message status indicators */}
                          <div className="flex items-center gap-1">
                            {chatBookmarks.includes(message.id) && (
                              <span className="text-xs text-amber-400" title="Bookmarked">🔖</span>
                            )}
                            {chatFavorites.includes(message.id) && (
                              <span className="text-xs text-red-400" title="Favorited">⭐</span>
                            )}
                            {chatLabels[message.id]?.length > 0 && (
                              <div className="flex gap-1">
                                {chatLabels[message.id].slice(0, 2).map((label, idx) => (
                                  <span key={idx} className="text-xs bg-violet-700/40 px-1 rounded text-violet-200" title={`Label: ${label}`}>
                                    {label}
                                  </span>
                                ))}
                                {chatLabels[message.id].length > 2 && (
                                  <span className="text-xs text-violet-400">+{chatLabels[message.id].length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Message reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex gap-1">
                              {message.reactions.map((reaction, index) => (
                                <button
                                  key={index}
                                  onClick={() => addReaction(message.id, reaction)}
                                  className="text-xs bg-violet-700/30 hover:bg-violet-600/40 px-2 py-1 rounded-full transition-colors"
                                >
                                  {reaction}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {/* Enhanced action buttons */}
                          <div className="relative group">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-violet-700/50 text-violet-400 hover:text-violet-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              title="More actions"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                            
                            <div className="absolute right-0 bottom-8 bg-slate-800/95 backdrop-blur-xl border border-violet-400/30 rounded-xl shadow-xl p-2 z-20 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity min-w-[160px]">
                              <div className="space-y-1">
                                <button
                                  onClick={() => bookmarkMessage(message.id)}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-violet-600/30 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  🔖 {chatBookmarks.includes(message.id) ? 'Remove Bookmark' : 'Bookmark'}
                                </button>
                                <button
                                  onClick={() => favoriteMessage(message.id)}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-violet-600/30 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  ⭐ {chatFavorites.includes(message.id) ? 'Remove Favorite' : 'Favorite'}
                                </button>
                                <button
                                  onClick={() => pinMessage(message.id)}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-violet-600/30 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  📌 Pin Message
                                </button>
                                <button
                                  onClick={() => shareMessage(message.id)}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-violet-600/30 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  📤 Share
                                </button>
                                {message.role === 'user' && (
                                  <button
                                    onClick={() => setMessageEdit({messageId: message.id, content: message.content})}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-violet-600/30 rounded-lg transition-colors flex items-center gap-2"
                                  >
                                    ✏️ Edit
                                  </button>
                                )}
                                <button
                                  onClick={() => translateMessage(message.id, chatLanguage === 'en' ? 'es' : 'en')}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-violet-600/30 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  🌐 Translate
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Reaction button */}
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                              className="h-6 w-6 p-0 hover:bg-violet-700/50 text-violet-400 hover:text-violet-300 rounded-lg"
                              title="Add reaction"
                            >
                              😊
                            </Button>
                            
                            {showEmojiPicker === message.id && (
                              <div className="absolute right-0 bottom-8 bg-slate-800/95 backdrop-blur-xl border border-violet-400/30 rounded-xl shadow-xl p-2 z-20">
                                <div className="grid grid-cols-6 gap-1">
                                  {['👍', '❤️', '😊', '🎉', '🚀', '💡', '🔥', '👏', '✨', '🎯', '📝', '💯'].map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => addReaction(message.id, emoji)}
                                      className="w-8 h-8 hover:bg-violet-600/30 rounded-lg transition-colors text-sm"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {message.role === 'assistant' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(message.content);
                                toast({ title: "Copied to clipboard" });
                              }}
                              className="h-6 w-6 p-0 hover:bg-violet-700/50 text-violet-400 hover:text-violet-300 rounded-lg"
                              title="Copy message"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center flex-shrink-0 order-3 border border-violet-400/30 shadow-lg shadow-violet-500/20">
                        <User className="h-4 w-4 text-violet-300" />
                      </div>
                    )}
                  </div>                ))}
                
                {/* No search results message */}
                {chatSearchQuery && filteredMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Search className="h-12 w-12 text-violet-400/60 mb-3" />
                    <p className="text-violet-300/80 text-sm">No messages found for "{chatSearchQuery}"</p>
                    <button
                      onClick={() => setChatSearchQuery('')}
                      className="text-violet-400 hover:text-violet-300 text-xs mt-2 underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}
                
                {isAITyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/40">
                      <Sparkles className="h-4 w-4 text-white animate-pulse" />
                    </div>
                    <div className="bg-slate-800/90 border border-violet-400/30 p-3 rounded-2xl shadow-lg shadow-violet-500/15 backdrop-blur-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>              {/* Chat Input */}
              <div className={`p-4 border-t ${getThemeStyles().border} bg-gradient-to-r ${getThemeStyles().header} rounded-b-3xl`}>
                {/* Auto-suggestions */}
                {autoSuggestions.length > 0 && (
                  <div className="mb-3 space-y-1">
                    {autoSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setChatInput(suggestion);
                          setAutoSuggestions([]);
                          setSelectedSuggestion(-1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                          index === selectedSuggestion
                            ? 'bg-violet-600/50 text-white'
                            : 'bg-slate-700/50 text-violet-300 hover:bg-violet-600/30'
                        }`}
                      >
                        💡 {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                  <div className="flex gap-3">
                  <div className="flex-1 relative">
                    {/* Message edit overlay */}
                    {messageEdit && (
                      <div className="absolute inset-0 bg-slate-800/95 backdrop-blur-sm border border-violet-400/50 rounded-2xl p-3 z-10">
                        <div className="text-xs text-violet-300 mb-2">Editing message:</div>
                        <Textarea
                          value={messageEdit.content}
                          onChange={(e) => setMessageEdit({...messageEdit, content: e.target.value})}
                          className="w-full bg-slate-700/50 border-violet-400/30 text-white text-sm rounded-lg"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => editMessage(messageEdit.messageId, messageEdit.content)}
                            className="bg-violet-600 hover:bg-violet-700"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setMessageEdit(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Smart suggestions dropdown */}
                    {autoSuggestions.length > 0 && chatInput.length > 2 && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800/95 backdrop-blur-xl border border-violet-400/30 rounded-xl shadow-xl max-h-48 overflow-y-auto z-20">
                        <div className="p-2">
                          <div className="text-xs text-violet-300 mb-2 px-2">💡 Smart suggestions:</div>
                          {autoSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setChatInput(suggestion);
                                setAutoSuggestions([]);
                                setSelectedSuggestion(-1);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-violet-600/30 rounded-lg transition-colors ${
                                selectedSuggestion === index ? 'bg-violet-600/40' : ''
                              }`}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Context mode indicator */}
                    {contextAware && (
                      <div className="absolute top-2 left-3 flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          chatMode === 'code' ? 'bg-blue-500/20 text-blue-300' :
                          chatMode === 'equation' ? 'bg-green-500/20 text-green-300' :
                          chatMode === 'debug' ? 'bg-red-500/20 text-red-300' :
                          'bg-violet-500/20 text-violet-300'
                        }`}>
                          {chatMode === 'code' ? '💻' : 
                           chatMode === 'equation' ? '∑' : 
                           chatMode === 'debug' ? '🐛' : '💬'} {chatMode}
                        </div>
                        {smartMode && (
                          <div className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300">
                            🧠 Smart
                          </div>
                        )}
                      </div>
                    )}

                    <Textarea
                      ref={inputRef}
                      value={chatInput}
                      onChange={(e) => {
                        setChatInput(e.target.value);
                        // Generate smart suggestions
                        if (e.target.value.length > 2) {
                          generateSmartSuggestions(e.target.value);
                        } else {
                          setAutoSuggestions([]);
                        }
                        // Auto-detect context mode
                        const content = e.target.value.toLowerCase();
                        if (content.includes('\\') || content.includes('code') || content.includes('tikz')) {
                          setChatMode('code');
                        } else if (content.includes('equation') || content.includes('formula') || content.includes('math')) {
                          setChatMode('equation');
                        } else if (content.includes('error') || content.includes('debug') || content.includes('fix')) {
                          setChatMode('debug');
                        } else {
                          setChatMode('normal');
                        }
                      }}
                      onKeyDown={handleChatKeyDown}
                      placeholder="💭 Ask anything about LaTeX... (⏎ Send, ⇧⏎ New line, ⇥ Suggestions, ⌘K Search)"
                      className={`flex-1 min-h-[48px] max-h-[120px] resize-none bg-slate-800/80 border-violet-400/50 text-white placeholder-violet-300/70 focus:border-violet-400/80 focus:ring-violet-500/30 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-200 ${
                        contextAware ? 'pt-8' : ''
                      } ${chatInput.length > 800 ? 'border-orange-400/60' : ''}`}
                      disabled={isAITyping}
                      rows={1}
                      maxLength={1000}
                    />
                    
                    <div className="absolute bottom-3 right-3 flex gap-1 items-center">
                      {chatInput.length > 0 && (
                        <span className={`text-xs mr-2 ${chatInput.length > 800 ? 'text-orange-400' : 'text-violet-400/60'}`}>
                          {chatInput.length}/1000
                        </span>
                      )}
                      
                      {/* Voice input button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={voiceToText}
                        className={`h-6 w-6 p-0 hover:bg-violet-700/50 text-violet-400 hover:text-violet-300 rounded-lg ${isRecording ? 'animate-pulse text-red-400' : ''}`}
                        title={voiceEnabled ? (isRecording ? "Stop recording" : "Start voice input") : "Voice input (enable in settings)"}
                        disabled={!voiceEnabled}
                      >
                        {isRecording ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                      </Button>

                      {/* Language switcher */}
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-violet-700/50 text-violet-400 hover:text-violet-300 rounded-lg"
                          title="Language settings"
                        >
                          🌐
                        </Button>
                        <div className="absolute right-0 bottom-8 bg-slate-800/95 backdrop-blur-xl border border-violet-400/30 rounded-xl shadow-xl p-2 z-20 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity min-w-[120px]">
                          <div className="space-y-1">
                            {[
                              { code: 'en', name: 'English', flag: '🇺🇸' },
                              { code: 'es', name: 'Español', flag: '🇪🇸' },
                              { code: 'fr', name: 'Français', flag: '🇫🇷' },
                              { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
                            ].map((lang) => (
                              <button
                                key={lang.code}
                                onClick={() => setChatLanguage(lang.code)}
                                className={`w-full text-left px-3 py-2 text-xs hover:bg-violet-600/30 rounded-lg transition-colors flex items-center gap-2 ${
                                  chatLanguage === lang.code ? 'bg-violet-600/40' : ''
                                }`}
                              >
                                {lang.flag} {lang.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Personality switcher */}
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-violet-700/50 text-violet-400 hover:text-violet-300 rounded-lg"
                          title="AI personality"
                        >
                          {chatPersonality === 'helpful' ? '😊' : 
                           chatPersonality === 'professional' ? '🎯' : 
                           chatPersonality === 'creative' ? '🎨' : '🤖'}
                        </Button>
                        <div className="absolute right-0 bottom-8 bg-slate-800/95 backdrop-blur-xl border border-violet-400/30 rounded-xl shadow-xl p-2 z-20 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity min-w-[140px]">
                          <div className="space-y-1">
                            {[
                              { id: 'helpful', name: 'Helpful', emoji: '😊' },
                              { id: 'professional', name: 'Professional', emoji: '🎯' },
                              { id: 'creative', name: 'Creative', emoji: '🎨' },
                              { id: 'technical', name: 'Technical', emoji: '🤖' }
                            ].map((personality) => (
                              <button
                                key={personality.id}
                                onClick={() => setChatPersonality(personality.id)}
                                className={`w-full text-left px-3 py-2 text-xs hover:bg-violet-600/30 rounded-lg transition-colors flex items-center gap-2 ${
                                  chatPersonality === personality.id ? 'bg-violet-600/40' : ''
                                }`}
                              >
                                {personality.emoji} {personality.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || isAITyping || chatInput.length > 1000}
                    className="bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-700 p-3 rounded-2xl shadow-lg shadow-violet-500/40 transition-all duration-200 hover:scale-105 border border-violet-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title="Send message (Enter)"
                  >
                    {isAITyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
                  {/* Enhanced footer with chat stats and quick toolbar */}
                <div className="space-y-3">
                  {/* Quick Toolbar */}
                  <div className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-800/50 rounded-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const lastMessage = chatMessages.filter(m => m.role === 'assistant').pop();
                        if (lastMessage && navigator.clipboard) {
                          navigator.clipboard.writeText(lastMessage.content);
                          toast({ title: "Last AI response copied!" });
                        }
                      }}
                      className="h-7 px-3 text-xs hover:bg-violet-700/50 text-violet-300 rounded-full"
                      title="Copy last AI response"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Last
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (chatMessages.length > 0) {
                          bookmarkMessage(chatMessages[chatMessages.length - 1].id);
                          toast({ title: "Last message bookmarked!" });
                        }
                      }}
                      className="h-7 px-3 text-xs hover:bg-violet-700/50 text-violet-300 rounded-full"
                      title="Bookmark last message"
                    >
                      🔖 Bookmark
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={exportChatAsMarkdown}
                      className="h-7 px-3 text-xs hover:bg-violet-700/50 text-violet-300 rounded-full"
                      title="Export chat as Markdown"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const stats = analyzeChat();
                        toast({
                          title: "📊 Chat Analysis",
                          description: `${stats.totalMessages} messages • ${stats.userMessages} user • ${stats.aiMessages} AI`,
                        });
                      }}
                      className="h-7 px-3 text-xs hover:bg-violet-700/50 text-violet-300 rounded-full"
                      title="Analyze chat performance"
                    >
                      📊 Stats
                    </Button>
                  </div>

                  {/* Footer info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-violet-400/60">
                      <span>⏎ Send • ⇧⏎ New line</span>
                      <span>↑↓ History • ⇥ Suggestions</span>
                      <span>⌘K Search • ⌘L Clear</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {filteredMessages.length !== chatMessages.length && (
                        <span className="text-xs text-violet-400/60">
                          {filteredMessages.length} of {chatMessages.length} messages
                        </span>
                      )}
                      <div className="flex items-center gap-2 text-xs text-violet-400/70">
                        <div className={`w-2 h-2 rounded-full ${isAITyping ? 'bg-green-400 animate-pulse' : 'bg-violet-400'}`}></div>
                        <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent font-medium">TeXSync AI</span>
                        {smartMode && <span className="text-purple-400">🧠</span>}
                        {contextAware && <span className="text-blue-400">🎯</span>}
                        {voiceEnabled && <span className="text-green-400">🎤</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>          )}
        </div>
      )}      {/* Enhanced Chat Analytics Overlay */}
      {hasHydrated && chatAnalytics.totalSessions > 5 && (
        <div className="fixed bottom-4 left-4 z-30">
          <div className="bg-gradient-to-br from-slate-900/95 via-violet-900/50 to-indigo-900/60 backdrop-blur-xl border border-violet-400/30 rounded-2xl shadow-2xl p-4 w-80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                📊 Chat Insights
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatAnalytics(prev => ({...prev, totalSessions: 0}))}
                className="h-6 w-6 p-0 hover:bg-violet-700/50 text-violet-400 hover:text-violet-300 rounded-lg"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-violet-800/30 rounded-lg p-3">
                  <div className="text-xs text-violet-300">Total Messages</div>
                  <div className="text-lg font-bold text-white">{chatMessages.length}</div>
                </div>
                <div className="bg-purple-800/30 rounded-lg p-3">
                  <div className="text-xs text-purple-300">Bookmarks</div>
                  <div className="text-lg font-bold text-white">{chatBookmarks.length}</div>
                </div>
              </div>
              
              <div className="bg-indigo-800/30 rounded-lg p-3">
                <div className="text-xs text-indigo-300 mb-2">Top Query Types</div>
                <div className="space-y-1">
                  {chatAnalytics.popularQueries.slice(0, 3).map((query, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-white capitalize">{query}</span>
                      <Badge variant="secondary" className="h-4 text-xs">#{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowChatSettings(true)}
                  className="flex-1 text-xs border-violet-400/30 hover:bg-violet-700/30"
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportChatAsMarkdown}
                  className="flex-1 text-xs border-violet-400/30 hover:bg-violet-700/30"
                >
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Settings Dialog */}
      {hasHydrated && (
        <Dialog open={showChatSettings} onOpenChange={setShowChatSettings}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Chat Settings
              </DialogTitle>
              <DialogDescription>
                Customize your TeXSync AI chat experience with advanced features
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="appearance" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="appearance" className="space-y-6">
                {/* Theme Selection */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Chat Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'default', name: 'Default', preview: 'bg-gradient-to-r from-violet-500 to-purple-500' },
                      { key: 'dark', name: 'Dark', preview: 'bg-gradient-to-r from-gray-600 to-slate-700' },
                      { key: 'neon', name: 'Neon', preview: 'bg-gradient-to-r from-cyan-500 to-purple-500' },
                      { key: 'minimal', name: 'Minimal', preview: 'bg-gradient-to-r from-gray-400 to-slate-500' }
                    ].map((theme) => (
                      <button
                        key={theme.key}
                        onClick={() => setChatTheme(theme.key as any)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          chatTheme === theme.key
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-full h-6 rounded ${theme.preview} mb-2`}></div>
                        <span className="text-sm font-medium">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Formatting */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Message Formatting</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rich text formatting</span>
                      <input 
                        type="checkbox" 
                        checked={messageFormatting === 'rich'} 
                        onChange={(e) => setMessageFormatting(e.target.checked ? 'rich' : 'plain')}
                        className="rounded" 
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="behavior" className="space-y-6">
                {/* AI Behavior */}
                <div>
                  <label className="text-sm font-medium mb-3 block">AI Personality</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'helpful', name: 'Helpful & Friendly', emoji: '😊' },
                      { key: 'professional', name: 'Professional', emoji: '🎯' },
                      { key: 'creative', name: 'Creative & Fun', emoji: '🎨' },
                      { key: 'technical', name: 'Technical Expert', emoji: '🤖' }
                    ].map((personality) => (
                      <button
                        key={personality.key}
                        onClick={() => setChatPersonality(personality.key)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          chatPersonality === personality.key
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-lg">{personality.emoji}</span>
                        <div className="text-sm font-medium">{personality.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smart Features */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Smart Assistance</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm">Smart Mode</span>
                        <p className="text-xs text-gray-500">AI adapts responses based on context</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={smartMode} 
                        onChange={(e) => setSmartMode(e.target.checked)}
                        className="rounded" 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm">Context Awareness</span>
                        <p className="text-xs text-gray-500">AI remembers document context</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={contextAware} 
                        onChange={(e) => setContextAware(e.target.checked)}
                        className="rounded" 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm">Auto-complete</span>
                        <p className="text-xs text-gray-500">Suggest completions while typing</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={autoComplete} 
                        onChange={(e) => setAutoComplete(e.target.checked)}
                        className="rounded" 
                      />
                    </div>
                  </div>
                </div>

                {/* Language Settings */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Language</label>
                  <select 
                    value={chatLanguage} 
                    onChange={(e) => setChatLanguage(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="de">🇩🇪 Deutsch</option>
                  </select>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                {/* Advanced Features */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Chat Features</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm">Voice Input</span>
                        <p className="text-xs text-gray-500">Speech-to-text input</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={voiceEnabled} 
                        onChange={(e) => setVoiceEnabled(e.target.checked)}
                        className="rounded" 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm">Notifications</span>
                        <p className="text-xs text-gray-500">Sound and visual alerts</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={chatNotifications} 
                        onChange={(e) => setChatNotifications(e.target.checked)}
                        className="rounded" 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm">Auto Backup</span>
                        <p className="text-xs text-gray-500">Automatically save chat history</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={chatBackup} 
                        onChange={(e) => setChatBackup(e.target.checked)}
                        className="rounded" 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm">Collaborative Mode</span>
                        <p className="text-xs text-gray-500">Share chat with team members</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={collaborativeMode} 
                        onChange={(e) => setCollaborativeMode(e.target.checked)}
                        className="rounded" 
                      />
                    </div>
                  </div>
                </div>

                {/* Export Options */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Export & Data</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportChatAsMarkdown}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export MD
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const chatData = {
                          messages: chatMessages,
                          bookmarks: chatBookmarks,
                          favorites: chatFavorites,
                          labels: chatLabels,
                          theme: chatTheme,
                          settings: {
                            smartMode,
                            contextAware,
                            chatLanguage,
                            voiceEnabled,
                            chatPersonality
                          },
                          exportedAt: new Date().toISOString()
                        };
                        const dataStr = JSON.stringify(chatData, null, 2);
                        const blob = new Blob([dataStr], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `texsync-chat-backup-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast({ title: "Complete chat backup exported" });
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Backup All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setChatMessages([{
                          id: 'welcome',
                          role: 'assistant',
                          content: '# ✨ Welcome to TeXSync AI! ✨\n\n🚀 **Your LaTeX writing companion is here!**\n\nI can help you with:\n• Creating complex equations and formulas\n• Document formatting and structure\n• LaTeX code optimization\n• TikZ diagrams and figures\n• Bibliography management\n• Error debugging\n\n💡 **What would you like to create today?**',
                          timestamp: new Date(),
                          reactions: []
                        }]);
                        setChatHistory([]);
                        setChatBookmarks([]);
                        setChatFavorites([]);
                        setChatLabels({});
                        toast({ title: "Chat completely reset" });
                      }}
                    >
                      🗑️ Reset All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const stats = analyzeChat();
                        toast({
                          title: "Chat Analysis",
                          description: `${stats.totalMessages} messages, avg. ${stats.averageMessageLength} chars`,
                        });
                      }}
                    >
                      📊 Analyze
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                {/* Chat Analytics */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Chat Statistics</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Messages</div>
                      <div className="text-xl font-bold text-violet-600">{chatMessages.length}</div>
                    </div>
                    <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Bookmarks</div>
                      <div className="text-xl font-bold text-violet-600">{chatBookmarks.length}</div>
                    </div>
                    <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Favorites</div>
                      <div className="text-xl font-bold text-violet-600">{chatFavorites.length}</div>
                    </div>
                    <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Sessions</div>
                      <div className="text-xl font-bold text-violet-600">{chatAnalytics.totalSessions}</div>
                    </div>
                  </div>
                </div>

                {/* Popular Queries */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Popular Topics</label>
                  <div className="space-y-2">
                    {chatAnalytics.popularQueries.slice(0, 5).map((query, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-sm capitalize">{query}</span>
                        <Badge variant="secondary">{index + 1}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Quick Stats</label>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>User Messages:</span>
                      <span>{chatMessages.filter(m => m.role === 'user').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Responses:</span>
                      <span>{chatMessages.filter(m => m.role === 'assistant').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Response Length:</span>
                      <span>{Math.round(chatMessages.reduce((acc, msg) => acc + msg.content.length, 0) / chatMessages.length)} chars</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button onClick={() => setShowChatSettings(false)}>
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
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
    />  );
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
  return (    <button
      type="button"
      onClick={onClick}
      className="px-4 py-3 border rounded-lg text-sm hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors text-left flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
      {name}
    </button>
  );
};

// Export the editor page without authentication
export default function EditorPage() {
  return <EditorPageComponent />;
}