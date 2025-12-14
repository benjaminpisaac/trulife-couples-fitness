# TruLife Azure Static Web Apps Deployment
# FREE tier - no quota restrictions!

Write-Host "=== TruLife Azure Static Web Apps (FREE) ===" -ForegroundColor Cyan
Write-Host ""

$resourceGroup = "TruLifeRG"
$location = "eastus2"
$appName = "trulife-app-$(Get-Random -Minimum 1000 -Maximum 9999)"
$repoUrl = "https://github.com/benjaminpisaac/trulife-couples-fitness"

Write-Host "This is completely FREE - no charges!" -ForegroundColor Green
Write-Host ""

# Get credentials
Write-Host "Enter your Gemini API Key:" -ForegroundColor Yellow
$geminiKey = Read-Host
Write-Host "Enter your JWT Secret (min 32 chars):" -ForegroundColor Yellow
$jwtSecret = Read-Host

Write-Host ""
Write-Host "Step 1: Logging into Azure..." -ForegroundColor Green
az login

Write-Host "Step 2: Creating Static Web App (FREE)..." -ForegroundColor Green
az staticwebapp create `
    --name $appName `
    --resource-group $resourceGroup `
    --source $repoUrl `
    --location $location `
    --branch main `
    --app-location "TruLife.ClientApp" `
    --api-location "TruLife.API" `
    --output-location "dist" `
    --sku Free `
    --login-with-github

Write-Host "Step 3: Setting environment variables..." -ForegroundColor Green
az staticwebapp appsettings set `
    --name $appName `
    --resource-group $resourceGroup `
    --setting-names `
    "Gemini__ApiKey=$geminiKey" `
    "Jwt__Secret=$jwtSecret" `
    "Jwt__Key=$jwtSecret" `
    "ConnectionStrings__DefaultConnection=Data Source=trulife.db"

Write-Host ""
Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Your app: https://$appName.azurestaticapps.net" -ForegroundColor Cyan
Write-Host "Cost: $0/month (FREE tier)" -ForegroundColor Green
Write-Host ""
Write-Host "Azure will automatically deploy from GitHub on every push!" -ForegroundColor Yellow
