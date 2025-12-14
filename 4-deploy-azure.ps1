# TruLife Azure Deployment - Free Tier (No SQL Server)
# This uses SQLite and Free App Service tier to avoid quota issues

Write-Host "=== TruLife Azure Deployment (Free Tier) ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$resourceGroup = "TruLifeRG"
$location = "westus"  # Changed from eastus
$appServicePlan = "TruLifePlan"
$backendApp = "trulife-api-$(Get-Random -Minimum 1000 -Maximum 9999)"
$frontendApp = "trulife-app-$(Get-Random -Minimum 1000 -Maximum 9999)"

Write-Host "=== Configuration ===" -ForegroundColor Yellow
Write-Host "Resource Group: $resourceGroup" -ForegroundColor Cyan
Write-Host "Location: $location" -ForegroundColor Cyan
Write-Host "Backend App: $backendApp" -ForegroundColor Cyan
Write-Host "Frontend App: $frontendApp" -ForegroundColor Cyan
Write-Host ""

# Get Gemini API Key
Write-Host "Enter your Gemini API Key:" -ForegroundColor Yellow
$geminiKey = Read-Host

# Get JWT Secret
Write-Host "Enter your JWT Secret (min 32 chars):" -ForegroundColor Yellow
$jwtSecret = Read-Host

Write-Host ""
Write-Host "Step 1: Logging into Azure..." -ForegroundColor Green
az login

Write-Host "Step 2: Using existing Resource Group..." -ForegroundColor Green
# Resource group already exists from previous attempt

Write-Host "Step 3: Creating App Service Plan (Free Tier)..." -ForegroundColor Green
az appservice plan create `
    --name $appServicePlan `
    --resource-group $resourceGroup `
    --location $location `
    --sku F1 `
    --is-linux

Write-Host "Step 4: Creating Backend Web App..." -ForegroundColor Green
az webapp create `
    --resource-group $resourceGroup `
    --plan $appServicePlan `
    --name $backendApp `
    --runtime "DOTNETCORE:8.0"

Write-Host "Step 5: Configuring Backend App Settings (SQLite)..." -ForegroundColor Green
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
Write-Host "Using SQLite database (no SQL Server needed)" -ForegroundColor Yellow
Write-Host "Free tier: $0/month!" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Run .\5-deploy-code.ps1 to deploy your code" -ForegroundColor Yellow

# Save configuration for next script
@{
    ResourceGroup = $resourceGroup
    BackendApp    = $backendApp
    FrontendApp   = $frontendApp
    Location      = $location
} | ConvertTo-Json | Out-File "azure-config.json"
