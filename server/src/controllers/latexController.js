const latexService = require('../services/latexService');
const path = require('path');

/**
 * Handle LaTeX compilation requests
 */
exports.compileLaTeX = async (req, res) => {
  try {
    const { latex } = req.body;
    
    if (!latex) {
      return res.status(400).json({ error: 'LaTeX content is required' });
    }
    
    const { success, pdfPath, errors } = await latexService.compile(latex);
    
    if (success) {
      // Convert absolute path to URL path
      const pdfFileName = path.basename(pdfPath);
      const pdfUrl = `${req.protocol}://${req.get('host')}/${pdfFileName}`;
      
      return res.json({ 
        success: true, 
        pdfUrl,
        message: 'Compilation successful'
      });
    } else {
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