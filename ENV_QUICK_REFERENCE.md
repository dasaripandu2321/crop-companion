# 🔑 Environment Variables - Quick Reference

## Backend (Render/Railway)

### Required:
```
GEMINI_API_KEY = your_gemini_api_key_here
```
Get from: https://makersuite.google.com/app/apikey

### Optional (for email):
```
MAIL_SERVER = smtp.gmail.com
MAIL_PORT = 587
MAIL_USE_TLS = True
MAIL_USERNAME = your_email@gmail.com
MAIL_PASSWORD = your_gmail_app_password
MAIL_DEFAULT_SENDER = noreply@cropcompanion.com
```

---

## Frontend (Vercel)

### After Backend Deployment:
```
VITE_API_URL = https://your-backend.onrender.com
```

---

## 📝 How to Add in Render

1. Go to your Web Service
2. Click "Environment" tab
3. Add each variable:
   - Click "Add Environment Variable"
   - Enter Key and Value
   - Click "Save Changes"

---

## 📝 How to Add in Vercel

1. Go to your Project
2. Settings → Environment Variables
3. Add variable:
   - Name: `VITE_API_URL`
   - Value: Your backend URL
   - Environment: Production
4. Redeploy

---

## ⚠️ Important Notes

- **GEMINI_API_KEY**: System works without it (uses mock data)
- **Email vars**: Only needed for "Forgot Password" feature
- **VITE_API_URL**: Add AFTER deploying backend
- **Firebase**: Already configured in code (no env vars needed)

---

## 🎯 Current Firebase Config

Already set up in `src/lib/firebase.ts`:
- Project: agrosmart-4d610
- Auth: Enabled
- No environment variables needed

---

See `ENVIRONMENT_VARIABLES.md` for detailed guide!
