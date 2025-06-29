"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, Send, Bot, User, Copy, ThumbsUp, ThumbsDown, 
  FileText, Lightbulb, Table, RotateCcw, Plus, Zap, ArrowLeft,
  Download, Share2, Settings, BookOpen, Calculator, FileCode,
  Clock, Search, Filter, Star, Bookmark, Upload, Image,
  ChevronDown, ChevronUp, Eye, EyeOff, MessageSquare, 
  Mic, MicOff, Volume2, VolumeX, Code2, Brain, Wand2, X
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import Link from "next/link";
import "katex/dist/katex.min.css";

// Extend Window interface for speech APIs
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isLatex?: boolean;
  copyable?: boolean;
  insertable?: boolean;
  tokens?: number;
  processingTime?: number;
  isFavorite?: boolean;
  tags?: string[];
  codeBlocks?: { language: string; code: string }[];
}

// Enhanced system prompts with more categories and advanced features
const SYSTEM_PROMPTS = [
  {
    id: "concise",
    label: "Make More Concise",
    icon: <Zap className="h-4 w-4" />,
    prompt: "Please make the following LaTeX code more concise while maintaining its functionality:",
    color: "bg-blue-500",
    category: "editing",
    premium: false
  },
  {
    id: "explain",
    label: "Explain LaTeX",
    icon: <Lightbulb className="h-4 w-4" />,
    prompt: "Please explain what this LaTeX code does and how it works:",
    color: "bg-green-500",
    category: "learning",
    premium: false
  },
  {
    id: "table",
    label: "Generate Table",
    icon: <Table className="h-4 w-4" />,
    prompt: "Create a professional LaTeX table with the following specifications:",
    color: "bg-purple-500",
    category: "generation",
    premium: false
  },
  {
    id: "improve",
    label: "Improve Structure",
    icon: <FileText className="h-4 w-4" />,
    prompt: "Please improve the structure and formatting of this LaTeX document:",
    color: "bg-orange-500",
    category: "editing",
    premium: false
  },
  {
    id: "equation",
    label: "Create Equation",
    icon: <Calculator className="h-4 w-4" />,
    prompt: "Generate a LaTeX equation for:",
    color: "bg-red-500",
    category: "generation",
    premium: false
  },
  {
    id: "bibliography",
    label: "Bibliography Help",
    icon: <BookOpen className="h-4 w-4" />,
    prompt: "Help me create a bibliography in LaTeX for:",
    color: "bg-indigo-500",
    category: "academic",
    premium: false
  },
  {
    id: "tikz",
    label: "TikZ Diagram",
    icon: <FileCode className="h-4 w-4" />,
    prompt: "Create a TikZ diagram for:",
    color: "bg-teal-500",
    category: "generation",
    premium: false
  },
  {
    id: "debug",
    label: "Debug Error",
    icon: <Settings className="h-4 w-4" />,
    prompt: "Help me fix this LaTeX error:",
    color: "bg-yellow-500",
    category: "debugging",
    premium: false
  },
  {
    id: "optimize",
    label: "Optimize Performance",
    icon: <Brain className="h-4 w-4" />,
    prompt: "Optimize this LaTeX code for better compilation speed and memory usage:",
    color: "bg-cyan-500",
    category: "optimization",
    premium: true
  },
  {
    id: "convert",
    label: "Format Converter",
    icon: <Code2 className="h-4 w-4" />,
    prompt: "Convert this content to LaTeX format:",
    color: "bg-pink-500",
    category: "conversion",
    premium: false
  },
  {
    id: "template",
    label: "Document Template",
    icon: <FileText className="h-4 w-4" />,
    prompt: "Create a complete LaTeX template for:",
    color: "bg-emerald-500",
    category: "templates",
    premium: false
  },
  {
    id: "review",
    label: "Code Review",
    icon: <Eye className="h-4 w-4" />,
    prompt: "Review this LaTeX code for best practices and potential improvements:",
    color: "bg-violet-500",
    category: "review",
    premium: true
  }
];

// Enhanced example conversations with more variety
const EXAMPLE_CONVERSATIONS = [
  {
    title: "Complex Mathematical Equation",
    description: "Create advanced calculus equations",
    prompt: "Generate a complex integral equation with multiple variables and show the solution steps",
    category: "mathematics",
    difficulty: "advanced"
  },
  {
    title: "Academic Paper Structure",
    description: "Structure for research papers",
    prompt: "Help me create a LaTeX template for an IEEE conference paper with proper sections and formatting",
    category: "academic",
    difficulty: "intermediate"
  },
  {
    title: "TikZ Graphics",
    description: "Create diagrams and figures",
    prompt: "Create a TikZ diagram showing a binary tree data structure with example nodes",
    category: "graphics",
    difficulty: "intermediate"
  },
  {
    title: "Table Generation",
    description: "Professional tables and layouts",
    prompt: "Generate a professional-looking table comparing different machine learning algorithms with their accuracy and performance metrics",
    category: "tables",
    difficulty: "beginner"
  },
  {
    title: "Chemical Formulas",
    description: "Chemistry equations and structures",
    prompt: "Create LaTeX code for complex chemical reactions including molecular structures using chemfig",
    category: "chemistry",
    difficulty: "advanced"
  },
  {
    title: "Thesis Template",
    description: "Complete dissertation structure",
    prompt: "Help me create a comprehensive PhD thesis template with chapters, bibliography, and appendices",
    category: "academic",
    difficulty: "advanced"
  },
  {
    title: "Beamer Presentation",
    description: "Professional slide deck",
    prompt: "Create a Beamer presentation template for a technical conference with modern styling",
    category: "presentations",
    difficulty: "intermediate"
  },
  {
    title: "Algorithm Pseudocode",
    description: "Computer science algorithms",
    prompt: "Generate LaTeX pseudocode for a sorting algorithm with proper formatting and comments",
    category: "computer-science",
    difficulty: "beginner"
  }
];

export default function AIChatPage() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);  // Enhanced state management
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSystemPrompts, setShowSystemPrompts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [favoriteMessages, setFavoriteMessages] = useState<string[]>([]);
  const [chatStats, setChatStats] = useState({
    totalMessages: 0,
    totalTokens: 0,
    averageResponseTime: 0
  });
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Add debugging state
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechSynthRef = useRef<any>(null);

  // Initialize component and welcome message after mounting
  useEffect(() => {
    setMounted(true);
    
    // Initialize welcome message after component mounts
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: "# Welcome to TeXSync AI! 🚀\n\nI'm your intelligent LaTeX and academic writing assistant powered by **Google Gemini**. I can help you with:\n\n## 📝 **LaTeX Expertise**\n• Complex mathematical equations: $\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$\n• Document structure and formatting\n• TikZ diagrams and graphics\n• Table generation and styling\n\n## 🎓 **Academic Writing**\n• Citation and bibliography management\n• Research paper templates\n• Thesis and dissertation formatting\n• Professional document layouts\n\n## 🔧 **Code Assistance**\n• LaTeX error debugging\n• Code optimization and cleanup\n• Package recommendations\n• Best practices guidance\n\n---\n\n💡 **Pro Tips:**\n- Use the quick action buttons below for common tasks\n- Try the example conversations to get started\n- All generated LaTeX code can be copied directly\n- Ask me to explain any LaTeX concepts you don't understand\n- Use voice input for hands-free interaction\n- Bookmark important conversations for later reference\n\n**Ready to create something amazing? Ask me anything!**",
      timestamp: new Date(),
      copyable: false,
      insertable: false,
    };
    
    setMessages([welcomeMessage]);
    setChatStats({
      totalMessages: 1,
      totalTokens: 0,
      averageResponseTime: 0
    });
  }, []);
  // Test API connection function
  const testConnection = async () => {
    setIsLoading(true);
    setDebugInfo("Testing API connection...");
    
    try {
      console.log("Testing API connection to /api/ai-latex");
      setDebugInfo("Sending test request to /api/ai-latex...");
      
      const response = await fetch("/api/ai-latex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Hello, can you respond with a simple test message?",
          context: "API connection test",
        }),
      });

      setDebugInfo(`Response status: ${response.status} ${response.statusText}`);
      console.log("Response status:", response.status, response.statusText);

      const data = await response.json();
      console.log("Response data:", data);
      
      if (data.success) {
        toast.success("✅ API connection working! AI responded successfully.");
        setDebugInfo(`✅ SUCCESS: API working. Response: "${data.response?.substring(0, 100)}..."`);
      } else {
        toast.error(`❌ API Error: ${data.error}`);
        setDebugInfo(`❌ API ERROR: ${data.error} (Code: ${data.code || 'N/A'})`);
        console.error("API Test Failed:", data);
      }
    } catch (error) {
      toast.error("❌ Connection failed - check console for details");
      const errorMsg = error instanceof Error ? error.message : String(error);
      setDebugInfo(`❌ CONNECTION ERROR: ${errorMsg}`);
      console.error("Connection test error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced utility functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleFavorite = (messageId: string) => {
    setFavoriteMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
    toast.success(
      favoriteMessages.includes(messageId) 
        ? "Removed from favorites" 
        : "Added to favorites"
    );
  };
  const startVoiceInput = () => {
    if (!mounted) return;
    
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast.info("Listening... Speak now!");
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => prev + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error("Voice recognition failed. Please try again.");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
    } else {
      toast.error("Speech recognition not supported in this browser");
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  const speakMessage = (text: string) => {
    if (!mounted) return;
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        toast.error("Speech synthesis failed");
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Speech synthesis not supported in this browser");
    }
  };

  const stopSpeaking = () => {
    if (!mounted) return;
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const extractCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: { language: string; code: string }[] = [];
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }
    
    return blocks;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const startTime = Date.now();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
      tags: extractTags(inputMessage),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    // Update stats
    setChatStats(prev => ({
      ...prev,
      totalMessages: prev.totalMessages + 1
    }));

    try {
      const response = await fetch("/api/ai-latex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          context: `LaTeX and academic writing assistant - TeXSync AI dedicated chat. Advanced mode: ${isAdvancedMode}`,
          conversationHistory: messages.slice(-8), // Send last 8 messages for better context
          advancedMode: isAdvancedMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error occurred" }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "API returned an error");
      }

      const processingTime = Date.now() - startTime;
      const codeBlocks = extractCodeBlocks(data.response);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        tokens: data.tokens || 0,
        processingTime,
        codeBlocks,
        tags: extractTags(data.response),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update stats
      setChatStats(prev => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
        totalTokens: prev.totalTokens + (data.tokens || 0),
        averageResponseTime: Math.round((prev.averageResponseTime + processingTime) / 2)
      }));

      // Auto-speak response if enabled
      if (isSpeaking && data.response) {
        const textToSpeak = data.response.replace(/[#*`]/g, '').substring(0, 200);
        speakMessage(textToSpeak);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      
      // Enhanced error handling with specific error messages
      let errorMessage = "I apologize, but I'm having trouble responding right now.";
      let debugInfo = "";
      
      if (error instanceof Error) {
        console.log("Error details:", error.message);
        debugInfo = `Debug info: ${error.message}`;
        
        if (error.message.includes("API key")) {
          errorMessage = "🔑 **API Configuration Issue**\n\nThere's a problem with the API key configuration. The administrator needs to check the GEMINI_API_KEY environment variable.";
          toast.error("API key configuration error");
        } else if (error.message.includes("quota") || error.message.includes("rate limit")) {
          errorMessage = "⏰ **Rate Limit Exceeded**\n\nThe API quota has been exceeded. Please wait a moment before trying again.";
          toast.error("API rate limit exceeded");
        } else if (error.message.includes("Network") || error.message.includes("fetch")) {
          errorMessage = "🌐 **Network Connection Issue**\n\nUnable to connect to the AI service. Please check your internet connection.";
          toast.error("Network connection error");
        } else if (error.message.includes("500")) {
          errorMessage = "🔧 **Server Error**\n\nThe AI service is experiencing issues. Please try again in a few moments.";
          toast.error("Server error - please try again");
        } else {
          errorMessage = "❌ **Unexpected Error**\n\nSomething went wrong. Please try again or contact support if the issue persists.";
          toast.error("Failed to send message. Please try again.");
        }
      } else {
        toast.error("Unknown error occurred");
      }
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `${errorMessage}\n\n**What you can try:**\n• Refresh the page\n• Check your internet connection\n• Try a shorter message\n• Wait a moment and try again\n\n${debugInfo ? `\n*${debugInfo}*` : ""}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractTags = (content: string): string[] => {
    const tags: string[] = [];
    if (content.toLowerCase().includes('equation') || content.includes('$')) tags.push('math');
    if (content.toLowerCase().includes('table')) tags.push('tables');
    if (content.toLowerCase().includes('tikz')) tags.push('graphics');
    if (content.toLowerCase().includes('bibliography') || content.toLowerCase().includes('citation')) tags.push('references');
    if (content.toLowerCase().includes('error') || content.toLowerCase().includes('debug')) tags.push('debugging');
    if (content.toLowerCase().includes('template')) tags.push('templates');
    return tags;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };  const copyMessage = (content: string) => {
    if (!mounted) return;
    
    // Remove markdown formatting for cleaner copy
    const cleanContent = content
      .replace(/^#{1,6}\s+/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`([^`]+)`/g, '$1'); // Remove inline code formatting
    
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(cleanContent);
      toast.success("Message copied to clipboard");
    } else {
      toast.error("Clipboard not available");
    }
  };

  const copyCodeBlock = (code: string, language: string) => {
    if (!mounted) return;
    
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      toast.success(`${language} code copied to clipboard`);
    } else {
      toast.error("Clipboard not available");
    }
  };

  const insertToEditor = (content: string) => {
    // This would integrate with the main editor
    toast.success("Content ready to insert into editor");
    // Future: Integration with the main LaTeX editor
  };

  const handleSystemPrompt = (prompt: string) => {
    setInputMessage(prompt);
    setShowSystemPrompts(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleExampleConversation = (prompt: string) => {
    setInputMessage(prompt);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  const clearChat = () => {
    if (!mounted) return;
    
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: "# Welcome back to TeXSync AI! 🚀\n\nI'm ready to help you with LaTeX, academic writing, and document creation. What would you like to work on today?\n\n💡 **Quick suggestions:**\n• Generate a mathematical equation\n• Create a document template\n• Debug LaTeX errors\n• Explain LaTeX concepts\n\nJust ask me anything!",
      timestamp: new Date(),
      copyable: false,
      insertable: false,
    };
    
    setMessages([welcomeMessage]);
    setChatStats({
      totalMessages: 1,
      totalTokens: 0,
      averageResponseTime: 0
    });
    setFavoriteMessages([]);
  };

  const exportChat = () => {
    const chatContent = messages
      .map(msg => {
        const favorite = favoriteMessages.includes(msg.id) ? '⭐ ' : '';
        const stats = msg.tokens ? `\n*Tokens: ${msg.tokens} | Processing: ${msg.processingTime}ms*` : '';
        return `## ${favorite}${msg.role.toUpperCase()} (${msg.timestamp.toLocaleString()})${stats}\n\n${msg.content}\n\n---\n`;
      })
      .join('\n');
    
    const chatMetadata = `# TeXSync AI Chat Export\n\n**Stats:**\n- Total Messages: ${chatStats.totalMessages}\n- Total Tokens: ${chatStats.totalTokens}\n- Average Response Time: ${chatStats.averageResponseTime}ms\n- Exported: ${new Date().toLocaleString()}\n\n---\n\n`;
    
    const blob = new Blob([chatMetadata + chatContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `texsync-ai-chat-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Chat exported successfully!");
  };
  const shareChat = async () => {
    if (!mounted) return;
    
    const shareData = {
      title: 'TeXSync AI Chat',
      text: 'Check out this helpful LaTeX conversation with TeXSync AI!',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Chat shared successfully!");
      } catch (error) {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
          toast.success("Chat URL copied to clipboard!");
        }
      }
    } else if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Chat URL copied to clipboard!");
    } else {
      toast.info("Sharing not available in this browser");
    }
  };

  const searchMessages = (query: string) => {
    return messages.filter(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase()) ||
      msg.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  };
  const filteredPrompts = selectedCategory === "all" 
    ? SYSTEM_PROMPTS 
    : SYSTEM_PROMPTS.filter(prompt => prompt.category === selectedCategory);

  const filteredExamples = searchQuery 
    ? EXAMPLE_CONVERSATIONS.filter(ex => 
        ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : EXAMPLE_CONVERSATIONS;
  const categories = [
    { id: "all", label: "All", icon: <Sparkles className="h-3 w-3" /> },
    { id: "generation", label: "Generate", icon: <Plus className="h-3 w-3" /> },
    { id: "editing", label: "Edit", icon: <FileText className="h-3 w-3" /> },
    { id: "learning", label: "Learn", icon: <BookOpen className="h-3 w-3" /> },
    { id: "academic", label: "Academic", icon: <User className="h-3 w-3" /> },
    { id: "debugging", label: "Debug", icon: <Settings className="h-3 w-3" /> },
    { id: "optimization", label: "Optimize", icon: <Brain className="h-3 w-3" /> },
    { id: "conversion", label: "Convert", icon: <Code2 className="h-3 w-3" /> },
    { id: "templates", label: "Templates", icon: <FileText className="h-3 w-3" /> },
    { id: "review", label: "Review", icon: <Eye className="h-3 w-3" /> },
  ];

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl">
            <Sparkles className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Loading TeXSync AI</h2>
            <p className="text-gray-400">Initializing your AI assistant...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-red-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header with enhanced design */}
      <div className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50 shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-all duration-300 group">
                <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                  <ArrowLeft className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-gray-400 text-sm group-hover:text-white transition-colors">Back to TeXSync</span>
              </Link>
              <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent" />
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-lg shadow-red-600/20">
                  <Sparkles className="h-7 w-7 text-white animate-pulse" />
                </div>                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    TeXSync AI
                  </h1>
                  <div className="text-sm text-gray-400 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Powered by Google Gemini
                  </div>
                </div>
              </div>
            </div>           
             <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={isLoading}
                className="bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-green-600 hover:text-green-400"
              >
                <Zap className="h-4 w-4 mr-1" />
                Test API
              </Button>
              <Button
                variant={isAdvancedMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setIsAdvancedMode(!isAdvancedMode);
                  toast.success(`Advanced mode ${!isAdvancedMode ? 'enabled' : 'disabled'}`);
                }}
                className={`${
                  isAdvancedMode 
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 border-none shadow-lg shadow-purple-600/20" 
                    : "bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800 backdrop-blur-sm"
                } transition-all duration-300`}
              >
                <Brain className="h-4 w-4 mr-1" />
                Advanced
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                className={`${
                  isListening 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-600 text-white shadow-lg shadow-red-600/20' 
                    : 'bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800 backdrop-blur-sm'
                } transition-all duration-300`}
                disabled={isLoading}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={isSpeaking ? stopSpeaking : () => toast.info("Enable auto-speak in settings")}
                className={`${
                  isSpeaking 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800 backdrop-blur-sm'
                } transition-all duration-300`}
              >
                {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent" />
              <Button
                variant="outline"
                size="sm"
                onClick={exportChat}
                className="bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareChat}
                className="bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-red-600 hover:text-red-400 backdrop-blur-sm transition-all duration-300"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {/* Chat Statistics */}
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <div className="p-1 bg-red-600/20 rounded-lg">
                    <Zap className="h-4 w-4 text-red-500" />
                  </div>
                  Chat Stats
                </h3>                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-3 bg-gradient-to-br from-gray-800/80 to-gray-800/60 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                    <div className="text-white font-bold text-lg">{chatStats.totalMessages}</div>
                    <div className="text-gray-400 text-xs font-medium">Messages</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-gray-800/80 to-gray-800/60 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                    <div className="text-white font-bold text-lg">{chatStats.totalTokens}</div>
                    <div className="text-gray-400 text-xs font-medium">Tokens</div>
                  </div>
                  <div className="col-span-2 text-center p-3 bg-gradient-to-br from-gray-800/80 to-gray-800/60 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                    <div className="text-white font-bold text-lg">{chatStats.averageResponseTime}ms</div>
                    <div className="text-gray-400 text-xs font-medium">Avg Response Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>            {/* Debug Panel */}
            {debugInfo && (
              <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/30 backdrop-blur-sm border-yellow-700/50 shadow-xl">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-yellow-200 mb-3 flex items-center gap-2">
                    <div className="p-1 bg-yellow-600/20 rounded-lg">
                      <Settings className="h-4 w-4 text-yellow-500" />
                    </div>
                    Debug Info
                  </h3>
                  <div className="text-xs text-yellow-300 bg-yellow-950/30 p-3 rounded-lg border border-yellow-800/30 font-mono">
                    {debugInfo}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDebugInfo("")}
                    className="mt-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-800/20"
                  >
                    Clear Debug
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Search */}
            <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-sm border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-gray-600/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-blue-600/30 to-blue-700/20 rounded-lg shadow-lg">
                    <Search className="h-4 w-4 text-blue-400" />
                  </div>
                  <h3 className="font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Search</h3>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="pl-10 bg-gradient-to-r from-gray-800/50 to-gray-750/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500/60 focus:ring-blue-500/20 transition-all duration-300 hover:border-gray-500/50"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all duration-200"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {searchQuery && (
                  <div className="mt-3 p-2 bg-gradient-to-r from-blue-900/20 to-blue-800/10 rounded-lg border border-blue-700/20">
                    <div className="text-xs text-blue-300 flex items-center gap-1">
                      <Filter className="h-3 w-3" />
                      Found {searchMessages(searchQuery).length} messages
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-sm border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-gray-600/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-purple-600/30 to-purple-700/20 rounded-lg shadow-lg">
                      <Wand2 className="h-4 w-4 text-purple-400" />
                    </div>
                    Quick Actions
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSystemPrompts(!showSystemPrompts)}
                    className="text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                  >
                    {showSystemPrompts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {showSystemPrompts && (
                  <>
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setSelectedCategory(category.id)}
                          className={`h-7 text-xs px-2.5 transition-all duration-200 ${
                            selectedCategory === category.id
                              ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-600/25"
                              : "text-gray-400 hover:text-white hover:bg-gray-800/60 border border-gray-700/50 hover:border-gray-600/50"
                          }`}
                        >
                          {category.icon}
                          <span className="ml-1.5">{category.label}</span>
                        </Button>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-2.5">
                      {filteredPrompts.map((prompt) => (
                        <Button
                          key={prompt.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSystemPrompt(prompt.prompt)}
                          className="h-auto p-3.5 flex items-center gap-3 bg-gradient-to-r from-gray-800/70 to-gray-750/60 border-gray-600/40 text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/80 hover:to-gray-700/70 hover:border-gray-500/60 text-left justify-start transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group"
                        >
                          <div className={`p-2 rounded-lg ${prompt.color} group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                            {prompt.icon}
                          </div>
                          <div className="flex-1">
                            <span className="text-sm block font-medium group-hover:text-white transition-colors duration-200">{prompt.label}</span>
                            {prompt.premium && (
                              <Badge variant="secondary" className="mt-1.5 text-xs bg-gradient-to-r from-yellow-600/30 to-amber-600/20 text-yellow-300 border border-yellow-600/30">
                                PRO
                              </Badge>
                            )}
                          </div>
                          <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-300 transition-colors duration-200" />
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>            {/* Example Conversations */}
            <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-sm border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-gray-600/50">
              <CardContent className="p-4">
                <h3 className="font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-green-600/30 to-green-700/20 rounded-lg shadow-lg">
                    <MessageSquare className="h-4 w-4 text-green-400" />
                  </div>
                  Examples
                </h3>
                <div className="space-y-3">
                  {filteredExamples.slice(0, 6).map((example, index) => (
                    <div key={index} className="cursor-pointer group" onClick={() => handleExampleConversation(example.prompt)}>
                      <div className="p-3.5 bg-gradient-to-r from-gray-800/60 to-gray-750/50 rounded-xl hover:from-gray-700/70 hover:to-gray-700/60 transition-all duration-300 border border-gray-700/50 hover:border-gray-600/60 hover:shadow-lg hover:scale-[1.02]">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white text-sm group-hover:text-gray-100 transition-colors duration-200">{example.title}</h4>
                          <Badge variant="outline" className={`text-xs ml-2 transition-all duration-200 ${
                            example.difficulty === 'beginner' ? 'border-green-500/60 text-green-400 group-hover:border-green-400 group-hover:text-green-300' :
                            example.difficulty === 'intermediate' ? 'border-yellow-500/60 text-yellow-400 group-hover:border-yellow-400 group-hover:text-yellow-300' :
                            'border-red-500/60 text-red-400 group-hover:border-red-400 group-hover:text-red-300'
                          }`}>
                            {example.difficulty}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-xs mb-3 group-hover:text-gray-300 transition-colors duration-200 leading-relaxed">{example.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-gray-700/80 to-gray-600/60 text-gray-300 group-hover:from-gray-600/80 group-hover:to-gray-600/70 group-hover:text-gray-200 transition-all duration-200 border border-gray-600/30">
                            {example.category}
                          </Badge>
                          <div className="ml-auto">
                            <ChevronDown className="h-3 w-3 text-gray-500 group-hover:text-gray-400 transition-all duration-200 group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>          {/* Main Chat Area */}
          <div className="lg:col-span-3 flex flex-col min-h-0">
            <Card className="flex-1 bg-gradient-to-br from-gray-900/95 to-gray-800/90 backdrop-blur-sm border-gray-700/50 flex flex-col shadow-2xl min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-6">
                    <div className="space-y-6 max-w-none">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/25">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] ${
                          message.role === "user" ? "order-2" : ""
                        }`}
                      >
                        <Card
                          className={`${
                            message.role === "user"
                              ? "bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600/50 shadow-lg shadow-red-600/20"
                              : "bg-gradient-to-br from-gray-800/90 to-gray-750/80 border-gray-600/50 backdrop-blur-sm shadow-xl"
                          } transition-all duration-300 hover:shadow-2xl`}
                        >
                          <CardContent className="p-4">
                            {message.role === "assistant" ? (
                              <div className="prose prose-invert max-w-none prose-pre:bg-gray-950/80 prose-pre:border prose-pre:border-gray-700/50 prose-pre:backdrop-blur-sm">                                <ReactMarkdown 
                                  remarkPlugins={[remarkMath, remarkGfm]}
                                  rehypePlugins={[rehypeKatex]}
                                  components={{
                                    p: ({ children }) => <p className="mb-3 last:mb-0 text-gray-200 leading-relaxed">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1.5 text-gray-300">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1.5 text-gray-300">{children}</ol>,
                                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-gray-100">{children}</h3>,
                                    code: ({ className, children, ...props }) => {
                                      const isInline = !className;
                                      if (isInline) {
                                        return (
                                          <code className="bg-gray-700/60 px-2 py-1 rounded text-sm font-mono text-red-300 border border-gray-600/30" {...props}>
                                            {children}
                                          </code>
                                        );
                                      }
                                      return (
                                        <code className={className} {...props}>
                                          {children}
                                        </code>
                                      );
                                    },
                                    pre: ({ children }) => (
                                      <pre className="bg-gray-950/90 p-4 rounded-xl overflow-x-auto border border-gray-700/50 my-4 backdrop-blur-sm shadow-lg">
                                        {children}
                                      </pre>
                                    ),
                                    blockquote: ({ children }) => (
                                      <blockquote className="border-l-4 border-red-500/60 pl-4 italic text-gray-300 my-4 bg-red-950/20 py-2 rounded-r-lg">
                                        {children}
                                      </blockquote>
                                    ),
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap text-white leading-relaxed">{message.content}</p>
                            )}                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-600/30">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-gray-400">
                                  {mounted ? message.timestamp.toLocaleString() : 'Loading...'}
                                </span>
                                {message.tokens && (
                                  <Badge variant="outline" className="text-xs border-gray-600/50 text-gray-400 bg-gray-800/50">
                                    {message.tokens} tokens
                                  </Badge>
                                )}
                                {message.processingTime && (
                                  <Badge variant="outline" className="text-xs border-gray-600/50 text-gray-400 bg-gray-800/50">
                                    {message.processingTime}ms
                                  </Badge>
                                )}
                                {message.tags && message.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs bg-gradient-to-r from-gray-700/60 to-gray-600/50 text-gray-300 border border-gray-600/30">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyMessage(message.content)}
                                  className="h-8 w-8 p-0 hover:bg-gray-700/50 text-gray-400 hover:text-gray-200 transition-all duration-200 hover:scale-110"
                                  title="Copy message"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                                {message.role === "assistant" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleFavorite(message.id)}
                                      className={`h-8 w-8 p-0 hover:bg-gray-700/50 transition-all duration-200 hover:scale-110 ${
                                        favoriteMessages.includes(message.id) 
                                          ? 'text-yellow-400 hover:text-yellow-300' 
                                          : 'text-gray-400 hover:text-yellow-400'
                                      }`}
                                      title="Add to favorites"
                                    >
                                      {favoriteMessages.includes(message.id) ? <Star className="h-3.5 w-3.5 fill-current" /> : <Star className="h-3.5 w-3.5" />}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => speakMessage(message.content)}
                                      className="h-8 w-8 p-0 hover:bg-gray-700/50 text-gray-400 hover:text-blue-400 transition-all duration-200 hover:scale-110"
                                      title="Read aloud"
                                    >
                                      <Volume2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => insertToEditor(message.content)}
                                      className="h-8 w-8 p-0 hover:bg-gray-700/50 text-gray-400 hover:text-green-400 transition-all duration-200 hover:scale-110"
                                      title="Insert to editor"
                                    >
                                      <FileCode className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-gray-700/50 text-gray-400 hover:text-green-400 transition-all duration-200 hover:scale-110"
                                      title="Good response"
                                    >
                                      <ThumbsUp className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-gray-700/50 text-gray-400 hover:text-red-400 transition-all duration-200 hover:scale-110"
                                      title="Poor response"
                                    >
                                      <ThumbsDown className="h-3.5 w-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                              {/* Code blocks with copy functionality */}
                            {message.codeBlocks && message.codeBlocks.length > 0 && (
                              <div className="mt-4 space-y-3">
                                {message.codeBlocks.map((block, index) => (
                                  <div key={index} className="relative rounded-xl overflow-hidden border border-gray-700/50 bg-gradient-to-br from-gray-950/90 to-gray-900/80 backdrop-blur-sm shadow-lg">
                                    <div className="flex items-center justify-between bg-gray-800/80 px-4 py-3 border-b border-gray-700/50">
                                      <Badge variant="outline" className="text-xs border-gray-600/50 text-gray-300 bg-gray-700/50 font-mono">
                                        {block.language}
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyCodeBlock(block.code, block.language)}
                                        className="h-7 w-7 p-0 hover:bg-gray-700/50 text-gray-400 hover:text-gray-200 transition-all duration-200 hover:scale-110"
                                        title="Copy code"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                    <div className="p-4">
                                      <pre className="text-sm text-gray-300 font-mono leading-relaxed overflow-x-auto">
                                        <code>{block.code}</code>
                                      </pre>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>                      {message.role === "user" && (
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center order-3 shadow-lg shadow-gray-700/25">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-4 justify-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/25">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <Card className="bg-gradient-to-br from-gray-800/90 to-gray-750/80 border-gray-600/50 backdrop-blur-sm shadow-xl">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-bounce shadow-lg shadow-red-600/50"></div>
                              <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-bounce shadow-lg shadow-red-600/50" style={{ animationDelay: "0.1s" }}></div>
                              <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-bounce shadow-lg shadow-red-600/50" style={{ animationDelay: "0.2s" }}></div>
                            </div>
                            <span className="text-gray-300 text-sm font-medium">TeXSync AI is thinking...</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}                  
                  <div ref={messagesEndRef} />
                    </div>
                  </div>
                </ScrollArea>
              </div>{/* Enhanced Input Area */}
              <div className="p-6 pt-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-950/95 to-gray-900/90 backdrop-blur-sm">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isListening ? "🎤 Listening..." : "Ask about LaTeX syntax, equations, academic writing, or anything else..."}
                      className={`min-h-[60px] max-h-[150px] resize-none bg-gradient-to-r from-gray-900/80 to-gray-850/70 border-gray-600/50 text-white placeholder-gray-400 focus:border-red-500/60 focus:ring-red-500/20 transition-all duration-300 rounded-xl shadow-lg backdrop-blur-sm ${
                        isListening ? 'border-red-500/80 ring-2 ring-red-500/30 shadow-red-500/20' : 'hover:border-gray-500/60'
                      }`}
                      disabled={isLoading}
                      rows={2}
                    />
                    {inputMessage.length > 0 && (
                      <div className="flex items-center justify-between mt-3 text-xs">
                        <span className="text-gray-500 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                          {inputMessage.length} characters
                        </span>
                        <div className="flex gap-2">
                          {inputMessage.length > 500 && (
                            <Badge variant="outline" className="text-xs border-amber-500/60 text-amber-400 bg-amber-950/20 shadow-sm">
                              Long message
                            </Badge>
                          )}
                          {isAdvancedMode && (
                            <Badge variant="outline" className="text-xs border-purple-500/60 text-purple-400 bg-purple-950/20 shadow-sm">
                              Advanced mode
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isListening ? stopVoiceInput : startVoiceInput}
                      disabled={isLoading}
                      className={`h-12 w-12 p-0 transition-all duration-300 hover:scale-105 ${
                        isListening 
                          ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-600/50 text-white hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-600/30' 
                          : 'bg-gray-900/80 border-gray-600/50 text-gray-300 hover:bg-gray-800/90 backdrop-blur-sm hover:border-gray-500/60'
                      }`}
                      title={isListening ? "Stop listening" : "Start voice input"}
                    >
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="h-12 w-12 p-0 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-105 shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      title="Send message"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                      Press Enter to send, Shift+Enter for new line
                    </span>
                    {isListening && (
                      <span className="flex items-center gap-1.5 text-red-400 animate-pulse">
                        <Mic className="h-3 w-3" />
                        Listening...
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${
                      isLoading ? 'bg-amber-500 shadow-amber-500/50' : 'bg-green-500 shadow-green-500/50'
                    } shadow-lg`}></div>
                    <span className="font-medium">
                      {isLoading ? 'Processing...' : 'AI Ready'}
                    </span>
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
