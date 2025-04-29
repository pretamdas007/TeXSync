"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CompilationStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, List, ListOrdered, Image,
  AlignLeft, Table, Link as LinkIcon, Search,
  Wand2, Share2, User, Users, X, Mail, 
  FileSymlink, CheckSquare, Square, 
  Code, AlignCenter, AlignRight, Braces, 
  Brackets, Parentheses, SquareAsterisk, Hash,
  ArrowUpRight, ChevronRight, ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { ViewUpdate, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { indentUnit, foldGutter } from "@codemirror/language";
import { StreamLanguage } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { searchKeymap, search, openSearchPanel } from "@codemirror/search";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { File, LayoutList, TableProperties, CheckSquareIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const DEFAULT_LATEX = `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\title{My First Document}
\\author{TeXSync User}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
This is a sample LaTeX document created with TeXSync.

\\section{Equations}
LaTeX is great for typesetting mathematics:
\\begin{equation}
  E = mc^2
\\end{equation}

\\section{Lists}
\\begin{itemize}
  \\item Item 1
  \\item Item 2
  \\item Item 3
\\end{itemize}

\\end{document}`;

const COMPILATION_DELAY = 1000; // 1 second delay for compilation

// Define VSCode-like theme colors
const vscodeColors = {
  background: "#1e1e1e",
  foreground: "#d4d4d4",
  comment: "#6a9955",
  string: "#ce9178",
  keyword: "#569cd6",
  function: "#dcdcaa",
  variable: "#9cdcfe",
  operator: "#d4d4d4",
  class: "#4ec9b0",
  number: "#b5cea8",
  property: "#9cdcfe",
  tag: "#569cd6",
  attribute: "#9cdcfe",
  type: "#4ec9b0",
  heading: "#569cd6",
  emphasis: "#569cd6",
  punctuation: "#d4d4d4",
};

// VSCode Dark Plus theme for LaTeX
const vscodeDarkTheme = HighlightStyle.define([
  // LaTeX-specific syntax
  { tag: [t.processingInstruction, t.documentMeta], color: vscodeColors.keyword }, // \documentclass, \usepackage
  { tag: t.definitionKeyword, color: vscodeColors.keyword }, // \begin, \end
  { tag: t.labelName, color: vscodeColors.class }, // environment names
  { tag: t.name, color: vscodeColors.function },  // Command names
  { tag: t.propertyName, color: vscodeColors.property }, // options/parameters
  { tag: t.atom, color: vscodeColors.variable }, // special chars
  { tag: t.comment, color: vscodeColors.comment }, // % comments
  { tag: t.string, color: vscodeColors.string }, // strings
  { tag: t.special(t.brace), color: vscodeColors.punctuation }, // { } braces
  
  // Math mode (customized)
  { tag: t.moduleKeyword, color: vscodeColors.function }, // $ and $$
  { tag: t.variableName, color: vscodeColors.variable }, // Variables in math mode
  { tag: t.number, color: vscodeColors.number }, // Numbers
  
  // General fallbacks
  { tag: t.heading, color: vscodeColors.heading, fontWeight: "bold" },
  { tag: t.bracket, color: vscodeColors.punctuation },
  { tag: t.operator, color: vscodeColors.operator },
  { tag: t.punctuation, color: vscodeColors.punctuation },
  { tag: t.className, color: vscodeColors.class },
  { tag: t.function(t.variableName), color: vscodeColors.function },
  { tag: t.tagName, color: vscodeColors.tag },
  { tag: t.attributeName, color: vscodeColors.attribute },
]);

// MOVED: Define ToolbarButton component before using it
interface ToolbarButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
}

function ToolbarButton({ icon, tooltip, onClick }: ToolbarButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onClick}
      title={tooltip}
      type="button"
    >
      {icon}
    </Button>
  );
}

// LaTeX snippets for quick insertion
const latexSnippets = [
  { name: "Bold Text", snippet: "\\textbf{${1:text}}", icon: <Bold size={14} /> },
  { name: "Italic Text", snippet: "\\textit{${1:text}}", icon: <Italic size={14} /> },
  { name: "Itemize Environment", snippet: "\\begin{itemize}\n\t\\item ${1:First item}\n\t\\item ${2:Second item}\n\\end{itemize}", icon: <List size={14} /> },
  { name: "Enumerate Environment", snippet: "\\begin{enumerate}\n\t\\item ${1:First item}\n\t\\item ${2:Second item}\n\\end{enumerate}", icon: <ListOrdered size={14} /> },
  { name: "Figure Environment", snippet: "\\begin{figure}[htbp]\n\t\\centering\n\t\\includegraphics[width=0.8\\textwidth]{${1:filename}}\n\t\\caption{${2:caption text}}\n\t\\label{fig:${3:label}}\n\\end{figure}", icon: <Image size={14} /> },
  { name: "Table Environment", snippet: "\\begin{table}[htbp]\n\t\\centering\n\t\\begin{tabular}{${1:|c|c|c|}}\n\t\t\\hline\n\t\tHeader 1 & Header 2 & Header 3 \\\\\n\t\t\\hline\n\t\tCell 1 & Cell 2 & Cell 3 \\\\\n\t\t\\hline\n\t\\end{tabular}\n\t\\caption{${2:caption text}}\n\t\\label{tab:${3:label}}\n\\end{table}", icon: <Table size={14} /> },
  { name: "Math Equation", snippet: "\\begin{equation}\n\t${1:y = mx + b}\n\\end{equation}", icon: <Braces size={14} /> },
  { name: "Align Environment", snippet: "\\begin{align}\n\t${1:y} &= ${2:mx + b} \\\\\n\t${3:z} &= ${4:a + b}\n\\end{align}", icon: <AlignLeft size={14} /> },
  { name: "Reference", snippet: "\\ref{${1:label}}", icon: <FileSymlink size={14} /> },
  { name: "Citation", snippet: "\\cite{${1:reference}}", icon: <Hash size={14} /> },
];

// LaTeX auto-completions for common commands
const latexCompletions = [
  { label: "\\begin{}", detail: "Begin environment", info: "Creates an environment block" },
  { label: "\\end{}", detail: "End environment", info: "Closes an environment block" },
  { label: "\\section{}", detail: "Section heading", info: "Creates a new section" },
  { label: "\\subsection{}", detail: "Subsection heading", info: "Creates a new subsection" },
  { label: "\\textbf{}", detail: "Bold text", info: "Makes text bold" },
  { label: "\\textit{}", detail: "Italic text", info: "Makes text italic" },
  { label: "\\cite{}", detail: "Citation", info: "Add citation reference" },
  { label: "\\ref{}", detail: "Reference", info: "Reference labeled item" },
  { label: "\\label{}", detail: "Label", info: "Create a label" },
  { label: "\\frac{}{}", detail: "Fraction", info: "Create a fraction" },
  { label: "\\sqrt{}", detail: "Square root", info: "Square root function" },
  { label: "\\sum_{}{}", detail: "Summation", info: "Summation notation" },
  { label: "\\int_{}{}", detail: "Integral", info: "Integral notation" },
];

// Custom extension for LaTeX auto-closing environments
const latexEnvironmentCloser = EditorView.updateListener.of((update: ViewUpdate) => {
  if (update.docChanged) {
    // Implementation would detect \begin{env} and add \end{env}
    // This is a simplified placeholder - actual implementation would be more complex
  }
});

// LaTeX bracket pairs for auto-closing
const latexBracketPairs = {
  open: ["(", "[", "{", "\\begin{"],
  close: [")", "]", "}", "\\end{"],
};

interface LaTeXEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function LaTeXEditor({ value, onChange }: LaTeXEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const [documentStructure, setDocumentStructure] = useState<Array<{level: number, title: string, line: number}>>([]);
  const [showOutline, setShowOutline] = useState(false);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  
  // Parse LaTeX structure - this is a simplified implementation
  const parseLatexStructure = useCallback((content: string) => {
    const lines = content.split("\n");
    const structure: Array<{level: number, title: string, line: number}> = [];
    
    lines.forEach((line, index) => {
      // Check for section commands
      const sectionMatch = line.match(/\\(chapter|section|subsection|subsubsection)\{([^}]*)\}/);
      if (sectionMatch) {
        const type = sectionMatch[1];
        const title = sectionMatch[2];
        let level = 0;
        
        switch (type) {
          case "chapter": level = 1; break;
          case "section": level = 2; break;
          case "subsection": level = 3; break;
          case "subsubsection": level = 4; break;
        }
        
        structure.push({ level, title, line: index });
      }
    });
    
    return structure;
  }, []);

  useEffect(() => {
    // Update document structure when content changes
    const structure = parseLatexStructure(value);
    setDocumentStructure(structure);
  }, [value, parseLatexStructure]);

  useEffect(() => {
    if (editorRef.current) {
      // Create CodeMirror editor instance
      const state = EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          StreamLanguage.define(stex),
          syntaxHighlighting(vscodeDarkTheme),
          lineNumbers(),
          highlightActiveLineGutter(),
          closeBrackets(),
          history(),
          search({
            caseSensitive: true,
          }),
          EditorView.updateListener.of((v: ViewUpdate) => {
            if (v.docChanged) {
              onChange(v.state.doc.toString());
            }
          }),
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...searchKeymap,
            ...closeBracketsKeymap,
            indentWithTab,
          ]),
          EditorView.theme({
            "&": {
              fontSize: "14px",
              height: "100%",
              fontFamily: "'Fira Code', monospace",
            },
            ".cm-content": {
              fontFamily: "'Fira Code', monospace",
              padding: "8px 0",
              caretColor: "#a6a6a6",
            },
            ".cm-line": {
              padding: "0 8px",
            },
            ".cm-gutters": {
              backgroundColor: "#1e1e1e",
              color: "#858585",
              border: "none",
              borderRight: "1px solid #333",
            },
            ".cm-activeLineGutter": {
              backgroundColor: "#252525",
              color: "#c6c6c6",
            },
            ".cm-cursor": {
              borderLeftColor: "#a6a6a6",
              borderLeftWidth: "2px",
            },
            ".cm-selectionMatch": {
              backgroundColor: "rgba(100, 100, 255, 0.2)",
            },
            ".cm-activeLine": {
              backgroundColor: "#252525",
            },
          }),
          // Add this to your CodeMirror extensions array in the useEffect
          // where you create the editor state
          [
            // ...existing extensions
            
            // Enhanced code folding
            foldGutter({
              markerDOM: (open) => {
                const marker = document.createElement("span");
                marker.className = `cm-fold-marker ${open ? "cm-fold-open" : "cm-fold-closed"}`;
                marker.textContent = open ? "▼" : "►";
                marker.style.fontSize = "10px";
                marker.style.position = "relative";
                marker.style.top = "-1px";
                return marker;
              }
            }),
            
            // LaTeX-specific line indentation
            indentUnit.of("  "),
            
            // Smart LaTeX environment handling
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                // Auto-detect environment begin tags and add matching end tags
                const changes = update.changes;
                changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
                  const text = inserted.toString();
                  if (text.includes("\\begin{") && !text.includes("\\end{")) {
                    // Extract environment name
                    const match = text.match(/\\begin\{([^}]+)\}/);
                    if (match) {
                      const envName = match[1];
                      // Add closing environment tag
                      const pos = fromB + text.length;
                      const endTag = `\n\\end{${envName}}`;
                      // Schedule the insertion for the next update
                      setTimeout(() => {
                        if (editorViewRef.current) {
                          editorViewRef.current.dispatch({
                            changes: { from: pos, to: pos, insert: endTag }
                          });
                        }
                      }, 0);
                    }
                  }
                });
              }
            }),
            
            // Enhanced active line highlighting
            highlightActiveLine(),
            
            // Auto bracket closing for LaTeX specific brackets
            closeBrackets(),
            
            // Better line highlighting
            EditorView.theme({
              "&": {
                fontSize: "14px",
                height: "100%",
                fontFamily: "'Fira Code', monospace",
              },
              ".cm-content": {
                fontFamily: "'Fira Code', monospace",
                padding: "8px 0",
                caretColor: "#a6a6a6",
              },
              ".cm-activeLine": {
                backgroundColor: "rgba(37, 37, 37, 0.8)",
                borderRadius: "2px",
              },
              ".cm-activeLineGutter": {
                backgroundColor: "#252525",
                color: "#c6c6c6",
                fontWeight: "bold",
              },
              ".cm-matchingBracket": {
                backgroundColor: "rgba(100, 100, 255, 0.2)",
                border: "1px solid rgba(100, 100, 255, 0.5)",
                borderRadius: "2px",
              },
            })
          ]
        ],
      });

      const view = new EditorView({
        state,
        parent: editorRef.current,
      });

      editorViewRef.current = view;

      return () => {
        view.destroy();
      };
    }
  }, []);

  // Update the editor content when the value prop changes (e.g. from external sources)
  useEffect(() => {
    if (editorViewRef.current) {
      const currentContent = editorViewRef.current.state.doc.toString();
      if (value !== currentContent) {
        editorViewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: value,
          },
        });
      }
    }
  }, [value]);

  const insertSnippet = useCallback((snippet: string) => {
    if (editorViewRef.current) {
      const { from, to } = editorViewRef.current.state.selection.main;
      
      // Simple snippet insertion - in a real implementation, you'd handle placeholders like ${1:text}
      const processedSnippet = snippet.replace(/\$\{(\d+)(?::([^}]*))?\}/g, (_, __, defaultText) => defaultText || "");
      
      editorViewRef.current.dispatch({
        changes: {
          from,
          to,
          insert: processedSnippet,
        },
      });
      
      // Focus back to editor
      editorViewRef.current.focus();
    }
  }, []);

  const jumpToLine = useCallback((lineNumber: number) => {
    if (editorViewRef.current) {
      const line = editorViewRef.current.state.doc.line(lineNumber + 1);
      editorViewRef.current.dispatch({
        selection: { anchor: line.from },
        scrollIntoView: true,
      });
      
      // Focus the editor
      editorViewRef.current.focus();
      
      setActiveSection(lineNumber);
    }
  }, []);

  const insertEnvironment = useCallback((envType: string) => {
    const environments: Record<string, string> = {
      "math": "\\begin{math}\n\t${1:a = b + c}\n\\end{math}",
      "equation": "\\begin{equation}\n\t${1:a = b + c}\n\\end{equation}",
      "align": "\\begin{align}\n\t${1:a} &= ${2:b + c} \\\\\n\t${3:d} &= ${4:e + f}\n\\end{align}",
      "figure": "\\begin{figure}[htbp]\n\t\\centering\n\t\\includegraphics[width=0.8\\textwidth]{${1:filename}}\n\t\\caption{${2:caption text}}\n\t\\label{fig:${3:label}}\n\\end{figure}",
      "table": "\\begin{table}[htbp]\n\t\\centering\n\t\\begin{tabular}{${1:|c|c|c|}}\n\t\t\\hline\n\t\tHeader 1 & Header 2 & Header 3 \\\\\n\t\t\\hline\n\t\tCell 1 & Cell 2 & Cell 3 \\\\\n\t\t\\hline\n\t\\end{tabular}\n\t\\caption{${2:caption text}}\n\t\\label{tab:${3:label}}\n\\end{table}",
      "itemize": "\\begin{itemize}\n\t\\item ${1:First item}\n\t\\item ${2:Second item}\n\t\\item ${3:Third item}\n\\end{itemize}",
      "enumerate": "\\begin{enumerate}\n\t\\item ${1:First item}\n\t\\item ${2:Second item}\n\t\\item ${3:Third item}\n\\end{enumerate}",
    };

    if (editorViewRef.current && environments[envType]) {
      insertSnippet(environments[envType]);
    }
  }, [insertSnippet]);

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced toolbar */}
      <div className="bg-[#252526] border-b border-[#3c3c3c] p-1 flex flex-wrap items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => insertSnippet("\\textbf{${1:text}}")}
              >
                <Bold size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold (Ctrl+B)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => insertSnippet("\\textit{${1:text}}")}
              >
                <Italic size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic (Ctrl+I)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="h-5 w-px bg-[#3c3c3c] mx-1"></div>
        
        <Select onValueChange={insertEnvironment}>
          <SelectTrigger className="h-8 border-[#3c3c3c] bg-[#252526] w-[150px] text-xs">
            <SelectValue placeholder="Insert environment..." />
          </SelectTrigger>
          <SelectContent className="bg-[#252526] border-[#3c3c3c]">
            <SelectItem value="math">Math</SelectItem>
            <SelectItem value="equation">Equation</SelectItem>
            <SelectItem value="align">Align</SelectItem>
            <SelectItem value="figure">Figure</SelectItem>
            <SelectItem value="table">Table</SelectItem>
            <SelectItem value="itemize">Itemize</SelectItem>
            <SelectItem value="enumerate">Enumerate</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="h-5 w-px bg-[#3c3c3c] mx-1"></div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2" 
                onClick={() => setShowOutline(!showOutline)}
              >
                <AlignLeft size={16} className="mr-1" />
                <span className="text-xs">Outline</span>
                {showOutline ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Document Outline</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="ml-auto flex items-center gap-1">
  <Dialog>
    <DialogTrigger asChild>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => {
                // This would open a find dialog in a real implementation
                editorViewRef.current?.focus();
                // Trigger the search panel (Ctrl+F equivalent)
                if (editorViewRef.current) {
                  openSearchPanel(editorViewRef.current);
                }
              }}
            >
              <Search size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Find (Ctrl+F)</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Advanced Search</DialogTitle>
        <DialogDescription>
          Search with additional options for complex documents
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="searchTerm">Search Term</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              id="searchTerm"
              placeholder="Enter search term..." 
              className="pl-8"
              autoFocus
            />
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <Label htmlFor="replace">Replace With (Optional)</Label>
          <Input id="replace" placeholder="Replace text..." />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="regex" />
            <Label htmlFor="regex" className="text-sm">Regex</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="case" />
            <Label htmlFor="case" className="text-sm">Match case</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="whole" />
            <Label htmlFor="whole" className="text-sm">Whole word</Label>
          </div>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-medium">Search Scope</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
              Current section
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
              Math environments
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
              Commands only
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
              Comments
            </Badge>
          </div>
        </div>
      </div>
      <DialogFooter className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          Press Enter to search, Shift+Enter to search backwards
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Find All</Button>
          <Button variant="outline">Replace</Button>
          <Button>Replace All</Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  
  {/* Quick search dropdown */}
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-xs gap-1"
      >
        Go to
        <ChevronDown className="h-3 w-3 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-60 p-0" align="end">
      <Command>
        <CommandInput placeholder="Search or jump to..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Document Structure">
            {documentStructure.map((item, index) => (
              <CommandItem 
                key={index}
                onSelect={() => jumpToLine(item.line)}
                className="cursor-pointer"
              >
                <File className="mr-2 h-4 w-4" />
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Common Actions">
            <CommandItem onSelect={() => setShowOutline(true)}>
              <LayoutList className="mr-2 h-4 w-4" />
              Show document outline
            </CommandItem>
            <CommandItem>
              <Hash className="mr-2 h-4 w-4" />
              Go to line number...
            </CommandItem>
            <CommandItem>
              <TableProperties className="mr-2 h-4 w-4" />
              Find table environments
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
  
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => {
            // Toggle line numbers
            toast.success("Line numbers toggled", {
              description: "Line numbers visibility has been toggled"
            });
          }}
        >
          <ListOrdered size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Toggle Line Numbers</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>
      </div>
      
      {/* Editor container with optional outline */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Outline */}
        {showOutline && (
          <div className="w-64 h-full overflow-y-auto border-r border-[#3c3c3c] bg-[#1e1e1e] text-[#d4d4d4]">
            <div className="p-3 border-b border-[#3c3c3c]">
              <h3 className="font-medium text-sm">Document Structure</h3>
            </div>
            <div className="p-1">
              {documentStructure.length > 0 ? (
                <ul className="space-y-1">
                  {documentStructure.map((item, index) => (
                    <li 
                      key={index}
                      className={`
                        text-sm py-1 px-2 rounded cursor-pointer transition-colors
                        ${activeSection === item.line ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e]'}
                      `}
                      style={{ paddingLeft: `${item.level * 12}px` }}
                      onClick={() => jumpToLine(item.line)}
                    >
                      <div className="flex items-center">
                        <ChevronRight size={14} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-3 px-2 text-center text-[#6d6d6d] text-sm">
                  <p>No sections found</p>
                  <p className="text-xs mt-1">Add \section{} commands to create document structure</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* CodeMirror Editor - CHANGE THIS LINE */}
        <div className="flex-1 overflow-auto">
          <div ref={editorRef} className="h-full w-full overflow-auto" />
        </div>
      </div>
      
      {/* Snippets panel */}
      <div className="bg-[#252526] border-t border-[#3c3c3c] p-1">
        <Tabs defaultValue="common">
          <TabsList className="bg-[#1e1e1e] border-[#3c3c3c]">
            <TabsTrigger value="common" className="text-xs">Common Commands</TabsTrigger>
            <TabsTrigger value="math" className="text-xs">Mathematics</TabsTrigger>
            <TabsTrigger value="envs" className="text-xs">Environments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="common" className="mt-1 flex flex-wrap gap-1">
            <QuickButton onClick={() => insertSnippet("\\section{${1:Section Title}}")} icon={<Hash size={14} />} label="Section" />
            <QuickButton onClick={() => insertSnippet("\\subsection{${1:Subsection Title}}")} icon={<Hash size={14} />} label="Subsection" />
            <QuickButton onClick={() => insertSnippet("\\ref{${1:label}}")} icon={<FileSymlink size={14} />} label="Reference" />
            <QuickButton onClick={() => insertSnippet("\\cite{${1:reference}}")} icon={<Hash size={14} />} label="Citation" />
            <QuickButton onClick={() => insertSnippet("\\label{${1:name}}")} icon={<Tag size={14} />} label="Label" />
            <QuickButton onClick={() => insertEnvironment("figure")} icon={<Image size={14} />} label="Figure" />
            <QuickButton onClick={() => insertEnvironment("table")} icon={<Table size={14} />} label="Table" />
          </TabsContent>
          
          <TabsContent value="math" className="mt-1 flex flex-wrap gap-1">
            <QuickButton onClick={() => insertSnippet("$${1:a = b + c}$")} icon={<Dollar size={14} />} label="Inline Math" />
            <QuickButton onClick={() => insertSnippet("\\frac{${1:numerator}}{${2:denominator}}")} icon={<Divide size={14} />} label="Fraction" />
            <QuickButton onClick={() => insertSnippet("\\sqrt{${1:x}}")} icon={<Square size={14} />} label="Square Root" />
            <QuickButton onClick={() => insertSnippet("\\sum_{${1:i=1}}^{${2:n}}")} icon={<Sigma size={14} />} label="Sum" />
            <QuickButton onClick={() => insertSnippet("\\int_{${1:a}}^{${2:b}}")} icon={<Integral size={14} />} label="Integral" />
            <QuickButton onClick={() => insertSnippet("\\lim_{${1:x \\to \\infty}}")} icon={<ArrowUpRight size={14} />} label="Limit" />
            <QuickButton onClick={() => insertEnvironment("align")} icon={<AlignLeft size={14} />} label="Align" />
          </TabsContent>
          
          <TabsContent value="envs" className="mt-1 flex flex-wrap gap-1">
            <QuickButton onClick={() => insertEnvironment("itemize")} icon={<List size={14} />} label="Itemize" />
            <QuickButton onClick={() => insertEnvironment("enumerate")} icon={<ListOrdered size={14} />} label="Enumerate" />
            <QuickButton onClick={() => insertEnvironment("equation")} icon={<Braces size={14} />} label="Equation" />
            <QuickButton onClick={() => insertSnippet("\\begin{center}\n\t${1:centered content}\n\\end{center}")} icon={<AlignCenter size={14} />} label="Center" />
            <QuickButton onClick={() => insertSnippet("\\begin{quote}\n\t${1:quoted text}\n\\end{quote}")} icon={<Quote size={14} />} label="Quote" />
            <QuickButton onClick={() => insertSnippet("\\begin{verbatim}\n${1:verbatim text}\n\\end{verbatim}")} icon={<Code size={14} />} label="Verbatim" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Quick action button component for snippet panel
function QuickButton({ onClick, icon, label }: { onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-7 bg-[#2d2d2d] border-[#3c3c3c] hover:bg-[#3e3e3e] hover:text-white text-xs"
      onClick={onClick}
    >
      <span className="mr-1">{icon}</span> {label}
    </Button>
  );
}

// Custom icon components for LaTeX
function Dollar(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="2" x2="12" y2="22"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
}

function Sigma(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 7V4H6l6 8-6 8h12v-3"></path>
    </svg>
  );
}

function Integral(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 10c.4-4.4 1.5-7 3.5-7 .5 0 1 .1 1.5.4 2 1.2 3 3.7 3 7 0 3.4 1.3 6 3 7.4.5.4 1 .6 1.5.6 2 0 3-2.6 3.5-7"></path>
    </svg>
  );
}

function Tag(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
      <line x1="7" y1="7" x2="7.01" y2="7"></line>
    </svg>
  );
}

function Quote(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
    </svg>
  );
}

function Divide(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="6" r="1"></circle>
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <circle cx="12" cy="18" r="1"></circle>
    </svg>
  );
}

function ChevronUp(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  );
}

export function CollaborationDialog() {
  const [collaborators, setCollaborators] = useState<Array<{email: string, role: string}>>([
    { email: "alex@example.com", role: "editor" },
    { email: "taylor@example.com", role: "viewer" }
  ]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("editor");
  const [documentLink, setDocumentLink] = useState("https://texsync.com/d/shared-doc-12345");

  const addCollaborator = () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error("Invalid email address", {
        description: "Please enter a valid email address",
      });
      return;
    }

    setCollaborators([...collaborators, { email: newEmail, role: newRole }]);
    setNewEmail("");
    toast.success("Collaborator added", {
      description: `Invitation sent to ${newEmail}`,
    });
  };

  const removeCollaborator = (email: string) => {
    setCollaborators(collaborators.filter(c => c.email !== email));
  };

  const copyLink = () => {
    navigator.clipboard.writeText(documentLink);
    toast.success("Link copied", {
      description: "The collaboration link has been copied to clipboard",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {}}  // This does nothing
          className="whitespace-nowrap flex items-center gap-1"
          type="button"
        >
          <Share2 size={16} />
          Collaborate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Invite others to collaborate on this document in real-time
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Shareable link section */}
          <div className="space-y-2">
            <Label htmlFor="link" className="text-sm font-medium">
              Shareable Link
            </Label>
            <div className="flex items-center space-x-2">
              <Input 
                id="link" 
                value={documentLink} 
                readOnly 
                className="flex-1 bg-gray-900 border-gray-800"
              />
              <Button onClick={copyLink} variant="outline" className="shrink-0" type="button">
                Copy
              </Button>
            </div>
          </div>
          
          {/* Add collaborators section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Add People</Label>
            <div className="flex items-start space-x-2">
              <div className="flex-1">
                <Input 
                  placeholder="Email address" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-gray-900 border-gray-800"
                />
              </div>
              <div className="w-28">
                <Select value={newRole} onValueChange={(value) => setNewRole(value)}>
                  <SelectTrigger className="bg-gray-900 border-gray-800">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800">
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="commenter">Commenter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addCollaborator} variant="outline" className="shrink-0" type="button">
                Add
              </Button>
            </div>
          </div>
          
          {/* Current collaborators list */}
          {collaborators.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">People with access</Label>
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.email} className="flex items-center justify-between p-2 bg-gray-900 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-800 rounded-full p-1.5">
                        <User size={16} />
                      </div>
                      <div>
                        <div className="text-sm">{collaborator.email}</div>
                        <div className="text-xs text-gray-400 capitalize">{collaborator.role}</div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => removeCollaborator(collaborator.email)}
                      type="button"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="border-t border-gray-800 pt-4">
          <div className="flex items-center">
            <Users size={16} className="text-gray-400 mr-2" />
            <span className="text-xs text-gray-400">
              Real-time collaboration enabled
            </span>
          </div>
          <Button 
            variant="default" 
            className="ml-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-none"
            type="button"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}