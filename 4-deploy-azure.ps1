# TruLife Azure Deployment - Using Available Quota
# Uses Premium v4 tier (you have quota for this!)

Write-Host "=== TruLife Azure Deployment (Premium v4) ===" -ForegroundColor Cyan
Write-Host ""

$resourceGroup = "TruLifeRG"
$location = "eastus"  # You have P0v4 quota here
$appServicePlan = "TruLifePlan"
$backendApp = "trulife-api-$(Get-Random -Minimum 1000 -Maximum 9999)"
$frontendApp = "trulife-app-$(Get-Random -Minimum 1000 -Maximum 9999)"

Write-Host "Using Premium v4 tier (P0v4) - you have quota for this!" -ForegroundColor Green
Write-Host ""

# Get credentials
Write-Host "Enter your Gemini API Key:" -ForegroundColor Yellow
$geminiKey = Read-Host
Write-Host "Enter your JWT Secret (min 32 chars):" -ForegroundColor Yellow
$jwtSecret = Read-Host

Write-Host ""
Write-Host "Step 1: Logging into Azure..." -ForegroundColor Green
az login

Write-Host "Step 2: Using existing Resource Group..." -ForegroundColor Green

Write-Host "Step 3: Creating App Service Plan (Premium v4)..." -ForegroundColor Green
az appservice plan create `
    --name $appServicePlan `
    --resource-group $resourceGroup `
    --location $location `
    --sku P0V3 `
    --is-linux

Write-Host "Step 4: Creating Backend Web App..." -ForegroundColor Green
az webapp create `
    --resource-group $resourceGroup `
    --plan $appServicePlan `
    --name $backendApp `
    --runtime "DOTNETCORE:8.0"

Write-Host "Step 5: Configuring Backend App Settings..." -ForegroundColor Green
az webapp config appsettings set `
    --resource-group $resourceGroup `
    --name $backendApp `
    --settings `
    "Gemini__ApiKey=$geminiKey" `
    "Jwt__Secret=$jwtSecret" `
    "Jwt__Key=$jwtSecret" `
    "Jwt__Issuer=TruLifeAPI" `
    "Jwt__Audience=TruLifeClient" `
    "ConnectionStrings__DefaultConnection=Data Source=trulife.db"

Write-Host "Step 6: Creating Frontend Web App..." -ForegroundColor Green
az webapp create `
    --resource-group $resourceGroup `
    --plan $appServicePlan `
    --name $frontendApp `
    --runtime "NODE:18-lts"

Write-Host "Step 7: Configuring Frontend App Settings..." -ForegroundColor Green
az webapp config appsettings set `
    --resource-group $resourceGroup `
    --name $frontendApp `
    --settings `
    "API_BASE_URL=https://$backendApp.azurewebsites.net"

Write-Host ""
Write-Host "=== Azure Resources Created! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API: https://$backendApp.azurewebsites.net" -ForegroundColor Cyan
Write-Host "Frontend App: https://$frontendApp.azurewebsites.net" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cost: ~$55/month (Premium v4 tier)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next: Run .\5-deploy-code.ps1 to deploy your code" -ForegroundColor Yellow

# Save configuration
@{
    ResourceGroup = $resourceGroup
    BackendApp    = $backendApp
    FrontendApp   = $frontendApp
    Location      = $location
} | ConvertTo-Json | Out-File "azure-config.json"
