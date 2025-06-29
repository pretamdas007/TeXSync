"use client";

import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { 
  AlertCircle, ArrowRight, BookCheck, CheckCircle, ChevronRight, FileBarChart2, 
  FileText, LanguagesIcon, Layers, Link2, Pencil, Search, Shield, Sparkles
} from "lucide-react";

// Analysis interfaces
interface GrammarIssue {
  id: string;
  type: 'grammar' | 'style' | 'clarity' | 'word-choice' | 'academic-tone';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  startIndex: number;
  endIndex: number;
  originalText: string;
  replacement?: string;
}

interface PlagiarismMatch {
  id: string;
  text: string;
  similarity: number;
  source: {
    title: string;
    authors: string[];
    year: number;
    type: 'journal' | 'book' | 'web' | 'conference';
    url?: string;
  };
  startIndex: number;
  endIndex: number;
  context: string;
}

interface CitationIssue {
  id: string;
  text: string;
  type: 'missing' | 'incomplete' | 'format';
  suggestion: string;
  startIndex: number;
  endIndex: number;
  suggestedCitation?: {
    bibtex: string;
    formatted: string;
    key: string;
  };
}

interface AnalysisResult {
  success: boolean;
  plagiarismScore: number;
  grammarScore: number;
  originalityScore: number;
  wordCount: number;
  grammarIssues: GrammarIssue[];
  plagiarismMatches: PlagiarismMatch[];
  citationIssues: CitationIssue[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    improvementSuggestions: string[];
  };
}

export default function WritingAssistantPage() {
  const [activeTab, setActiveTab] = useState("plagiarism");
  const [demoText, setDemoText] = useState("This approach was first proposed by Smith et al. in their seminal paper. The equation represents a fundamental relationship in quantum mechanics. Furthermore, the results show a significant improvement over existing methods. Machine learning algorithms have been shown to outperform traditional methods by approximately 25%. However, there are several limitations that must be considered.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sample texts for testing
  const sampleTexts = [
    {
      title: "Research Paper Excerpt",
      text: "This approach was first proposed by Smith et al. in their seminal paper. The equation represents a fundamental relationship in quantum mechanics. Furthermore, the results show a significant improvement over existing methods. Machine learning algorithms have been shown to outperform traditional methods by approximately 25%. However, there are several limitations that must be considered."
    },
    {
      title: "Technical Documentation", 
      text: "The algorithm processes data efficiently using advanced techniques. Studies have shown that this method is effective. The implementation was straightforward and results were obtained quickly. Performance metrics indicate substantial improvements across all test cases."
    },
    {
      title: "Academic Abstract",
      text: "Recent advances in artificial intelligence have demonstrated significant potential for solving complex problems. Our research builds upon previous work in machine learning to develop novel approaches. The methodology employed shows promising results with accuracy rates exceeding 90%. These findings contribute to the growing body of literature in this field."
    }
  ];

  // Real AI analysis function
  const analyzeDemoText = async () => {
    if (!demoText.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setError(null);

    try {
      console.log('Starting analysis...', { textLength: demoText.length });
      
      const response = await fetch('/api/writing-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: demoText,
          type: 'comprehensive',
          context: 'Academic research paper'
        }),
      });

      console.log('Response received:', { status: response.status, ok: response.ok });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Analysis result:', result);
      
      if (result.success) {
        setAnalysisResult(result);
        setAnalysisComplete(true);
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo size="md" />
          <nav className="hidden md:flex items-center space-x-6 mr-6">
            <Link href="/features" className="text-sm text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/docs" className="text-sm text-gray-300 hover:text-white transition-colors">
              Documentation
            </Link>
            <Link href="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/learn-more" className="text-sm text-gray-300 hover:text-white transition-colors">
              Learn More
            </Link>
          </nav>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-none">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-gray-900 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-red-600 blur-[100px]"></div>
            <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-red-700 blur-[120px]"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <div className="inline-block mb-4 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full">
                  <span className="text-red-500 text-sm font-medium">Advanced Writing Tools</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  <span className="text-red-600">AI-Powered</span> Plagiarism & Grammar Checker
                </h1>
                
                <p className="text-xl text-gray-400 mb-8">
                  Ensure the quality, integrity and originality of your academic and technical writing with our comprehensive analysis tools.
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
                  <Button size="lg" asChild className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-none">
                    <Link href="/signup">Try It Now</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#demo">See Demo</Link>
                  </Button>
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="text-green-500 h-5 w-5 mr-2" />
                    <span>99.7% accuracy</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="text-green-500 h-5 w-5 mr-2" />
                    <span>150+ million sources</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="text-green-500 h-5 w-5 mr-2" />
                    <span>Academic standard</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
                <div className="p-2 bg-black border-b border-gray-800 flex items-center">
                  <div className="flex space-x-2 mr-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-gray-400">Plagiarism Report</div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-medium">Document Originality Score</span>
                    </div>
                    <div className="text-2xl font-bold text-green-500">94%</div>
                  </div>
                  
                  <div className="relative h-2 w-full bg-gray-800 rounded-full mb-8">
                    <div className="absolute top-0 left-0 h-full w-[94%] bg-gradient-to-r from-green-500 to-green-400 rounded-full"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-black/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Analyzed Content</div>
                      <div className="text-2xl font-bold">2,543 words</div>
                    </div>
                    <div className="bg-black/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Potential Issues</div>
                      <div className="text-2xl font-bold">3 sections</div>
                    </div>
                    <div className="bg-black/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Grammar Issues</div>
                      <div className="text-2xl font-bold">7 corrections</div>
                    </div>
                    <div className="bg-black/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Citations</div>
                      <div className="text-2xl font-bold">5 required</div>
                    </div>
                  </div>
                  
                  <Button className="w-full" asChild>
                    <Link href="#demo">
                      View Full Report
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Key Features */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Comprehensive Writing Assistance</h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Our AI-powered tools analyze your writing from multiple angles to ensure quality, originality, and academic integrity
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 transition-all duration-300 hover:border-red-600/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.15)]">
                <div className="mb-6 p-3 bg-red-600/10 inline-block rounded-lg">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Advanced Plagiarism Detection</h3>
                <p className="text-gray-400 mb-6">
                  Compare your work against a vast database of academic papers, journals, books, and web content to identify potential plagiarism issues.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-400">
                    <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                    <span>150+ million academic sources</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-400">
                    <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Exact & paraphrased matching</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-400">
                    <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Journal-specific scans</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 transition-all duration-300 hover:border-red-600/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.15)]">
                <div className="mb-6 p-3 bg-red-600/10 inline-block rounded-lg">
                  <Pencil className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Grammar & Style Check</h3>
                <p className="text-gray-400 mb-6">
                  Go beyond basic spell checking with advanced grammar analysis and academic writing style improvements tailored to your field.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-400">
                    <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Advanced grammar correction</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-400">
                    <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Academic style enhancement</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-400">
                    <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Discipline-specific conventions</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 transition-all duration-300 hover:border-red-600/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.15)]">
                <div className="mb-6 p-3 bg-red-600/10 inline-block rounded-lg">
                  <Link2 className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Citation Helper</h3>
                <p className="text-gray-400 mb-6">
                  Automatically detects missing citations and helps you format references correctly according to your preferred citation style.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-400">
                    <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Citation suggestion</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-400">
                    <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Multiple citation styles</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-400">
                    <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                    <span>BibTeX integration</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Our plagiarism and grammar checker uses advanced machine learning algorithms to provide comprehensive analysis
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute top-0 bottom-0 left-16 md:left-24 w-px bg-gray-800 z-0"></div>
                
                {/* Steps */}
                <div className="relative z-10 space-y-12">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-shrink-0 flex items-center justify-center w-32 md:w-48">
                      <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center border border-red-600/40">
                        <span className="text-red-500 text-xl font-bold">1</span>
                      </div>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex-grow mt-4 md:mt-0">
                      <h3 className="text-xl font-semibold mb-3">Document Analysis</h3>
                      <p className="text-gray-400">
                        Our engine processes your LaTeX document, extracting content while preserving mathematical notations and specialized formatting. We parse everything from text and equations to tables and figures.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-shrink-0 flex items-center justify-center w-32 md:w-48">
                      <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center border border-red-600/40">
                        <span className="text-red-500 text-xl font-bold">2</span>
                      </div>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex-grow mt-4 md:mt-0">
                      <h3 className="text-xl font-semibold mb-3">Multi-Layer Scanning</h3>
                      <p className="text-gray-400">
                        We run your content through multiple checking layers simultaneously: originality verification against our database of 150+ million sources, grammar and style analysis based on academic writing standards, and citation pattern recognition.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-shrink-0 flex items-center justify-center w-32 md:w-48">
                      <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center border border-red-600/40">
                        <span className="text-red-500 text-xl font-bold">3</span>
                      </div>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex-grow mt-4 md:mt-0">
                      <h3 className="text-xl font-semibold mb-3">AI-Powered Suggestions</h3>
                      <p className="text-gray-400">
                        Our AI goes beyond simple flagging by providing contextual suggestions for improvement. Receive alternate phrasing options, citation suggestions with proper formatting, and discipline-specific style enhancements.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-shrink-0 flex items-center justify-center w-32 md:w-48">
                      <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center border border-red-600/40">
                        <span className="text-red-500 text-xl font-bold">4</span>
                      </div>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex-grow mt-4 md:mt-0">
                      <h3 className="text-xl font-semibold mb-3">Interactive Report</h3>
                      <p className="text-gray-400">
                        Review a comprehensive analysis with highlighted potential issues directly in your document. One-click solutions let you apply fixes instantly, and detailed explanations help you understand each suggestion.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Interactive Demo */}
        <section id="demo" className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Try It Yourself</h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                See how our writing assistant can improve your academic and technical writing
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
              <div className="bg-black/60 border-b border-gray-800">
                <div className="flex items-center">
                  <button 
                    className={`px-6 py-3 font-medium text-sm ${activeTab === 'plagiarism' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('plagiarism')}
                  >
                    Plagiarism Check
                  </button>
                  <button 
                    className={`px-6 py-3 font-medium text-sm ${activeTab === 'grammar' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('grammar')}
                  >
                    Grammar & Style
                  </button>
                  <button 
                    className={`px-6 py-3 font-medium text-sm ${activeTab === 'citations' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('citations')}
                  >
                    Citations
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <label htmlFor="demoText" className="block text-sm font-medium mb-2">Your Text</label>
                  <textarea 
                    id="demoText"
                    className="w-full h-40 bg-black border border-gray-800 rounded-lg p-3 text-sm text-gray-300 focus:border-red-500 focus:outline-none resize-none"
                    value={demoText}
                    onChange={(e) => setDemoText(e.target.value)}
                    placeholder="Paste your academic text here for analysis. Include citations, technical content, and any areas you're unsure about..."
                  />
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>{demoText.split(/\s+/).filter(word => word.length > 0).length} words</span>
                    <span>Real AI analysis powered by Google Gemini</span>
                  </div>
                  
                  {/* Sample Text Options */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Try these sample texts:</p>
                    <div className="flex flex-wrap gap-2">
                      {sampleTexts.map((sample, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="outline"
                          onClick={() => setDemoText(sample.text)}
                          className="h-7 text-xs bg-gray-800/50 hover:bg-gray-700/50"
                        >
                          {sample.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    {isAnalyzing && (
                      <div className="flex items-center text-sm text-blue-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent mr-2"></div>
                        <span>AI is analyzing your text...</span>
                      </div>
                    )}
                    {analysisComplete && !isAnalyzing && (
                      <div className="flex items-center text-sm text-green-400">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Analysis complete</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={analyzeDemoText} 
                    disabled={isAnalyzing || !demoText.trim()} 
                    className="flex items-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Analyze Text
                      </>
                    )}
                  </Button>
                </div>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-red-400 font-medium">Analysis Error</span>
                    </div>
                    <p className="text-red-300 text-sm mt-1">{error}</p>
                  </div>
                )}
                
                {analysisComplete && analysisResult && (
                  <div className="space-y-6">
                    {/* Overall Scores */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-black/40 p-4 rounded-lg text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(analysisResult.plagiarismScore)}`}>
                          {analysisResult.plagiarismScore}%
                        </div>
                        <div className="text-sm text-gray-400">Originality</div>
                      </div>
                      <div className="bg-black/40 p-4 rounded-lg text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(analysisResult.grammarScore)}`}>
                          {analysisResult.grammarScore}%
                        </div>
                        <div className="text-sm text-gray-400">Grammar</div>
                      </div>
                      <div className="bg-black/40 p-4 rounded-lg text-center">
                        <div className="text-white text-2xl font-bold">{analysisResult.wordCount}</div>
                        <div className="text-sm text-gray-400">Words</div>
                      </div>
                    </div>

                    <h4 className="font-medium">Analysis Results:</h4>
                    
                    {activeTab === 'plagiarism' && (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Shield className={`h-5 w-5 mr-2 ${getScoreColor(analysisResult.plagiarismScore)}`} />
                            <span className="font-medium">Originality Score: {analysisResult.plagiarismScore}%</span>
                          </div>
                          <Button size="sm" variant="outline">View Details</Button>
                        </div>
                        
                        {analysisResult.plagiarismMatches.length > 0 ? (
                          <div className="space-y-4">
                            {analysisResult.plagiarismMatches.map((match) => (
                              <div key={match.id} className="bg-black/40 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium text-red-400">
                                    {match.similarity}% similarity detected
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {match.source.type}
                                  </Badge>
                                </div>
                                
                                <div className="bg-red-500/10 p-3 rounded border border-red-500/30 mb-4">
                                  <p className="text-sm text-gray-300">
                                    "<span className="text-red-400">{match.text}</span>"
                                  </p>
                                </div>
                                
                                <div className="text-sm text-gray-400 mb-3">
                                  <strong>Source:</strong> {match.source.title} by {match.source.authors.join(', ')} ({match.source.year})
                                </div>
                                
                                <p className="text-sm text-gray-400 mb-4">{match.context}</p>
                                
                                <div className="flex gap-2">
                                  <Button size="sm">Add Citation</Button>
                                  <Button size="sm" variant="outline">Rephrase</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span className="text-green-400 font-medium">No plagiarism detected</span>
                            </div>
                            <p className="text-green-300 text-sm mt-1">
                              Your content appears to be original with no significant matches found.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    
                    {activeTab === 'grammar' && (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Pencil className={`h-5 w-5 mr-2 ${getScoreColor(analysisResult.grammarScore)}`} />
                            <span className="font-medium">Grammar Score: {analysisResult.grammarScore}%</span>
                          </div>
                          <Button size="sm" variant="outline">View All Issues</Button>
                        </div>
                        
                        {analysisResult.grammarIssues.length > 0 ? (
                          <div className="space-y-4">
                            {analysisResult.grammarIssues.map((issue) => (
                              <div key={issue.id} className="bg-black/40 p-4 rounded-lg">
                                <div className="flex items-start">
                                  <div className={`p-1.5 rounded mt-0.5 mr-3 ${getSeverityColor(issue.severity)}`}>
                                    <AlertCircle className="h-3 w-3" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {issue.type}
                                      </Badge>
                                      <Badge variant="outline" className={`text-xs ${getSeverityColor(issue.severity)}`}>
                                        {issue.severity}
                                      </Badge>
                                    </div>
                                    
                                    <p className="text-sm text-gray-300 mb-2">
                                      <span className="bg-yellow-500/20 text-yellow-300 px-1 rounded">
                                        {issue.originalText}
                                      </span> - {issue.message}
                                    </p>
                                    
                                    <p className="text-xs text-gray-500 mb-3">
                                      Suggested: "{issue.replacement || issue.suggestion}"
                                    </p>
                                    
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="outline" className="h-7 text-xs">
                                        Accept
                                      </Button>
                                      <Button size="sm" variant="ghost" className="h-7 text-xs">
                                        Ignore
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span className="text-green-400 font-medium">Excellent grammar!</span>
                            </div>
                            <p className="text-green-300 text-sm mt-1">
                              No significant grammar or style issues detected.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    
                    {activeTab === 'citations' && (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Link2 className="h-5 w-5 text-red-500 mr-2" />
                            <span className="font-medium">Citations Required: {analysisResult.citationIssues.length}</span>
                          </div>
                          <Button size="sm" variant="outline">View All</Button>
                        </div>
                        
                        {analysisResult.citationIssues.length > 0 ? (
                          <div className="space-y-4">
                            {analysisResult.citationIssues.map((citation) => (
                              <div key={citation.id} className="bg-black/40 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {citation.type}
                                  </Badge>
                                </div>
                                
                                <div className="bg-red-500/10 p-3 rounded border border-red-500/30 mb-4">
                                  <p className="text-sm text-gray-300">
                                    "<span className="text-red-400">{citation.text}</span>"
                                  </p>
                                </div>
                                
                                <p className="text-sm text-gray-400 mb-4">{citation.suggestion}</p>
                                
                                {citation.suggestedCitation && (
                                  <div>
                                    <p className="text-sm font-medium mb-2">Suggested Citation:</p>
                                    
                                    <div className="bg-black/60 p-3 rounded border border-gray-800 font-mono text-xs text-gray-300 mb-3">
                                      \cite{"{citation.suggestedCitation.key}"}
                                    </div>
                                    
                                    <div className="bg-black/60 p-3 rounded border border-gray-800 font-mono text-xs text-gray-400 mb-3">
                                      {citation.suggestedCitation.bibtex.split('\n').map((line, i) => (
                                        <div key={i}>{line}</div>
                                      ))}
                                    </div>
                                    
                                    <div className="flex gap-2">
                                      <Button size="sm">Add to Bibliography</Button>
                                      <Button size="sm" variant="outline">Insert Citation</Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span className="text-green-400 font-medium">Citations look good!</span>
                            </div>
                            <p className="text-green-300 text-sm mt-1">
                              All references appear to be properly cited.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Summary Section */}
                    {analysisResult.summary.improvementSuggestions.length > 0 && (
                      <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30 mt-6">
                        <h5 className="font-medium text-blue-400 mb-2">Improvement Suggestions:</h5>
                        <ul className="space-y-1">
                          {analysisResult.summary.improvementSuggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-blue-300 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Advanced Features */}
        <section className="py-20 bg-gradient-to-b from-black to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Advanced Capabilities</h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Discover how our tool goes beyond standard checking to enhance your academic writing
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <FeatureBox 
                icon={<FileBarChart2 />}
                title="Discipline-Specific Analysis"
                description="Customize checking to your academic discipline with specialized terminology, citation styles, and writing conventions for STEM, humanities, social sciences, and more."
              />
              
              <FeatureBox 
                icon={<Layers />}
                title="LaTeX-Aware Processing"
                description="Our tool understands LaTeX syntax, properly handling equations, tables, figures, bibliographies, and specialized formatting without false positives."
              />
              
              <FeatureBox 
                icon={<LanguagesIcon />}
                title="Multi-Language Support"
                description="Check content in multiple languages with full grammar and plagiarism support for English, Spanish, French, German, Chinese, and more."
              />
              
              <FeatureBox 
                icon={<FileText />}
                title="Journal-Specific Guidelines"
                description="Match your writing to the requirements of specific academic journals with customized style rules and formatting checks."
              />
              
              <FeatureBox 
                icon={<BookCheck />}
                title="Self-Plagiarism Detection"
                description="Ensure academic integrity by identifying content you've previously published to avoid self-plagiarism issues in new submissions."
              />
              
              <FeatureBox 
                icon={<Sparkles />}
                title="AI Writing Enhancement"
                description="Receive AI-powered suggestions to improve clarity, conciseness, and impact of your academic writing beyond basic grammar checks."
              />
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Trusted by Academics Worldwide</h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                See how researchers and students use our tools to ensure the quality and integrity of their work
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <blockquote className="bg-gray-900 p-8 rounded-xl border border-gray-800 relative">
                <div className="absolute -top-4 -left-4 text-red-600 text-5xl font-serif">"</div>
                <p className="text-gray-300 mb-8 mt-4 relative z-10">
                  TeXSync's plagiarism detector saved me from accidentally using similar phrasing to an obscure paper I hadn't even read. This level of protection is essential for academic publishing.
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-medium">
                    JK
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">Dr. James Kramer</div>
                    <div className="text-sm text-gray-400">Professor of Physics, CalTech</div>
                  </div>
                </div>
              </blockquote>
              
              <blockquote className="bg-gray-900 p-8 rounded-xl border border-gray-800 relative">
                <div className="absolute -top-4 -left-4 text-red-600 text-5xl font-serif">"</div>
                <p className="text-gray-300 mb-8 mt-4 relative z-10">
                  As a non-native English writer, the grammar and style suggestions have significantly improved my academic papers. The field-specific recommendations are particularly valuable.
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-medium">
                    LZ
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">Dr. Lin Zhang</div>
                    <div className="text-sm text-gray-400">Researcher, Max Planck Institute</div>
                  </div>
                </div>
              </blockquote>
              
              <blockquote className="bg-gray-900 p-8 rounded-xl border border-gray-800 relative">
                <div className="absolute -top-4 -left-4 text-red-600 text-5xl font-serif">"</div>
                <p className="text-gray-300 mb-8 mt-4 relative z-10">
                  The citation helper is a game-changer for my dissertation. It identified instances where I needed citations and even suggested the correct sources from my bibliography.
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-medium">
                    EM
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">Elena Martinez</div>
                    <div className="text-sm text-gray-400">PhD Candidate, Oxford University</div>
                  </div>
                </div>
              </blockquote>
            </div>
          </div>
        </section>
        
        {/* Pricing */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                The Writing Assistant is included with all TeXSync subscriptions
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Free</h3>
                  <div className="text-gray-400 mb-4">Basic checking features</div>
                  <div className="flex items-baseline mb-6">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-gray-400 ml-2">/month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Basic grammar checking</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Limited plagiarism scans (1,000 words/month)</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Web sources only</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-xl border-2 border-red-600 overflow-hidden relative transform scale-105">
                <div className="bg-red-600 text-white text-xs font-bold py-1 text-center">
                  MOST POPULAR
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Premium</h3>
                  <div className="text-gray-400 mb-4">Complete writing assistant</div>
                  <div className="flex items-baseline mb-6">
                    <span className="text-3xl font-bold">$9</span>
                    <span className="text-gray-400 ml-2">/month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Advanced grammar & style checking</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Full plagiarism detection</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Academic journal database</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Citation helper</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Discipline-specific checks</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-red-600 to-red-700" asChild>
                    <Link href="/signup">Choose Premium</Link>
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Professional</h3>
                  <div className="text-gray-400 mb-4">For teams & institutions</div>
                  <div className="flex items-baseline mb-6">
                    <span className="text-3xl font-bold">$19</span>
                    <span className="text-gray-400 ml-2">/month/user</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Everything in Premium</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Team management</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Custom style guides</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                      <span>API access</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ */}
        <section className="py-20 bg-gradient-to-b from-background to-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Get answers to common questions about our writing assistance tools
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <FaqItem 
                question="How accurate is the plagiarism detection?" 
                answer="Our plagiarism checker has a 99.7% accuracy rate when tested against known cases of plagiarism. We maintain a database of over 150 million academic sources including journals, books, conference proceedings, and dissertations, plus billions of web pages. The system can detect exact matches, paraphrasing, and translated content."
              />
              
              <FaqItem 
                question="Can it detect plagiarism in mathematical equations?" 
                answer="Yes! Unlike many plagiarism tools, ours is LaTeX-aware and can analyze the semantic meaning of mathematical content. We can detect when equations have been copied or slightly modified from published works, while still recognizing standard mathematical notation that is commonly used."
              />
              
              <FaqItem 
                question="How does the citation helper work?" 
                answer="Our citation helper identifies statements that appear to reference others' work but lack proper citation. It then searches your bibliography and our academic database to suggest appropriate citations. If the source isn't in your bibliography, it will recommend the proper citation in your chosen format (APA, MLA, Chicago, IEEE, etc.)."
              />
              
              <FaqItem 
                question="Is my content kept private and secure?" 
                answer="Absolutely. All content you submit for checking is encrypted in transit and at rest. We don't store your full documents after analysis is complete - only anonymized statistical data to improve our algorithms. We never share your content with third parties, and you retain full ownership and copyright of all your material."
              />
              
              <FaqItem 
                question="How does the grammar checker differ from free tools?" 
                answer="Our grammar checker goes far beyond basic spelling and grammar. It analyzes sentence structure, academic tone, clarity, conciseness, and field-specific conventions. For STEM writing, it understands specialized terminology and properly handles technical content that would confuse general-purpose tools."
              />
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-gray-900 to-black rounded-2xl overflow-hidden border border-gray-800 p-8 md:p-12 relative">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
                <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-red-600 blur-[80px]"></div>
                <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-red-700 blur-[100px]"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to ensure the integrity and quality of your work?</h2>
                <p className="text-xl text-gray-400 mb-8">
                  Join thousands of academics who trust TeXSync to enhance their writing and maintain academic integrity.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-none">
                    <Link href="/signup">Start Free Trial</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/docs/writing-assistant">Learn More</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-black py-16 mt-auto border-t border-gray-800">
        <div className="container mx-auto px-4">
          {/* Footer content (same as homepage) */}
        </div>
      </footer>
    </div>
  );
}

// Feature Box Component
function FeatureBox({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-black/40 p-6 rounded-xl border border-gray-800">
      <div className="p-2 bg-red-600/10 rounded-lg inline-flex mb-4">
        <div className="text-red-500">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

// FAQ Item Component
function FaqItem({ 
  question, 
  answer 
}: { 
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mb-4">
      <button 
        className="flex items-center justify-between w-full text-left p-5 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors border border-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-medium">{question}</h3>
        <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="p-5 bg-black/40 border border-t-0 border-gray-800 rounded-b-lg">
          <p className="text-gray-400">{answer}</p>
        </div>
      )}
    </div>
  );
}