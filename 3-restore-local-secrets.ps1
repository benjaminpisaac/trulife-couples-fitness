# TruLife - Restore Local Secrets
# Run this after securing GitHub to restore your local API keys

Write-Host "=== Restoring Local Secrets ===" -ForegroundColor Cyan

$projectPath = "c:\Users\Ike\Documents\Base44 App Downloads\TruLife Couples Fitness"
Set-Location $projectPath

if (Test-Path "TruLife.API\appsettings.json.backup") {
    Copy-Item "TruLife.API\appsettings.json.backup" "TruLife.API\appsettings.json" -Force
    Write-Host "SUCCESS: Local secrets restored!" -ForegroundColor Green
    Write-Host "Your app will now work locally with your API keys." -ForegroundColor Green
} else {
    Write-Host "ERROR: Backup file not found!" -ForegroundColor Red
    Write-Host "Please manually update appsettings.json with your keys." -ForegroundColor Yellow
}
