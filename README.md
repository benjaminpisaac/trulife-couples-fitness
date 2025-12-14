# TruLife Couples Fitness App

A comprehensive fitness and wellness application for couples, featuring AI-powered workout generation, nutrition tracking, lab analysis, DNA insights, and romantic evening planning.

## 🚀 Features

- **AI-Powered Workouts** - Equipment detection, personalized programs, AI coaching
- **Nutrition Tracking** - Meal photo analysis, macro tracking, hydration
- **Lab & DNA Analysis** - Biomarker extraction, genetic insights
- **Couples Mode** - Challenges, romantic evenings, real-time chat
- **Recovery Tracking** - Sleep, stress, muscle recovery
- **Mobile App** - Native iOS and Android via Capacitor

## 🛠️ Tech Stack

**Backend:**
- ASP.NET Core 8.0
- Entity Framework Core
- SQLite (dev) / SQL Server (prod)
- SignalR for real-time chat
- Gemini 2.5 Pro AI

**Frontend:**
- React 18
- TypeScript
- Redux Toolkit
- Vite
- Tailwind CSS
- Capacitor (mobile)

## 📦 Quick Start

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+
- Gemini API Key (get from https://makersuite.google.com/app/apikey)

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/trulife-couples-fitness.git
cd trulife-couples-fitness
```

### 2. Setup Backend
```bash
cd TruLife.API

# Update appsettings.json with your Gemini API key

# Run migrations
dotnet ef database update

# Run API
dotnet run
```

### 3. Setup Frontend
```bash
cd TruLife.ClientApp

# Install dependencies
npm install

# Run dev server
npm run dev
```

### 4. Access App
- Frontend: http://localhost:5173
- Backend API: https://localhost:5001
- Swagger: https://localhost:5001/swagger

## 📱 Mobile App

### Build for Android/iOS
```bash
cd TruLife.ClientApp

# Build web app
npm run build

# Sync to native projects
npx cap sync

# Open in Android Studio
npx cap open android

# Open in Xcode (Mac only)
npx cap open ios
```

## 🌐 Deployment

See [GitHub & Azure Deployment Guide](../brain/aa5fdd32-7a57-4eae-bbe8-2526b4b54d74/github_azure_deployment.md) for complete deployment instructions.

## 📚 Documentation

- [Deployment Guide](../brain/aa5fdd32-7a57-4eae-bbe8-2526b4b54d74/deployment_guide.md)
- [Development Roadmap](../brain/aa5fdd32-7a57-4eae-bbe8-2526b4b54d74/development_roadmap.md)
- [Walkthrough](../brain/aa5fdd32-7a57-4eae-bbe8-2526b4b54d74/walkthrough.md)

## 🔑 Environment Variables

### Backend (appsettings.json)
```json
{
  "Gemini": {
    "ApiKey": "YOUR_GEMINI_API_KEY"
  },
  "Jwt": {
    "Secret": "your-super-secret-jwt-key-minimum-32-characters-long"
  }
}
```

### Frontend (.env)
```
VITE_API_BASE_URL=https://localhost:5001
```

## 🧪 Testing

1. Register new account
2. Complete profile (verify data saves!)
3. Test Train page features
4. Test Eat page features
5. Test Couples mode
6. Test mobile app

## 📄 License

Private - All Rights Reserved

## 🤝 Support

For issues or questions, please check the deployment guide or create an issue on GitHub.

---

**Built with ❤️ for couples who train together**
