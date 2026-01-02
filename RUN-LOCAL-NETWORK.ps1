# TruLife Local Network Testing
# Run this to test the app on your phones (no deployment needed!)

Write-Host "=== TruLife Local Network Testing ===" -ForegroundColor Cyan
Write-Host ""

# Get your local IP address
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -like "192.168.*" }).IPAddress

if (-not $ipAddress) {
    $ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" }).IPAddress | Select-Object -First 1
}

Write-Host "Your computer's IP address: $ipAddress" -ForegroundColor Green
Write-Host ""

$projectPath = "c:\Users\Ike\Documents\Base44 App Downloads\TruLife Couples Fitness"

# Start Backend
Write-Host "Starting Backend API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath\TruLife.API'; dotnet run --urls=http://0.0.0.0:5000"

Start-Sleep -Seconds 3

# Update frontend to use local IP
Write-Host "Configuring Frontend..." -ForegroundColor Yellow
Set-Location "$projectPath\TruLife.ClientApp"

# Create .env.local with your IP
$envContent = "VITE_API_BASE_URL=http://${ipAddress}:5000/api"
Set-Content ".env.local" $envContent

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath\TruLife.ClientApp'; npm run dev -- --host 0.0.0.0"

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "=== App is Running! ===" -ForegroundColor Green
Write-Host ""
Write-Host "On your phones, open your browser and go to:" -ForegroundColor Cyan
Write-Host "http://${ipAddress}:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Make sure your phones are on the same WiFi network as this computer!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C in the PowerShell windows to stop the servers" -ForegroundColor Gray
