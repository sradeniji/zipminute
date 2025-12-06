# Deployment Guide

This guide will help you deploy your React app to your domain.

## Prerequisites

- ✅ Active domain name
- ✅ Node.js 18+ installed
- ✅ Git repository (optional but recommended)

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

Vercel is perfect for React apps and provides automatic deployments.

#### Steps:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd my-react-app
   vercel
   ```
   Follow the prompts. Vercel will detect your React app automatically.

4. **Set Environment Variables**:
   - Go to your project on Vercel dashboard
   - Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-domain.com` (or leave empty if backend is on same domain)

5. **Connect Your Domain**:
   - Go to Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions

6. **Update Backend API URL** (if backend is separate):
   - Update `VITE_API_URL` environment variable to point to your backend

---

### Option 2: Netlify

Netlify is another great option for React apps.

#### Steps:

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   cd my-react-app
   npm run build
   netlify deploy --prod
   ```

4. **Set Environment Variables**:
   - Netlify Dashboard → Site Settings → Environment Variables
   - Add `VITE_API_URL`

5. **Connect Domain**:
   - Site Settings → Domain Management
   - Add your custom domain

---

### Option 3: Traditional VPS/Server (DigitalOcean, AWS EC2, etc.)

For full control over your deployment.

#### Steps:

1. **Build the Frontend**:
   ```bash
   cd my-react-app
   npm run build
   ```

2. **Set Environment Variables**:
   ```bash
   # Create .env file
   cp .env.example .env
   # Edit .env and set:
   # VITE_API_URL=https://yourdomain.com
   # PORT=3001
   # NODE_ENV=production
   ```

3. **Install Dependencies**:
   ```bash
   npm install --production
   ```

4. **Start the Server**:
   ```bash
   npm start
   ```

5. **Use PM2 for Process Management** (recommended):
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name "lastminutenow"
   pm2 save
   pm2 startup
   ```

6. **Setup Nginx Reverse Proxy** (recommended):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Setup SSL with Let's Encrypt**:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

8. **Configure DNS**:
   - Point your domain's A record to your server's IP address
   - Wait for DNS propagation (can take up to 48 hours)

---

### Option 4: Railway

Railway makes deployment simple with automatic deployments from Git.

#### Steps:

1. **Connect GitHub Repository** to Railway
2. **Add Environment Variables**:
   - `VITE_API_URL` = your backend URL
   - `NODE_ENV` = `production`
   - `PORT` = `3001` (or let Railway assign)
3. **Deploy** - Railway will automatically build and deploy
4. **Add Custom Domain** in Railway dashboard

---

## Important Configuration Steps

### 1. Update API URL

After deployment, make sure your frontend knows where your backend is:

**If backend and frontend are on the same domain:**
```bash
# Leave VITE_API_URL empty or set to relative path
VITE_API_URL=
```

**If backend is on a separate subdomain:**
```bash
VITE_API_URL=https://api.yourdomain.com
```

**If backend is on a different domain:**
```bash
VITE_API_URL=https://backend.yourdomain.com
```

### 2. Rebuild After Environment Changes

If you change environment variables, rebuild:
```bash
npm run build
```

### 3. CORS Configuration

Your backend already has CORS enabled (`Access-Control-Allow-Origin: *`), which works for development. For production, you may want to restrict it:

Update `backend/router.js`:
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com', // Your frontend domain
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-vendor-id',
  'Access-Control-Max-Age': '86400'
};
```

### 4. Database/Data Persistence

Your app uses JSON files for storage. For production, consider:
- Moving to a proper database (PostgreSQL, MongoDB, etc.)
- Using cloud storage (AWS S3, Google Cloud Storage)
- Setting up backups

---

## Quick Checklist

- [ ] Build the frontend (`npm run build`)
- [ ] Set environment variables (`.env` file or hosting platform)
- [ ] Deploy backend (if separate)
- [ ] Deploy frontend
- [ ] Configure DNS records
- [ ] Test API endpoints
- [ ] Test frontend functionality
- [ ] Setup SSL/HTTPS
- [ ] Configure CORS (if needed)
- [ ] Setup monitoring/logging
- [ ] Setup backups

---

## Troubleshooting

### Frontend shows blank page
- Check browser console for errors
- Verify `VITE_API_URL` is set correctly
- Check that build completed successfully
- Verify all assets are loading

### API calls failing
- Check CORS configuration
- Verify backend is running
- Check API URL in browser network tab
- Verify environment variables are set

### Domain not working
- Check DNS propagation: `nslookup yourdomain.com`
- Verify DNS records are correct
- Wait up to 48 hours for DNS propagation
- Check SSL certificate is valid

---

## Need Help?

- Check your hosting platform's documentation
- Review error logs in your hosting dashboard
- Test locally first: `npm run build && npm start`

---

**Your app should now be live on your domain! 🎉**

