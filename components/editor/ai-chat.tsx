"use client";

// Web Speech API TypeScript declarations
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Logo } from "../common/logo";
import { 
  Sparkles, Copy, CheckCircle, Send, Loader2, 
  ChevronLeft, ChevronRight, RefreshCw, ThumbsUp, ThumbsDown,
  Settings, X, FileUp, FileDown, BookOpen, HelpCircle, 
  MoveHorizontal, Lightbulb, Code2, Table, RotateCw, MessageCircle,
  Mic, MicOff, AlertTriangle, AlertCircle, Circle
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cn } from "../../lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const markdownInvalidBlockTypes = [
  'div', 'pre', 'ul', 'ol', 'table', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr'
];

// Define custom CodeProps type with the expected properties
type CodeProps = {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
};

// Initialize the Google Generative AI with direct API key
// WARNING: Using direct API keys is only recommended for testing purposes
// In production, use environment variables instead
const API_KEY = "AIzaSyAwNXtukA3f2QOa2YIGimEuBqXA8dC9V8w"; // Replace with your actual Gemini API key
const genAI = new GoogleGenerativeAI(API_KEY);

// Types for chat messages
type MessageRole = "user" | "bot" | "system";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  liked?: boolean;
  disliked?: boolean;
}

interface AIChatProps {
  latex: string;
  onInsertCode: (code: string) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

// Define preset prompt types for quick access
type PresetPrompt = {
  id: string;
  title: string;
  prompt: string;
  icon: React.ReactNode;
  category: "document" | "format" | "math" | "structure";
};

// Add this utility function
const analyzeDocument = (latexContent: string) => {
  // Detect common LaTeX issues or patterns
  const issues = [];
  
  // Check for unclosed environments
  const beginEnvs = latexContent.match(/\\begin\{([^}]+)\}/g) || [];
  const endEnvs = latexContent.match(/\\end\{([^}]+)\}/g) || [];
  if (beginEnvs.length !== endEnvs.length) {
    issues.push({
      type: "environment",
      severity: "error",
      message: "Possible unclosed environment detected",
      suggestion: "Check that all \\begin{} commands have matching \\end{}"
    });
  }
  
  // Check for missing citations
  if (latexContent.includes('\\cite{') && !latexContent.includes('\\bibliography{')) {
    issues.push({
      type: "citation",
      severity: "warning",
      message: "Citations used without bibliography",
      suggestion: "Add \\bibliography{your-bibfile} or \\printbibliography"
    });
  }
  
  // More advanced checks could be added
  
  return issues;
};

// TypeScript interface for SpeechRecognition events
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

// The main component starts here
export function AIChat({ latex, onInsertCode, isMinimized, onToggleMinimize }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      content: "Hi there! I'm your TeXSync assistant powered by Gemini. How can I help with your LaTeX document today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const { toast } = useToast();
  const scrollAreaRef = useRef<React.ElementRef<typeof ScrollArea>>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [apiKeyValid, setApiKeyValid] = useState<boolean>(!!API_KEY);
  const [initialRender, setInitialRender] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash");
  const [activeTab, setActiveTab] = useState<string>("chat");
  
  // LaTeX-specific settings
  const [temperature, setTemperature] = useState(0.4);
  const [maxTokens, setMaxTokens] = useState(8192);
  const [chatMode, setChatMode] = useState<"general" | "teaching" | "expert">("expert");
  
  // Define the type for document issues
  interface DocumentIssue {
    type: string;
    severity: string;
    message: string;
    suggestion: string;
  }
  const [documentIssues, setDocumentIssues] = useState<DocumentIssue[]>([]);
  // Use a more stable approach to handle auto-scrolling - always start from the bottom
  useEffect(() => {
    if (initialRender) {
      setInitialRender(false);
      // Initial scroll to bottom on first render
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      }
      return;
    }
    
    // Skip auto-scroll if loading (dots animation is visible)
    if (isLoading) return;

    // Use requestAnimationFrame to ensure DOM is fully updated
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // Immediate scroll attempt
    scrollToBottom();

    // Use a small timeout to ensure all renders are complete
    const timeoutId = window.setTimeout(() => {
      requestAnimationFrame(scrollToBottom);
    }, 100);

    return () => window.clearTimeout(timeoutId);
  }, [messages, isLoading, initialRender]);  // Add this useEffect for scrolling - always keep newest messages visible at the bottom
  useEffect(() => {
    // Always scroll when messages change, even if there are no messages (to reset scroll position)
    // Use requestAnimationFrame to ensure DOM updates are complete
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: messages.length <= 2 ? 'auto' : 'smooth', // Use auto for initial messages for instant positioning
          block: 'end'
        });
      }
    };
    
    // Immediate scroll to bottom when new messages are added
    scrollToBottom();
    
    // Small timeout to ensure render is complete
    const timer = setTimeout(() => {
      requestAnimationFrame(scrollToBottom);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [messages]);

  // Focus the input field when chat is opened
  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized]);

  // Validate API key on component mount
  useEffect(() => {
    const validateKey = async () => {
      if (!API_KEY) {
        setApiKeyValid(false);
        return;
      }
      
      try {
        if (!genAI) return;
        const model = genAI.getGenerativeModel({ model: selectedModel });
        await model.generateContent("Test");
        setApiKeyValid(true);
        console.log("API key validation successful");
      } catch (error) {
        console.error("API key validation failed:", error);
        setApiKeyValid(false);
        toast({
          title: "API Connection Issue",
          description: "Could not connect to Gemini API. Please check your internet connection and API key.",
          variant: "destructive",
        });
      }
    };
    
    validateKey();
  }, [toast, selectedModel]);

  // Add this near your other useEffect hooks
  useEffect(() => {
    // Load chat history from localStorage when component mounts
    const savedMessages = localStorage.getItem('texsync-chat-history');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Validate and restore timestamps
        const validMessages = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(validMessages);
      } catch (e) {
        console.error("Failed to parse saved chat history:", e);
      }
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 1) { // Don't save if it's just the welcome message
      localStorage.setItem('texsync-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (latex) {
      const issues = analyzeDocument(latex);
      setDocumentIssues(issues);
    }
  }, [latex]);

  // Generate a unique ID for each message
  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Process the response from Gemini
  const processCodeBlocks = (text: string): string => {
    // Ensure all LaTeX code blocks have the language specified
    return text.replace(/```\s*([\s\S]*?)```/g, (match, codeContent) => {
      // If the code contains LaTeX specific commands, mark it as latex
      if (codeContent.includes('\\') || codeContent.includes('\\begin{') || codeContent.includes('\\documentclass')) {
        return '```latex\n' + codeContent + '\n```';
      }
      return match;
    });
  };

  // Preset prompts for quick user access
  const presetPrompts: PresetPrompt[] = [
    {
      id: "equation",
      title: "Complex Equation",
      prompt: "Help me write a complex LaTeX equation for Maxwell's equations in differential form.",
      icon: <Code2 className="h-3.5 w-3.5" />,
      category: "math"
    },
    {
      id: "table",
      title: "Data Table",
      prompt: "Create a LaTeX table with 4 columns and 5 rows for presenting experimental data.",
      icon: <Table className="h-3.5 w-3.5" />,
      category: "format"
    },
    {
      id: "tikz",
      title: "TikZ Diagram",
      prompt: "Generate a TikZ diagram showing a simple neural network architecture with 3 layers.",
      icon: <MoveHorizontal className="h-3.5 w-3.5" />,
      category: "structure"
    },
    {
      id: "improve",
      title: "Improve Document",
      prompt: "Review my LaTeX document and suggest structural improvements and better formatting.",
      icon: <Lightbulb className="h-3.5 w-3.5" />,
      category: "document"
    },
    {
      id: "citation",
      title: "Citation Style",
      prompt: "Help me set up a bibliography and citation style for an IEEE format paper.",
      icon: <BookOpen className="h-3.5 w-3.5" />,
      category: "document"
    },
    {
      id: "algorithm",
      title: "Algorithm",
      prompt: "Create a LaTeX algorithm environment for Dijkstra's shortest path algorithm.",
      icon: <Code2 className="h-3.5 w-3.5" />,
      category: "structure"
    },
  ];

  // Handle chat submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Check for valid API key
    if (!apiKeyValid || !genAI) {
      toast({
        title: "API Key Error",
        description: "Your Gemini API key is missing or invalid. Please check your environment variables.",
        variant: "destructive",
      });
      
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: "bot",
        content: "I'm unable to respond because the API key is missing or invalid. Please contact the administrator to set up a valid Gemini API key.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }
    
    // Hide suggestions when submitting
    setShowSuggestions(false);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Add network timeout detection
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        const timeoutMessage: ChatMessage = {
          id: generateId(),
          role: "bot",
          content: "I'm unable to respond due to a network timeout. Please check your internet connection and try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, timeoutMessage]);
        toast({
          title: "Network Timeout",
          description: "The request timed out. Please check your internet connection.",
          variant: "destructive",
        });
      }
    }, 30000); // 30 second timeout
    
    try {
      // Use Gemini with proper error handling
      const model = genAI.getGenerativeModel({ 
        model: selectedModel,
        generationConfig: {
          temperature: temperature,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: maxTokens,
        }
      });
      
      // Create chat context by including the latex document and previous messages
      let contextPrompt = "";
      
      // Different system prompts based on chat mode
      if (chatMode === "expert") {
        contextPrompt = "You are a LaTeX expert assistant for the TeXSync editor. ";
        contextPrompt += "Provide advanced, concise, and specific advice with direct LaTeX code examples. ";
        contextPrompt += "Focus on technical accuracy and best practices for academic publishing. ";
      } else if (chatMode === "teaching") {
        contextPrompt = "You are a helpful LaTeX teaching assistant for the TeXSync editor. ";
        contextPrompt += "Explain LaTeX concepts clearly, provide examples with explanations, and focus on teaching users. ";
        contextPrompt += "Include educational context and resources when appropriate. ";
      } else {
        contextPrompt = "You are a helpful LaTeX assistant for the TeXSync editor. ";
        contextPrompt += "Help users write, edit, and improve their LaTeX documents. ";
      }
      
      contextPrompt += "Always format code blocks using ```latex and ``` markers.\n\n";
      
      // Include some of the current document for context
      if (latex) {
        contextPrompt += "Here's the current document the user is working on:\n```latex\n";
        // Only include the first part of the document to avoid token limits
        const truncatedLatex = latex.length > 5000 ? 
          latex.substring(0, 5000) + "\n...(document truncated)" : 
          latex;
        contextPrompt += truncatedLatex + "\n```\n\n";
      }
      
      // Prepare history for the chat
      const chatHistory = messages
        .filter(msg => msg.id !== "welcome") // Filter out the welcome message
        .slice(-6) // Use up to 6 recent messages for context
        .map(msg => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        }));
      
      // Update conversation history for future reference
      setConversationHistory(chatHistory);
      
      // Start a new chat session with history
      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          temperature: temperature,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: maxTokens,
        }
      });
      
      // Send the user's query along with context about their document
      const result = await chat.sendMessage(
        contextPrompt + "User query: " + input
      );
      
      const response = result.response;
      let responseText = response.text();
      
      // Ensure code blocks are properly formatted
      responseText = processCodeBlocks(responseText);
      
      // Add bot response
      const botMessage: ChatMessage = {
        id: generateId(),
        role: "bot",
        content: responseText,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      
    } catch (error) {
      console.error("Chat error:", error);
      
      let errorDescription = "Failed to get a response from the AI assistant. Please try again.";
      let errorContent = "I'm sorry, I encountered an error. Please try again later.";
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorDescription = "Invalid API key. Please check your Gemini API configuration.";
          errorContent = "I can't respond because there's an issue with the API key configuration. Please contact the administrator.";
        } else if (error.message.includes("quota")) {
          errorDescription = "API quota exceeded. Please try again later.";
          errorContent = "I've reached my usage quota for now. Please try again later.";
        } else if (error.message.includes("network") || error.message.includes("fetch") || error.message.includes("connect")) {
          errorDescription = "Network error. Please check your internet connection.";
          errorContent = "I'm having trouble connecting to the Gemini service. Please check your internet connection and try again.";
        } else if (error.message.includes("timeout")) {
          errorDescription = "Request timed out. Please check your internet connection.";
          errorContent = "The request to the AI service timed out. Please check your internet connection and try again.";
        } else if (error.message.includes("model")) {
          errorDescription = "Model not available. Please try another model.";
          errorContent = "The selected AI model is currently unavailable. Please try a different model in the settings.";
        }
      }
      
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: "bot",
        content: errorContent,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  // Insert code into editor
  const handleInsertCode = (code: string) => {
    onInsertCode(code);
    toast({
      title: "Code inserted",
      description: "The LaTeX code has been inserted into your document.",
    });
  };

  // Copy code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: "The code has been copied to your clipboard.",
    });
  };

  // Clear conversation
  const handleClearConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "bot",
        content: "Hi there! I'm your TeXSync assistant powered by Gemini. How can I help with your LaTeX document today?",
        timestamp: new Date(),
      },
    ]);
    setConversationHistory([]);
    toast({
      title: "Conversation cleared",
      description: "The conversation history has been reset.",
    });
  };

  // Reattempt the last query if there was an error
  const handleRetry = () => {
    // Find the last user message
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === "user");
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
      // Remove the last user and bot messages
      setMessages(prev => prev.slice(0, -2));
    }
  };
  
  // Handler for preset prompt selection
  const handlePresetPrompt = (prompt: string) => {
    setInput(prompt);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle feedback on AI responses
  const handleFeedback = (messageId: string, isLike: boolean) => {
    setMessages(messages.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            liked: isLike ? !msg.liked : msg.liked,
            disliked: !isLike ? !msg.disliked : false
          }
        : msg
    ));
    
    // In a real app, you might send this feedback to your API
    const feedbackType = isLike ? "positive" : "negative";
    console.log(`User gave ${feedbackType} feedback for message ${messageId}`);
  };

  // Generate LaTeX examples
  const generateLatexExample = async (type: string) => {
    let prompt = "";
    
    switch(type) {
      case "equation":
        prompt = "Create a complex equation for quantum mechanics using LaTeX.";
        break;
      case "table":
        prompt = "Create a professional academic table in LaTeX with borders and merged cells.";
        break;
      case "figure":
        prompt = "Create LaTeX code for including a figure with caption and label.";
        break;
      case "bibliography":
        prompt = "Show me how to set up a bibliography in LaTeX using BibTeX.";
        break;
      default:
        prompt = `Create an example of ${type} in LaTeX.`;
    }
    
    setInput(prompt);
    handleSubmit(new Event('generate') as any);
  };

  // Show API key warning if invalid
  const ApiKeyWarning = () => {
    if (apiKeyValid) return null;
    
    return (
      <div className="bg-amber-950/30 border border-amber-700/50 rounded-md p-3 mb-4">
        <h4 className="text-amber-500 font-medium text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          API Key Not Configured
        </h4>
        <p className="text-xs text-amber-200/70 mt-1">
          The Gemini API key is missing or invalid. Contact the administrator or set up your own API key in the environment variables (NEXT_PUBLIC_GEMINI_API_KEY).
        </p>
      </div>
    );
  };
  // Voice recognition state variables
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecordingPermission, setHasRecordingPermission] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  
  // Check for browser Speech Recognition API support
  const isBrowserSupportsSpeechRecognition = () => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  };
  
  // Toggle voice recording function using Web Speech API
  const toggleVoiceRecording = async () => {
    if (!isRecording) {
      try {
        // Check for microphone permission first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasRecordingPermission(true);
        stream.getTracks().forEach(track => track.stop()); // Stop the stream after permission check
        
        // Check if browser supports Speech Recognition
        if (!isBrowserSupportsSpeechRecognition()) {
          throw new Error("Browser doesn't support speech recognition");
        }
        
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        
        // Configure recognition
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        // Handle results
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          let interimTranscriptResult = '';
          
          // Process results
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscriptResult += result[0].transcript;
            }
          }
          
          // Set interim results for display during recording
          setInterimTranscript(interimTranscriptResult);
          
          // If we have final results, update the input field
          if (finalTranscript !== '') {
            setInput(prev => {
              // Add a space if the previous input doesn't end with one
              const spacer = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
              return prev + spacer + finalTranscript;
            });
          }
        };
        
        // Handle errors
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          setTranscribing(false);
          toast({
            title: "Voice Recognition Error",
            description: `Error: ${event.error}`,
            variant: "destructive",
          });
        };
        
        // When recognition ends
        recognition.onend = () => {
          setIsRecording(false);
          setTranscribing(false);
          setInterimTranscript("");
        };
        
        // Start recognition
        recognition.start();
        setIsRecording(true);
        setTranscribing(true);
        
      } catch (error) {
        console.error('Error with speech recognition:', error);
        setHasRecordingPermission(false);
        toast({
          title: "Speech Recognition Error",
          description: error instanceof Error ? error.message : "Could not start voice recognition. Check microphone permissions.",
          variant: "destructive",
        });
      }
    } else {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      setTranscribing(false);
      setInterimTranscript("");
    }
  };

  // Add these state variables to the component
  const [isListeningForCommands, setIsListeningForCommands] = useState(false);
  const [recognizedCommand, setRecognizedCommand] = useState<string | null>(null);
  const [showVoiceCommandHelp, setShowVoiceCommandHelp] = useState(false);
  const [continuousListening, setContinuousListening] = useState(false);
  const [voiceConfidence, setVoiceConfidence] = useState(0);
  const [commandFeedback, setCommandFeedback] = useState<{
    command: string | null;
    status: 'success' | 'not-found' | 'processing' | null;
    timestamp: number;
  }>({ command: null, status: null, timestamp: 0 });
  // Add new state for command history and UI enhancements
  const [commandHistory, setCommandHistory] = useState<Array<{
    command: string;
    timestamp: number;
    successful: boolean;
  }>>([]);
  const [showCommandFeedbackUI, setShowCommandFeedbackUI] = useState(false);
  const [selectedCommandCategory, setSelectedCommandCategory] = useState<string | null>(null);
  // Define voice commands with improved natural language patterns
  const voiceCommands = [
    // Navigation commands
    { 
      name: "chat", 
      pattern: /^(go to |switch to |open |show |display |navigate to )?(chat|conversation|messages|talk|message history|assistant|ai chat)/i, 
      action: () => setActiveTab("chat"),
      category: "navigation",
      description: "Switch to chat tab"
    },
    { 
      name: "examples", 
      pattern: /^(go to |switch to |open |show |display |navigate to )?(examples|snippets|code examples|sample|templates)/i, 
      action: () => setActiveTab("examples"),
      category: "navigation",
      description: "Switch to examples tab"
    },
    { 
      name: "help", 
      pattern: /^(go to |switch to |open |show |display |navigate to )?(help|assistance|docs|documentation|guide|help section)/i, 
      action: () => setActiveTab("help"),
      category: "navigation",
      description: "Switch to help tab"
    },
    
    // Control commands
    { 
      name: "clear", 
      pattern: /^(clear|reset|start over|new chat|fresh start|clean slate|clear chat|clear conversation|delete( all)? messages|erase( all)? messages)/i, 
      action: () => handleClearConversation(),
      category: "control",
      description: "Clear current conversation"
    },
    { 
      name: "settings", 
      pattern: /^(open |show |adjust |change |configure |modify |access |view )?(settings|options|preferences|configuration|setup|config)/i, 
      action: () => setShowSettings(true),
      category: "control",
      description: "Open settings dialog"
    },
    { 
      name: "minimize", 
      pattern: /^(minimize|collapse|hide|close|shrink) (chat|window|panel|sidebar|ai|assistant|interface|box|this)/i, 
      action: () => onToggleMinimize(),
      category: "control",
      description: "Minimize chat interface"
    },
    
    // LaTeX content commands
    { 
      name: "insert code", 
      pattern: /^(insert|add|apply|use|paste|put|place|include) (code|latex|snippet|formula|equation|example|the code|that|this|the formula|the equation|the example)/i, 
      action: () => {
        const lastCodeBlock = getLastCodeBlock();
        if (lastCodeBlock) handleInsertCode(lastCodeBlock);
      },
      category: "content",
      description: "Insert last code into editor"
    },
    { 
      name: "copy code", 
      pattern: /^(copy|grab|duplicate|save|get) (code|latex|snippet|formula|equation|example|the code|that|this|the formula|the equation|the example)/i, 
      action: () => {
        const lastCodeBlock = getLastCodeBlock();
        if (lastCodeBlock) handleCopyCode(lastCodeBlock);
      },
      category: "content",
      description: "Copy last code to clipboard"
    },
    
    // Generation commands
    { 
      name: "generate equation", 
      pattern: /^(generate|create|make|write|give me|show me|produce|craft)( a| an| some)? (equation|formula|math|expression|mathematical formula|mathematical expression)/i, 
      action: () => handlePresetPrompt("Help me write a complex LaTeX equation."),
      category: "generate",
      description: "Generate LaTeX equation example"
    },
    { 
      name: "generate table", 
      pattern: /^(generate|create|make|write|give me|show me|produce|craft)( a| an| some)? (table|data table|spreadsheet|grid|tabular data)/i, 
      action: () => handlePresetPrompt("Create a LaTeX table with headers and data."),
      category: "generate",
      description: "Generate LaTeX table example"
    },
    { 
      name: "generate figure", 
      pattern: /^(generate|create|make|write|give me|show me|produce|craft)( a| an| some)? (figure|image|diagram|picture|graph|chart|plot|illustration|visual)/i, 
      action: () => handlePresetPrompt("Help me create a figure with caption in LaTeX."),
      category: "generate",
      description: "Generate LaTeX figure example"
    },
    { 
      name: "generate bibliography", 
      pattern: /^(generate|create|make|write|give me|show me|produce|craft)( a| an| some)? (bibliography|citation|reference|bib|bibtex|references|citations)/i, 
      action: () => handlePresetPrompt("Help me set up a bibliography and citations in LaTeX."),
      category: "generate",
      description: "Generate LaTeX bibliography example"
    },
    
    // Special commands
    { 
      name: "continuous mode", 
      pattern: /^(enable|disable|toggle|turn on|turn off|activate|deactivate|start|stop) (continuous|listening|voice|command|hands free) mode/i, 
      action: () => {
        setContinuousListening(prev => !prev);
        // Provide feedback on continuous mode state
        toast({
          title: continuousListening ? "Continuous Listening Disabled" : "Continuous Listening Enabled",
          description: continuousListening ? 
            "Voice commands will now work one at a time." : 
            "Voice commands will stay active until you disable this mode.",
          variant: "default",
        });
      },
      category: "special",
      description: "Toggle continuous listening mode"
    },
    {
      name: "submit", 
      pattern: /^(submit|send|ask|enter|go ahead)( this)?( question| query| prompt| message)?$/i, 
      action: () => handleSubmit(new Event('submit') as any),
      category: "special",
      description: "Submit current input"
    },
    {
      name: "stop listening", 
      pattern: /^(stop|end|cancel|quit|exit) (listening|voice commands|voice|commands)/i, 
      action: () => {
        if (isListeningForCommands) {
          setIsListeningForCommands(false);
          if (continuousListening) {
            setContinuousListening(false);
          }
        }
      },
      category: "special",
      description: "Stop voice command listening"
    },
    {
      name: "show commands", 
      pattern: /^(show|display|list|what are|tell me|help with) (commands|voice commands|what can i say|available commands)/i, 
      action: () => setShowVoiceCommandHelp(true),
      category: "special",
      description: "Show available voice commands"
    }
  ];

  // Helper function to get the last code block from messages
  const getLastCodeBlock = () => {
    // Start from the end and look for the first code block
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.role === "bot") {
        const match = message.content.match(/```(?:latex)?\n([\s\S]*?)\n```/);
        if (match && match[1]) {
          return match[1];
        }
      }    }
    return null;
  };

  // Utility function to format relative time
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Enhanced voice command functionality with improved pattern matching
  const startVoiceCommandListener = async () => {
    try {
      setIsListeningForCommands(true);
      setRecognizedCommand(null);
      setCommandFeedback({ command: null, status: 'processing', timestamp: Date.now() });
      
      // Add this command to history
      if (continuousListening) {
        // Only add to history if we're not already in the history
        if (!commandHistory.some(c => c.command === "Listening started")) {
          setCommandHistory(prev => [...prev.slice(-9), { 
            command: "Listening started", 
            timestamp: Date.now(), 
            successful: true 
          }]);
        }
      }
      
      // Check if browser supports SpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast({
          title: "Voice Commands Unavailable",
          description: "Your browser doesn't support voice recognition.",
          variant: "destructive",
        });
        setIsListeningForCommands(false);
        setCommandFeedback({ command: null, status: null, timestamp: Date.now() });
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = continuousListening;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      // Play a subtle sound to indicate listening started
      const audioStart = new Audio('/audio/listen-start.mp3');
      try {
        await audioStart.play();
      } catch (error) {
        console.log('Audio feedback not supported');
      }
      
      // Show feedback UI for continuous listening mode
      setShowCommandFeedbackUI(continuousListening);
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.trim();
          const confidence = event.results[i][0].confidence;
          setVoiceConfidence(confidence);
          setRecognizedCommand(transcript);
            // Process the transcript for commands
          let commandFound = false;
          let bestMatchCommand: any = null;
          let bestMatchScore = 0.6; // Threshold for command matching
          
          // Advanced command matching logic
          for (const command of voiceCommands) {
            // Direct pattern test
            if (command.pattern.test(transcript)) {
              // Calculate match score with improved algorithm
              const patternStr = command.pattern.toString();
              const keyTerms = patternStr
                .replace(/[\/\^$]/g, '')
                .replace(/[()]|i$/g, '')
                .split('|')
                .filter(term => term.trim().length > 0);
              
              // Calculate how many key terms in the command are present in the transcript
              let termMatches = 0;
              let totalTerms = 0;
              
              for (const term of keyTerms) {
                const cleanTerm = term.trim();
                if (cleanTerm.length > 2) { // Only consider meaningful terms
                  totalTerms++;
                  if (transcript.toLowerCase().includes(cleanTerm.toLowerCase())) {
                    termMatches++;
                  }
                }
              }
              
              // Calculate similarity score - combines speech confidence and term matching
              const termMatchScore = totalTerms > 0 ? termMatches / totalTerms : 0;
              const matchScore = (confidence * 0.6) + (termMatchScore * 0.4);
              
              if (matchScore > bestMatchScore) {
                bestMatchCommand = command;
                bestMatchScore = matchScore;
              }
            }
          }
          
          if (bestMatchCommand) {
            commandFound = true;
            
            // Execute the command
            bestMatchCommand.action();
            
            // Add to command history
            setCommandHistory(prev => [...prev.slice(-9), { 
              command: bestMatchCommand.name, 
              timestamp: Date.now(), 
              successful: true 
            }]);
            
            // Update command feedback state
            setCommandFeedback({
              command: bestMatchCommand.name,
              status: 'success',
              timestamp: Date.now()
            });
            
            // Visual feedback
            toast({
              title: `Command: ${bestMatchCommand.name}`,
              description: `Executed: "${transcript}"`,
              variant: "default",
            });
            
            // Audio feedback for successful command
            const audioSuccess = new Audio('/audio/command-success.mp3');
            try {
              audioSuccess.volume = 0.3;
              audioSuccess.play();
            } catch (error) {
              console.log('Audio feedback not supported');
            }
          }
          
          // If not a command, treat as regular input
          if (!commandFound && transcript) {
            setInput(transcript);
            
            // Update feedback
            setCommandFeedback({
              command: transcript,
              status: 'not-found',
              timestamp: Date.now()
            });
            
            // Auto-submit if it seems like a question or if the input is longer than a few words
            const words = transcript.split(' ');
            if (
              transcript.endsWith('?') || 
              transcript.toLowerCase().startsWith('how') || 
              transcript.toLowerCase().startsWith('what') || 
              transcript.toLowerCase().startsWith('why') ||
              transcript.toLowerCase().startsWith('explain') ||
              transcript.toLowerCase().startsWith('tell me') ||
              words.length > 5
            ) {
              handleSubmit(new Event('submit') as any);
            }
          }
        }
      };
      
      // Define the interface for command feedback
      interface CommandFeedback {
        command: string | null;
        status: 'success' | 'not-found' | 'processing' | null;
        timestamp: number;
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent): void => {
        console.error('Speech recognition error:', event.error);
        
        // Update feedback state
        setCommandFeedback({
          command: null,
          status: 'not-found',
          timestamp: Date.now()
        } as CommandFeedback);
        
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
        
        // Play error sound
        const audioError: HTMLAudioElement = new Audio('/audio/command-error.mp3');
        try {
          audioError.volume = 0.3;
          audioError.play();
        } catch (error) {
          console.log('Audio feedback not supported');
        }
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        
        // If continuous mode is enabled, restart listening
        if (continuousListening && isListeningForCommands) {
          console.log('Restarting speech recognition due to continuous mode');
          try {
            recognition.start();
          } catch (error) {
            console.error('Failed to restart continuous listening', error);
            setContinuousListening(false);
            setIsListeningForCommands(false);
          }
        } else {
          setIsListeningForCommands(false);
          
          // Play end listening sound
          const audioEnd = new Audio('/audio/listen-end.mp3');
          try {
            audioEnd.volume = 0.2;
            audioEnd.play();
          } catch (error) {
            console.log('Audio feedback not supported');
          }
        }
      };
      
      recognition.start();
      
      // Safety timeout to prevent hanging if recognition doesn't end properly
      // Only use for non-continuous mode
      if (!continuousListening) {
        setTimeout(() => {
          if (isListeningForCommands) {
            try {
              recognition.stop();
            } catch (error) {
              console.error('Error stopping recognition', error);
            }
            setIsListeningForCommands(false);
          }
        }, 10000); // 10 seconds timeout
      }
      
    } catch (error) {
      console.error('Error starting voice command listener:', error);
      setIsListeningForCommands(false);
      setCommandFeedback({
        command: null,
        status: 'not-found',
        timestamp: Date.now()
      });
      
      toast({
        title: "Voice Command Error",
        description: "Could not start voice recognition. Check permissions.",
        variant: "destructive",
      });
    }
  };

  // Minimized button styling
  if (isMinimized) {
    return (
      <div className="fixed z-50 transition-all duration-300 ease-in-out sm:right-4 md:right-6 lg:right-8 top-1/2 transform -translate-y-1/2">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-red-700 rounded-l-full opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
          <Button
            onClick={onToggleMinimize}
            variant="default"
            size="sm"
            className="hidden sm:flex relative rounded-l-full rounded-r-none h-10 px-4 py-6 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 border-none shadow-lg transition-all duration-300 text-white"
          >
            <div className="bg-white/20 p-1.5 rounded-full mr-2 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-medium tracking-wide">TeXSync AI</span>
          </Button>
        </div>
        
        <div className="relative sm:hidden group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-red-700 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
          <Button
            onClick={onToggleMinimize}
            variant="default"
            size="icon"
            className="relative rounded-full h-12 w-12 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 border-none shadow-lg transition-all duration-300 text-white"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-screen border-l border-[#383838] bg-[#1a1a1a] overflow-hidden">
      {/* Header with enhanced styling */}
      <div className="relative flex items-center justify-between p-3 border-b border-[#383838] bg-gradient-to-r from-[#1a1a1a] via-[#232323] to-[#252525]">
        <div className="flex items-center">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-red-700 rounded-full opacity-75 blur-[1px] group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-red-700 to-red-500 p-1.5 rounded-full mr-2 shadow-md shadow-red-900/20">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-white tracking-wide">TeXSync AI</h3>
          <Badge variant="outline" className="ml-2 text-[10px] py-0 px-2 h-5 bg-red-500/10 text-red-300 border-red-500/30 shadow-inner shadow-red-900/10">
            {selectedModel === "gemini-2.0-flash" ? "Gemini Pro" : "Gemini"}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 text-[#cccccc] hover:text-white hover:bg-[#333333]/90 transition-colors",
              showSettings && "bg-[#333333]/90 text-white ring-1 ring-red-500/20"
            )}
            title="Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button
            onClick={handleClearConversation}
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#cccccc] hover:text-white hover:bg-[#333333]/90 transition-colors"
            title="Clear conversation"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            onClick={onToggleMinimize}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#cccccc] hover:text-white hover:bg-[#333333]/90 transition-colors"
            title="Minimize"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Settings panel (collapsible) */}
      {showSettings && (
        <div className="p-3 border-b border-[#383838] bg-[#222222]/70 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white">Assistant Settings</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={() => setShowSettings(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#cccccc] block mb-1">Model</label>
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full text-xs rounded-md p-1.5 bg-[#1a1a1a] border border-[#383838] text-[#e9e9e9]"
              >
                <option value="gemini-2.0-flash">Gemini Pro</option>
                <option value="gemini-pro-vision">Gemini Pro Vision</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs text-[#cccccc] block mb-1">Assistant Mode</label>
              <select 
                value={chatMode}
                onChange={(e) => setChatMode(e.target.value as "general" | "teaching" | "expert")}
                className="w-full text-xs rounded-md p-1.5 bg-[#1a1a1a] border border-[#383838] text-[#e9e9e9]"
              >
                <option value="general">General Helper</option>
                <option value="teaching">Teaching Assistant</option>
                <option value="expert">LaTeX Expert</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-[#cccccc]">Temperature: {temperature.toFixed(1)}</label>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#383838] rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-[9px] text-[#888888] mt-0.5">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-[#cccccc]">Max Response Length</label>
              </div>
              <select
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="w-full text-xs rounded-md p-1.5 bg-[#1a1a1a] border border-[#383838] text-[#e9e9e9]"
              >
                <option value="2048">Short (2048 tokens)</option>
                <option value="4096">Medium (4096 tokens)</option>
                <option value="8192">Long (8192 tokens)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab navigation with improved styling */}
      <div className="border-b border-[#383838] bg-[#1a1a1a] flex-1 flex flex-col min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col min-h-0">
          <TabsList className="grid grid-cols-3 bg-transparent h-auto p-0 mx-4 flex-shrink-0">
            <TabsTrigger 
              value="chat" 
              className={cn(
                "border-b-2 border-transparent rounded-none py-2 px-2 data-[state=active]:border-red-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs transition-all duration-200",
                activeTab === "chat" 
                  ? "text-red-400 bg-gradient-to-b from-transparent to-red-950/5" 
                  : "text-[#888888] hover:text-white hover:bg-[#252525]/40"
              )}
            >
              <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="examples" 
              className={cn(
                "border-b-2 border-transparent rounded-none py-2 px-2 data-[state=active]:border-red-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs transition-all duration-200",
                activeTab === "examples" 
                  ? "text-red-400 bg-gradient-to-b from-transparent to-red-950/5" 
                  : "text-[#888888] hover:text-white hover:bg-[#252525]/40"
              )}
            >
              <Code2 className="h-3.5 w-3.5 mr-1.5" />
              Examples
            </TabsTrigger>
            <TabsTrigger 
              value="help" 
              className={cn(
                "border-b-2 border-transparent rounded-none py-2 px-2 data-[state=active]:border-red-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs transition-all duration-200",
                activeTab === "help" 
                  ? "text-red-400 bg-gradient-to-b from-transparent to-red-950/5" 
                  : "text-[#888888] hover:text-white hover:bg-[#252525]/40"
              )}
            >
              <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
              Help
            </TabsTrigger>
          </TabsList>
            {/* Messages */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">            <TabsContent 
              value="chat" 
              className="m-0 flex-1 min-h-0 flex flex-col overflow-hidden"
            >
              <div className="p-4 flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-[#555] scrollbar-track-[#1a1a1a] flex flex-col">
                <div className={cn(
                  "flex flex-col space-y-4 pb-2",
                  messages.length < 3 ? "mt-auto pt-4" : "mt-auto"
                )}>
                  {!apiKeyValid && <ApiKeyWarning />}
                  <DocumentSuggestions documentIssues={documentIssues} />
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex flex-col p-3 rounded-lg transition-all duration-300 animate-in slide-in-from-bottom-3",
                        message.role === "user"
                          ? "ml-auto bg-gradient-to-br from-red-900 to-red-700 text-white max-w-[85%] shadow-lg shadow-red-950/20 border border-red-700/60" 
                          : "mr-auto bg-gradient-to-br from-[#252525] to-[#1e1e1e] text-[#e9e9e9] max-w-[90%] border border-[#333333]/70 shadow-lg shadow-black/40",
                        message.role === "system" && "bg-gradient-to-r from-red-950/30 to-red-900/30 text-red-200 max-w-full mx-auto text-center border border-red-800/20"
                      )}
                    >
                      {/* Message content */}                      <div className="text-sm max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          unwrapDisallowed={true}
                          components={{
                            p: ({node, className, children, ...props}) => {
                              // Check if children contain block elements that shouldn't be in a paragraph
                              const hasBlockElement = React.Children.toArray(children).some(child => {
                                if (!React.isValidElement(child)) return false;
                                const childType = child.type;
                                // Check if it's a DOM element with a tagName that's a block element
                                if (typeof childType === 'string') {
                                  return ['div', 'pre', 'table', 'ul', 'ol', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(childType);
                                }
                                return false;
                              });
                              
                              // If there are block elements inside, render as div instead of p
                              return hasBlockElement ? 
                                <div className="text-sm mb-2" {...props}>{children}</div> : 
                                <p className="text-sm mb-2" {...props}>{children}</p>;
                            },
                            // Handle div elements with consistent styling
                            div: ({node, children, ...props}) => {
                              return <div className="text-sm mb-2" {...props}>{children}</div>;
                            },
                            // Handle other block elements that might be nested incorrectly
                            blockquote: ({node, children, ...props}) => (
                              <blockquote className="pl-4 border-l-2 border-[#383838] my-2 italic" {...props}>{children}</blockquote>
                            ),
                            code: ({node, inline, className, children, ...props}: CodeProps) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const lang = match ? match[1] : '';
                              const isLatex = lang === 'latex' || (!lang && String(children).includes('\\'));
                              
                              if (!inline) {
                                return (
                                  <div className="relative my-2 group transition-all duration-300">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-900/50 to-red-700/50 rounded-md opacity-0 group-hover:opacity-100 blur-[1px] transition duration-300"></div>
                                    <div className="relative rounded-md overflow-hidden border border-[#383838] shadow-md">
                                      <div className="flex justify-between items-center px-3 py-1.5 bg-[#111111] text-[10px]">
                                        <span className="text-red-400 font-medium">{lang || 'code'}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                          <Button
                                            onClick={() => handleCopyCode(String(children))}
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 rounded-md bg-transparent hover:bg-[#3a3a3a] text-[#cccccc]"
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                          {isLatex && (
                                            <Button
                                              onClick={() => handleInsertCode(String(children))}
                                              variant="ghost"
                                              size="icon" 
                                              className="h-5 w-5 rounded-md bg-transparent hover:bg-[#3a3a3a] text-[#cccccc] transition-all duration-200"
                                            >
                                              <CheckCircle className="h-3 w-3" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                      <pre className="bg-[#151515] pt-8 p-3 overflow-x-auto text-xs">
                                        <code className={className} {...props}>
                                          {children}
                                        </code>
                                      </pre>
                                    </div>
                                  </div>
                                );
                              }
                              
                              return (
                                <code className="px-1.5 py-0.5 rounded-sm bg-[#222222] font-mono text-xs" {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      {/* ...existing code... */}
                    </div>                  ))}
                  <div ref={messagesEndRef} className="h-0 w-full" />
                </div>
              </div>
            </TabsContent>
              <TabsContent value="examples" className="m-0 flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="p-4 flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-[#555] scrollbar-track-[#1a1a1a]">
                <LatexExamplesTab />
              </div>
            </TabsContent>
            
            <TabsContent value="help" className="m-0 flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="p-4 flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-[#555] scrollbar-track-[#1a1a1a]">
                {/* ... existing help content ... */}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Input with improved styling */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#383838] bg-gradient-to-b from-[#1a1a1a] to-[#1c1c1c]">
        <div className="flex flex-col space-y-2">
          <div className="relative">
            {/* Add a glowing effect when input is focused */}
            <div className={cn(
              "absolute -inset-0.5 bg-gradient-to-r from-red-700 to-red-500 rounded-md opacity-0 blur transition duration-300",
              input && "opacity-20"
            )}></div>            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about LaTeX formatting, equations, citations..."
              className="relative min-h-[80px] max-h-[160px] resize-y pr-12 focus-visible:ring-1 focus-visible:ring-red-500/50 border border-[#383838] hover:border-[#444] focus:border-red-700/50 bg-[#222222] rounded-md text-[#e9e9e9] placeholder:text-[#888888] transition-all duration-300"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
            />
            
            {/* Enhanced suggestion window */}
            {showSuggestions && activeTab === "chat" && !isLoading && (
              <div className="absolute bottom-[4px] left-[4px] right-[36px] max-h-[120px] overflow-y-auto bg-[#191919] border border-[#3a3a3a] rounded-md shadow-lg z-10 backdrop-blur-sm animate-in slide-in-from-bottom-2 fade-in">
                <div className="flex justify-between items-center px-2 py-1.5 border-b border-[#444]/70 bg-gradient-to-r from-[#222] to-[#1a1a1a]">
                  <h4 className="text-xs font-medium text-red-400 flex items-center">
                    <Sparkles className="h-3 w-3 mr-1.5 text-red-300/70" />
                    Suggestions
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-[#333]/80"
                    onClick={() => setShowSuggestions(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-2">
                  {presetPrompts.slice(0, 4).map(prompt => (
                    <Button
                      key={prompt.id}
                      variant="ghost"
                      size="sm"
                      className="text-[10px] py-1.5 px-2 h-auto justify-start hover:bg-[#333] hover:text-red-400 truncate transition-colors duration-200 rounded-sm"
                      onClick={() => handlePresetPrompt(prompt.prompt)}
                    >
                      <div className="bg-[#252525] p-1 rounded mr-1.5">
                        {prompt.icon}
                      </div>
                      <span className="truncate">{prompt.title}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Enhanced send button */}
            <div className="absolute bottom-2 right-2">
              {input.trim() && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-700 to-red-500 rounded-md opacity-75 blur-[1px] transition duration-300"></div>
              )}
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className={cn(
                  "relative h-8 w-8 rounded-md transition-all duration-200", 
                  input.trim() 
                    ? "bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white shadow-md" 
                    : "bg-[#333333] text-[#888888]"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>            </div>

            {/* Voice command recognized feedback */}
            {recognizedCommand && (
              <div className="absolute top-[-40px] left-0 right-0 bg-purple-900/90 text-white text-xs py-1.5 px-3 rounded-t-md border-t border-x border-purple-700 flex items-center justify-between animate-in slide-in-from-top fade-in duration-200">
                <div className="flex items-center">
                  <Mic className="h-3 w-3 mr-2 text-purple-300" />
                  <span>"{recognizedCommand}"</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setRecognizedCommand(null)}
                  className="h-5 w-5 rounded-full hover:bg-purple-800"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}            {/* Voice command help modal - Enhanced with categories */}
            {showVoiceCommandHelp && (
              <div className="absolute bottom-[calc(100%+10px)] left-0 right-0 bg-[#1a1a1a] border border-[#383838] rounded-md shadow-lg z-20 p-4 max-h-[300px] overflow-y-auto scrollbar-thin animate-in slide-in-from-bottom fade-in">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-purple-400">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" x2="12" y1="19" y2="22"></line>
                      <line x1="9" x2="15" y1="22" y2="22"></line>
                      <circle cx="18" cy="4.5" r="2.5" fill="currentColor"></circle>
                    </svg>
                    Voice Commands
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowVoiceCommandHelp(false)}
                    className="h-6 w-6 rounded-full hover:bg-[#333]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                <p className="text-xs text-[#aaa] mb-3">
                  Click the voice command button and speak one of these commands:
                </p>
                
                {/* Category selector */}
                <div className="flex flex-wrap gap-1 mb-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-[10px] h-6 px-2 rounded-sm",
                      selectedCommandCategory === null 
                        ? "bg-purple-800/50 text-white border border-purple-700/50" 
                        : "bg-[#252525] hover:bg-[#333] text-[#aaa]"
                    )}
                    onClick={() => setSelectedCommandCategory(null)}
                  >
                    All
                  </Button>
                  {["navigation", "control", "content", "generate", "special"].map(category => (
                    <Button
                      key={category}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "text-[10px] h-6 px-2 capitalize rounded-sm",
                        selectedCommandCategory === category 
                          ? "bg-purple-800/50 text-white border border-purple-700/50" 
                          : "bg-[#252525] hover:bg-[#333] text-[#aaa]"
                      )}
                      onClick={() => setSelectedCommandCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                
                {/* Filtered commands by category */}
                <div className="space-y-1">
                  {voiceCommands
                    .filter(cmd => selectedCommandCategory === null || cmd.category === selectedCommandCategory)
                    .map((cmd, index) => (
                    <div key={index} className="flex items-start py-1.5 px-2 border-t border-[#333] first:border-t-0 hover:bg-[#252525] rounded-sm">
                      <div className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded text-xs font-medium mr-3 min-w-[80px] text-center">
                        {cmd.name}
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="text-xs text-[#ddd]">
                          {cmd.description}
                        </div>
                        <div className="text-[10px] text-[#777] mt-1 italic">
                          Example: "{cmd.pattern.toString().split('|')[0].replace(/[\/\^$]/g, '').replace(/[()]|i$/g, '').trim()}"
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {continuousListening && (
                  <div className="mt-4 p-2 bg-purple-900/20 border border-purple-800/30 rounded text-xs text-purple-200 flex items-center">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    Continuous listening mode is active. Say "stop listening" to turn it off.
                  </div>
                )}
                
                <p className="text-xs text-[#aaa] mt-3">
                  If your command isn't recognized, it will be used as input text.
                </p>
              </div>
            )}

            {/* Enhanced Voice Command Feedback UI */}
            {isListeningForCommands && (
              <div className={cn(
                "absolute top-[-60px] left-0 right-0 bg-gradient-to-r from-purple-900/90 to-indigo-900/90 text-white py-2 px-3 rounded-md border border-purple-700 shadow-lg",
                "animate-in slide-in-from-top fade-in duration-200"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-purple-500 rounded-full animate-ping opacity-75"></div>
                      <Mic className="h-4 w-4 text-white relative" />
                    </div>
                    <span className="text-xs font-medium">
                      {continuousListening ? "Continuous Listening Mode" : "Listening for command..."}
                    </span>
                  </div>
                  
                  {/* Voice confidence meter */}
                  {voiceConfidence > 0 && (
                    <div className="flex items-center space-x-1">
                      <div className="h-1.5 w-16 bg-purple-900/50 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            voiceConfidence > 0.8 ? "bg-green-400" :
                            voiceConfidence > 0.6 ? "bg-yellow-400" : "bg-red-400"
                          )}
                          style={{ width: `${Math.round(voiceConfidence * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] opacity-70">
                        {Math.round(voiceConfidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                
                {recognizedCommand && (
                  <div className="mt-1.5 text-xs bg-purple-800/50 py-1 px-2 rounded">
                    "{recognizedCommand}"
                  </div>
                )}
              </div>
            )}
            
            {/* Command feedback toast */}
            {commandFeedback.command && commandFeedback.status && Date.now() - commandFeedback.timestamp < 3000 && (
              <div className={cn(
                "absolute top-[-40px] left-0 right-0 text-xs py-1.5 px-3 border rounded-md animate-in slide-in-from-top fade-in duration-200",
                commandFeedback.status === 'success' ? "bg-green-900/90 border-green-700 text-green-50" :
                commandFeedback.status === 'not-found' ? "bg-amber-900/90 border-amber-700 text-amber-50" :
                "bg-blue-900/90 border-blue-700 text-blue-50"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {commandFeedback.status === 'success' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : commandFeedback.status === 'not-found' ? (
                      <AlertCircle className="h-3 w-3" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                    <span>
                      {commandFeedback.status === 'success' ? (
                        `Command executed: ${commandFeedback.command}`
                      ) : commandFeedback.status === 'not-found' ? (
                        `No matching command: "${commandFeedback.command}"`
                      ) : (
                        'Processing command...'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
            {/* Input footer */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="text-xs text-[#888888]">
                <kbd className="px-1.5 py-0.5 text-[10px] bg-[#222222] border border-[#444444] rounded shadow-inner">Shift+Enter</kbd> for new line
              </div>
              <Button
                variant="ghost" 
                size="sm"
                className="ml-2 h-6 px-2 text-xs text-[#888888] hover:text-red-400 transition-colors"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Suggestions
              </Button>
            </div>
            {messages.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                className="h-7 px-2 text-xs text-[#cccccc] hover:text-white hover:bg-[#333333] transition-colors"
                disabled={isLoading}
              >
                <RotateCw className="h-3 w-3 mr-1" />
                Regenerate
              </Button>
            )}
          </div>
            {/* NEW VOICE COMMAND BUTTONS ROW */}
          <div className="flex items-center justify-between py-2 mt-1 border-t border-[#383838]/50">
            <div className="flex items-center gap-3">
              {/* Voice input button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleVoiceRecording}
                className={cn(
                  "h-8 px-3 flex items-center gap-1.5 transition-all duration-200",
                  isRecording 
                    ? "bg-red-700 text-white border-red-600 animate-pulse" 
                    : "bg-[#252525] text-[#cccccc] border-[#383838] hover:bg-[#333] hover:text-white"
                )}
                disabled={isLoading}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                <span>{isRecording ? "Stop Recording" : "Voice Input"}</span>
              </Button>
              
              {/* Voice command button with continuous mode indicator */}
              <div className="relative">
                {continuousListening && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full z-10">
                    <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={startVoiceCommandListener}
                  className={cn(
                    "h-8 px-3 flex items-center gap-1.5 transition-all duration-200",
                    isListeningForCommands ? "bg-purple-700 text-white border-purple-600 animate-pulse" : 
                    continuousListening ? "bg-purple-900/60 text-purple-100 border-purple-700" : 
                    "bg-[#252525] text-[#cccccc] border-[#383838] hover:bg-[#333] hover:text-white"
                  )}
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" x2="12" y1="19" y2="22"></line>
                    <line x1="9" x2="15" y1="22" y2="22"></line>
                    <circle cx="18" cy="4.5" r="2.5" fill="currentColor" opacity={continuousListening ? "0.8" : "0.4"}></circle>
                  </svg>
                  <span>{isListeningForCommands ? "Listening..." : continuousListening ? "Continuous Mode" : "Voice Commands"}</span>
                </Button>
              </div>
              
              {/* Help button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowVoiceCommandHelp(!showVoiceCommandHelp)}
                className="h-8 px-3 bg-[#252525] text-[#cccccc] border-[#383838] hover:bg-[#333] hover:text-white"
              >
                <HelpCircle className="h-4 w-4 mr-1.5" />
                <span>Help</span>
              </Button>
            </div>

            {/* TeXSync Logo */}
            <div className="flex items-center mr-2 opacity-70 hover:opacity-100 transition-opacity">
              <Logo size="sm" className="text-base" />
            </div>
          </div>
        </div>
      </form>
      {/* Voice Command History Panel */}
            {commandHistory.length > 0 && (
              <div className="absolute top-[-2px] right-[90px] z-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCommandFeedbackUI(!showCommandFeedbackUI)}
                  className={cn(
                    "h-6 text-[10px] rounded-b-none border-b-0 flex items-center gap-1",
                    showCommandFeedbackUI 
                      ? "bg-purple-900/80 text-white border border-purple-700/50"
                      : "bg-[#333]/80 text-[#aaa] hover:text-white border border-[#444]/30"
                  )}
                >
                  <span className="relative flex h-2 w-2">
                    {continuousListening && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    )}
                    <span className={cn(
                      "relative inline-flex rounded-full h-2 w-2",
                      continuousListening ? "bg-purple-500" : "bg-gray-500"
                    )}></span>
                  </span>
                  History
                </Button>
                
                {showCommandFeedbackUI && (
                  <div className="bg-[#1a1a1a]/95 backdrop-blur-sm border border-[#444]/40 rounded-md shadow-lg p-2 w-[220px] max-h-[180px] overflow-y-auto scrollbar-thin animate-in slide-in-from-top">
                    <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-[#333]">
                      <h4 className="text-xs font-medium text-white">Recent Commands</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowCommandFeedbackUI(false)}
                        className="h-5 w-5 rounded-full hover:bg-[#333]"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {commandHistory.length === 0 ? (
                      <div className="text-[10px] text-[#777] italic py-1">
                        No commands yet
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {commandHistory.slice().reverse().map((cmd, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "flex justify-between items-center text-[10px] py-0.5 px-1.5 rounded",
                              cmd.successful ? "text-green-300" : "text-yellow-300",
                              i === 0 && cmd.timestamp > Date.now() - 3000 && "bg-[#333]/40"
                            )}
                          >
                            <span>{cmd.command}</span>
                            <span className="text-[#777]">
                              {formatTimeAgo(cmd.timestamp)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {continuousListening && (
                      <div className="mt-2 pt-1.5 border-t border-[#333] flex justify-between items-center">
                        <span className="text-[10px] text-purple-300">Continuous mode</span>
                        <Button
                          type="button"
                          variant="ghost" 
                          size="sm"
                          onClick={() => setContinuousListening(false)}
                          className="h-5 text-[10px] py-0 px-1.5 bg-purple-900/30 text-purple-200 hover:bg-purple-800/50"
                        >
                          Stop
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
    </div>
  );
}

// Create this new component in your project
const LatexExamplesTab = () => {
  const examples = [
    {
      id: "equation",
      title: "Equations",
      description: "Common mathematical equations and expressions",
      snippets: [
        {
          name: "Quadratic Formula",
          code: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
          preview: true
        },
        {
          name: "Maxwell's Equations",
          code: "\\begin{align}\n\\nabla \\cdot \\vec{E} &= \\frac{\\rho}{\\epsilon_0} \\\\\n\\nabla \\cdot \\vec{B} &= 0 \\\\\n\\nabla \\times \\vec{E} &= -\\frac{\\partial \\vec{B}}{\\partial t} \\\\\n\\nabla \\times \\vec{B} &= \\mu_0 \\vec{J} + \\mu_0 \\epsilon_0 \\frac{\\partial \\vec{E}}{\\partial t}\n\\end{align}",
          preview: true
        }
      ]
    },
    {
      id: "tables",
      title: "Tables",
      description: "Table formats for different use cases",
      snippets: [
        {
          name: "Simple Table",
          code: "\\begin{table}[htbp]\n\\centering\n\\caption{Sample Table}\n\\begin{tabular}{|c|c|c|}\n\\hline\nHeader 1 & Header 2 & Header 3 \\\\ \\hline\nValue 1 & Value 2 & Value 3 \\\\ \\hline\nValue 4 & Value 5 & Value 6 \\\\ \\hline\n\\end{tabular}\n\\label{tab:sample}\n\\end{table}",
          preview: false
        }
      ]
    },
    // Add more example categories
  ];
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        // Provide feedback that code was copied
        const notification = document.createElement('div');
        notification.textContent = 'Copied to clipboard';
        notification.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-md text-sm shadow-lg z-50';
        document.body.appendChild(notification);
        
        // Remove notification after 2 seconds
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy code to clipboard');
      });
  };

  function handleInsertCode(code: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="space-y-6">
      {examples.map(category => (
        <div key={category.id} className="bg-[#1e1e1e] rounded-md overflow-hidden border border-[#383838]">
          <div className="bg-gradient-to-r from-[#2a2a2a] to-[#222] p-3 border-b border-[#383838]">
            <h3 className="text-sm font-medium text-white">{category.title}</h3>
            <p className="text-xs text-[#aaa] mt-1">{category.description}</p>
          </div>
          
          <div className="p-3 space-y-4">
            {category.snippets.map(snippet => (
              <div key={snippet.name} className="bg-[#252525] rounded-md overflow-hidden border border-[#333]">
                <div className="flex items-center justify-between px-3 py-2 bg-[#1f1f1f] border-b border-[#333]">
                  <span className="text-xs font-medium text-red-400">{snippet.name}</span>
                  <div className="flex space-x-1">
                    <Button
                      onClick={() => handleCopyCode(snippet.code)}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md hover:bg-[#333]"
                      title="Copy code"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      onClick={() => handleInsertCode(snippet.code)}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md hover:bg-[#333]"
                      title="Insert into document"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-3 bg-[#151515] max-h-[250px] overflow-y-auto">
                  <pre className="text-xs text-[#e0e0e0] whitespace-pre-wrap">
                    <code>{snippet.code}</code>
                  </pre>
                </div>
                
                {snippet.preview && (
                  <div className="border-t border-[#333] p-3 bg-white">
                    {/* Integrate with KaTeX or MathJax for rendering */}
                    <div className="katex-preview" 
                         dangerouslySetInnerHTML={{ __html: "" /* TODO: Render LaTeX preview */ }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Then use this component in your Examples tab
<TabsContent value="examples" className="m-0 flex-1 min-h-0 flex flex-col overflow-hidden">
  <div className="p-4 flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-[#555] scrollbar-track-[#1a1a1a]">
    <LatexExamplesTab />
  </div>
</TabsContent>

// Add a component to show document suggestions
interface DocumentSuggestionsProps {
  documentIssues: any[];
  setInput?: (value: string) => void;
}

const DocumentSuggestions = ({ documentIssues, setInput }: DocumentSuggestionsProps) => {
  if (documentIssues.length === 0) return null;

  return (
    <div className="mb-4 bg-[#1e1e1e] border border-[#383838] rounded-md overflow-hidden">
      <div className="bg-gradient-to-r from-amber-900/20 to-red-900/20 px-3 py-2 border-b border-[#383838]">
        <h3 className="text-sm font-medium text-amber-400 flex items-center">
          <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
          Document Analysis
        </h3>
      </div>
      <div className="p-3">
        <ul className="space-y-2">
          {documentIssues.map((issue, index) => (
            <li key={index} className="flex items-start text-xs">
              <span className={cn(
                "rounded-full h-2 w-2 mt-1 mr-2",
                issue.severity === "error" ? "bg-red-500" : "bg-amber-400"
              )}/>
              <div>
                <p className="text-[#e0e0e0] font-medium">{issue.message}</p>
                <p className="text-[#aaa] mt-0.5">{issue.suggestion}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-[#1a1a1a] px-3 py-2 border-t border-[#383838]">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
          onClick={() => setInput && setInput("Help me fix these document issues")}
        >
          Ask AI to help fix issues
        </Button>
      </div>
    </div>
  );
};