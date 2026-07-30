# Modern Chain Link Company - Production Deployment & Architecture Guide

This document provides complete technical, operational, and maintenance guidelines for **Modern Chain Link Company (v2.0.0)**.

---

## 1. System Architecture Overview

```
                        +--------------------------------+
                        |   Progressive Web App (PWA)    |
                        | (HTML5 / Vanilla CSS3 / ES6)   |
                        +---------------+----------------+
                                        |
                                        | HTTP / REST (JWT Auth)
                                        v
                        +---------------+----------------+
                        |  FastAPI Backend App (v2.0.0)  |
                        |   (Uvicorn / Gunicorn Server)  |
                        +---------------+----------------+
                                        |
                   +--------------------+--------------------+
                   |                                         |
                   v                                         v
        +----------+----------+                   +----------+----------+
        |   SQLite / MySQL    |                   |   Rotating Logger    |
        |  Database (mclc.db) |                   |    (logs/app.log)    |
        +---------------------+                   +---------------------+
```

---

## 2. API Reference Summary

Base URL: `http://localhost:8000/api/v1`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/health` | Server status check | No |
| **POST** | `/api/v1/auth/login` | Admin authentication & JWT token generation | No |
| **GET** | `/api/v1/dashboard/summary` | Dashboard statistics & counters | Yes |
| **GET** | `/api/v1/orders` | List and search orders | Yes |
| **POST** | `/api/v1/orders` | Create a new order | Yes |
| **GET** | `/api/v1/orders/{order_id}` | Fetch order details | Yes |
| **PUT** | `/api/v1/orders/{order_id}` | Update order details/status | Yes |
| **GET** | `/api/v1/orders/{order_id}/invoice` | HTML Tax Invoice with GST breakdown | Yes |
| **GET** | `/api/v1/customers` | Customer history aggregation | Yes |
| **POST** | `/api/v1/payments/{order_id}` | Record payment against order | Yes |
| **GET** | `/api/v1/profile/company` | Fetch company profile & GST info | Yes |
| **PUT** | `/api/v1/profile/company` | Update company profile details | Yes |

---

## 3. Production Deployment Guide

### Environment Configuration (`.env`)

```env
PROJECT_NAME="Modern Chain Link Company API"
VERSION="2.0.0"
API_V1_STR="/api/v1"
SECRET_KEY="REPLACE_WITH_A_HIGH_ENTROPY_RANDOM_SECRET_KEY_FOR_PROD"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL="sqlite:///./mclc.db"
CORS_ORIGINS=["https://app.modernchainlink.com"]
```

### Server Command (Uvicorn / Gunicorn)

```bash
# Development
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production (Multi-worker Gunicorn)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```

---

## 4. Maintenance & Automated Testing

- **Run Pytest Suite**:
  ```bash
  python -m pytest tests/
  ```
- **Automated Database Backup**:
  ```bash
  python scripts/backup.py
  ```
- **System Maintenance & Log Cleanup**:
  ```bash
  python scripts/maintenance.py
  ```
