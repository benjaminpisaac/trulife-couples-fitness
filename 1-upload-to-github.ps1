# TruLife GitHub Upload Script
# This script will initialize git, create a GitHub repo, and push your code

Write-Host "=== TruLife GitHub Upload Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Check if GitHub CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: GitHub CLI is not installed!" -ForegroundColor Red
    Write-Host "Please install GitHub CLI from: https://cli.github.com/" -ForegroundColor Yellow
    Write-Host "Or run: winget install --id GitHub.cli" -ForegroundColor Yellow
    exit 1
}

# Navigate to project directory
$projectPath = "c:\Users\Ike\Documents\Base44 App Downloads\TruLife Couples Fitness"
Set-Location $projectPath

Write-Host "Step 1: Initializing Git repository..." -ForegroundColor Green
git init

Write-Host "Step 2: Adding all files..." -ForegroundColor Green
git add .

Write-Host "Step 3: Creating initial commit..." -ForegroundColor Green
git commit -m "Initial commit - TruLife Couples Fitness App"

Write-Host "Step 4: Authenticating with GitHub..." -ForegroundColor Green
Write-Host "A browser window will open. Please login to GitHub." -ForegroundColor Yellow
gh auth login

Write-Host "Step 5: Creating GitHub repository..." -ForegroundColor Green
Write-Host "Creating private repository 'trulife-couples-fitness'..." -ForegroundColor Yellow
gh repo create trulife-couples-fitness --private --source=. --remote=origin --push

Write-Host ""
Write-Host "=== SUCCESS! ===" -ForegroundColor Green
Write-Host "Your code has been pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Repository URL: https://github.com/$(gh api user --jq .login)/trulife-couples-fitness" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Now run the security script to remove secrets from GitHub!" -ForegroundColor Yellow
Write-Host "Run: .\2-secure-secrets.ps1" -ForegroundColor Yellow
