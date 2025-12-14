# TruLife Vercel Deployment Script
# Deploy to Vercel (no quota restrictions!)

Write-Host "=== TruLife Vercel Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

$projectPath = "c:\Users\Ike\Documents\Base44 App Downloads\TruLife Couples Fitness"
Set-Location $projectPath

Write-Host "Step 1: Deploying Frontend to Vercel..." -ForegroundColor Green
Set-Location "TruLife.ClientApp"

# Login to Vercel
Write-Host "Logging into Vercel (browser will open)..." -ForegroundColor Yellow
vercel login

# Deploy frontend
Write-Host "Deploying frontend..." -ForegroundColor Green
vercel --prod

Write-Host ""
Write-Host "Frontend deployed!" -ForegroundColor Green
Write-Host ""

# Get frontend URL
$frontendUrl = vercel ls --json | ConvertFrom-Json | Select-Object -First 1 -ExpandProperty url
Write-Host "Frontend URL: https://$frontendUrl" -ForegroundColor Cyan

Set-Location $projectPath

Write-Host ""
Write-Host "Step 2: Deploying Backend..." -ForegroundColor Green
Write-Host ""
Write-Host "For the backend, you have 2 options:" -ForegroundColor Yellow
Write-Host "A) Deploy to Railway (free, supports .NET)" -ForegroundColor Cyan
Write-Host "B) Deploy to Render (free, supports .NET)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vercel doesn't support .NET backends well." -ForegroundColor Yellow
Write-Host "I recommend Railway - it's free and easy!" -ForegroundColor Green
Write-Host ""
Write-Host "Run: .\9-deploy-railway.ps1" -ForegroundColor Cyan

Write-Host ""
Write-Host "=== Frontend Deployed! ===" -ForegroundColor Green
Write-Host "URL: https://$frontendUrl" -ForegroundColor Cyan
