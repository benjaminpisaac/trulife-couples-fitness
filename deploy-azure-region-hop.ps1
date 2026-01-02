# TruLife Azure "Region-Hop" Deployment
# Use this to bypass quota limits in specific regions

Write-Host "=== TruLife Azure Region-Hop Deployment ===" -ForegroundColor Cyan
Write-Host "Use this to bypass 'Quota Exceeded' errors by switching regions." -ForegroundColor Yellow
Write-Host ""

# 1. Configuration selection
Write-Host "Select a Region:" -ForegroundColor Yellow
Write-Host "1. East US (Standard)" -ForegroundColor White
Write-Host "2. Central US (Higher Quota)" -ForegroundColor White
Write-Host "3. West US (Alternate)" -ForegroundColor White
$regionChoice = Read-Host "Choice (1-3)"

$location = "eastus"
if ($regionChoice -eq "2") { $location = "centralus" }
if ($regionChoice -eq "3") { $location = "westus" }

Write-Host "Select a Pricing Tier:" -ForegroundColor Yellow
Write-Host "1. F1 (Free - restricted, no always-on)" -ForegroundColor White
Write-Host "2. B1 (Basic - ~$12/mo, Always-On supported)" -ForegroundColor White
Write-Host "3. P0v3 (Premium - ~$55/mo, High Performance)" -ForegroundColor White
$tierChoice = Read-Host "Choice (1-3)"

$sku = "F1"
if ($tierChoice -eq "2") { $sku = "B1" }
if ($tierChoice -eq "3") { $sku = "P0V3" }

$resourceGroup = "TruLifeRG"
$appServicePlan = "TruLifePlan-$location"
$backendApp = "trulife-api-$(Get-Random -Minimum 1000 -Maximum 9999)"

Write-Host ""
Write-Host "Deploying to $location using $sku tier..." -ForegroundColor Green

# 2. Get secrets
Write-Host "Enter your Gemini API Key:" -ForegroundColor Yellow
$geminiKey = Read-Host
Write-Host "Enter your JWT Secret (min 32 chars):" -ForegroundColor Yellow
$jwtSecret = Read-Host

# 3. Create Resources
Write-Host "Step 1: Creating App Service Plan..." -ForegroundColor Green
az appservice plan create --name $appServicePlan --resource-group $resourceGroup --location $location --sku $sku --is-linux:$false

Write-Host "Step 2: Creating Backend Web App..." -ForegroundColor Green
az webapp create --resource-group $resourceGroup --plan $appServicePlan --name $backendApp --runtime "DOTNETCORE:8.0"

Write-Host "Step 3: Configuring App Settings..." -ForegroundColor Green
az webapp config appsettings set --resource-group $resourceGroup --name $backendApp --settings `
    "Gemini__ApiKey=$geminiKey" `
    "Jwt__Secret=$jwtSecret" `
    "Jwt__Key=$jwtSecret" `
    "ConnectionStrings__DefaultConnection=Data Source=trulife.db"

# 4. Build and Publish
Write-Host "Step 4: Building and Publishing Code..." -ForegroundColor Green
dotnet publish TruLife.API/TruLife.API.csproj -c Release -o ./publish

# Ensure web.config is in publish folder
Copy-Item "TruLife.API/web.config" "./publish/web.config" -Force

# Zip and Deploy
Write-Host "Step 5: Zipping and Deploying..." -ForegroundColor Green
if (Test-Path "deploy.zip") { Remove-Item "deploy.zip" }
Compress-Archive -Path ./publish/* -DestinationPath deploy.zip

az webapp deployment source config-zip --resource-group $resourceGroup --name $backendApp --src deploy.zip

Write-Host ""
Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "Backend API: https://$backendApp.azurewebsites.net" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now updating azure-config.json..." -ForegroundColor Yellow

# Save configuration
@{
    ResourceGroup = $resourceGroup
    BackendApp    = $backendApp
    Location      = $location
} | ConvertTo-Json | Out-File "azure-config.json"

Write-Host "DONE! Your app should now be LIVE on your phone." -ForegroundColor Green
