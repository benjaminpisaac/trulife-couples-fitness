# TruLife Quick Redeploy Script
# Use this to quickly redeploy after making code changes

Write-Host "=== Quick Redeploy ===" -ForegroundColor Cyan
Write-Host ""

# Load configuration
if (-not (Test-Path "azure-config.json")) {
    Write-Host "ERROR: azure-config.json not found!" -ForegroundColor Red
    exit 1
}

$config = Get-Content "azure-config.json" | ConvertFrom-Json

Write-Host "What do you want to redeploy?" -ForegroundColor Yellow
Write-Host "1. Backend only" -ForegroundColor Cyan
Write-Host "2. Frontend only" -ForegroundColor Cyan
Write-Host "3. Both" -ForegroundColor Cyan
$choice = Read-Host "Enter choice (1-3)"

$projectPath = "c:\Users\Ike\Documents\Base44 App Downloads\TruLife Couples Fitness"

if ($choice -eq "1" -or $choice -eq "3") {
    Write-Host ""
    Write-Host "Redeploying Backend..." -ForegroundColor Green
    Set-Location "$projectPath\TruLife.API"
    
    dotnet publish -c Release -o ./publish
    if (Test-Path "deploy.zip") { Remove-Item "deploy.zip" }
    Compress-Archive -Path ./publish/* -DestinationPath deploy.zip
    
    az webapp deployment source config-zip `
        --resource-group $config.ResourceGroup `
        --name $config.BackendApp `
        --src deploy.zip
    
    Write-Host "Backend redeployed!" -ForegroundColor Green
}

if ($choice -eq "2" -or $choice -eq "3") {
    Write-Host ""
    Write-Host "Redeploying Frontend..." -ForegroundColor Green
    Set-Location "$projectPath\TruLife.ClientApp"
    
    npm run build
    Set-Location "dist"
    if (Test-Path "../deploy.zip") { Remove-Item "../deploy.zip" }
    Compress-Archive -Path ./* -DestinationPath ../deploy.zip
    
    az webapp deployment source config-zip `
        --resource-group $config.ResourceGroup `
        --name $config.FrontendApp `
        --src ../deploy.zip
    
    Write-Host "Frontend redeployed!" -ForegroundColor Green
}

Set-Location $projectPath

Write-Host ""
Write-Host "=== Redeploy Complete! ===" -ForegroundColor Green
Write-Host "Visit: https://$($config.FrontendApp).azurewebsites.net" -ForegroundColor Cyan
