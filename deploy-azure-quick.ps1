# Deploy TruLife to Azure - Quick Deploy
# Uses your existing Azure free credit

Write-Host "=== TruLife Azure Quick Deploy ===" -ForegroundColor Cyan

$resourceGroup = "TruLifeRG"
$location = "eastus"
$appName = "trulife-backend-$(Get-Random -Minimum 1000 -Maximum 9999)"
$planName = "trulife-plan"

# Environment variables
$geminiKey = "AIzaSyDVWDGI53zU6MkMSGotzBZGAYzqVGkezgQ"
$jwtSecret = "your-super-secret-jwt-key-min-32-characters-long-12345"

Write-Host "Creating App Service Plan (Free tier)..." -ForegroundColor Green
az appservice plan create `
    --name $planName `
    --resource-group $resourceGroup `
    --location $location `
    --sku F1 `
    --is-linux

Write-Host "Creating Web App..." -ForegroundColor Green
az webapp create `
    --resource-group $resourceGroup `
    --plan $planName `
    --name $appName `
    --runtime "DOTNETCORE:8.0"

Write-Host "Configuring App Settings..." -ForegroundColor Green
az webapp config appsettings set `
    --resource-group $resourceGroup `
    --name $appName `
    --settings `
    "GEMINI_API_KEY=$geminiKey" `
    "JWT_SECRET=$jwtSecret" `
    "JWT_KEY=$jwtSecret" `
    "JWT_ISSUER=TruLifeAPI" `
    "JWT_AUDIENCE=TruLifeClient" `
    "ASPNETCORE_ENVIRONMENT=Production"

Write-Host ""
Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "Backend URL: https://$appName.azurewebsites.net" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Deploy code with 'az webapp up'" -ForegroundColor Yellow

# Save config
@{
    ResourceGroup = $resourceGroup
    AppName       = $appName
    BackendUrl    = "https://$appName.azurewebsites.net"
} | ConvertTo-Json | Out-File "azure-backend-config.json"
