# Backend Deployment Guide - Render

This guide will help you deploy the Farm Futura AI backend to Render (free tier).

## Prerequisites

- GitHub repository with the backend code (already done ✓)
- Render account (free) - Sign up at https://render.com
- Gemini API key (already have: `AIzaSyBhvNml-KZ2s6EGzUEB5FughBIonij6c8E`)

## Step-by-Step Deployment

### Step 1: Sign Up / Log In to Render

1. Go to https://render.com
2. Click "Get Started" or "Sign In"
3. Sign up with GitHub (recommended) or email

### Step 2: Create a New Web Service

1. From Render Dashboard, click "New +" button (top right)
2. Select "Web Service"
3. Connect your GitHub account if not already connected
4. Select your repository: `dasaripandu2321/crop-companion`
5. Click "Connect"

### Step 3: Configure the Web Service

Fill in the following settings:

**Basic Settings:**
- **Name**: `crop-companion-backend` (or any name you prefer)
- **Region**: Choose closest to your users (e.g., Singapore, Oregon)
- **Branch**: `main`
- **Root Directory**: `backend` (IMPORTANT!)
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`

**Instance Type:**
- Select **Free** (this gives you 750 hours/month free)

### Step 4: Add Environment Variables

Click "Advanced" and add the following environment variable:

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | `AIzaSyBhvNml-KZ2s6EGzUEB5FughBIonij6c8E` |

**Optional Email Variables** (leave empty for now):
- `MAIL_USERNAME` - (empty)
- `MAIL_PASSWORD` - (empty)
- `MAIL_DEFAULT_SENDER` - (empty)

### Step 5: Add Gunicorn to Requirements

Before deploying, we need to add `gunicorn` to the requirements file.



## Step 6: Deploy

1. Click "Create Web Service" button at the bottom
2. Render will start building and deploying your backend
3. Wait 3-5 minutes for the deployment to complete
4. You'll see logs showing the build process

**Expected logs:**
```
==> Cloning from https://github.com/dasaripandu2321/crop-companion...
==> Checking out commit...
==> Running build command 'pip install -r requirements.txt'...
==> Starting service with 'gunicorn app:app'...
==> Your service is live 🎉
```

### Step 7: Get Your Backend URL

Once deployed, Render will provide you with a URL like:
```
https://crop-companion-backend.onrender.com
```

**Copy this URL** - you'll need it for the next step!

### Step 8: Update Frontend Configuration

Now update the frontend to use your new backend URL:

1. Open `src/config.ts` in your project
2. Replace the placeholder URL with your actual Render URL:

```typescript
export const API_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'https://YOUR-ACTUAL-RENDER-URL.onrender.com'
  : 'http://localhost:5000';
```

3. Commit and push to GitHub:
```bash
git add src/config.ts
git commit -m "Update backend URL with Render deployment"
git push origin main
```

4. Vercel will automatically redeploy your frontend with the new backend URL

### Step 9: Test Your Deployment

1. Wait for Vercel to finish redeploying (1-2 minutes)
2. Visit your Vercel URL
3. Try making a crop prediction
4. You should now see real predictions instead of "Rice" every time!

## Troubleshooting

### Issue: "Application failed to respond"

**Solution**: Check Render logs for errors. Common issues:
- Missing `gunicorn` in requirements.txt (we added it ✓)
- Wrong root directory (should be `backend`)
- Wrong start command (should be `gunicorn app:app`)

### Issue: "502 Bad Gateway"

**Solution**: Your app might be starting up. Render free tier sleeps after 15 minutes of inactivity. First request takes 30-60 seconds to wake up.

### Issue: Predictions still showing "Rice"

**Solution**: 
1. Check that frontend config.ts has the correct Render URL
2. Verify Vercel redeployed after you pushed the config change
3. Clear browser cache and try again

### Issue: "API Unreachable" error

**Solution**:
1. Test backend directly: `https://YOUR-RENDER-URL.onrender.com/api/regions`
2. Should return JSON with list of regions
3. If it works, the issue is in frontend config
4. If it doesn't work, check Render logs

## Important Notes

### Free Tier Limitations

- **Sleep after 15 minutes**: First request after sleep takes 30-60 seconds
- **750 hours/month**: Enough for development and testing
- **Automatic HTTPS**: Render provides SSL certificate automatically

### Keeping Your Service Awake (Optional)

To prevent sleeping, you can:
1. Use a service like UptimeRobot to ping your backend every 10 minutes
2. Upgrade to paid tier ($7/month) for always-on service

### Environment Variables

You can update environment variables anytime:
1. Go to Render Dashboard
2. Select your service
3. Click "Environment" tab
4. Add/edit variables
5. Service will automatically redeploy

## Next Steps

After successful deployment:

1. ✅ Backend deployed on Render
2. ✅ Frontend updated with backend URL
3. ✅ Vercel redeployed with new config
4. ✅ Test crop predictions
5. ✅ Test regional summaries
6. ✅ Test AI advisory features

## Support

If you encounter issues:
- Check Render logs: Dashboard → Your Service → Logs
- Check Vercel logs: Vercel Dashboard → Your Project → Deployments
- Verify environment variables are set correctly
- Test backend endpoints directly using browser or Postman

## Summary

Your deployment architecture:
```
User Browser
    ↓
Vercel (Frontend)
    ↓
Render (Backend API)
    ↓
Google Gemini AI
```

All traffic is HTTPS encrypted and secure!
