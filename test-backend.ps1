# PowerShell test script for TeXSync backend LaTeX engine availability

Write-Host "🔍 Testing TeXSync Backend LaTeX Engine Availability" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Replace with your actual Render backend URL
$BACKEND_URL = "https://texsync.onrender.com"

Write-Host "Testing backend: $BACKEND_URL" -ForegroundColor Cyan
Write-Host ""

# Test health check
Write-Host "1. Testing health check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/health" -Method GET
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test LaTeX engine availability
Write-Host "2. Testing LaTeX engine availability..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/check-engines" -Method GET
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Engine check failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test simple LaTeX compilation
Write-Host "3. Testing LaTeX compilation..." -ForegroundColor Yellow
try {
    $body = @{
        latex = "\documentclass{article}\begin{document}Hello World\end{document}"
        engine = "pdflatex"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/compile" -Method POST -Body $body -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Compilation test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Green
