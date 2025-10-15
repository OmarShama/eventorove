# 🚀 Fixed Railway Deployment Guide

The Nixpacks build failed because Railway was trying to build the entire monorepo. Here's the correct way to deploy:

## ✅ What I Fixed

1. **Removed root-level Railway configs** - These were confusing Nixpacks
2. **Added proper nixpacks.toml** - Tells Railway exactly how to build each service
3. **Updated railway.json** - Added explicit build commands
4. **Created service-specific configs** - Each service has its own configuration

## 🚀 Correct Deployment Steps

### Step 1: Deploy Backend (Server) First

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **IMPORTANT**: In the deployment settings, set:
   - **Root Directory**: (Leave empty - uses root)
   - **Build Command**: (Leave empty - uses Dockerfile)
   - **Start Command**: (Leave empty - uses railway.json)
   - **Config File Path**: `server/railway.json`
6. **Add Environment Variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=your-supabase-url-here
   DB_SCHEMA=eventorove_dev
   DB_SYNC=false
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=3001
   HOST=0.0.0.0
   CORS_ORIGIN=https://eventorove-fe.railway.app
   NEXT_PUBLIC_API_URL=https://eventorove-be.railway.app/api
   ```
7. **Click "Deploy"**
8. **Wait for deployment** (5-10 minutes)
9. **Copy the generated URL** (e.g., `https://eventorove-be.railway.app`)

### Step 2: Deploy Frontend (Client) Second

1. **Create another Railway project**
2. **Select your repository again**
3. **IMPORTANT**: In the deployment settings, set:
   - **Root Directory**: (Leave empty - uses root)
   - **Build Command**: (Leave empty - uses Dockerfile)
   - **Start Command**: (Leave empty - uses railway.json)
   - **Config File Path**: `client/railway.json`
4. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://eventorove-be.railway.app/api
   NEXT_PUBLIC_ENV=production
   NEXT_PUBLIC_APP_NAME=Eventorove
   ```
5. **Click "Deploy"**
6. **Wait for deployment** (5-10 minutes)
7. **Copy the generated URL** (e.g., `https://eventorove-fe.railway.app`)

### Step 3: Connect Your Apps

1. **Update Server CORS**:
   - Go to your server project on Railway
   - Add/Update environment variable: `CORS_ORIGIN=https://eventorove-fe.railway.app`
   - Redeploy

2. **Update Client API URL**:
   - Go to your client project on Railway
   - Update: `NEXT_PUBLIC_API_URL=https://eventorove-be.railway.app/api`
   - Redeploy

## 🔧 Alternative: Use Railway CLI

If the web interface is still having issues, use the CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy server
cd server
railway init
railway up

# Deploy client (in new terminal)
cd client
railway init
railway up
```

## 🐛 Troubleshooting

### If Build Fails with "npm ci" Error

If you see an error like:
```
npm error The `npm ci` command can only install with an existing package-lock.json
```

**Solution**: The Dockerfiles have been updated to use `npm install` instead of `npm ci`. Make sure you're using the latest Dockerfile from the repository.

### If Container Fails to Start with "cd command not found"

If you see an error like:
```
The executable `cd` could not be found.
```

**Solution**: The railway.json files have been updated to remove the `startCommand` since Docker containers use the CMD from the Dockerfile directly.

### If Build Still Fails

1. **Check the build logs** in Railway dashboard
2. **Make sure you selected the correct root directory** (Leave empty - uses root)
3. **Verify your package.json has the right scripts**:
   - Server: `"start:prod": "node dist/main"`
   - Client: `"start": "next start -p ${PORT:-3000}"`

### If Environment Variables Don't Work

1. **Redeploy after adding environment variables**
2. **Check the variable names match exactly**
3. **Make sure there are no extra spaces**

### If CORS Errors

1. **Update CORS_ORIGIN** with your exact client URL
2. **Redeploy the server**
3. **Check browser console for specific errors**

## ✅ Success Checklist

- [ ] Server deployed successfully
- [ ] Client deployed successfully
- [ ] Server URL accessible (e.g., `https://eventorove-be.railway.app`)
- [ ] Client URL accessible (e.g., `https://eventorove-fe.railway.app`)
- [ ] API calls work from client to server
- [ ] No CORS errors in browser console

## 🎉 You're Done!

Your app should now be live at:
- **Frontend**: `https://eventorove-fe.railway.app`
- **API**: `https://eventorove-be.railway.app`

Both services will have:
- ✅ Free SSL certificates
- ✅ Automatic deployments from GitHub
- ✅ Professional hosting
- ✅ No credit card required

## 📞 Need Help?

If you're still having issues:
1. Check the Railway build logs
2. Make sure you're selecting the correct root directory
3. Verify your environment variables are set correctly
4. Try the Railway CLI approach

The key was specifying the root directory (`server` or `client`) so Railway knows which part of your monorepo to build!
