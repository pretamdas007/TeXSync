const latexService = require('../services/latexService');
const path = require('path');

/**
 * Handle LaTeX compilation requests
 */
exports.compileLaTeX = async (req, res) => {
  try {
    const { latex, engine = 'pdflatex' } = req.body;
    
    if (!latex) {
      return res.status(400).json({ error: 'LaTeX content is required' });
    }
    
    console.log(`Compiling LaTeX with engine: ${engine}`);
    const { success, pdfPath, errors } = await latexService.compile(latex, engine);
    
    if (success) {
      // Convert absolute path to URL path
      const pdfFileName = path.basename(pdfPath);
      
      // Use environment variable or construct URL based on request
      const baseUrl = process.env.RENDER_EXTERNAL_URL || `${req.protocol}://${req.get('host')}`;
      const pdfUrl = `${baseUrl}/pdfs/${pdfFileName}`;
      
      console.log(`PDF generated successfully: ${pdfUrl}`);
      
      return res.json({ 
        success: true, 
        pdfUrl,
        message: 'Compilation successful'
      });
    } else {
      console.log('Compilation failed:', errors);
      return res.json({
        success: false,
        errors,
        message: 'Compilation failed'
      });
    }
  } catch (error) {
    console.error('Error compiling LaTeX:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during compilation',
      error: error.message
    });
  }
};

/**
 * Handle AI-assisted LaTeX generation
 */
exports.generateAILatex = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // For now, return a simple response
    // In production, you would integrate with an actual AI service
    const latex = `% Generated from prompt: "${prompt}"\n\\begin{equation}\n  E = mc^2\n\\end{equation}`;
    
    return res.json({ success: true, latex });
  } catch (error) {
    console.error('Error generating LaTeX:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};