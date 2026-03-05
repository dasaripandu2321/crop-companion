# 🚀 Quick Deployment Guide

## Current Status

✅ Frontend: Deployed on Vercel  
❌ Backend: NOT deployed yet (causing "API Unreachable" error)

## Why Predictions Always Show "Rice"

The frontend is using fallback error response because it can't reach the backend. The backend is running on `localhost:5000` which only works on your computer, not on the internet.

## Solution: Deploy Backend to Render

### Quick Steps (5 minutes)

1. **Go to Render**: https://render.com
2. **Sign up/Login** with GitHub
3. **Create New Web Service**
4. **Connect repository**: `dasaripandu2321/crop-companion`
5. **Configure**:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
   - Environment Variable: `GEMINI_API_KEY` = `AIzaSyBhvNml-KZ2s6EGzUEB5FughBIonij6c8E`
6. **Deploy** (wait 3-5 minutes)
7. **Copy your Render URL** (e.g., `https://crop-companion-backend.onrender.com`)

### Update Frontend

After getting your Render URL:

```bash
# Edit src/config.ts and replace the URL
# Then commit and push:
git add src/config.ts
git commit -m "Update backend URL"
git push origin master
```

Vercel will auto-redeploy in 1-2 minutes.

## Test Your Deployment

Visit your Vercel URL and try a prediction. It should now work correctly!

## Need Help?

See detailed guide: `RENDER_DEPLOYMENT_GUIDE.md`
