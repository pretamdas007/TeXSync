import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Use environment variable for API key
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
    const { prompt } = body;
    
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
    // Prepare the prompt with context for better LaTeX generation
    const fullPrompt = `You are a LaTeX expert. Generate LaTeX code for the following request. 
    Only include valid LaTeX code without explanations or markdown formatting. 
    Request: ${prompt}`;
    
    try {
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const latexContent = response.text();
      
      return NextResponse.json({ 
        success: true,
        latex: latexContent
      });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      
      let errorMessage = 'Failed to generate LaTeX content';
      if (error.message) {
        if (error.message.includes("API key")) {
          errorMessage = "API key is invalid. Please check your API configuration.";
        } else if (error.message.includes("quota")) {
          errorMessage = "API quota exceeded. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage
        },
        { status: 500 }
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