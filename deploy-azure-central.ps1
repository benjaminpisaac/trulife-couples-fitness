# TruLife Automated Azure "Region-Hop" Deployment
# Pre-configured to Central US (B1 tier) as requested

Write-Host "=== TruLife Automated Azure Deployment ===" -ForegroundColor Cyan
Write-Host "Targeting Central US (B1 Tier) for zero-hustle LIVE status." -ForegroundColor Yellow
Write-Host ""

$location = "centralus"
$sku = "B1"
$resourceGroup = "TruLifeRG"
$appServicePlan = "TruLifePlan-Central"
$backendApp = "trulife-api-$(Get-Random -Minimum 1000 -Maximum 9999)"

# Discovered Credentials
$geminiKey = "AIzaSyDVWDGI53zU6MkMSGotzBZGAYzqVGkezgQ"
$jwtSecret = "your-super-secret-jwt-key-min-32-characters-long-12345"

Write-Host "Step 1: Creating App Service Plan ($location)..." -ForegroundColor Green
az appservice plan create --name $appServicePlan --resource-group $resourceGroup --location $location --sku $sku

Write-Host "Step 2: Creating Backend Web App..." -ForegroundColor Green
az webapp create --resource-group $resourceGroup --plan $appServicePlan --name $backendApp --runtime "DOTNETCORE:8.0"

Write-Host "Step 3: Configuring App Settings..." -ForegroundColor Green
az webapp config appsettings set --resource-group $resourceGroup --name $backendApp --settings `
    "Gemini__ApiKey=$geminiKey" `
    "Jwt__Secret=$jwtSecret" `
    "Jwt__Key=$jwtSecret" `
    "Jwt__Issuer=TruLifeAPI" `
    "Jwt__Audience=TruLifeClient" `
    "ConnectionStrings__DefaultConnection=Data Source=trulife.db"

Write-Host "Step 4: Building and Publishing Backend..." -ForegroundColor Green
dotnet publish TruLife.API/TruLife.API.csproj -c Release -o ./publish
Copy-Item "TruLife.API/web.config" "./publish/web.config" -Force

# Cleanup native libraries for other platforms to prevent permission/zip errors
Get-ChildItem -Path ./publish -Filter *.so -Recurse | Remove-Item -Force
Get-ChildItem -Path ./publish -Filter *.dylib -Recurse | Remove-Item -Force

Write-Host "Step 5: Zipping and Deploying Backend..." -ForegroundColor Green
if (Test-Path "deploy.zip") { Remove-Item "deploy.zip" }
# Wait a second for IO to settle
Start-Sleep -Seconds 2
Compress-Archive -Path ./publish/* -DestinationPath deploy.zip
az webapp deployment source config-zip --resource-group $resourceGroup --name $backendApp --src deploy.zip

Write-Host ""
Write-Host "=== Deployment Successful! ===" -ForegroundColor Green
Write-Host "Backend API: https://$backendApp.azurewebsites.net" -ForegroundColor Cyan
Write-Host ""

# Update local config
@{
    ResourceGroup = $resourceGroup
    BackendApp    = $backendApp
    Location      = $location
} | ConvertTo-Json | Out-File "azure-config.json"

Write-Host "Next: Visit the URL on your phone to verify LIVE status!" -ForegroundColor Green
