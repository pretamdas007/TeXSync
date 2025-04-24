import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@/components/analytics';
import NextTopLoader from 'nextjs-toploader';
import { Suspense } from 'react';

// Load fonts
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// Enhanced metadata for better SEO
export const metadata: Metadata = {
  title: {
    default: 'TeXSync - Collaborative LaTeX Editing Platform',
    template: '%s | TeXSync'
  },
  description: 'A modern, distraction-free writing environment for LaTeX documents with real-time collaboration features',
  keywords: ['LaTeX', 'TeX', 'document editing', 'academic writing', 'collaboration', 'mathematics', 'research papers'],
  authors: [{ name: 'TeXSync Team' }],
  creator: 'TeXSync',
  publisher: 'TeXSync',
  applicationName: 'TeXSync',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://texsync.example.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://texsync.example.com',
    title: 'TeXSync - Collaborative LaTeX Editing Platform',
    description: 'A modern, distraction-free writing environment for LaTeX documents',
    siteName: 'TeXSync',
    images: [{
      url: 'https://texsync.example.com/og-image.png', 
      width: 1200,
      height: 630,
      alt: 'TeXSync - Collaborative LaTeX Editing Platform'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TeXSync - Collaborative LaTeX Editing Platform',
    description: 'A modern, distraction-free writing environment for LaTeX documents',
    images: ['https://texsync.example.com/twitter-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon-16x16.png',
      },
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#dc2626',
      },
    ],
  },
  manifest: '/site.webmanifest',
};

// Viewport configuration
export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={inter.className}>
        {/* Page loading progress indicator */}
        <NextTopLoader 
          color="#dc2626"
          showSpinner={false}
          shadow="0 0 10px #dc2626,0 0 5px #dc2626"
        />
        
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
        
        {/* Analytics with Suspense for performance */}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}