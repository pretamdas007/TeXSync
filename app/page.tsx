import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import Link from "next/link";
import { Laptop, FileText, Users, Zap, ArrowRight, CheckCircle, Code, Book, ChevronRight, BookCheck, Shield, GanttChart, Sparkles, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function Home() {
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
        <section className="py-24 bg-gradient-to-b from-background to-gray-900 relative overflow-hidden">
          {/* Abstract shapes in the background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-red-600 blur-[100px]"></div>
            <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-red-700 blur-[120px]"></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-block mb-4 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full">
              <span className="text-red-500 text-sm font-medium">The #1 Choice for Academic Writing</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-red-600">Collaborative LaTeX</span> Editing,{" "}
              <span className="text-red-600">Simplified</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
              A modern, distraction-free writing environment for academic papers, 
              research documents, and technical writing with real-time collaboration.
            </p>
            
            <div className="flex justify-center gap-4 flex-wrap mb-12">
              <Button size="lg" asChild className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-none shadow-lg hover:shadow-red-700/20">
                <Link href="/editor" className="flex items-center">
                  Try the Editor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                asChild 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-none shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Link href="/convert" className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Convert Documents to LaTeX
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                asChild 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-none shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Link href="/features/writing-assistant" className="flex items-center gap-2">
                  <BookCheck className="w-5 h-5" />
                  Check for Plagiarism & Grammar
                </Link>
              </Button>
              
              
            </div>
            
            {/* Preview Window */}
            <div className="max-w-5xl mx-auto rounded-xl overflow-hidden border border-gray-800 shadow-2xl shadow-red-900/10">
              <div className="bg-gray-900 p-2 flex items-center border-b border-gray-800">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-gray-400">TeXSync Editor</div>
              </div>
              <div className="bg-black aspect-video relative">
                {/* Replace placeholder with actual Image component */}
                <Image
                  src="/tex.jpg"
                  alt="TeXSync Editor Interface"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-10 bg-black/40 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-12 text-gray-400">
              <p className="text-sm font-medium">TRUSTED BY RESEARCHERS AT</p>
              <p className="text-xl font-semibold">MIT</p>
              <p className="text-xl font-semibold">Stanford</p>
              <p className="text-xl font-semibold">Oxford</p>
              <p className="text-xl font-semibold">Berkeley</p>
              <p className="text-xl font-semibold">Cambridge</p>
            </div>
          </div>
        </section>

        {/* Feature Section 
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Key Features</h2>
            <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">Everything you need to create professional LaTeX documents without the complexity</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<Laptop className="w-12 h-12 text-red-600" />}
                title="Real-time Editing"
                description="Edit your LaTeX documents with immediate compilation and live preview. No more waiting for results."
                link="/features/editing"
              />
              <FeatureCard 
                icon={<FileText className="w-12 h-12 text-red-600" />}
                title="Smart Conversion"
                description="Convert Word documents and PDFs to structured LaTeX code with our AI-powered conversion engine."
                link="/convert"
              />
              <FeatureCard 
                icon={<Users className="w-12 h-12 text-red-600" />}
                title="Collaboration"
                description="Work together in real-time with your team. Comments, suggestions, and version history included."
                link="/features/collaboration"
              />
              <FeatureCard 
                icon={<Zap className="w-12 h-12 text-red-600" />}
                title="Powerful Templates"
                description="Start with professionally designed academic templates for journals, theses, and presentations."
                link="/templates"
              />
              <FeatureCard 
                icon={<BookCheck className="w-12 h-12 text-red-600" />}
                title="Plagiarism & Grammar Check"
                description="Ensure academic integrity and professional writing with our advanced AI-powered plagiarism detection and grammar correction tools."
                link="/features/writing-assistant"
              />
            </div>
          </div>
        </section>*/}
        
        {/* How It Works */}
        <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How TeXSync Works</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Our platform simplifies the LaTeX workflow from start to finish
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mb-6">
                  <span className="text-red-500 text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Choose Your Starting Point</h3>
                <p className="text-gray-400">
                  Start with a template, upload existing documents, or begin from scratch
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mb-6">
                  <span className="text-red-500 text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Write & Format</h3>
                <p className="text-gray-400">
                  Use our intuitive editor with live preview for instant feedback
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mb-6">
                  <span className="text-red-500 text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Export & Publish</h3>
                <p className="text-gray-400">
                  Generate publication-ready PDFs with proper formatting and references
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Quote/Testimonial */}
        <section className="py-24 bg-black">
          <div className="container mx-auto px-4">
            <blockquote className="max-w-4xl mx-auto text-center">
              <div className="text-5xl text-red-600 mb-6">"</div>
              <p className="text-2xl md:text-3xl font-light mb-6 italic">
                TeXSync has revolutionized how we collaborate on research papers. 
                What used to take days of back-and-forth now happens in real-time.
              </p>
              <footer className="flex flex-col items-center">
                <p className="font-semibold mb-1">Dr. Emily Chen</p>
                <p className="text-sm text-gray-400">Professor of Computer Science, Stanford University</p>
              </footer>
            </blockquote>
          </div>
        </section>

        {/* Features List */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Everything You Need for LaTeX Success</h2>
                <p className="text-gray-400 mb-8">
                  Our platform comes with all the tools and features academics and professionals need for efficient technical writing.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <FeatureItem>LaTeX syntax highlighting</FeatureItem>
                  <FeatureItem>Auto-completion</FeatureItem>
                  <FeatureItem>Math equation support</FeatureItem>
                  <FeatureItem>BibTeX integration</FeatureItem>
                  <FeatureItem>Template library</FeatureItem>
                  <FeatureItem>Version control</FeatureItem>
                  <FeatureItem>Collaborative editing</FeatureItem>
                  <FeatureItem>PDF export</FeatureItem>
                  <FeatureItem>Citation management</FeatureItem>
                  <FeatureItem>Cloud storage</FeatureItem>
                  <FeatureItem>Advanced grammar checking</FeatureItem>
                  <FeatureItem>Plagiarism detection</FeatureItem>
                </div>
              </div>
              
              <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-xl">
                <div className="flex items-center mb-6">
                  <Code className="w-8 h-8 text-red-600 mr-3" />
                  <h3 className="text-xl font-bold">Try Our LaTeX Editor</h3>
                </div>
                
                <p className="text-gray-400 mb-6">
                  Experience the power of our editor firsthand with these quick actions:
                </p>
                
                <div className="space-y-4">
                  <Link href="/editor" className="flex items-center justify-between p-3 bg-black rounded-lg hover:bg-gray-800 transition-colors">
                    <span>Create a new document</span>
                    <ChevronRight className="w-5 h-5 text-red-600" />
                  </Link>
                  <Link href="/convert" className="flex items-center justify-between p-3 bg-black rounded-lg hover:bg-gray-800 transition-colors">
                    <span>Convert an existing document</span>
                    <ChevronRight className="w-5 h-5 text-red-600" />
                  </Link>
                  <Link href="/templates" className="flex items-center justify-between p-3 bg-black rounded-lg hover:bg-gray-800 transition-colors">
                    <span>Browse templates</span>
                    <ChevronRight className="w-5 h-5 text-red-600" />
                  </Link>
                  <Link href="/docs" className="flex items-center justify-between p-3 bg-black rounded-lg hover:bg-gray-800 transition-colors">
                    <span>Read the documentation</span>
                    <ChevronRight className="w-5 h-5 text-red-600" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New Feature Section */}
        <section className="py-24 bg-black">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <div className="inline-block mb-4 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full">
                  <span className="text-red-500 text-sm font-medium">New Feature</span>
                </div>
                <h2 className="text-3xl font-bold mb-6">Ensure Integrity & Quality with Built-in Writing Assistant</h2>
                <p className="text-gray-400 mb-8">
                  Our advanced AI-powered writing tools help you produce flawless academic and technical documents by identifying potential issues before submission.
                </p>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex">
                    <div className="mr-4 p-2 bg-red-600/10 rounded-lg">
                      <Shield className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Plagiarism Detection</h3>
                      <p className="text-sm text-gray-400">Compare your work against millions of academic papers, journals, and web sources to ensure originality.</p>
                    </div>
                  </li>
                  
                  <li className="flex">
                    <div className="mr-4 p-2 bg-red-600/10 rounded-lg">
                      <GanttChart className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Grammar & Style Analysis</h3>
                      <p className="text-sm text-gray-400">Get suggestions for grammar, clarity, conciseness, and academic tone to elevate your writing quality.</p>
                    </div>
                  </li>
                  
                  <li className="flex">
                    <div className="mr-4 p-2 bg-red-600/10 rounded-lg">
                      <Sparkles className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">AI Writing Suggestions</h3>
                      <p className="text-sm text-gray-400">Receive intelligent recommendations to enhance your arguments, improve clarity, and strengthen your research narrative.</p>
                    </div>
                  </li>
                </ul>
                
                <Button asChild>
                  <Link href="/features/writing-assistant" className="flex items-center">
                    Learn More About Writing Tools
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-xl">
                <div className="p-2 bg-gray-900 border-b border-gray-800 flex items-center">
                  <div className="flex space-x-2 mr-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-gray-400">Writing Assistant</div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-2">Document Analysis</h4>
                    <div className="w-full bg-black rounded-lg p-4 font-mono text-sm">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-gray-400">Analyzing document...</div>
                        <div className="text-green-500">100% Complete</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-gray-300">Grammar check complete</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-gray-300">Plagiarism scan complete</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-gray-300">Style analysis complete</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-medium mb-2">Results</h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="p-1.5 bg-yellow-500/10 rounded mt-0.5 mr-2">
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-300 mb-1">
                          <span className="bg-yellow-500/20 text-yellow-300 px-1 rounded">The equation represents...</span> - Consider rephrasing to avoid passive voice
                        </p>
                        <p className="text-xs text-gray-500">Suggested: "The equation demonstrates..."</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-1.5 bg-red-500/10 rounded mt-0.5 mr-2">
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-300 mb-1">
                          <span className="bg-red-500/20 text-red-300 px-1 rounded">This approach was first proposed by Smith et al.</span> - Potential citation needed
                        </p>
                        <p className="text-xs text-gray-500">Add citation for Smith et al. using \cite{"exampleKey"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-1.5 bg-blue-500/10 rounded mt-0.5 mr-2">
                        <AlertCircle className="h-3 w-3 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-300 mb-1">
                          <span className="bg-blue-500/20 text-blue-300 px-1 rounded">Furthermore, the results show a significant improvement.</span> - Consider adding specific metrics
                        </p>
                        <p className="text-xs text-gray-500">Suggestion: Add p-value or percentage improvement</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-3 bg-black/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium">Originality Score: 97%</span>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs">View Report</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-red-600 blur-[100px]"></div>
            <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-red-700 blur-[120px]"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold mb-6">Ready to transform your LaTeX workflow?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Join thousands of researchers, students, and professionals who use TeXSync for their LaTeX needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-none">
                <Link href="/signup" className="px-8">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/editor" className="px-8">Try Without Signup</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black py-16 mt-auto border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <Logo className="mb-4" />
              <p className="text-sm text-gray-400 mb-4">
                Modern LaTeX editing for academics and professionals.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/templates" className="text-gray-400 hover:text-white transition-colors">Templates</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/tutorials" className="text-gray-400 hover:text-white transition-colors">Tutorials</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} TeXSync. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Updated Feature Card Component
function FeatureCard({ 
  icon, 
  title, 
  description,
  link 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  link?: string;
}) {
  return (
    <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 transition-all duration-300 hover:border-red-600/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.15)] group">
      <div className="mb-6 p-3 bg-black/40 inline-block rounded-lg">{icon}</div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      {link && (
        <Link href={link} className="text-red-500 inline-flex items-center text-sm font-medium group-hover:text-red-400">
          Learn more <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

// New component for feature items
function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center">
      <CheckCircle className="text-red-600 h-5 w-5 mr-2 flex-shrink-0" />
      <span className="text-sm">{children}</span>
    </div>
  );
}