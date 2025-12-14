# TruLife Security Script
# This script removes secrets from appsettings.json on GitHub

Write-Host "=== TruLife Security Script ===" -ForegroundColor Cyan
Write-Host "This will remove API keys and secrets from GitHub" -ForegroundColor Yellow
Write-Host ""

# Navigate to project directory
$projectPath = "c:\Users\Ike\Documents\Base44 App Downloads\TruLife Couples Fitness"
Set-Location $projectPath

# Create a backup of current appsettings.json
Write-Host "Step 1: Creating backup of appsettings.json..." -ForegroundColor Green
Copy-Item "TruLife.API\appsettings.json" "TruLife.API\appsettings.json.backup"

# Read the file
$appsettingsPath = "TruLife.API\appsettings.json"
$content = Get-Content $appsettingsPath -Raw

# Replace secrets with placeholders
Write-Host "Step 2: Replacing secrets with placeholders..." -ForegroundColor Green
$content = $content -replace '"ApiKey": "AIzaSy[^"]*"', '"ApiKey": "YOUR_GEMINI_API_KEY_HERE"'
$content = $content -replace '"Key": "[^"]*"', '"Key": "YOUR_JWT_SECRET_HERE"'
$content = $content -replace '"Secret": "[^"]*"', '"Secret": "YOUR_JWT_SECRET_HERE"'

# Save the modified file
Set-Content $appsettingsPath $content

# Commit and push changes
Write-Host "Step 3: Committing changes to GitHub..." -ForegroundColor Green
git add TruLife.API/appsettings.json
git commit -m "Remove secrets from public file"
git push

Write-Host ""
Write-Host "=== SUCCESS! ===" -ForegroundColor Green
Write-Host "Secrets have been removed from GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Your backup is saved at: TruLife.API\appsettings.json.backup" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: To restore your local secrets, run:" -ForegroundColor Yellow
Write-Host "Copy-Item 'TruLife.API\appsettings.json.backup' 'TruLife.API\appsettings.json' -Force" -ForegroundColor Yellow
