# Render Deployment Guide for TripTrack Server

## Quick Fix for TypeScript Build Errors

The build errors occur because Render doesn't install `devDependencies` by default. Here's how to fix it:

## Option 1: Use Render Dashboard (Recommended)

1. Go to your Render dashboard → Your Web Service
2. Go to **Settings** tab
3. Find **Build Command** and change it to:
   ```
   npm install --include=dev && npm run build
   ```
4. Make sure **Start Command** is:
   ```
   node dist/src/index.js
   ```
5. Set **Root Directory** to: `server` (if deploying from monorepo)
6. Click **Save Changes**
7. **Manual Deploy** → **Deploy latest commit**

## Option 2: Use render.yaml (If using Render Blueprint)

The `render.yaml` file has been updated with the correct build command. Make sure it's committed to your repo.

## Required Environment Variables

Add these in Render Dashboard → Environment:

```
NODE_ENV=production
PORT=3000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-random-secret-key
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGINS=https://your-app.vercel.app
```

## Why This Fixes the Error

- `npm install --include=dev` ensures TypeScript and `@types/*` packages are installed
- These are needed during the build process to compile TypeScript
- Without them, you get "Cannot find module" errors

## Verify Build

After deploying, check the build logs. You should see:
- ✅ `npm install --include=dev` installing all packages
- ✅ `npm run build` compiling TypeScript successfully
- ✅ `node dist/src/index.js` starting the server

## Troubleshooting

If you still get errors:
1. Check that **Root Directory** is set to `server/`
2. Verify all environment variables are set
3. Check build logs for specific error messages
4. Make sure `package.json` has all required dependencies

