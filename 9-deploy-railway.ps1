# TruLife Railway Deployment (Backend)
# Railway supports .NET and is free!

Write-Host "=== TruLife Railway Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

$projectPath = "c:\Users\Ike\Documents\Base44 App Downloads\TruLife Couples Fitness"
Set-Location "$projectPath\TruLife.API"

Write-Host "Step 1: Login to Railway..." -ForegroundColor Green
railway login

Write-Host "Step 2: Initialize Railway project..." -ForegroundColor Green
railway init

Write-Host "Step 3: Setting environment variables..." -ForegroundColor Green
Write-Host "Enter your Gemini API Key:" -ForegroundColor Yellow
$geminiKey = Read-Host
Write-Host "Enter your JWT Secret:" -ForegroundColor Yellow
$jwtSecret = Read-Host

railway variables set GEMINI_API_KEY=$geminiKey
railway variables set JWT_SECRET=$jwtSecret
railway variables set JWT_KEY=$jwtSecret
railway variables set JWT_ISSUER=TruLifeAPI
railway variables set JWT_AUDIENCE=TruLifeClient
railway variables set ConnectionStrings__DefaultConnection="Data Source=trulife.db"

Write-Host "Step 4: Deploying to Railway..." -ForegroundColor Green
railway up

Write-Host ""
Write-Host "=== Backend Deployed! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Get your backend URL:" -ForegroundColor Yellow
Write-Host "Run: railway status" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then update your frontend to use this backend URL" -ForegroundColor Yellow
