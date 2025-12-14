# TruLife Render Deployment - Simplest Cloud Deployment
# FREE tier, no quota issues, both frontend + backend

Write-Host "=== TruLife Render Deployment (FREE) ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will deploy your app to Render.com (free tier)" -ForegroundColor Green
Write-Host "You'll be able to access it from anywhere!" -ForegroundColor Green
Write-Host ""

# Instructions
Write-Host "Follow these steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://render.com" -ForegroundColor Cyan
Write-Host "2. Sign up with your GitHub account" -ForegroundColor Cyan
Write-Host "3. Click 'New +' -> 'Web Service'" -ForegroundColor Cyan
Write-Host "4. Connect your GitHub repo: trulife-couples-fitness" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Configure Backend:" -ForegroundColor Yellow
Write-Host "   - Name: trulife-api" -ForegroundColor Gray
Write-Host "   - Root Directory: TruLife.API" -ForegroundColor Gray
Write-Host "   - Build Command: dotnet publish -c Release -o out" -ForegroundColor Gray
Write-Host "   - Start Command: dotnet out/TruLife.API.dll" -ForegroundColor Gray
Write-Host "   - Instance Type: Free" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Add Environment Variables:" -ForegroundColor Yellow
Write-Host "   GEMINI_API_KEY = (your Gemini key)" -ForegroundColor Gray
Write-Host "   JWT_SECRET = (your JWT secret)" -ForegroundColor Gray
Write-Host ""
Write-Host "7. Click 'Create Web Service'" -ForegroundColor Cyan
Write-Host "   Wait 5-10 minutes for deployment" -ForegroundColor Gray
Write-Host "   You'll get a URL like: https://trulife-api.onrender.com" -ForegroundColor Gray
Write-Host ""
Write-Host "8. Repeat for Frontend:" -ForegroundColor Yellow
Write-Host "   - Name: trulife-app" -ForegroundColor Gray
Write-Host "   - Root Directory: TruLife.ClientApp" -ForegroundColor Gray
Write-Host "   - Build Command: npm install && npm run build" -ForegroundColor Gray
Write-Host "   - Start Command: npm run preview -- --host 0.0.0.0 --port `$PORT" -ForegroundColor Gray
Write-Host "   - Add env var: VITE_API_BASE_URL = (your backend URL)" -ForegroundColor Gray
Write-Host ""
Write-Host "=== Done! ===" -ForegroundColor Green
Write-Host "Your app will be live at: https://trulife-app.onrender.com" -ForegroundColor Cyan
Write-Host "Access from anywhere, any device!" -ForegroundColor Green
Write-Host ""
Write-Host "Cost: $0/month (free tier)" -ForegroundColor Green
Write-Host "Note: Free tier sleeps after 15 min of inactivity (wakes up in 30 sec)" -ForegroundColor Yellow
