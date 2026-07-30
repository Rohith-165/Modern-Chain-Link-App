# How to Get a Live Public URL (Step-by-Step Hosting Guide)

Follow this step-by-step checklist to deploy **Modern Chain Link Company** to free-tier cloud platforms (Vercel + Railway + PostgreSQL).

---

## 📋 Step-by-Step Deployment Walkthrough

### Step 1 – Create & Push to GitHub Repository
1. Initialize Git and commit all project files:
   ```bash
   git init
   git add .
   git commit -m "Initial release v2.0.0"
   ```
2. Create a new GitHub repository named `Modern-chain-link-App`.
3. Push codebase to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/Modern-chain-link-App.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2 & 3 – Create Railway Project & PostgreSQL Database
1. Sign in to [Railway.app](https://railway.app) using your GitHub account.
2. Click **New Project** → **Provision PostgreSQL**.
3. Copy the generated `DATABASE_URL` from the PostgreSQL service **Variables** tab.

---

### Step 4 & 5 – Deploy FastAPI Backend on Railway
1. Click **New** → **GitHub Repo** → Select `Modern-chain-link-App`.
2. Select root directory as `/backend`.
3. In **Variables**, add the following environment variables:
   - `DATABASE_URL` = `postgresql://...` (copied from Step 3)
   - `SECRET_KEY` = `generate-a-secure-random-64-char-string`
   - `CORS_ORIGINS` = `["https://your-project.vercel.app"]`
4. Click **Deploy**. Railway will build using `backend/Procfile`.
5. Under **Settings** → **Networking**, click **Generate Domain**.
6. Copy your public backend URL (e.g., `https://modern-chain-link-api.up.railway.app`).
7. Verify health endpoints:
   - Health Check: `https://modern-chain-link-api.up.railway.app/health`
   - Interactive Docs: `https://modern-chain-link-api.up.railway.app/docs`

---

### Step 6 & 7 – Deploy Frontend PWA on Vercel
1. Sign in to [Vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New** → **Project** → Import `Modern-chain-link-App`.
3. Keep Framework Preset as **Other** and Root Directory as `./`.
4. Click **Deploy**.
5. Copy your live frontend URL (e.g., `https://modern-chain-link.vercel.app`).

---

### Step 8 & 9 – Connect Frontend & Backend Live Environment
1. Update `API_BASE_URL` in [js/api.js](file:///D:/Modern-chain-link-App/js/api.js):
   ```javascript
   const API_BASE_URL = "https://modern-chain-link-api.up.railway.app/api/v1";
   ```
2. Commit and push the change to GitHub:
   ```bash
   git add js/api.js
   git commit -m "Connected frontend to production Railway backend"
   git push origin main
   ```
3. Vercel will automatically redeploy the updated frontend!

---

## 🎯 Final Live Production Endpoints

- **Frontend App**: `https://modern-chain-link.vercel.app`
- **Backend API**: `https://modern-chain-link-api.up.railway.app`
- **API Swagger Docs**: `https://modern-chain-link-api.up.railway.app/docs`
- **Health Endpoint**: `https://modern-chain-link-api.up.railway.app/health`
