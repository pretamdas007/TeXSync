const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const crypto = require('crypto');

const execPromise = util.promisify(exec);

/**
 * Generate a unique ID for each compilation job
 */
const generateUniqueId = () => {
  return crypto.randomBytes(8).toString('hex');
};

/**
 * Compile LaTeX content into a PDF
 * @param {string} latexContent - The LaTeX source code to compile
 * @param {string} engine - LaTeX compiler engine (pdflatex, xelatex, or lualatex)
 * @returns {object} - Compilation result with success status and output information
 */
exports.compile = async (latexContent, engine = 'pdflatex') => {
  // Validate engine type
  const validEngines = ['pdflatex', 'xelatex', 'lualatex'];
  if (!validEngines.includes(engine)) {
    return {
      success: false,
      errors: `Invalid compiler engine: ${engine}. Must be one of: ${validEngines.join(', ')}`
    };
  }

  const jobId = generateUniqueId();
  const tempDir = path.join(__dirname, '..', '..', 'temp');
  const texFilePath = path.join(tempDir, `${jobId}.tex`);
  const baseOutputPath = path.join(tempDir, jobId);
  
  try {
    // Write LaTeX content to a temporary file
    await fs.promises.writeFile(texFilePath, latexContent);
    
    console.log(`LaTeX file written to ${texFilePath}`);
    console.log(`Using compiler engine: ${engine}`);
    
    // Check if LaTeX engine is available
    try {
      await execPromise(`which ${engine}`);
    } catch (error) {
      console.error(`LaTeX engine ${engine} not found`);
      return {
        success: false,
        errors: `LaTeX engine "${engine}" is not installed on this system. Available engines may include: pdflatex, xelatex, lualatex. Please check server configuration.`
      };
    }
    
    // Run LaTeX compiler with the specified engine
    const command = `${engine} -interaction=nonstopmode -output-directory="${tempDir}" "${texFilePath}"`;
    console.log(`Executing command: ${command}`);
    
    const { stdout, stderr } = await execPromise(command);
    
    console.log(`${engine} output:`, stdout);
    if (stderr) {
      console.log(`${engine} stderr:`, stderr);
    }
    
    const pdfPath = `${baseOutputPath}.pdf`;
    const logPath = `${baseOutputPath}.log`;
    
    // Check if PDF was created
    if (fs.existsSync(pdfPath)) {
      console.log(`PDF successfully created at ${pdfPath}`);
      return {
        success: true,
        pdfPath,
        engine,
        logOutput: stdout
      };
    } else {
      // If compilation failed, try to extract errors from the log file
      console.log('PDF creation failed, checking log file');
      let errors = 'Unknown error during compilation';
      
      if (fs.existsSync(logPath)) {
        const logContent = await fs.promises.readFile(logPath, 'utf-8');
        errors = extractErrorsFromLog(logContent);
      }
      
      return {
        success: false,
        engine,
        errors,
        logOutput: stdout
      };
    }
  } catch (error) {
    console.error('Compilation error:', error);
    return {
      success: false,
      engine,
      errors: error.message,
      stderr: error.stderr
    };
  }
};

/**
 * Extract error messages from LaTeX log
 * @param {string} logContent - The content of the LaTeX compilation log
 * @returns {string} - Extracted error messages
 */
function extractErrorsFromLog(logContent) {
  const errorLines = [];
  const lines = logContent.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('!') && !line.includes('!name')) {
      // Collect the error and a few lines after it for context
      const contextLines = lines.slice(i, i + 3);
      errorLines.push(...contextLines);
    }
  }
  
  return errorLines.length > 0 
    ? errorLines.join('\n') 
    : 'Compilation failed, but no specific error was found in the log.';
}