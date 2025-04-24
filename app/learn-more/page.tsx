"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import { 
  AlertCircle, Book, CheckCircle, ChevronDown, ChevronRight, Code, 
  FileText, Github, Globe, Laptop, ShieldCheck, Users, Zap 
} from "lucide-react";
import { useState } from "react";

export default function LearnMorePage() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - reusing the same header structure from the homepage */}
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

          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover the Power of <span className="text-red-600">TeXSync</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
              A deep dive into how TeXSync is transforming LaTeX collaboration and scientific writing
              for researchers, students, and professionals worldwide.
            </p>
          </div>
        </section>

        {/* Platform Overview */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold mb-16 text-center">Why Choose TeXSync?</h2>
              
              <div className="grid md:grid-cols-2 gap-10 items-center mb-24">
                <div>
                  <h3 className="text-2xl font-semibold mb-6">LaTeX Without the Learning Curve</h3>
                  <p className="text-gray-400 mb-6">
                    TeXSync brings the power of LaTeX to everyone, from beginners to experts,
                    with an intuitive interface that eliminates the traditional barriers to entry.
                  </p>
                  <ul className="space-y-4">
                    <FeatureListItem>
                      Visual editor with instant preview
                    </FeatureListItem>
                    <FeatureListItem>
                      Smart templates for common document types
                    </FeatureListItem>
                    <FeatureListItem>
                      AI-assisted writing and formatting
                    </FeatureListItem>
                    <FeatureListItem>
                      Extensive documentation and tutorials
                    </FeatureListItem>
                  </ul>
                </div>
                <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                  <div className="aspect-video relative">
                    <Image
                      src="/editor-screenshot.jpg"
                      alt="TeXSync Editor Interface"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-10 items-center mb-24">
                <div className="order-2 md:order-1 bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                  <div className="aspect-video relative">
                    <Image
                      src="/collaboration-screenshot.jpg"
                      alt="TeXSync Collaboration Features"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-2xl font-semibold mb-6">Real-time Collaboration</h3>
                  <p className="text-gray-400 mb-6">
                    Work together with your team, no matter where they are in the world,
                    with true real-time collaborative editing and communication.
                  </p>
                  <ul className="space-y-4">
                    <FeatureListItem>
                      Multiple users editing simultaneously
                    </FeatureListItem>
                    <FeatureListItem>
                      In-document comments and discussions
                    </FeatureListItem>
                    <FeatureListItem>
                      Track changes and version history
                    </FeatureListItem>
                    <FeatureListItem>
                      Role-based permissions and access control
                    </FeatureListItem>
                  </ul>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <h3 className="text-2xl font-semibold mb-6">Powerful Document Management</h3>
                  <p className="text-gray-400 mb-6">
                    TeXSync isn't just an editor—it's a complete document management system
                    built specifically for academic and technical writing.
                  </p>
                  <ul className="space-y-4">
                    <FeatureListItem>
                      Organized project folders and workspaces
                    </FeatureListItem>
                    <FeatureListItem>
                      Automatic bibliography management with BibTeX
                    </FeatureListItem>
                    <FeatureListItem>
                      Figure and table management tools
                    </FeatureListItem>
                    <FeatureListItem>
                      Advanced search across all your documents
                    </FeatureListItem>
                  </ul>
                </div>
                <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                  <div className="aspect-video relative">
                    <Image
                      src="/document-management.jpg"
                      alt="TeXSync Document Management"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Specifications */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 text-center">Technical Specifications</h2>
            <p className="text-gray-400 text-center max-w-3xl mx-auto mb-16">
              Built with cutting-edge technology to provide a reliable and powerful platform
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
              <div className="bg-black/40 p-8 rounded-xl border border-gray-800">
                <div className="flex items-center mb-4">
                  <Laptop className="h-6 w-6 text-red-600 mr-3" />
                  <h3 className="text-xl font-semibold">Compatibility</h3>
                </div>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Works on all modern browsers</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Desktop apps for Windows, macOS, Linux</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Mobile-optimized interface</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Offline mode with synchronization</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-black/40 p-8 rounded-xl border border-gray-800">
                <div className="flex items-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-red-600 mr-3" />
                  <h3 className="text-xl font-semibold">Security & Privacy</h3>
                </div>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>End-to-end encryption</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>GDPR compliant data handling</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Regular security audits</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Data export & portability</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-black/40 p-8 rounded-xl border border-gray-800">
                <div className="flex items-center mb-4">
                  <Code className="h-6 w-6 text-red-600 mr-3" />
                  <h3 className="text-xl font-semibold">Integration</h3>
                </div>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>GitHub & GitLab integration</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Zotero & Mendeley citation support</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Cloud storage providers</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>API for custom integrations</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-black/30 border border-gray-800 rounded-xl p-6 max-w-3xl mx-auto">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <h4 className="font-semibold">System Requirements</h4>
              </div>
              <p className="text-gray-400 text-sm">
                TeXSync runs in the cloud, so there are no heavy system requirements.
                Any device with a modern web browser (Chrome, Firefox, Safari, Edge) and
                internet connection will work perfectly. For the desktop app, we recommend
                at least 4GB RAM and 100MB of free disk space.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 text-center">Who Uses TeXSync?</h2>
            <p className="text-gray-400 text-center max-w-3xl mx-auto mb-16">
              TeXSync is designed for anyone who needs to create professional, 
              technically accurate documents
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 transition-all duration-300 hover:border-red-600/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.15)]">
                <h3 className="text-2xl font-semibold mb-4">Academic Researchers</h3>
                <p className="text-gray-400 mb-6">
                  Collaborate on research papers with colleagues around the world,
                  manage citations, and publish in top journals with proper formatting.
                </p>
                <ul className="space-y-3">
                  <li className="text-sm text-gray-400">• Research papers</li>
                  <li className="text-sm text-gray-400">• Journal articles</li>
                  <li className="text-sm text-gray-400">• Conference submissions</li>
                  <li className="text-sm text-gray-400">• Grant proposals</li>
                </ul>
              </div>
              
              <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 transition-all duration-300 hover:border-red-600/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.15)]">
                <h3 className="text-2xl font-semibold mb-4">Students</h3>
                <p className="text-gray-400 mb-6">
                  Create professional-looking theses, dissertations, and assignments without
                  spending hours learning LaTeX syntax.
                </p>
                <ul className="space-y-3">
                  <li className="text-sm text-gray-400">• Theses & dissertations</li>
                  <li className="text-sm text-gray-400">• Lab reports</li>
                  <li className="text-sm text-gray-400">• Mathematics assignments</li>
                  <li className="text-sm text-gray-400">• Class presentations</li>
                </ul>
              </div>
              
              <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 transition-all duration-300 hover:border-red-600/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.15)]">
                <h3 className="text-2xl font-semibold mb-4">Industry Professionals</h3>
                <p className="text-gray-400 mb-6">
                  Produce technical documentation, reports, and presentations with
                  accurate formulas, diagrams, and consistent formatting.
                </p>
                <ul className="space-y-3">
                  <li className="text-sm text-gray-400">• Technical documentation</li>
                  <li className="text-sm text-gray-400">• Engineering reports</li>
                  <li className="text-sm text-gray-400">• Financial models</li>
                  <li className="text-sm text-gray-400">• Client presentations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <p className="text-gray-400 text-center max-w-3xl mx-auto mb-16">
              Everything you need to know about TeXSync
            </p>
            
            <div className="max-w-3xl mx-auto">
              <FaqItem 
                question="Do I need to know LaTeX to use TeXSync?"
                answer="Not at all! TeXSync is designed to be accessible for beginners while still offering advanced features for LaTeX experts. Our visual editor and templates make it easy to create professional documents without knowing LaTeX syntax, and you can gradually learn more as you go."
                isOpen={openSection === 'faq1'}
                toggleOpen={() => toggleSection('faq1')}
              />
              
              <FaqItem 
                question="How does real-time collaboration work?"
                answer="Multiple people can edit the same document simultaneously, with changes appearing instantly for all collaborators. You'll see everyone's cursors and selections in real-time, and can use comments and chat to communicate within the editor. All changes are automatically saved and synced across all devices."
                isOpen={openSection === 'faq2'}
                toggleOpen={() => toggleSection('faq2')}
              />
              
              <FaqItem 
                question="Can I use TeXSync offline?"
                answer="Yes! Our desktop apps for Windows, macOS, and Linux support offline editing. Your changes will automatically sync when you reconnect to the internet. The web version requires an internet connection to function properly."
                isOpen={openSection === 'faq3'}
                toggleOpen={() => toggleSection('faq3')}
              />
              
              <FaqItem 
                question="How does TeXSync handle complex mathematical equations?"
                answer="TeXSync excels at rendering mathematical equations! You can use our equation editor with visual tools for creating complex formulas, or write LaTeX math directly. All equations are instantly rendered in the preview, and we support all standard LaTeX math packages and environments."
                isOpen={openSection === 'faq4'}
                toggleOpen={() => toggleSection('faq4')}
              />
              
              <FaqItem 
                question="What citation formats are supported?"
                answer="TeXSync supports all major citation formats including APA, MLA, Chicago, Harvard, IEEE, and many more. You can import references from BibTeX files, Zotero, Mendeley, or our built-in citation database. Our system automatically formats citations and bibliographies according to your chosen style."
                isOpen={openSection === 'faq5'}
                toggleOpen={() => toggleSection('faq5')}
              />
              
              <FaqItem 
                question="Can I export my documents to other formats?"
                answer="Absolutely! TeXSync allows you to export your documents to PDF, Word (.docx), HTML, plain text, and even directly to formats required by specific journals or conferences. All formatting, equations, and references are preserved in the export process."
                isOpen={openSection === 'faq6'}
                toggleOpen={() => toggleSection('faq6')}
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 text-center">What Users Are Saying</h2>
            <p className="text-gray-400 text-center max-w-3xl mx-auto mb-16">
              Join thousands of satisfied TeXSync users worldwide
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-black/40 p-8 rounded-xl border border-gray-800 relative">
                <div className="absolute -top-4 -left-4 text-red-600 text-5xl font-serif">"</div>
                <p className="text-gray-300 mb-8 mt-4">
                  TeXSync has completely transformed how our research group collaborates on papers.
                  The real-time editing and commenting features have cut our writing time in half.
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-medium">
                    MC
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">Dr. Michael Chen</div>
                    <div className="text-sm text-gray-400">Professor of Physics, MIT</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/40 p-8 rounded-xl border border-gray-800 relative">
                <div className="absolute -top-4 -left-4 text-red-600 text-5xl font-serif">"</div>
                <p className="text-gray-300 mb-8 mt-4">
                  As a graduate student, I was dreading learning LaTeX for my thesis. TeXSync made
                  it incredibly easy with their templates and visual editor. I can focus on my content
                  instead of wrestling with formatting.
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-medium">
                    SJ
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">Sarah Johnson</div>
                    <div className="text-sm text-gray-400">PhD Candidate, Stanford University</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/40 p-8 rounded-xl border border-gray-800 relative">
                <div className="absolute -top-4 -left-4 text-red-600 text-5xl font-serif">"</div>
                <p className="text-gray-300 mb-8 mt-4">
                  Our engineering team uses TeXSync for all our technical documentation. The ability
                  to have version control, collaborative editing, and professional output in one platform
                  has been a game-changer for us.
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-medium">
                    RP
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">Robert Patel</div>
                    <div className="text-sm text-gray-400">Lead Engineer, SpaceX</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-black relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-red-600 blur-[100px]"></div>
            <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-red-700 blur-[120px]"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold mb-6">Ready to experience TeXSync?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
              Join academics and professionals worldwide using TeXSync for their LaTeX documents.
              Start with a free account today.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-none px-8">
                <Link href="/signup">Get Started for Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer (reuse from homepage) */}
      <footer className="bg-black py-16 mt-auto border-t border-gray-800">
        <div className="container mx-auto px-4">
          {/* Footer content */}
        </div>
      </footer>
    </div>
  );
}

// Feature List Item Component
function FeatureListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center">
      <CheckCircle className="text-red-600 h-5 w-5 mr-3 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}

// FAQ Item Component
function FaqItem({ 
  question, 
  answer,
  isOpen,
  toggleOpen
}: { 
  question: string;
  answer: string;
  isOpen: boolean;
  toggleOpen: () => void;
}) {
  return (
    <div className="mb-4">
      <button 
        className="flex items-center justify-between w-full text-left p-6 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors border border-gray-800"
        onClick={toggleOpen}
      >
        <h3 className="text-xl font-medium">{question}</h3>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="p-6 bg-black/40 border border-t-0 border-gray-800 rounded-b-lg">
          <p className="text-gray-400">{answer}</p>
        </div>
      )}
    </div>
  );
}