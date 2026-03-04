# 🔑 Environment Variables Guide

Complete guide for setting up environment variables for Crop Companion.

---

## 📋 Quick Reference

### Backend Variables (Required)
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Backend Variables (Optional - for email)
```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
MAIL_DEFAULT_SENDER=noreply@cropcompanion.com
```

### Frontend Variables (Vercel)
```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🔧 Backend Environment Variables

### 1. GEMINI_API_KEY (Required)

**Purpose:** Enables AI-powered crop advisory using Google Gemini AI

**How to get:**
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

**Example:**
```env
GEMINI_API_KEY=AIzaSyBhvNml-KZ2s6EGzUEB5FughBIonij6c8E
```

**Note:** Without this key, the system will use mock data (which still works!)

---

### 2. Email Configuration (Optional)

These are only needed if you want the "Forgot Password" email functionality to work.

#### MAIL_SERVER
**Default:** `smtp.gmail.com`
```env
MAIL_SERVER=smtp.gmail.com
```

#### MAIL_PORT
**Default:** `587`
```env
MAIL_PORT=587
```

#### MAIL_USE_TLS
**Default:** `True`
```env
MAIL_USE_TLS=True
```

#### MAIL_USERNAME
Your Gmail address
```env
MAIL_USERNAME=your.email@gmail.com
```

#### MAIL_PASSWORD
**Important:** This is NOT your regular Gmail password!

**How to get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification (if not already enabled)
3. Go to "App passwords" section
4. Select "Mail" and "Other (Custom name)"
5. Enter "Crop Companion" as the name
6. Click "Generate"
7. Copy the 16-character password (no spaces)

```env
MAIL_PASSWORD=abcd efgh ijkl mnop
```

#### MAIL_DEFAULT_SENDER
The "From" address in emails
```env
MAIL_DEFAULT_SENDER=noreply@cropcompanion.com
```

---

## 🌐 Frontend Environment Variables

### VITE_API_URL (Production Only)

**Purpose:** Points frontend to your deployed backend

**When to set:** After deploying backend to Render/Railway/etc.

**How to set in Vercel:**
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add new variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-name.onrender.com`
4. Redeploy

**Example:**
```env
VITE_API_URL=https://crop-companion-backend.onrender.com
```

**Note:** In development, it automatically uses `http://localhost:5000`

---

## 🚀 Deployment Setup

### For Render (Backend)

1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python app.py`

5. Add Environment Variables:
   ```
   GEMINI_API_KEY = your_key_here
   MAIL_SERVER = smtp.gmail.com
   MAIL_PORT = 587
   MAIL_USE_TLS = True
   MAIL_USERNAME = your_email@gmail.com
   MAIL_PASSWORD = your_app_password
   MAIL_DEFAULT_SENDER = noreply@cropcompanion.com
   ```

6. Click "Create Web Service"

### For Vercel (Frontend)

1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Add Environment Variable:
   ```
   VITE_API_URL = https://your-backend.onrender.com
   ```
   (Add this AFTER deploying backend)

5. Click "Deploy"

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env` files in `.gitignore` (already done)
- Use different API keys for development and production
- Rotate API keys periodically
- Use environment variables for all secrets
- Enable 2FA on all accounts

### ❌ DON'T:
- Commit `.env` files to Git
- Share API keys publicly
- Use production keys in development
- Hardcode secrets in source code
- Use your regular Gmail password (use App Password)

---

## 📝 Local Development Setup

### Backend (.env file)

Create `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
MAIL_DEFAULT_SENDER=noreply@cropcompanion.com
```

### Frontend (No .env needed)

The frontend uses:
- Firebase config (in `src/lib/firebase.ts`)
- API URL from `src/config.ts` (auto-detects environment)

---

## 🧪 Testing Environment Variables

### Test Backend Variables
```bash
cd backend
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('GEMINI_API_KEY:', 'SET' if os.getenv('GEMINI_API_KEY') else 'NOT SET')"
```

### Test Frontend Build
```bash
npm run build
# Should complete without errors
```

---

## 🐛 Troubleshooting

### Issue: "No API key configured"
**Solution:** Add `GEMINI_API_KEY` to backend environment variables

### Issue: "Email sending failed"
**Solution:** 
1. Check Gmail App Password is correct
2. Verify 2FA is enabled on Gmail
3. Check MAIL_USERNAME is correct

### Issue: "API calls failing in production"
**Solution:**
1. Verify backend is deployed and running
2. Check `VITE_API_URL` is set in Vercel
3. Ensure backend URL is correct (with https://)
4. Check CORS is enabled in backend

### Issue: "Firebase authentication not working"
**Solution:**
1. Verify Firebase config in `src/lib/firebase.ts`
2. Check Firebase project is active
3. Enable authentication methods in Firebase Console

---

## 📊 Environment Variables Checklist

### Backend (Render)
- [ ] GEMINI_API_KEY - Required for AI features
- [ ] MAIL_SERVER - Optional for emails
- [ ] MAIL_PORT - Optional for emails
- [ ] MAIL_USE_TLS - Optional for emails
- [ ] MAIL_USERNAME - Optional for emails
- [ ] MAIL_PASSWORD - Optional for emails
- [ ] MAIL_DEFAULT_SENDER - Optional for emails

### Frontend (Vercel)
- [ ] VITE_API_URL - Set after backend deployment
- [ ] Firebase config - Already in code

### Local Development
- [ ] backend/.env created
- [ ] GEMINI_API_KEY added
- [ ] Email variables added (if testing email)

---

## 🎯 Quick Start Commands

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your values
python app.py
```

### Frontend
```bash
npm install
npm run dev
```

---

## 📞 Need Help?

- Check if `.env` file exists: `ls -la backend/.env`
- Verify variables are loaded: Run test commands above
- Check deployment logs in Render/Vercel
- Review `DEPLOYMENT_GUIDE.md` for detailed instructions

---

**Remember:** The system works without GEMINI_API_KEY (uses mock data), but email features require mail configuration!
