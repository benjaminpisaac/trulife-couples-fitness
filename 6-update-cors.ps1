# TruLife CORS Update Script
# Updates backend CORS to allow your frontend domain

Write-Host "=== Updating CORS Configuration ===" -ForegroundColor Cyan
Write-Host ""

# Load configuration
if (-not (Test-Path "azure-config.json")) {
    Write-Host "ERROR: azure-config.json not found!" -ForegroundColor Red
    exit 1
}

$config = Get-Content "azure-config.json" | ConvertFrom-Json
$frontendUrl = "https://$($config.FrontendApp).azurewebsites.net"

Write-Host "Updating Program.cs to allow: $frontendUrl" -ForegroundColor Yellow

# Update Program.cs
$programPath = "TruLife.API\Program.cs"
$content = Get-Content $programPath -Raw

# Replace production CORS URL
$content = $content -replace 'policy\.WithOrigins\("https://your-app\.azurewebsites\.net"\)', "policy.WithOrigins(`"$frontendUrl`")"

Set-Content $programPath $content

Write-Host "CORS updated in Program.cs" -ForegroundColor Green
Write-Host ""
Write-Host "Committing and pushing to GitHub..." -ForegroundColor Green

git add TruLife.API/Program.cs
git commit -m "Update CORS for Azure frontend"
git push

Write-Host ""
Write-Host "Redeploying backend..." -ForegroundColor Green

Set-Location "TruLife.API"
dotnet publish -c Release -o ./publish
if (Test-Path "deploy.zip") { Remove-Item "deploy.zip" }
Compress-Archive -Path ./publish/* -DestinationPath deploy.zip

az webapp deployment source config-zip `
    --resource-group $config.ResourceGroup `
    --name $config.BackendApp `
    --src deploy.zip

Write-Host ""
Write-Host "=== CORS Updated! ===" -ForegroundColor Green
Write-Host "Your frontend can now communicate with the backend!" -ForegroundColor Green
