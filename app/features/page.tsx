import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import Link from "next/link";
import { 
  Edit3, Users, FileText, Code, Zap, BarChart2, 
  Database, Layout, ArrowRight, CheckCircle, BookOpen,
  Monitor, Layers, GitMerge, ChevronRight, Terminal
} from "lucide-react";
import Image from "next/image";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo size="md" />
          <nav className="hidden md:flex items-center space-x-6 mr-6">
            <Link href="/features" className="text-sm text-white font-medium transition-colors">
              Features
            </Link>
            <Link href="/docs" className="text-sm text-gray-300 hover:text-white transition-colors">
              Documentation
            </Link>
            <Link href="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
              Pricing
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
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-red-600 blur-[100px]"></div>
            <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-red-700 blur-[120px]"></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-block mb-4 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full">
              <span className="text-red-500 text-sm font-medium">Powerful LaTeX Tools</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Every <span className="text-red-600">Feature</span> You Need for <span className="text-red-600">Academic Excellence</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
              TeXSync combines powerful editing tools, real-time collaboration, and intelligent automation to make writing LaTeX documents easier than ever.
            </p>
          </div>
        </section>

        {/* Feature Overview */}
        <section className="py-24 bg-black">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Edit3 className="w-12 h-12 text-red-600" />}
                title="Advanced Editor"
                description="A powerful LaTeX editor with syntax highlighting, auto-completion, and live preview capabilities."
                link="/features/editor"
              />
              <FeatureCard 
                icon={<Users className="w-12 h-12 text-red-600" />}
                title="Real-time Collaboration"
                description="Work together with colleagues on the same document simultaneously with live changes."
                link="/features/collaboration"
              />
              <FeatureCard 
                icon={<FileText className="w-12 h-12 text-red-600" />}
                title="Document Management"
                description="Organize your projects with folders, tags, and powerful search capabilities."
                link="/features/management"
              />
              <FeatureCard 
                icon={<Layout className="w-12 h-12 text-red-600" />}
                title="Professional Templates"
                description="Start quickly with templates for academic papers, theses, presentations, and more."
                link="/features/templates"
              />
              <FeatureCard 
                icon={<BookOpen className="w-12 h-12 text-red-600" />}
                title="Bibliography Tools"
                description="Easily manage citations and references with integrated BibTeX support."
                link="/features/bibliography"
              />
              <FeatureCard 
                icon={<Zap className="w-12 h-12 text-red-600" />}
                title="Smart Conversion"
                description="Convert between document formats including Word, PDF, and LaTeX with precision."
                link="/features/conversion"
              />
            </div>
          </div>
        </section>

        {/* Editor Feature Showcase */}
        <section className="py-24 bg-background relative">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block mb-4 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full">
                  <span className="text-red-500 text-sm font-medium">Advanced Editor</span>
                </div>
                <h2 className="text-3xl font-bold mb-6">Intelligent LaTeX Editing Experience</h2>
                <p className="text-gray-400 mb-8">
                  Our editor is designed specifically for LaTeX, with features that make writing technical documents fast and efficient.
                </p>
                
                <ul className="space-y-4">
                  <FeatureListItem>
                    <span className="font-semibold">Syntax Highlighting</span> - Color-coded display of LaTeX elements
                  </FeatureListItem>
                  <FeatureListItem>
                    <span className="font-semibold">Auto-completion</span> - Suggestions for commands and environments
                  </FeatureListItem>
                  <FeatureListItem>
                    <span className="font-semibold">Live Preview</span> - See your changes rendered in real-time
                  </FeatureListItem>
                  <FeatureListItem>
                    <span className="font-semibold">Error Detection</span> - Catch syntax errors before compilation
                  </FeatureListItem>
                  <FeatureListItem>
                    <span className="font-semibold">Math Mode Support</span> - Special tools for mathematical notation
                  </FeatureListItem>
                </ul>
                
                <Button asChild className="mt-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-none">
                  <Link href="/editor" className="inline-flex items-center">
                    Try the Editor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
                <div className="bg-black p-2 flex items-center border-b border-gray-800">
                  <div className="flex space-x-2 mr-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-gray-400">LaTeX Editor</div>
                </div>
                <div className="aspect-video bg-black relative">
                  {/* Replace with actual editor screenshot */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Editor Screenshot
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Collaboration Feature */}
        <section className="py-24 bg-black relative">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="lg:order-2">
                <div className="inline-block mb-4 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full">
                  <span className="text-red-500 text-sm font-medium">Collaboration</span>
                </div>
                <h2 className="text-3xl font-bold mb-6">Real-time Collaborative Editing</h2>
                <p className="text-gray-400 mb-8">
                  Work together with your colleagues and coauthors on the same document in real-time, with changes synced instantly.
                </p>
                
                <ul className="space-y-4">
                  <FeatureListItem>
                    <span className="font-semibold">Simultaneous Editing</span> - Multiple authors can work at once
                  </FeatureListItem>
                  <FeatureListItem>
                    <span className="font-semibold">Change Tracking</span> - See who made what changes and when
                  </FeatureListItem>
                  <FeatureListItem>
                    <span className="font-semibold">Comments</span> - Discuss specific sections with inline comments
                  </FeatureListItem>
                  <FeatureListItem>
                    <span className="font-semibold">Permissions</span> - Control who can view, edit, or comment
                  </FeatureListItem>
                  <FeatureListItem>
                    <span className="font-semibold">Version History</span> - Revert to previous versions when needed
                  </FeatureListItem>
                </ul>
                
                <Button asChild className="mt-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-none">
                  <Link href="/features/collaboration" className="inline-flex items-center">
                    Learn More About Collaboration
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="lg:order-1 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl relative">
                <div className="absolute top-4 left-4 z-10">
                  <div className="flex space-x-2">
                    <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                      EC
                    </div>
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      JD
                    </div>
                    <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                      TS
                    </div>
                  </div>
                </div>
                <div className="aspect-video bg-black relative">
                  {/* Replace with actual collaboration screenshot */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Collaboration Screenshot
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Templates Feature */}
        <section className="py-24 bg-background relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full">
                <span className="text-red-500 text-sm font-medium">Templates</span>
              </div>
              <h2 className="text-3xl font-bold mb-6">Professional LaTeX Templates</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Start with beautifully designed templates for academic papers, theses, presentations, CVs, and more.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TemplateCard 
                title="Academic Paper"
                description="Perfect for journal submissions with proper formatting and citation styles."
                imageUrl="/academic-paper.jpg"
              />
              <TemplateCard 
                title="Thesis/Dissertation"
                description="Structured template for graduate research documents with chapters and appendices."
                imageUrl="/thesis.jpg"
              />
              <TemplateCard 
                title="Beamer Presentation"
                description="Professional slide presentations with LaTeX quality mathematics."
                imageUrl="/presentation.jpg"
              />
              <TemplateCard 
                title="Academic CV"
                description="Clean, professional curriculum vitae for academic positions."
                imageUrl="/cv.jpg"
              />
              <TemplateCard 
                title="Lab Report"
                description="Structured format for scientific experiments and results."
                imageUrl="/lab-report.jpg"
              />
              <TemplateCard 
                title="Research Poster"
                description="Large format research posters for conferences and presentations."
                imageUrl="/poster.jpg"
              />
            </div>
            
            <div className="text-center mt-12">
              <Button asChild className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-none">
                <Link href="/templates" className="inline-flex items-center">
                  Browse All Templates
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Bibliography Feature */}
        <section className="py-24 bg-black relative">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block mb-4 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full">
                  <span className="text-red-500 text-sm font-medium">Bibliography Management</span>
                </div>
                <h2 className="text-3xl font-bold mb-6">Streamlined Citation & Reference Management</h2>
                <p className="text-gray-400 mb-8">
                  TeXSync makes managing your references and citations effortless with integrated BibTeX support.
                </p>
                
                <ul className="space-y-4">
                  <FeatureListItem>
                    <span className="font-semibold">BibTeX Integration</span> - Direct support for reference databases
                  </FeatureListItem>
                  <FeatureListItem>
                    <span className="font-semibold">Citation Search</span> - Find and insert citations as you write
                  </FeatureListItem>
                  <FeatureListItem>
                    <span className="font-semibold">Style Selection</span> - Choose from popular citation styles (APA, IEEE, etc.)
                  </FeatureListItem>
                  <FeatureListItem>
                    <span className="font-semibold">Reference Import</span> - Import references from DOI, arXiv, and more
                  </FeatureListItem>
                  <FeatureListItem>
                    <span className="font-semibold">Bibliography Generation</span> - Automatically format your reference list
                  </FeatureListItem>
                </ul>
              </div>
              
              <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-4">BibTeX Manager</h3>
                  <div className="space-y-4">
                    <div className="bg-black p-4 rounded border border-gray-800">
                      <div className="text-green-500 text-xs mb-1">@article</div>
                      <div className="text-sm text-gray-300 font-mono">
                        <div>{'{'}<span className="text-blue-400">einstein1905electrodynamics</span>,</div>
                        <div className="pl-4">author = {'{'}Einstein, Albert{'}'},</div>
                        <div className="pl-4">title = {'{'}On the Electrodynamics of Moving Bodies{'}'},</div>
                        <div className="pl-4">journal = {'{'}Annalen der Physik{'}'},</div>
                        <div className="pl-4">year = {'{'}1905{'}'},</div>
                        <div className="pl-4">volume = {'{'}17{'}'},</div>
                        <div>{'}'}</div>
                      </div>
                    </div>
                    
                    <div className="bg-black p-4 rounded border border-gray-800">
                      <div className="text-green-500 text-xs mb-1">@book</div>
                      <div className="text-sm text-gray-300 font-mono">
                        <div>{'{'}<span className="text-blue-400">hawking1988brief</span>,</div>
                        <div className="pl-4">author = {'{'}Hawking, Stephen W.{'}'},</div>
                        <div className="pl-4">title = {'{'}A Brief History of Time{'}'},</div>
                        <div className="pl-4">publisher = {'{'}Bantam Books{'}'},</div>
                        <div className="pl-4">year = {'{'}1988{'}'},</div>
                        <div>{'}'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Conversion Feature */}
        <section className="py-24 bg-background relative">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="lg:order-2">
                <div className="inline-block mb-4 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full">
                  <span className="text-red-500 text-sm font-medium">Smart Conversion</span>
                </div>
                <h2 className="text-3xl font-bold mb-6">Convert Between Document Formats</h2>
                <p className="text-gray-400 mb-8">
                  TeXSync allows you to convert between LaTeX, Word, PDF, and other formats while preserving formatting and structure.
                </p>
                
                <ul className="space-y-4">
                  <FeatureListItem>
                    <span className="font-semibold">Word to LaTeX</span> - Convert .docx files to properly formatted LaTeX
                  </FeatureListItem>
                  <FeatureListItem>
                    <span className="font-semibold">LaTeX to PDF</span> - Generate high-quality PDF documents
                  </FeatureListItem>
                  <FeatureListItem>
                    <span className="font-semibold">LaTeX to Word</span> - Export to .docx for colleagues who don't use LaTeX
                  </FeatureListItem>
                  <FeatureListItem>
                    <span className="font-semibold">PDF to LaTeX</span> - Extract content from PDF documents
                  </FeatureListItem>
                  <FeatureListItem>
                    <span className="font-semibold">Markdown Support</span> - Convert between Markdown and LaTeX
                  </FeatureListItem>
                </ul>
                
                <Button asChild className="mt-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-none">
                  <Link href="/convert" className="inline-flex items-center">
                    Try Document Conversion
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="lg:order-1 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl p-8">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path></svg>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 my-4"><path d="m6 9 6 6 6-6"></path></svg>
                  <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M5 12V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2h-5"></path><path d="M5 18h6"></path><path d="M5 14h6"></path></svg>
                  </div>
                  <p className="text-gray-400 text-center mb-6">Convert documents with a single click while preserving formatting</p>
                  <div className="flex space-x-4">
                    <div className="px-4 py-2 bg-gray-800 rounded text-xs text-gray-300">DOCX</div>
                    <div className="px-4 py-2 bg-gray-800 rounded text-xs text-gray-300">PDF</div>
                    <div className="px-4 py-2 bg-gray-800 rounded text-xs text-gray-300">LaTeX</div>
                    <div className="px-4 py-2 bg-gray-800 rounded text-xs text-gray-300">MD</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* More Features */}
        <section className="py-24 bg-black relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">More Powerful Features</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                TeXSync is packed with additional features to make your LaTeX workflow smooth and productive.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <SmallFeatureCard
                icon={<Terminal className="h-6 w-6 text-red-600" />}
                title="Custom Commands"
                description="Define your own LaTeX commands and shortcuts for faster writing."
              />
              <SmallFeatureCard
                icon={<Layers className="h-6 w-6 text-red-600" />}
                title="Document Versioning"
                description="Track changes with full version history and rollback capabilities."
              />
              <SmallFeatureCard
                icon={<Monitor className="h-6 w-6 text-red-600" />}
                title="Responsive Preview"
                description="See how your document looks on different devices and formats."
              />
              <SmallFeatureCard
                icon={<Database className="h-6 w-6 text-red-600" />}
                title="Cloud Storage"
                description="Access your documents from anywhere with secure cloud storage."
              />
              <SmallFeatureCard
                icon={<GitMerge className="h-6 w-6 text-red-600" />}
                title="Git Integration"
                description="Connect to GitHub repositories for advanced version control."
              />
              <SmallFeatureCard
                icon={<BarChart2 className="h-6 w-6 text-red-600" />}
                title="Document Analytics"
                description="Get insights on word count, complexity, and readability."
              />
            </div>
          </div>
        </section>
        
        {/* Testimonial */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 p-10 md:p-16 relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" viewBox="0 0 16 16" className="absolute top-6 left-6 text-red-600/10">
                <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z"/>
              </svg>
              <div className="relative">
                <p className="text-xl md:text-2xl mb-8 font-light">
                  "TeXSync has completely transformed our research paper workflow. The collaborative features allowed our international team to work together seamlessly, while the citation management saved us countless hours of formatting work."
                </p>
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-red-600 rounded-full mr-4 flex items-center justify-center font-bold text-lg">
                    DR
                  </div>
                  <div>
                    <p className="font-semibold">Dr. Rebecca Johnson</p>
                    <p className="text-sm text-gray-400">Professor of Computer Science, MIT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-24 bg-gradient-to-b from-gray-900 to-black relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-red-600 blur-[100px]"></div>
            <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-red-700 blur-[120px]"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold mb-6">Ready to experience these features?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Try TeXSync today and see how our features can transform your LaTeX writing experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-none">
                <Link href="/signup" className="px-8">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing" className="px-8">View Pricing</Link>
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

// Feature Card Component
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

// Feature List Item Component
function FeatureListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start">
      <CheckCircle className="text-red-600 h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

// Template Card Component
function TemplateCard({ 
  title, 
  description, 
  imageUrl 
}: { 
  title: string;
  description: string;
  imageUrl: string;
}) {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 transition-all duration-300 hover:border-red-600/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.15)] group">
      <div className="h-48 bg-black/50 relative">
        {/* When you have actual images, uncomment this */}
        {/* <Image 
          src={imageUrl} 
          fill 
          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
          alt={title} 
        /> */}
        
        {/* Placeholder for now */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          {title} Template Preview
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
        <Link href="/templates" className="text-red-500 inline-flex items-center text-sm font-medium group-hover:text-red-400">
          Use template <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// Small Feature Card Component
function SmallFeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 transition-all duration-300 hover:border-red-600/30 hover:shadow-[0_0_15px_rgba(220,38,38,0.15)]">
      <div className="flex items-start">
        <div className="mr-4 mt-1">{icon}</div>
        <div>
          <h3 className="font-semibold mb-2">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}