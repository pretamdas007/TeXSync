"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

// Analytics wrapper component - easily swap providers
export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Track page views
  useEffect(() => {
    if (pathname) {
      // Get the full URL including any query parameters
      const url = searchParams?.size
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
        
      // Push to analytics
      pageView(url);
    }
  }, [pathname, searchParams]);
  
  return (
    <>
      {/* Google Analytics Example - replace with your preferred provider */}
      <Script 
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}', {
            page_path: window.location.pathname,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
    </>
  );
}

// Helper function for page views
function pageView(url: string) {
  // Ensure window.gtag exists
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA_TRACKING_ID!, {
      page_path: url,
    });
  }
}

// Export for direct usage
export function trackEvent(action: string, category: string, label: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Add Google Analytics types
declare global {
  interface Window {
    gtag: (
      command: string,
      id: string,
      config?: Record<string, unknown>
    ) => void;
  }
}