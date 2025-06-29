import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Use server-side environment variable for API key
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    // Check if API key exists
    if (!API_KEY) {
      return NextResponse.json(
        { 
          success: false,
          error: 'API key is missing. Please check your environment configuration.'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt, message, context, conversationHistory } = body;
    
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    let fullPrompt: string;
    
    // Handle different request types
    if (message && context) {
      // Chat functionality
      const systemPrompt = `You are TeXSync AI, an expert LaTeX and academic writing assistant powered by Google Gemini. You help users with:

- LaTeX syntax and code generation
- Mathematical equations and formulas
- Document structure and formatting
- Academic writing assistance
- TikZ diagrams and graphics
- Table creation and styling
- Bibliography and citation management
- Error debugging and troubleshooting

Provide helpful, detailed responses in Markdown format. When showing LaTeX code, use proper code blocks. For mathematical expressions, use LaTeX math notation with $ for inline math and $$ for display math. Always be encouraging and educational.

Context: ${context}`;

      // Build conversation context
      let conversationContext = "";
      if (conversationHistory && conversationHistory.length > 0) {
        conversationContext = "\n\nRecent conversation:\n" + 
          conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') + 
          "\n\n";
      }

      fullPrompt = `${systemPrompt}${conversationContext}User: ${message}`;
    } else if (prompt) {
      // Legacy LaTeX generation functionality
      fullPrompt = `You are a LaTeX expert. Generate LaTeX code for the following request. 
      Only include valid LaTeX code without explanations or markdown formatting. 
      Request: ${prompt}`;
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'No valid input provided. Please include either "message" or "prompt" in your request.'
        },
        { status: 400 }
      );
    }
    
    try {
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Get token count if available
      let tokenCount = 0;
      try {
        const usage = result.response.usageMetadata;
        if (usage) {
          tokenCount = usage.totalTokenCount || 0;
        }
      } catch (e) {
        console.log("Token count not available:", e);
      }
      
      // Return appropriate response format based on request type
      if (message && context) {
        return NextResponse.json({ 
          success: true,
          response: responseText,
          tokens: tokenCount,
          model: "gemini-2.0-flash"
        });
      } else {
        return NextResponse.json({ 
          success: true,
          latex: responseText,
          tokens: tokenCount
        });
      }
    } catch (error: any) {
      console.error("Gemini API error:", error);
      
      let errorMessage = 'Failed to generate response';
      let statusCode = 500;
      
      if (error.message) {
        if (error.message.includes("API_KEY") || error.message.includes("API key")) {
          errorMessage = "API key is invalid or missing. Please check your GEMINI_API_KEY configuration.";
          statusCode = 401;
        } else if (error.message.includes("quota") || error.message.includes("RATE_LIMIT")) {
          errorMessage = "API quota exceeded. Please try again later.";
          statusCode = 429;
        } else if (error.message.includes("blocked") || error.message.includes("safety")) {
          errorMessage = "Content was blocked due to safety filters. Please try rephrasing your request.";
          statusCode = 400;
        } else if (error.message.includes("model not found")) {
          errorMessage = "AI model not available. Please try again later.";
          statusCode = 503;
        } else {
          errorMessage = error.message;
        }
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          code: error.code || 'UNKNOWN_ERROR'
        },
        { status: statusCode }
      );
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process your request'
      },
      { status: 500 }
    );
  }
}