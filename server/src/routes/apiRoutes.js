const express = require('express');
const latexController = require('../controllers/latexController');

const router = express.Router();

router.post('/compile', latexController.compileLaTeX);
router.post('/ai-latex', latexController.generateAILatex);
router.get('/check-engines', latexController.checkLatexEngines);

module.exports = router;