// Central file for all CodeMirror imports to ensure single instance

// Base CodeMirror
export { EditorView, basicSetup } from "codemirror";
export { EditorState, Compartment } from "@codemirror/state";
export { StreamLanguage } from "@codemirror/stream-parser";
export { stex } from "@codemirror/legacy-modes/mode/stex";
export type { ViewUpdate } from "@codemirror/view";

// Additional imports as needed
export { keymap } from "@codemirror/view";
export { indentWithTab, history, undo, redo } from "@codemirror/commands";

// We'll avoid using syntaxHighlighting from @codemirror/language
// and instead use EditorView.theme directly