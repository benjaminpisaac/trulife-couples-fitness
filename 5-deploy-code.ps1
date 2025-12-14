# TruLife Code Deployment Script (SQLite version)
# This deploys your code to Azure

Write-Host "=== TruLife Code Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Load configuration
if (-not (Test-Path "azure-config.json")) {
    Write-Host "ERROR: azure-config.json not found!" -ForegroundColor Red
    Write-Host "Please run .\4-deploy-azure.ps1 first" -ForegroundColor Yellow
    exit 1
}

$config = Get-Content "azure-config.json" | ConvertFrom-Json

Write-Host "Deploying to:" -ForegroundColor Yellow
Write-Host "Backend: $($config.BackendApp)" -ForegroundColor Cyan
Write-Host "Frontend: $($config.FrontendApp)" -ForegroundColor Cyan
Write-Host ""

# Navigate to project
$projectPath = "c:\Users\Ike\Documents\Base44 App Downloads\TruLife Couples Fitness"
Set-Location $projectPath

# Deploy Backend
Write-Host "Step 1: Building Backend..." -ForegroundColor Green
Set-Location "TruLife.API"
dotnet publish -c Release -o ./publish

Write-Host "Step 2: Creating Backend deployment package..." -ForegroundColor Green
if (Test-Path "deploy.zip") { Remove-Item "deploy.zip" }
Compress-Archive -Path ./publish/* -DestinationPath deploy.zip

Write-Host "Step 3: Deploying Backend to Azure..." -ForegroundColor Green
az webapp deployment source config-zip `
    --resource-group $config.ResourceGroup `
    --name $config.BackendApp `
    --src deploy.zip

Write-Host "Step 4: Waiting for backend to start..." -ForegroundColor Green
Start-Sleep -Seconds 30

Set-Location $projectPath

# Deploy Frontend
Write-Host "Step 5: Installing Frontend dependencies..." -ForegroundColor Green
Set-Location "TruLife.ClientApp"

# Update API URL in environment
$envContent = "VITE_API_BASE_URL=https://$($config.BackendApp).azurewebsites.net"
Set-Content ".env.production" $envContent

npm install

Write-Host "Step 6: Building Frontend..." -ForegroundColor Green
npm run build

Write-Host "Step 7: Creating Frontend deployment package..." -ForegroundColor Green
Set-Location "dist"
if (Test-Path "../deploy.zip") { Remove-Item "../deploy.zip" }
Compress-Archive -Path ./* -DestinationPath ../deploy.zip

Write-Host "Step 8: Deploying Frontend to Azure..." -ForegroundColor Green
az webapp deployment source config-zip `
    --resource-group $config.ResourceGroup `
    --name $config.FrontendApp `
    --src ../deploy.zip

Set-Location $projectPath

Write-Host ""
Write-Host "=== DEPLOYMENT COMPLETE! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is live at:" -ForegroundColor Yellow
Write-Host "Frontend: https://$($config.FrontendApp).azurewebsites.net" -ForegroundColor Cyan
Write-Host "Backend API: https://$($config.BackendApp).azurewebsites.net" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Run .\6-update-cors.ps1 to enable frontend-backend communication" -ForegroundColor Yellow
Write-Host ""
Write-Host "Note: Using SQLite database (data stored in app, will reset on redeploy)" -ForegroundColor Yellow
Write-Host "For production, consider upgrading to SQL Database later" -ForegroundColor Yellow
