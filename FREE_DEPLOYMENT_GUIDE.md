# 🆓 Complete FREE Deployment Guide

This guide will help you deploy your Eventorove app completely FREE using the best free hosting services available.

## 🚀 Option 1: Railway (Recommended - Easiest)

### What you get for FREE:
- ✅ Custom domain (your-app.railway.app)
- ✅ Automatic SSL certificates
- ✅ Automatic deployments from GitHub
- ✅ 500 hours/month free
- ✅ No credit card required

### Step 1: Prepare Your Code

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for free deployment"
   git push origin main
   ```

2. **Set up Supabase (Free database)**:
   - Go to [supabase.com](https://supabase.com)
   - Sign up for free
   - Create a new project
   - Copy your database URL from Settings → Database

### Step 2: Deploy Backend (Server)

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **Choose the `server` folder**
6. **Add environment variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=your-supabase-url-here
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3001
   HOST=0.0.0.0
   CORS_ORIGIN=https://eventorove-fe.railway.app
   NEXT_PUBLIC_API_URL=https://eventorove-be.railway.app/api
   ```
7. **Click "Deploy"**
8. **Wait for deployment** (5-10 minutes)
9. **Copy the generated URL** (e.g., `https://eventorove-be.railway.app`)

### Step 3: Deploy Frontend (Client)

1. **Create another Railway project**
2. **Select the `client` folder**
3. **Add environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://eventorove-be.railway.app/api
   NEXT_PUBLIC_ENV=production
   ```
4. **Click "Deploy"**
5. **Copy the generated URL** (e.g., `https://eventorove-fe.railway.app`)

### Step 4: Connect Your Apps

1. **Update server CORS**:
   - Go to your server project on Railway
   - Add environment variable: `CORS_ORIGIN=https://eventorove-fe.railway.app`
   - Redeploy

2. **Update client API URL**:
   - Go to your client project on Railway
   - Update: `NEXT_PUBLIC_API_URL=https://eventorove-be.railway.app/api`
   - Redeploy

---

## 🌐 Option 2: Render (Alternative)

### What you get for FREE:
- ✅ Custom domain (your-app.onrender.com)
- ✅ Automatic SSL certificates
- ✅ Automatic deployments
- ✅ 750 hours/month free
- ✅ No credit card required

### Step 1: Deploy Backend

1. **Go to [render.com](https://render.com)**
2. **Sign up with GitHub**
3. **Click "New" → "Web Service"**
4. **Connect your repository**
5. **Configure**:
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm run start:prod`
   - **Environment**: Node
6. **Add environment variables** (same as Railway)
7. **Click "Create Web Service"**

### Step 2: Deploy Frontend

1. **Create another Web Service**
2. **Configure**:
   - **Build Command**: `cd client && npm install && npm run build`
   - **Start Command**: `cd client && npm run start`
   - **Environment**: Node
3. **Add environment variables** (same as Railway)
4. **Click "Create Web Service"**

---

## 🔧 Option 3: Vercel + Railway (Best Performance)

### Deploy Frontend on Vercel (Free)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up with GitHub**
3. **Import your repository**
4. **Configure**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `client`
5. **Add environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-server-app.railway.app/api
   ```
6. **Deploy**

### Deploy Backend on Railway (as above)

---

## 🆓 Option 4: Completely Free with Custom Domain

### Get a Free Domain

1. **Go to [freenom.com](https://freenom.com)**
2. **Search for a free domain** (e.g., `.tk`, `.ml`, `.ga`)
3. **Register for free** (1 year)
4. **Point DNS to your Railway/Render URLs**

### Free SSL with Let's Encrypt

Railway and Render automatically provide SSL certificates for free!

---

## 🧪 Testing Your Free Deployment

### Local Testing First

```bash
# Test locally before deploying
./scripts/test-local.sh
```

### After Deployment

1. **Visit your frontend URL**
2. **Test all features**
3. **Check browser console for errors**
4. **Test API endpoints**

---

## 📊 Free Tier Limits

### Railway
- ✅ 500 hours/month
- ✅ 1GB RAM
- ✅ 1GB storage
- ✅ Custom domains
- ✅ Automatic SSL

### Render
- ✅ 750 hours/month
- ✅ 512MB RAM
- ✅ Custom domains
- ✅ Automatic SSL

### Vercel
- ✅ Unlimited static sites
- ✅ 100GB bandwidth
- ✅ Custom domains
- ✅ Automatic SSL

---

## 🚨 Important Notes

### Database Setup
- **Use Supabase free tier** (500MB database)
- **Never commit database credentials** to GitHub
- **Use environment variables** for all secrets

### Environment Variables
- **Server needs**: Database URL, JWT secret, CORS origin
- **Client needs**: API URL
- **Never hardcode** sensitive information

### Monitoring
- **Check logs** regularly
- **Monitor usage** to stay within free limits
- **Set up alerts** if available

---

## 🎯 Quick Start Commands

### Test Locally
```bash
./scripts/test-local.sh
```

### Deploy to Railway
1. Push to GitHub
2. Connect to Railway
3. Deploy server first
4. Deploy client second
5. Update environment variables

### Deploy to Render
1. Push to GitHub
2. Connect to Render
3. Deploy both services
4. Update environment variables

---

## 🆘 Troubleshooting

### Common Issues

**"Build failed"**
- Check your `package.json` scripts
- Ensure all dependencies are listed
- Check build logs for specific errors

**"Database connection failed"**
- Verify your Supabase URL
- Check if database is accessible
- Ensure SSL is enabled

**"CORS error"**
- Update CORS_ORIGIN with your frontend URL
- Redeploy the backend
- Check browser console for specific errors

**"App not loading"**
- Check if both services are running
- Verify environment variables
- Check service logs

### Getting Help

1. **Check service logs** in Railway/Render dashboard
2. **Test API endpoints** directly
3. **Check browser console** for errors
4. **Verify environment variables** are set correctly

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ A live website accessible worldwide
- ✅ Free SSL certificate
- ✅ Automatic deployments
- ✅ Professional domain name
- ✅ Scalable infrastructure

**Your app will be live at**: `https://your-app.railway.app` or `https://your-app.onrender.com`

---

## 📈 Next Steps

1. **Monitor your app** for a few days
2. **Set up monitoring** (optional)
3. **Consider upgrading** if you need more resources
4. **Add custom domain** if desired
5. **Set up CI/CD** for automatic deployments

**Congratulations! You now have a free, production-ready deployment! 🎉**
