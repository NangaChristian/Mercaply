# Hostinger Deployment Guide

This app is a full-stack application (Vite Frontend + Express Backend). Depending on your Hostinger plan, you will follow a different set of instructions.

## Option 1: Hostinger Shared / Premium Web Hosting (Frontend Only)
If you only have standard shared hosting (which does not support Node.js/Express backends natively), you can deploy the frontend as a Static Single Page Application (SPA). The app already relies heavily on Supabase for the backend, so the frontend-only version works perfectly for most features.

### Steps:
1. Open your terminal or command prompt.
2. Build the app for production:
   ```bash
   npm run build
   ```
3. Locate the `dist` folder that was generated.
4. Log into your **Hostinger hPanel**.
5. Go to **Files > File Manager**.
6. Open the `public_html` directory of your domain.
7. Upload **all the contents** of the `dist/` folder directly into `public_html`.
   - *Note: We have already added a `.htaccess` file which handles routing for the single-page application so your React Router links will work properly when refreshed.*
8. Add your environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) to your production build or set them securely on your hosting provider.

---

## Option 2: Hostinger VPS / CyberPanel / Node.js Hosting (Full-Stack)
If you have a VPS or Hostinger's Node.js hosting, you can run the full Express + Vite application.

### Steps:
1. **Upload your code** to the server via SSH or FTP.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Build the application**:
   ```bash
   npm run build
   ```
   This will bundle your Vite frontend and compile the Express `server.ts` into a self-contained `dist/server.cjs` file.
4. **Create a `.env` file** in your root directory containing your production variables:
   ```env
   NODE_ENV=production
   PORT=3000
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ```
5. **Start the server**:
   - If using **PM2** (Recommended for Hostinger VPS):
     ```bash
     npm install -g pm2
     pm2 start ecosystem.config.cjs
     pm2 save
     pm2 startup
     ```
   - If using standard **Node**:
     ```bash
     npm start
     ```
6. Setup a **Reverse Proxy** (Nginx/Apache) to point port 80/443 to `http://localhost:3000`.

## Notes
- The built static files include an `index.html` and assets. For full-stack deployment, `server.cjs` handles serving these files dynamically while also providing the `/api/*` endpoints.
