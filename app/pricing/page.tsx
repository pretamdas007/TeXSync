"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Logo } from "@/components/common/logo";
import Link from "next/link";
import { CheckCircle, XCircle, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const discount = 20; // 20% discount for annual

  const pricing = {
    premium: {
      monthly: 9,
      annual: 9 * (1 - discount / 100)
    },
    professional: {
      monthly: 19,
      annual: 19 * (1 - discount / 100)
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
            <Link href="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors font-medium text-white">
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
        <section className="py-20 bg-gradient-to-b from-background to-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-red-600 blur-[100px]"></div>
            <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-red-700 blur-[120px]"></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent <span className="text-red-600">Pricing</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
              Choose the plan that fits your needs, from individual researchers to large teams.
            </p>
            
            {/* Add billing toggle */}
            <div className="flex items-center justify-center mb-8">
              <span className={`text-sm mr-3 ${!isAnnual ? 'text-white font-medium' : 'text-gray-400'}`}>Monthly</span>
              <Switch 
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-red-600"
              />
              <span className={`text-sm ml-3 ${isAnnual ? 'text-white font-medium' : 'text-gray-400'}`}>
                Annual <span className="text-red-600 font-medium">(Save {discount}%)</span>
              </span>
            </div>
          </div>
        </section>

        {/* Pricing Table */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Freemium Plan */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-red-600/30 hover:shadow-[0_0_15px_rgba(220,38,38,0.15)]"
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">Freemium</h3>
                  <div className="text-gray-400 mb-6">For individual researchers</div>
                  <div className="flex items-baseline mb-8">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-gray-400 ml-2">/month</span>
                  </div>
                  <Button asChild className="w-full bg-gray-800 hover:bg-gray-700 mb-6">
                    <Link href="/signup" className="py-5">Get Started</Link>
                  </Button>
                  <div className="space-y-4">
                    <FeatureItem included>Basic LaTeX editor</FeatureItem>
                    <FeatureItem included>PDF preview & export</FeatureItem>
                    <FeatureItem included>5 documents storage</FeatureItem>
                    <FeatureItem included>Common LaTeX templates</FeatureItem>
                    <FeatureItem>Real-time collaboration</FeatureItem>
                    <FeatureItem>Document conversion</FeatureItem>
                    <FeatureItem>Version history</FeatureItem>
                    <FeatureItem>Priority support</FeatureItem>
                  </div>
                </div>
                <div className="bg-gray-800 p-4 text-center">
                  <Link href="#features-freemium" className="text-sm text-gray-300 hover:text-white inline-flex items-center">
                    View full features <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </motion.div>

              {/* Premium Plan - Highlighted */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900 rounded-xl border-2 border-red-600 overflow-hidden relative transition-all duration-300 hover:shadow-[0_0_20px_rgba(220,38,38,0.25)] transform hover:-translate-y-1"
              >
                <div className="bg-red-600 text-white text-sm font-bold py-1 text-center">
                  MOST POPULAR
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">Premium</h3>
                  <div className="text-gray-400 mb-6">For serious writers & academics</div>
                  <div className="flex items-baseline mb-8">
                    <span className="text-4xl font-bold">
                      ${isAnnual ? pricing.premium.annual.toFixed(0) : pricing.premium.monthly}
                    </span>
                    <span className="text-gray-400 ml-2">/{isAnnual ? 'year' : 'month'}</span>
                    {isAnnual && (
                      <span className="ml-2 bg-red-600/20 text-red-500 text-xs px-2 py-1 rounded-full">
                        Save ${(pricing.premium.monthly * 12 - pricing.premium.annual * 12).toFixed(0)}/yr
                      </span>
                    )}
                  </div>
                  <Button asChild className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-none mb-6">
                    <Link href="/signup/premium" className="py-5">Get Premium</Link>
                  </Button>
                  <div className="space-y-4">
                    <FeatureItem included>Everything in Freemium</FeatureItem>
                    <FeatureItem included>Unlimited documents</FeatureItem>
                    <FeatureItem included>Real-time collaboration</FeatureItem>
                    <FeatureItem included>Document conversion</FeatureItem>
                    <FeatureItem included>30-day version history</FeatureItem>
                    <FeatureItem included>Advanced LaTeX templates</FeatureItem>
                    <FeatureItem included>Bibliography management</FeatureItem>
                    <FeatureItem>Team workspaces</FeatureItem>
                  </div>
                </div>
                <div className="bg-gray-800 p-4 text-center">
                  <Link href="#features-premium" className="text-sm text-gray-300 hover:text-white inline-flex items-center">
                    View full features <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </motion.div>

              {/* Professional Plan */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-red-600/30 hover:shadow-[0_0_15px_rgba(220,38,38,0.15)]"
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">Professional</h3>
                  <div className="text-gray-400 mb-6">For teams & organizations</div>
                  <div className="flex items-baseline mb-8">
                    <span className="text-4xl font-bold">
                      ${isAnnual ? pricing.professional.annual.toFixed(0) : pricing.professional.monthly}
                    </span>
                    <span className="text-gray-400 ml-2">/{isAnnual ? 'year' : 'month'}/user</span>
                    {isAnnual && (
                      <span className="ml-2 bg-red-600/20 text-red-500 text-xs px-2 py-1 rounded-full">
                        Save ${(pricing.professional.monthly * 12 - pricing.professional.annual * 12).toFixed(0)}/yr
                      </span>
                    )}
                  </div>
                  <Button asChild className="w-full bg-gray-800 hover:bg-gray-700 mb-6">
                    <Link href="/signup/professional" className="py-5">Get Professional</Link>
                  </Button>
                  <div className="space-y-4">
                    <FeatureItem included>Everything in Premium</FeatureItem>
                    <FeatureItem included>Team workspaces</FeatureItem>
                    <FeatureItem included>Admin dashboard</FeatureItem>
                    <FeatureItem included>Priority support</FeatureItem>
                    <FeatureItem included>Custom templates</FeatureItem>
                    <FeatureItem included>Unlimited version history</FeatureItem>
                    <FeatureItem included>Advanced permissions</FeatureItem>
                    <FeatureItem included>SSO authentication</FeatureItem>
                  </div>
                </div>
                <div className="bg-gray-800 p-4 text-center">
                  <Link href="#features-professional" className="text-sm text-gray-300 hover:text-white inline-flex items-center">
                    View full features <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Add Testimonials Section */}
        <section className="py-20 bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">What Our Customers Say</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-black/30 p-6 rounded-xl border border-gray-800 relative"
              >
                <div className="absolute -top-4 -left-4 text-red-600 text-5xl font-serif">"</div>
                <p className="text-gray-300 mb-6 mt-2">
                  TeXSync has transformed how I write academic papers. The templates and collaboration 
                  features have saved me countless hours.
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-medium">
                    JD
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">Dr. Jane Doe</div>
                    <div className="text-sm text-gray-400">Professor of Physics</div>
                  </div>
                </div>
              </motion.div>
              
              {/* Add two more testimonials with similar structure */}
            </div>
          </div>
        </section>

        {/* Enhanced FAQ Section with Accordion */}
        <section className="py-20 bg-gradient-to-b from-background to-black">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto">
              <Accordion 
                items={[
                  {
                    question: "Can I upgrade or downgrade my plan?",
                    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle."
                  },
                  {
                    question: "Do you offer academic or student discounts?",
                    answer: "Yes! We offer special discounts for verified students and academic institutions. Contact our support team for details."
                  },
                  {
                    question: "Is my data secure?",
                    answer: "We prioritize your data security. All documents are encrypted in transit and at rest, and we perform regular security audits."
                  },
                  {
                    question: "What if I need more than what Professional offers?",
                    answer: "We offer custom enterprise solutions for large organizations with specific requirements. Contact our sales team to discuss your needs."
                  },
                  {
                    question: "Can I cancel my subscription anytime?",
                    answer: "Yes, you can cancel your subscription at any time. You'll continue to have access to your plan until the end of your current billing period."
                  }
                ]} 
              />
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-black relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-red-600 blur-[100px]"></div>
            <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-red-700 blur-[120px]"></div>
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl font-bold mb-6">Ready to get started with TeXSync?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Try Freemium today and upgrade anytime as your needs grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-none">
                <Link href="/signup" className="px-8">Sign Up Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact-sales" className="px-8">Contact Sales</Link>
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

// Enhanced Feature Item Component with Tooltip
function FeatureItem({ children, included = false, tooltip = "" }: { 
  children: React.ReactNode, 
  included?: boolean,
  tooltip?: string 
}) {
  return (
    <div className="flex items-center group relative">
      {included ? (
        <CheckCircle className="text-red-600 h-5 w-5 mr-3 flex-shrink-0" />
      ) : (
        <XCircle className="text-gray-600 h-5 w-5 mr-3 flex-shrink-0" />
      )}
      <span className={`text-sm ${included ? 'text-gray-200' : 'text-gray-500 line-through'}`}>{children}</span>
      
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-xs text-white rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-48 text-center z-10">
          {tooltip}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
        </div>
      )}
    </div>
  );
}

// Simple Accordion Component
function Accordion({ items }: { items: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState(-1);
  
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div 
          key={index} 
          className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
        >
          <button 
            className="p-6 w-full flex justify-between items-center text-left"
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
          >
            <h3 className="text-xl font-semibold">{item.question}</h3>
            <ChevronRight 
              className={`h-5 w-5 transition-transform ${openIndex === index ? 'rotate-90' : ''}`} 
            />
          </button>
          {openIndex === index && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 pb-6"
            >
              <p className="text-gray-400">{item.answer}</p>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}