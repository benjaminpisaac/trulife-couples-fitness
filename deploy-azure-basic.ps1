# Deploy TruLife to Azure - Basic Tier (uses your $77 credit)

Write-Host "=== TruLife Azure Deploy (Basic Tier) ===" -ForegroundColor Cyan

$resourceGroup = "TruLifeRG"
$location = "eastus"
$appName = "trulife-backend-$(Get-Random -Minimum 1000 -Maximum 9999)"
$planName = "trulife-plan-basic"

# Environment variables
$geminiKey = "AIzaSyDVWDGI53zU6MkMSGotzBZGAYzqVGkezgQ"
$jwtSecret = "your-super-secret-jwt-key-min-32-characters-long-12345"

Write-Host "Creating App Service Plan (Basic B1 - ~$13/month from your credit)..." -ForegroundColor Green
az appservice plan create `
    --name $planName `
    --resource-group $resourceGroup `
    --location $location `
    --sku B1 `
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
Write-Host "Cost: ~$13/month (using your $77 credit)" -ForegroundColor Yellow
Write-Host ""

# Save config
@{
    ResourceGroup = $resourceGroup
    AppName       = $appName
    BackendUrl    = "https://$appName.azurewebsites.net"
} | ConvertTo-Json | Out-File "azure-backend-config.json"
