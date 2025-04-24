"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { CompilationStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  Bold, Italic, List, ListOrdered, Image, 
  AlignLeft, Table, Link as LinkIcon,
  Wand2, Share2, User, Users, X, Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { StreamLanguage } from '@codemirror/stream-parser';
import { stex } from '@codemirror/legacy-modes/mode/stex';
import { ViewUpdate } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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
    >
      {icon}
    </Button>
  );
}

interface LaTeXEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

export function LaTeXEditor({ initialContent = DEFAULT_LATEX, onContentChange }: LaTeXEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [compilationStatus, setCompilationStatus] = useState<CompilationStatus>("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastCompiledContent, setLastCompiledContent] = useState(content);
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  
  // When content changes internally, notify parent if callback exists
  useEffect(() => {
    if (onContentChange) {
      onContentChange(content);
    }
  }, [content, onContentChange]);

  // Memoized compilation function
  const compile = useCallback(async () => {
    if (content === lastCompiledContent) {
      return; // Skip if content hasn't changed since last compilation
    }

    setCompilationStatus("compiling");
    
    try {
      // Simulate compilation process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLastCompiledContent(content);
      setCompilationStatus("success");
      
      // Show success toast only for manual compilations
      if (content !== lastCompiledContent) {
        toast({
          title: "Compilation successful",
          description: "Your document has been updated",
        });
      }
    } catch (error) {
      setCompilationStatus("error");
      toast({
        title: "Compilation failed",
        description: "There was an error compiling your document",
        variant: "destructive",
      });
    }
  }, [content, lastCompiledContent, toast]);

  // Auto-compilation effect with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== lastCompiledContent) {
        compile();
      }
    }, COMPILATION_DELAY);

    return () => clearTimeout(timer);
  }, [content, lastCompiledContent, compile]);

  // Manual compilation handler
  const handleManualCompile = () => {
    compile();
  };

  // AI writing analysis
  const analyzeWriting = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      const demoSuggestions = [
        "Consider rephrasing 'This is a sample' to be more engaging",
        "Add more context to the Introduction section",
        "The equation could benefit from additional explanation",
        "Consider using a more descriptive list structure",
      ];
      setSuggestions(demoSuggestions);
      setIsAnalyzing(false);
      
      toast({
        title: "Writing Analysis Complete",
        description: "Review the suggestions to improve your document",
      });
    }, 2000);
  };
  
  const insertTemplate = (template: string) => {
    setContent((prev) => prev + template);
  };

  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const latex = StreamLanguage.define(stex as any);
      const startState = EditorState.create({
        doc: content,
        extensions: [
          basicSetup,
          latex,  // Use the language definition here
          syntaxHighlighting(vscodeDarkTheme), // Use the consolidated theme
          EditorView.theme({
            "&": {
              backgroundColor: vscodeColors.background,
              color: vscodeColors.foreground,
              height: "100%",
              fontSize: "14px"
            },
            ".cm-content": {
              fontFamily: "'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace",
              caretColor: vscodeColors.foreground,
              padding: "10px 0"
            },
            ".cm-line": {
              padding: "0 16px"  // Add left/right padding to text lines
            },
            ".cm-cursor": {
              borderLeftColor: vscodeColors.foreground
            },
            ".cm-gutters": {
              backgroundColor: "#252526",
              color: "#858585",
              border: "none",
              paddingRight: "8px"
            },
            ".cm-activeLineGutter": {
              backgroundColor: "#2c2c2d"
            },
            ".cm-activeLine": {
              backgroundColor: "#2c2c2d33"  // More subtle active line
            },
            ".cm-selectionMatch": {
              backgroundColor: "#3392FF44"
            },
            ".cm-matchingBracket, .cm-nonmatchingBracket": {
              backgroundColor: "#3392FF44",
              outline: "1px solid #3392FF"
            },
            ".cm-tooltip": {
              backgroundColor: "#252526",
              border: "1px solid #454545",
              color: vscodeColors.foreground
            },
            ".cm-tooltip-autocomplete": {
              "& > ul > li[aria-selected]": {
                backgroundColor: "#04395e",
                color: vscodeColors.foreground
              }
            },
          }),
          EditorView.updateListener.of((update: ViewUpdate) => {
            if (update.docChanged) {
              setContent(update.state.doc.toString());
            }
          }),
          // Add keyboard shortcuts for common LaTeX commands
          EditorView.domEventHandlers({
            keydown: (event, view) => {
              // Add shortcuts here as needed
              return false;
            }
          }),
        ],
      });

      const view = new EditorView({
        state: startState,
        parent: editorRef.current,
      });

      viewRef.current = view;
    }

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, []);

  // Update editor content when value prop changes
  useEffect(() => {
    if (viewRef.current && content !== viewRef.current.state.doc.toString()) {
      // Only update if the value is different to avoid cursor jumps
      const currentValue = viewRef.current.state.doc.toString();
      if (currentValue !== content) {
        viewRef.current.dispatch({
          changes: { from: 0, to: currentValue.length, insert: content }
        });
      }
    }
  }, [content]);

  return (
    <div className="h-full">
      <div className="border-b border-gray-800 p-2 flex items-center gap-1 overflow-x-auto">
        <div className="flex items-center">
          <ToolbarButton icon={<Bold size={16} />} tooltip="Bold" onClick={() => insertTemplate("\\textbf{}")} />
          <ToolbarButton icon={<Italic size={16} />} tooltip="Italic" onClick={() => insertTemplate("\\textit{}")} />
          <ToolbarButton 
            icon={<span className="text-xs font-semibold">U</span>} 
            tooltip="Underline" 
            onClick={() => insertTemplate("\\underline{}")} 
          />
        </div>

        <div className="h-4 w-px bg-gray-800 mx-1" />
        
        <div className="flex items-center">
          <ToolbarButton 
            icon={<span className="text-xs font-semibold">§</span>} 
            tooltip="Section" 
            onClick={() => insertTemplate("\n\\section{}")} 
          />
          <ToolbarButton 
            icon={<span className="text-xs font-semibold">§§</span>} 
            tooltip="Subsection" 
            onClick={() => insertTemplate("\n\\subsection{}")} 
          />
        </div>

        <div className="h-4 w-px bg-gray-800 mx-1" />

        <div className="flex items-center">
          <ToolbarButton icon={<List size={16} />} tooltip="Bulleted List" onClick={() => insertTemplate("\n\\begin{itemize}\n  \\item \n\\end{itemize}")} />
          <ToolbarButton icon={<ListOrdered size={16} />} tooltip="Numbered List" onClick={() => insertTemplate("\n\\begin{enumerate}\n  \\item \n\\end{enumerate}")} />
        </div>

        <div className="h-4 w-px bg-gray-800 mx-1" />

        <div className="flex items-center">
          <ToolbarButton 
            icon={<span className="text-xs font-semibold">Σ</span>} 
            tooltip="Math Mode" 
            onClick={() => insertTemplate("$  $")} 
          />
          <ToolbarButton 
            icon={<span className="text-xs font-semibold">∫</span>} 
            tooltip="Display Math" 
            onClick={() => insertTemplate("\n\\begin{equation}\n  \n\\end{equation}")} 
          />
          <ToolbarButton 
            icon={<span className="text-xs font-semibold">⨯</span>} 
            tooltip="Matrix" 
            onClick={() => insertTemplate("\n\\begin{pmatrix}\n  a & b \\\\\n  c & d\n\\end{pmatrix}")} 
          />
        </div>

        <div className="h-4 w-px bg-gray-800 mx-1" />

        <div className="flex items-center">
          <ToolbarButton icon={<Image size={16} />} tooltip="Insert Image" onClick={() => insertTemplate("\n\\includegraphics[width=0.8\\textwidth]{image.png}")} />
          <ToolbarButton icon={<Table size={16} />} tooltip="Insert Table" onClick={() => insertTemplate("\n\\begin{table}\n  \\centering\n  \\begin{tabular}{cc}\n    Cell 1 & Cell 2 \\\\\n    Cell 3 & Cell 4 \\\\\n  \\end{tabular}\n  \\caption{Table caption}\n\\end{table}")} />
          <ToolbarButton icon={<LinkIcon size={16} />} tooltip="Citation" onClick={() => insertTemplate("\\cite{}")} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Replace the non-functional button with the CollaborationDialog component */}
          <CollaborationDialog />
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualCompile}
            disabled={compilationStatus === "compiling"}
            className="whitespace-nowrap"
          >
            {compilationStatus === "compiling" ? "Compiling..." : "Compile"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeWriting}
            disabled={isAnalyzing}
            className="whitespace-nowrap"
          >
            <Wand2 size={16} className="mr-2" />
            {isAnalyzing ? "Analyzing..." : "Analyze Writing"}
          </Button>
        </div>
      </div>
      
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
              <div className="w-full h-full border rounded overflow-hidden" data-theme="dark">
                <div className="w-full h-full" ref={editorRef} />
              </div>
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70}>
              <div className="h-full flex flex-col bg-gray-950 p-4">
                {compilationStatus === "compiling" ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-400">Compiling document...</div>
                  </div>
                ) : compilationStatus === "success" ? (
                  <div className="overflow-auto">
                    <div className="prose prose-invert max-w-none">
                      <h1 className="text-2xl font-bold mb-4">My First Document</h1>
                      <div className="text-sm text-gray-400 mb-8">
                        TeXSync User • {new Date().toLocaleDateString()}
                      </div>
                      
                      <h2 className="text-xl font-semibold mb-4">Introduction</h2>
                      <p className="mb-6">
                        This is a sample LaTeX document created with TeXSync.
                      </p>
                      
                      <h2 className="text-xl font-semibold mb-4">Equations</h2>
                      <p className="mb-4">LaTeX is great for typesetting mathematics:</p>
                      <div className="bg-gray-900 p-4 rounded-lg mb-6 font-mono">
                        E = mc²
                      </div>
                      
                      <h2 className="text-xl font-semibold mb-4">Lists</h2>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Item 1</li>
                        <li>Item 2</li>
                        <li>Item 3</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-400">
                      {compilationStatus === "error" 
                        ? "Compilation failed. Check for errors." 
                        : "Click Compile to preview"}
                    </div>
                  </div>
                )}
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={30}>
              <div className="h-full bg-gray-950 p-4 overflow-auto">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Writing Suggestions</h3>
                {suggestions.length > 0 ? (
                  <ul className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <li 
                        key={index}
                        className="bg-gray-900 p-3 rounded-lg text-sm border border-gray-800"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    {isAnalyzing 
                      ? "Analyzing your writing..." 
                      : "Click 'Analyze Writing' to get suggestions"}
                  </p>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
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
  const { toast } = useToast();

  const addCollaborator = () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: "Invalid email address",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setCollaborators([...collaborators, { email: newEmail, role: newRole }]);
    setNewEmail("");
    toast({
      title: "Collaborator added",
      description: `Invitation sent to ${newEmail}`
    });
  };

  const removeCollaborator = (email: string) => {
    setCollaborators(collaborators.filter(c => c.email !== email));
  };

  const copyLink = () => {
    navigator.clipboard.writeText(documentLink);
    toast({
      title: "Link copied",
      description: "The collaboration link has been copied to clipboard"
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
              <Button onClick={copyLink} variant="outline" className="shrink-0">
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
              <Button onClick={addCollaborator} variant="outline" className="shrink-0">
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
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}