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
  AlignLeft, Table, Link as LinkIcon,
  Wand2, Share2, User, Users, X, Mail
} from "lucide-react";
// --- FIX: Use 'sonner' for toasts ---
import { toast } from "sonner";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { StreamLanguage } from "@codemirror/stream-parser";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { ViewUpdate } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
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
      type="button"
    >
      {icon}
    </Button>
  );
}

interface LaTeXEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function LaTeXEditor({ value, onChange }: LaTeXEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-full"
    />
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