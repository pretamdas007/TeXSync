import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import mammoth from "mammoth";

// Initialize the Gemini API client with safety settings
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Configure safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

export async function convertToLatex(file: File): Promise<string> {
  try {
    // For text-based conversion from DOCX content
    if (file.name.toLowerCase().endsWith('.docx')) {
      const text = await extractTextFromDocx(file);
      return await generateLatexFromText(text, file.name);
    }
    
    // For PDF-based conversion using vision model
    if (file.name.toLowerCase().endsWith('.pdf')) {
      const base64Data = await fileToBase64(file);
      return await generateLatexFromPdf(base64Data, file.name);
    }
    
    throw new Error("Unsupported file format. Please upload a .docx or .pdf file.");
  } catch (error) {
    console.error("Gemini API error:", error);
    
    // Provide more specific error messages for better user feedback
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("API key is invalid or missing. Please check your API configuration.");
      } else if (error.message.includes("quota")) {
        throw new Error("API quota exceeded. Please try again later.");
      } else if (error.message.includes("network")) {
        throw new Error("Network error. Please check your internet connection and try again.");
      }
      throw error;
    }
    throw new Error("An unexpected error occurred during document conversion.");
  }
}

// Convert text content to LaTeX using Gemini with retry mechanism
async function generateLatexFromText(content: string, filename: string): Promise<string> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-pro",
    safetySettings,
    generationConfig: {
      temperature: 0.2, // Lower temperature for more consistent outputs
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
    }
  });
  
  const prompt = `
You are a LaTeX expert. Convert this document to proper LaTeX format.

INSTRUCTIONS:
1. Create a well-structured LaTeX document with appropriate document class and packages
2. Use appropriate section, subsection, and other structural commands
3. Convert all mathematical content to proper LaTeX math notation
4. Create appropriate LaTeX table environments for any tables
5. For any images mentioned, add \\includegraphics placeholders
6. Format citations and references properly
7. Preserve all formatting like bold, italic, lists, etc.
8. Follow best practices for academic LaTeX documents
9. Original filename: ${filename}

CONTENT:
${content}

Return ONLY the LaTeX code with no explanations or markdown formatting.
`;

  // Implement retry mechanism
  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      attempts++;
      if (attempts >= MAX_RETRIES) {
        throw error;
      }
      console.log(`Attempt ${attempts} failed, retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  throw new Error("Failed to convert document after multiple attempts");
}

// Convert PDF using vision capabilities with improved prompt
async function generateLatexFromPdf(base64Data: string, filename: string): Promise<string> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-pro-vision",
    safetySettings,
    generationConfig: {
      temperature: 0.2, // Lower temperature for more consistent outputs
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
    }
  });
  
  const prompt = `
You are a LaTeX expert. Convert this PDF document to LaTeX code.

INSTRUCTIONS:
1. Extract all text content, preserving the document structure and formatting
2. Create a well-structured LaTeX document with appropriate document class and packages
3. Maintain proper sections, subsections, and other organizational elements
4. Convert all mathematical equations and formulas to proper LaTeX math notation
5. Recreate tables using appropriate LaTeX table environments
6. Add placeholders for images using \\includegraphics
7. Format citations and references properly
8. Preserve all formatting like bold, italic, lists, etc.
9. Follow best practices for academic LaTeX documents
10. Original filename: ${filename}

Return ONLY the complete LaTeX code with no explanations or markdown formatting.
`;

  const imageParts = [
    {
      inlineData: {
        data: base64Data,
        mimeType: "application/pdf"
      },
    },
  ];

  // Implement retry mechanism for PDF conversion too
  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      attempts++;
      if (attempts >= MAX_RETRIES) {
        throw error;
      }
      console.log(`PDF conversion attempt ${attempts} failed, retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  throw new Error("Failed to convert PDF after multiple attempts");
}

// Helper function to extract text from DOCX using mammoth.js
async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    // Check if we got valid text content
    if (result && result.value) {
      return result.value;
    }
    
    // Log warnings if any
    if (result.messages && result.messages.length > 0) {
      console.warn("DOCX extraction warnings:", result.messages);
    }
    
    // If empty or failed
    if (!result.value || result.value.trim() === '') {
      throw new Error("Could not extract text content from the document");
    }
    
    return result.value;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new Error("Failed to read the DOCX file. The file may be corrupted or password-protected.");
  }
}

// Convert File to base64 with better error handling
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check file size first
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 20MB.`));
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64 format"));
      }
    };
    
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      reject(new Error("Error reading the file. The file may be corrupted."));
    };
    
    // Add timeout for large files
    const timeout = setTimeout(() => {
      reader.abort();
      reject(new Error("File reading timed out. The file may be too large or your browser is unresponsive."));
    }, 30000); // 30 seconds timeout
    
    reader.onloadend = () => {
      clearTimeout(timeout);
    };
  });
}

// Add function to check the API key validity before conversion
export async function validateApiKey(): Promise<boolean> {
  if (!API_KEY) {
    return false;
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    await model.generateContent("Test");
    return true;
  } catch (error) {
    console.error("API key validation failed:", error);
    return false;
  }
}