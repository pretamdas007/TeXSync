import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;
    
    // This is a mock implementation - in a real app, you'd call an AI API
    // For example, OpenAI's API
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let latexContent = "";
    
    // Generate some fake LaTeX based on the prompt
    if (prompt.includes("matrix")) {
      latexContent = `\\begin{pmatrix}
  a_{11} & a_{12} & a_{13} \\\\
  a_{21} & a_{22} & a_{23} \\\\
  a_{31} & a_{32} & a_{33}
\\end{pmatrix}`;
    } else if (prompt.includes("quadratic")) {
      latexContent = `x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}`;
    } else if (prompt.includes("table")) {
      latexContent = `\\begin{table}[h]
  \\centering
  \\begin{tabular}{|c|c|c|}
    \\hline
    Column 1 & Column 2 & Column 3 \\\\
    \\hline
    Data 1 & Data 2 & Data 3 \\\\
    Data 4 & Data 5 & Data 6 \\\\
    \\hline
  \\end{tabular}
  \\caption{Sample Table}
  \\label{tab:sample}
\\end{table}`;
    } else if (prompt.includes("flowchart") || prompt.includes("diagram")) {
      latexContent = `\\begin{tikzpicture}[node distance=2cm]
  \\node (start) [startstop] {Start};
  \\node (pro1) [process, below of=start] {Process 1};
  \\node (dec1) [decision, below of=pro1] {Decision 1};
  \\node (pro2a) [process, below of=dec1, xshift=-3cm] {Process 2A};
  \\node (pro2b) [process, below of=dec1, xshift=3cm] {Process 2B};
  \\node (stop) [startstop, below of=dec1, yshift=-3cm] {Stop};
  
  \\draw [arrow] (start) -- (pro1);
  \\draw [arrow] (pro1) -- (dec1);
  \\draw [arrow] (dec1) -- node[anchor=east] {yes} (pro2a);
  \\draw [arrow] (dec1) -- node[anchor=west] {no} (pro2b);
  \\draw [arrow] (pro2a) |- (stop);
  \\draw [arrow] (pro2b) |- (stop);
\\end{tikzpicture}`;
    } else {
      latexContent = `% Generated from prompt: "${prompt}"
\\begin{equation}
  f(x) = \\int_{a}^{b} g(x) \\, dx
\\end{equation}`;
    }
    
    return NextResponse.json({ 
      success: true,
      latex: latexContent
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate LaTeX content'
      },
      { status: 500 }
    );
  }
}