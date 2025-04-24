"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

// Default theme configuration
const defaultThemeConfig = {
  attribute: "class",
  defaultTheme: "system",
  enableSystem: true,
  disableTransitionOnChange: false,
  storageKey: "texsync-theme",
  themes: ["light", "dark", "system", "markdown", "latex"]
};

export function ThemeProvider({ 
  children, 
  ...props 
}: ThemeProviderProps) {
  // Use merged config with defaults
  const themeConfig = {
    ...defaultThemeConfig,
    ...props
  };

  return (
    <>
      {/* Add CSS for smooth theme transitions */}
      <style jsx global>{`
        html {
          transition: color 300ms ease, background-color 300ms ease;
        }
      `}</style>

      <NextThemesProvider {...themeConfig}>{children}</NextThemesProvider>
    </>
  );
}

// Custom hook for theme management with extended functionality
export function useTheme() {
  const context = require("next-themes").useTheme();
  const [hasMounted, setHasMounted] = React.useState(false);

  // Only run after component has mounted to avoid hydration mismatch
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  return {
    ...context,
    // Make sure the theme is only accessed client-side
    currentTheme: hasMounted ? context.theme : undefined,
    isLightTheme: hasMounted && context.theme === "light",
    isDarkTheme: hasMounted && context.theme === "dark",
    isSystemTheme: hasMounted && context.theme === "system",
    isCustomTheme: hasMounted && !["light", "dark", "system"].includes(context.theme || ""),
    resolvedTheme: hasMounted ? context.resolvedTheme : undefined,
    isClient: hasMounted
  };
}

// Theme toggle component for easy theme switching
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="bg-background text-foreground border border-input rounded-md px-3 py-1 text-sm"
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
      <option value="markdown">Markdown</option>
      <option value="latex">LaTeX</option>
    </select>
  );
}

// Theme toggle button (icon-based)
export function ThemeToggleButton() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }
  
  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      aria-label="Toggle theme"
    >
      {/* Sun icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={resolvedTheme === "dark" ? "hidden" : "block"}
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
      
      {/* Moon icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={resolvedTheme === "dark" ? "block" : "hidden"}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}