import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import mammoth from "mammoth";

// Initialize the Gemini API client with direct API key
// WARNING: Using direct API keys is only recommended for testing purposes 
// In production, use environment variables instead
const API_KEY = "AIzaSyAwNXtukA3f2QOa2YIGimEuBqXA8dC9V8w"; // Replace with your actual Gemini API key
const genAI = new GoogleGenerativeAI(API_KEY);

// Validate API key
export async function validateApiKey(): Promise<boolean> {
  if (!API_KEY || !genAI) return false;
  
  try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    await model.generateContent("API key validation test");
    return true;
  } catch (error) {
    console.error("Gemini API key validation failed:", error);
    return false;
  }
}

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
    // Validate API key before proceeding
    if (!API_KEY || !genAI) {
      throw new Error("API key is missing or invalid. Please check your environment configuration.");
    }
    
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
      } else if (error.message.includes("unregistered callers")) {
        throw new Error("API key authentication failed. Please ensure you have registered your API key correctly.");
      }
      throw error;
    }
    throw new Error("An unexpected error occurred during document conversion.");
  }
}

// Convert text content to LaTeX using Gemini with retry mechanism
async function generateLatexFromText(content: string, filename: string): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini API client not initialized. Check your API key.");
  }

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
  let lastError;
  
  while (attempts < MAX_RETRIES) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error(`Attempt ${attempts + 1} failed:`, error);
      lastError = error;
      attempts++;
      
      if (attempts < MAX_RETRIES) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
      }
    }
  }
  
  // If all retries fail
  throw lastError || new Error("Failed to generate LaTeX after multiple attempts");
}

// Extract text from DOCX files
async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new Error("Failed to extract text from the DOCX file. The file may be corrupted.");
  }
}

// Convert PDF file to base64 for vision model
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
}

// Generate LaTeX from PDF using vision model
async function generateLatexFromPdf(base64Data: string, filename: string): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini API client not initialized. Check your API key.");
  }

  // Use Gemini Pro Vision model
  const model = genAI.getGenerativeModel({ 
    model: "gemini-pro-vision", 
    safetySettings,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
    }
  });
  
  const prompt = `
You are a LaTeX expert. Convert this PDF document to proper LaTeX format.

Analyze the PDF content and create a structured LaTeX document that can reproduce the same output. 
Pay special attention to:
1. Document structure (titles, sections, subsections)
2. Mathematical formulas and equations
3. Tables and figures
4. Reference formatting
5. Original filename: ${filename}

Return ONLY the LaTeX code with no explanations.
`;

  // Implement retry mechanism
  let attempts = 0;
  let lastError;
  
  while (attempts < MAX_RETRIES) {
    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Data
          }
        }
      ]);
      
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error(`Attempt ${attempts + 1} failed:`, error);
      lastError = error;
      attempts++;
      
      if (attempts < MAX_RETRIES) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
      }
    }
  }
  
  // If all retries fail
  throw lastError || new Error("Failed to generate LaTeX from PDF after multiple attempts");
}