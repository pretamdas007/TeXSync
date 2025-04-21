import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import Link from "next/link";
import { Laptop, FileText, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-800 bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo size="md" />
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 bg-gradient-to-b from-background to-gray-900">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-red-600">Collaborative LaTeX</span> Editing,{" "}
              <span className="text-red-600">Simplified</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
              A modern, distraction-free writing environment for academic papers, 
              research documents, and technical writing.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button size="lg" asChild>
                <Link href="/editor">Try the Editor</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<Laptop className="w-10 h-10 text-red-600" />}
                title="Real-time Editing"
                description="Edit your LaTeX documents with real-time compilation and preview."
              />
              <FeatureCard 
                icon={<FileText className="w-10 h-10 text-red-600" />}
                title="Smart Conversion"
                description="Convert .docx and .pdf files to structured LaTeX code."
              />
              <FeatureCard 
                icon={<Users className="w-10 h-10 text-red-600" />}
                title="Collaboration"
                description="Work together with your team in real-time on the same document."
              />
              <FeatureCard 
                icon={<Zap className="w-10 h-10 text-red-600" />}
                title="Powerful Templates"
                description="Start with professionally designed academic templates."
              />
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to get started?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Join thousands of researchers, students, and professionals who use TeXSync for their LaTeX needs.
            </p>
            <Button size="lg" asChild>
              <Link href="/signup">Create Free Account</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-black py-10 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo className="mb-4 md:mb-0" />
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} TeXSync. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 transition-all duration-300 hover:border-red-600/50 hover:shadow-[0_0_15px_rgba(220,38,38,0.15)]">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}