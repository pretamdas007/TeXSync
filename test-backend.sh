#!/bin/bash

# Test script for TeXSync backend LaTeX engine availability

echo "🔍 Testing TeXSync Backend LaTeX Engine Availability"
echo "==============================================="

# Replace with your actual Render backend URL
BACKEND_URL="https://texsync.onrender.com"

echo "Testing backend: $BACKEND_URL"
echo ""

# Test health check
echo "1. Testing health check..."
curl -s "$BACKEND_URL/api/health" | python -m json.tool 2>/dev/null || echo "Health check failed"
echo ""

# Test LaTeX engine availability
echo "2. Testing LaTeX engine availability..."
curl -s "$BACKEND_URL/api/check-engines" | python -m json.tool 2>/dev/null || echo "Engine check failed"
echo ""

# Test simple LaTeX compilation
echo "3. Testing LaTeX compilation..."
curl -X POST "$BACKEND_URL/api/compile" \
  -H "Content-Type: application/json" \
  -d '{
    "latex": "\\documentclass{article}\\begin{document}Hello World\\end{document}",
    "engine": "pdflatex"
  }' \
  -s | python -m json.tool 2>/dev/null || echo "Compilation test failed"

echo ""
echo "Test complete!"
