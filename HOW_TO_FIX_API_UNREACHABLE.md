# 🔧 How to Fix "API Unreachable" Error

## The Problem You're Seeing

When you visit your deployed app, you see:
- ❌ "API Unreachable" message
- ❌ Every prediction shows "Rice"
- ❌ Regional summaries don't work
- ❌ AI advisory shows "N/A"

## Why This Happens

Your frontend (on Vercel) is trying to connect to `http://localhost:5000`, which only exists on your computer. When users visit your site, their browser can't reach your computer!

```
❌ CURRENT (BROKEN):
User's Browser → Vercel Frontend → localhost:5000 (doesn't exist!)
                                    ↓
                              "API Unreachable"
```

```
✅ NEEDED (WORKING):
User's Browser → Vercel Frontend → Render Backend → Gemini AI
                                    ↓
                              Real predictions!
```

## The Fix: Deploy Backend to Render

### What is Render?

Render is like Vercel but for backend APIs. It's free and takes 5 minutes to set up.

### Step-by-Step Fix

#### 1. Go to Render.com

Open https://render.com in your browser

#### 2. Sign Up / Log In

- Click "Get Started"
- Choose "Sign up with GitHub" (easiest)
- Authorize Render to access your GitHub

#### 3. Create New Web Service

- Click "New +" button (top right)
- Select "Web Service"
- Find and select: `dasaripandu2321/crop-companion`
- Click "Connect"

#### 4. Fill in the Form

Copy these settings EXACTLY:

| Field | Value |
|-------|-------|
| Name | `crop-companion-backend` |
| Region | Singapore (or closest to you) |
| Branch | `master` |
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn app:app` |
| Instance Type | Free |

#### 5. Add Environment Variable

Scroll down to "Environment Variables" section:

- Click "Add Environment Variable"
- Key: `GEMINI_API_KEY`
- Value: `AIzaSyBhvNml-KZ2s6EGzUEB5FughBIonij6c8E`

#### 6. Deploy!

- Click "Create Web Service" button at bottom
- Wait 3-5 minutes (grab a coffee ☕)
- Watch the logs - you'll see:
  ```
  ==> Cloning from GitHub...
  ==> Installing dependencies...
  ==> Starting service...
  ==> Your service is live 🎉
  ```

#### 7. Copy Your Backend URL

Once deployed, you'll see a URL at the top like:
```
https://crop-companion-backend-abc123.onrender.com
```

**COPY THIS URL!** You need it for the next step.

#### 8. Update Frontend Configuration

Open your project and edit `src/config.ts`:

**BEFORE:**
```typescript
export const API_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'https://crop-companion-backend.onrender.com'
  : 'http://localhost:5000';
```

**AFTER (replace with YOUR actual URL):**
```typescript
export const API_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'https://crop-companion-backend-abc123.onrender.com'
  : 'http://localhost:5000';
```

#### 9. Push to GitHub

```bash
cd farm-futura-ai-main
git add src/config.ts
git commit -m "Connect frontend to Render backend"
git push origin master
```

#### 10. Wait for Vercel

Vercel will automatically detect your push and redeploy (1-2 minutes).

#### 11. Test Your App!

1. Visit your Vercel URL
2. Try a crop prediction
3. It should now work correctly! 🎉

## How to Verify It's Working

### Test 1: Backend Health Check

Visit: `https://YOUR-RENDER-URL.onrender.com/api/regions`

Should return JSON like:
```json
{
  "regions": ["Punjab", "Haryana", "Uttar Pradesh", ...]
}
```

### Test 2: Frontend Prediction

1. Go to your Vercel app
2. Enter some values:
   - N: 80, P: 48, K: 40
   - Temperature: 24, Humidity: 82
   - pH: 6.5, Rainfall: 230
3. Click "Predict"
4. Should show "Rice" with confidence score (not "API Unreachable")

### Test 3: Regional Summary

1. After prediction, scroll down
2. Select a region (e.g., "Punjab")
3. Click "Get Regional Summary"
4. Should show detailed regional advice (not "API Unreachable")

## Troubleshooting

### "Application failed to respond"

Check Render logs:
1. Go to Render Dashboard
2. Click your service
3. Click "Logs" tab
4. Look for errors

Common fix: Make sure Root Directory is set to `backend`

### "502 Bad Gateway"

Your app is waking up (free tier sleeps after 15 min). Wait 30-60 seconds and try again.

### Still showing "Rice" for everything

1. Clear browser cache (Ctrl+Shift+Delete)
2. Check that Vercel redeployed (check Vercel dashboard)
3. Verify `src/config.ts` has correct URL
4. Test backend directly (see Test 1 above)

### "CORS error" in browser console

Backend CORS is already configured. If you see this:
1. Make sure backend URL in config.ts is correct
2. Make sure backend is actually running (check Render dashboard)

## Important Notes

### Free Tier Sleep

Render free tier sleeps after 15 minutes of inactivity. First request takes 30-60 seconds to wake up. This is normal!

### Keep It Awake (Optional)

Use UptimeRobot (free) to ping your backend every 10 minutes:
1. Sign up at https://uptimerobot.com
2. Add monitor: `https://YOUR-RENDER-URL.onrender.com/api/regions`
3. Check interval: 10 minutes

### Cost

Everything is FREE:
- Vercel: Free forever
- Render: 750 hours/month free (enough for 24/7)
- Firebase: Free tier
- Gemini API: Free tier (60 req/min)

## Summary

1. ✅ Deploy backend to Render (5 min)
2. ✅ Copy Render URL
3. ✅ Update `src/config.ts` with URL
4. ✅ Push to GitHub
5. ✅ Wait for Vercel redeploy
6. ✅ Test and enjoy! 🎉

Total time: ~10 minutes

## Need More Help?

- Detailed guide: `RENDER_DEPLOYMENT_GUIDE.md`
- Quick reference: `DEPLOYMENT_QUICK_START.md`
- Status overview: `DEPLOYMENT_STATUS.md`
