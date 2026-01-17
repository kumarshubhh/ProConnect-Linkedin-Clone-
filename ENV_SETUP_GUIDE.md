# 🚀 Environment Variables Setup Guide

## Overview

This project now uses **environment-based configuration** for all API calls. No more hardcoded URLs! 🎉

---

## 📁 Backend Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Server Configuration
PORT=9090
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/dbname

# CORS - Allowed Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

### For Production (Render)

Add these environment variables in Render Dashboard:

1. Go to your Render service
2. Navigate to **Environment** tab
3. Add the following variables:

```
PORT=10000
NODE_ENV=production
MONGODB_URI=mongodb+srv://subhanshukumar290:Shubh@linkedin.xps8o.mongodb.net/?retryWrites=true&w=majority&appName=Linkedin
ALLOWED_ORIGINS=http://localhost:3000,https://pro-connect-linkedin-clone-eight.vercel.app,https://pro-connect-linkedin-clone-cb1jrssvq-kumarshubhhs-projects.vercel.app,https://pro-connect-linkedin-clone-gwwl3ef39-kumarshubhhs-projects.vercel.app,https://pro-connect-linkedin-clone-dljuyh3vn-kumarshubhhs-projects.vercel.app,https://pro-connect-linkedin-clone-g5b9joo56-kumarshubhhs-projects.vercel.app,https://pro-connect-linkedin-clone-iqk7c7d9b-kumarshubhhs-projects.vercel.app,https://pro-connect-linkedin-clone-jf149fsu4-kumarshubhhs-projects.vercel.app
```

---

## 🎨 Frontend Configuration

### Development Environment

Create `.env.local` in the `frontend/` directory:

```bash
# Backend API URL (local development)
NEXT_PUBLIC_API_BASE_URL=http://localhost:9090

# Environment
NEXT_PUBLIC_ENV=development
```

### Production Environment

Create `.env.production` in the `frontend/` directory:

```bash
# Backend API URL (production - Render)
NEXT_PUBLIC_API_BASE_URL=https://proconnect-linkedin-clone.onrender.com

# Environment
NEXT_PUBLIC_ENV=production
```

### For Production (Vercel)

Add these environment variables in Vercel Dashboard:

1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:

**Variable Name**: `NEXT_PUBLIC_API_BASE_URL`  
**Value**: `https://proconnect-linkedin-clone.onrender.com`  
**Environment**: Production

**Variable Name**: `NEXT_PUBLIC_ENV`  
**Value**: `production`  
**Environment**: Production

---

## 🔄 How It Works

### Backend

**Before:**
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://production-url.vercel.app'
];
await mongoose.connect("mongodb+srv://hardcoded-credentials...");
```

**After:**
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
await mongoose.connect(process.env.MONGODB_URI);
```

### Frontend

**Before:**
```javascript
export const BASE_URL = "https://proconnect-linkedin-clone.onrender.com";
const response = await axios.post(`${BASE_URL}/login`, data);
```

**After:**
```javascript
import { clientServer } from '@/config';
const response = await clientServer.post('/login', data);
// Automatically uses the correct URL based on environment
```

---

## 🏗️ Architecture

```
Frontend (Next.js)
├── .env.local (development)
├── .env.production (production)
└── src/config/
    ├── api.js          → API configuration
    ├── axios.js        → Axios instance with interceptors
    └── index.jsx       → Main export

Backend (Express)
├── .env (local)
└── server.js → Uses process.env variables
```

---

## ✅ Benefits

1. **No Code Changes**: Switch environments by changing `.env` files only
2. **Security**: No credentials in code
3. **Scalability**: Easy to add new environments (staging, testing, etc.)
4. **Clean Architecture**: Single source of truth for API configuration
5. **Future-Ready**: Interceptors ready for auth headers, logging, etc.

---

## 🧪 Testing

### Local Development

1. Start backend:
   ```bash
   cd backend
   npm run dev
   # Should connect to local MongoDB and run on port 9090
   ```

2. Start frontend:
   ```bash
   cd frontend
   npm run dev
   # Should call http://localhost:9090
   ```

### Production

1. Deploy backend to Render (auto-deploys from GitHub)
2. Deploy frontend to Vercel (auto-deploys from GitHub)
3. Frontend automatically calls production backend URL

---

## 🔒 Security Notes

- ✅ `.env` files are in `.gitignore` (never committed)
- ✅ Use `.env.example` files as templates
- ✅ MongoDB credentials are environment variables
- ✅ CORS origins are configurable
- ⚠️ Never commit real credentials to Git

---

## 🐛 Troubleshooting

### Issue: API calls failing in development

**Solution**: Make sure `.env.local` exists with correct `NEXT_PUBLIC_API_BASE_URL`

### Issue: CORS errors in production

**Solution**: Add your Vercel URL to `ALLOWED_ORIGINS` in Render environment variables

### Issue: Environment variables not updating

**Solution**: 
- Frontend: Restart dev server (`npm run dev`)
- Backend: Restart server
- Vercel: Redeploy after changing env vars

---

## 📝 Quick Reference

### Backend Environment Variables
- `PORT` - Server port (default: 9090)
- `MONGODB_URI` - MongoDB connection string
- `ALLOWED_ORIGINS` - Comma-separated CORS origins
- `NODE_ENV` - Environment (development/production)

### Frontend Environment Variables
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL
- `NEXT_PUBLIC_ENV` - Environment name

---

**Note**: All `NEXT_PUBLIC_*` variables are exposed to the browser. Never put secrets in them!

---

Created by: Senior Full-Stack Engineer  
Last Updated: January 18, 2026
