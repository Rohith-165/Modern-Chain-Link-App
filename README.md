# Modern Chain Link Company - Management System

![Version](https://img.shields.io/badge/version-2.0.0-green.svg)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-blue.svg)
![PWA](https://img.shields.io/badge/frontend-PWA-orange.svg)
![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)

Full-stack order calculation, customer tracking, payment ledger, and business management application for **Modern Chain Link Company**.

---

## 🚀 Recommended Deployment Stack

- **Frontend PWA**: Deployed on [Vercel](https://vercel.com)
- **Backend FastAPI**: Deployed on [Railway](https://railway.app) / [Render](https://render.com)
- **Database**: PostgreSQL on Railway / Supabase / SQLite for local testing

---

## 🛠️ Tech Stack Overview

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3 (Custom Design System), Vanilla JS (ES6+), Font Awesome 6.5, Service Worker PWA |
| **Backend** | Python 3.11+, FastAPI 0.109+, Uvicorn, SQLAlchemy 2.0+, Pydantic v2, PyJWT, Bcrypt |
| **Database** | SQLite (Local) / PostgreSQL (Production) |
| **Testing** | Pytest, HTTPX TestClient |
| **CI/CD** | GitHub Actions (`.github/workflows/ci.yml`) |

---

## 💻 Local Development Setup

### 1. Clone Repository & Navigate to Project
```bash
git clone https://github.com/your-username/modern-chain-link-app.git
cd modern-chain-link-app
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# On Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Install Dependencies:
pip install -r requirements.txt

# Run FastAPI Server:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Live API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 3. Run Automated Tests
```bash
cd backend
pytest tests/
```

---

## 🚢 Deployment Steps

### Deploying Backend on Railway / Render:
1. Connect GitHub repository to Railway or Render.
2. Set Root Directory to `backend/`.
3. Set Environment Variables:
   - `DATABASE_URL` (PostgreSQL URL)
   - `SECRET_KEY` (Strong random key)
   - `CORS_ORIGINS` (`["https://your-vercel-app.vercel.app"]`)
4. Build / Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Deploying Frontend on Vercel:
1. Import GitHub repository into Vercel.
2. Keep root directory as `./`.
3. Update `API_BASE_URL` in `js/api.js` to your deployed Railway backend URL.

---

## 📄 License
MIT License. Developed for **Modern Chain Link Company**.
