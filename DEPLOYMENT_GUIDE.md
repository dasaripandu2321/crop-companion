# 🚀 Deployment Guide - Crop Companion

## Repository Information

**GitHub Repository:** https://github.com/dasaripandu2321/crop-companion.git  
**Project Name:** Crop Companion (Farm Futura AI)  
**Tech Stack:** React + TypeScript + Flask + Gemini AI

---

## 📦 What's Included

This repository contains a complete AI-powered crop prediction system with:

- ✅ **Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- ✅ **Backend:** Python Flask + Gemini AI integration
- ✅ **Features:**
  - Crop prediction based on soil parameters
  - AI-powered agricultural advisory
  - Regional summaries for 15 Indian states
  - Crop image display system
  - User authentication (Firebase)
  - Responsive UI with dark mode

---

## 🛠️ Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/dasaripandu2321/crop-companion.git
cd crop-companion
```

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Add your Gemini API key to .env
# GEMINI_API_KEY=your_key_here

# Start backend server
python app.py
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup

```bash
# From project root
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend (.env)

```env
GEMINI_API_KEY=your_gemini_api_key_here
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_DEFAULT_SENDER=noreply@cropcompanion.com
```

### Frontend (Firebase)

Update `src/lib/firebase.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_auth_domain",
  projectId: "your_project_id",
  storageBucket: "your_storage_bucket",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend)

#### Deploy Frontend to Vercel

1. Push code to GitHub (already done ✅)
2. Go to [Vercel](https://vercel.com)
3. Import repository: `dasaripandu2321/crop-companion`
4. Configure:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables (Firebase config)
6. Deploy

#### Deploy Backend to Render

1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`
5. Add environment variables (Gemini API key, etc.)
6. Deploy

#### Update Frontend API URL

After backend deployment, update frontend to use production API:

```typescript
// src/config.ts (create this file)
export const API_URL = import.meta.env.PROD 
  ? 'https://your-backend.onrender.com'
  : 'http://localhost:5000';
```

### Option 2: Railway (Full Stack)

1. Go to [Railway](https://railway.app)
2. Create new project from GitHub
3. Add two services:
   - Frontend (Node.js)
   - Backend (Python)
4. Configure environment variables
5. Deploy

### Option 3: AWS (Production)

#### Frontend (S3 + CloudFront)

```bash
# Build frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name

# Configure CloudFront distribution
```

#### Backend (EC2 or Elastic Beanstalk)

```bash
# Create requirements.txt with all dependencies
pip freeze > requirements.txt

# Deploy to Elastic Beanstalk
eb init
eb create crop-companion-env
eb deploy
```

---

## 📊 Project Structure

```
crop-companion/
├── backend/                    # Flask backend
│   ├── app.py                 # Main Flask app
│   ├── gemini_service.py      # AI integration
│   ├── regional_service.py    # Regional analysis
│   ├── email_service.py       # Email functionality
│   └── requirements.txt       # Python dependencies
│
├── src/                       # React frontend
│   ├── components/            # UI components
│   │   ├── RegionalSummary.tsx
│   │   ├── RegionSelector.tsx
│   │   └── ui/               # shadcn/ui components
│   ├── pages/                # Page components
│   ├── lib/                  # Utilities
│   └── assets/               # Static assets
│
├── public/                    # Public assets
├── docs/                      # Documentation
│   ├── REGIONAL_SUMMARIES_GUIDE.md
│   ├── TESTING_REGIONAL_FEATURE.md
│   └── AI_ADVISORY_FIX.md
│
└── package.json              # Node dependencies
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Test mock advisory data
python test_mock_advisory.py

# Test API endpoints
python test_api_response.py

# Test regional service
python -m pytest
```

### Frontend Tests

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage
```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Remove `.env` from git (already in `.gitignore`)
- [ ] Use environment variables for all secrets
- [ ] Enable CORS only for production domain
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure Firebase security rules
- [ ] Rate limit API endpoints
- [ ] Sanitize user inputs
- [ ] Enable CSP headers

---

## 📈 Performance Optimization

### Frontend

- ✅ Code splitting with React.lazy()
- ✅ Image optimization (Unsplash CDN)
- ✅ Lazy loading for components
- ✅ Minification in production build

### Backend

- ✅ Mock data fallback (fast response)
- ✅ Request timeout handling
- ✅ Error recovery mechanisms
- 🔄 TODO: Add Redis caching
- 🔄 TODO: Implement rate limiting

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** Backend shows "N/A" for AI advisory  
**Solution:** Check `AI_ADVISORY_FIX.md` for detailed troubleshooting

**Issue:** CORS errors  
**Solution:** Ensure Flask-CORS is configured correctly in `app.py`

**Issue:** Firebase authentication not working  
**Solution:** Verify Firebase config in `src/lib/firebase.ts`

**Issue:** Gemini API rate limit  
**Solution:** System automatically falls back to mock data

---

## 📚 Documentation

- `README.md` - Project overview
- `REGIONAL_SUMMARIES_GUIDE.md` - Regional feature documentation
- `REGIONAL_ARCHITECTURE.md` - System architecture
- `TESTING_REGIONAL_FEATURE.md` - Testing guide
- `AI_ADVISORY_FIX.md` - Troubleshooting AI advisory
- `DEPLOYMENT_GUIDE.md` - This file

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📝 License

This project is part of Farm Futura AI initiative.

---

## 👨‍💻 Developer

**Dasari Pandu**  
GitHub: [@dasaripandu2321](https://github.com/dasaripandu2321)  
Email: dasaripandu2321@gmail.com

---

## 🎯 Next Steps

1. ✅ Code pushed to GitHub
2. 🔄 Deploy frontend to Vercel
3. 🔄 Deploy backend to Render
4. 🔄 Configure custom domain
5. 🔄 Set up CI/CD pipeline
6. 🔄 Add monitoring and analytics

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check documentation files
- Review troubleshooting guides

---

**Happy Farming! 🌾🚜**
