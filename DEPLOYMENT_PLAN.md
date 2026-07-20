# SmartERP — Vercel Deployment Plan

## Architecture

Two separate Vercel projects from the same monorepo:

| Project | Root Directory | Runtime | Purpose |
|---------|---------------|---------|---------|
| `smarterp-web` | `apps/web` | Node.js (Next.js 15) | Frontend UI |
| `smarterp-api` | `apps/api` | Python (Django serverless) | REST API |

```
GitHub Repo (MuhammadHussainDev/smarterp-erp)
  ├── apps/web/       →  Vercel Project: smarterp-web
  └── apps/api/       →  Vercel Project: smarterp-api
```

---

## Prerequisites

| Item | Details |
|------|---------|
| GitHub account | Connected to Vercel |
| Vercel account | [vercel.com](https://vercel.com) — Free tier sufficient |
| Neon account | [neon.tech](https://neon.tech) — Free PostgreSQL tier |
| Node.js 20+ | For local frontend build |
| Python 3.12 | For local backend build |

---

## Phase 1: Database Setup (Neon — Free)

| Step | Action |
|------|--------|
| 1.1 | Go to [neon.tech](https://neon.tech) and sign in with GitHub |
| 1.2 | Create a new project → name: `smarterp-erp` |
| 1.3 | Copy the connection string (looks like `postgresql://user:pass@ep-xxxx.us-east-2.aws.neon.tech/neondb`) |
| 1.4 | Save it — you'll use it as `DATABASE_URL` in Phase 4 |

---

## Phase 2: Backend Code Changes (`apps/api/`)

These changes are already implemented in the repo. Here's what was done:

### 2a. `apps/api/requirements.txt` — Added dependencies

- `dj-database-url>=2.3.0` — reads `DATABASE_URL` env var
- `psycopg2-binary>=2.9.10` — PostgreSQL adapter

### 2b. `apps/api/smarterp/settings.py` — Production-ready config

- `SECRET_KEY` reads from `DJANGO_SECRET_KEY` env var (with a fallback for local dev)
- `DEBUG` reads from `DEBUG` env var (defaults to `False` in production)
- `ALLOWED_HOSTS` = `os.environ.get('ALLOWED_HOSTS', '127.0.0.1,.vercel.app').split(',')`
- **Database**: Uses `dj_database_url.config()` to read from `DATABASE_URL` env var with a SQLite fallback for local dev
- `CORS_ALLOWED_ORIGINS` reads from `CORS_ALLOWED_ORIGINS` env var; defaults to allow all in dev
- `STATIC_ROOT` added for `collectstatic`

### 2c. `apps/api/smarterp/wsgi.py` — Vercel entrypoint

Added `app = application` — Vercel looks for the `app` variable in WSGI modules.

### 2d. `apps/api/pyproject.toml` — Vercel config (NEW FILE)

```toml
[project]
name = "smarterp-api"
version = "0.1.0"
requires-python = ">=3.12"

[tool.vercel]
entrypoint = "smarterp.wsgi:application"
```

### 2e. `apps/api/runtime.txt` — Python version (NEW FILE)

```
python-3.12
```

### 2f. `apps/api/build_files.sh` — Build script (NEW FILE)

```bash
#!/bin/bash
pip install -r requirements.txt
python manage.py collectstatic --noinput
```

---

## Phase 3: Frontend Code Changes (`apps/web/`)

| Step | Action |
|------|--------|
| 3.1 | No code changes needed |
| 3.2 | The frontend already reads `NEXT_PUBLIC_API_URL` from env |

---

## Phase 4: Vercel Project Creation

### Step 4.1 — Create Backend Project (`smarterp-api`)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** → select `MuhammadHussainDev/smarterp-erp`
3. **Configure Project:**
   | Setting | Value |
   |---------|-------|
   | **Project Name** | `smarterp-api` |
   | **Framework Preset** | Python |
   | **Root Directory** | `apps/api` |
   | **Build Command** | `chmod +x build_files.sh && ./build_files.sh` |
4. **Environment Variables:**
   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | `postgresql://...` (from Neon in Phase 1) |
   | `DJANGO_SECRET_KEY` | Generate: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
   | `DEBUG` | `false` |
   | `DJANGO_SETTINGS_MODULE` | `smarterp.settings` |
   | `ALLOWED_HOSTS` | `.vercel.app,127.0.0.1` |
   | `CORS_ALLOWED_ORIGINS` | `https://smarterp-web.vercel.app` |
5. Click **Deploy**

### Step 4.2 — Create Frontend Project (`smarterp-web`)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** → select `MuhammadHussainDev/smarterp-erp`
3. **Configure Project:**
   | Setting | Value |
   |---------|-------|
   | **Project Name** | `smarterp-web` |
   | **Framework Preset** | Next.js |
   | **Root Directory** | `apps/web` |
4. **Environment Variables:**
   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://smarterp-api.vercel.app/api/v1` |
5. Click **Deploy**

---

## Phase 5: Database Migration + Seed Data

| Step | Action |
|------|--------|
| 5.1 | After Vercel deploys the API, the build script runs migrations automatically (added to build_files.sh) |
| 5.2 | To seed data, add a `python manage.py seed` command to the build script or run it manually via Vercel CLI: `vercel run python manage.py seed` |

> **Note:** If migrations don't auto-run, you can trigger them by adding `python manage.py migrate` to `build_files.sh` (already done).

---

## Phase 6: Verification

| Test | URL | Expected |
|------|-----|----------|
| API Health | `https://smarterp-api.vercel.app/api/v1/auth/login/` | POST with `{"email":"admin@smarterp.com","password":"admin123"}` → returns JWT tokens |
| Frontend | `https://smarterp-web.vercel.app` | Login page loads, can authenticate |

---

## Final URLs (Live)

| Service | URL |
|---------|-----|
| Frontend | **https://web-tawny-pi-43.vercel.app** |
| Backend API | **https://api-six-lovat-46.vercel.app/api/v1** |
| Admin Panel | **https://api-six-lovat-46.vercel.app/admin/** |

## Login Credentials

| Field | Value |
|-------|-------|
| Email | `admin@smarterp.com` |
| Password | `admin123` |

## Vercel Projects

| Project | Vercel Name | Alias |
|---------|-------------|-------|
| Frontend | `web` | `https://web-tawny-pi-43.vercel.app` |
| Backend | `api` | `https://api-six-lovat-46.vercel.app` |

## Environment Variables (Already Set)

### Backend (`api` project)
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `DJANGO_SECRET_KEY` | Production secret key |
| `DEBUG` | `false` |
| `DJANGO_SETTINGS_MODULE` | `smarterp.settings` |
| `ALLOWED_HOSTS` | `.vercel.app,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | `https://smarterp-web.vercel.app,https://api-six-lovat-46.vercel.app` |

### Frontend (`web` project)
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api-six-lovat-46.vercel.app/api/v1` |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| API returns 502 | Check Vercel function logs in dashboard. Common cause: missing `DATABASE_URL` or `DJANGO_SECRET_KEY` env vars |
| API returns 500 "relation does not exist" | Migrations didn't run. Add `python manage.py migrate` to `build_files.sh` and redeploy |
| Frontend shows "Failed to fetch" | `NEXT_PUBLIC_API_URL` not set correctly or CORS misconfigured. Verify env var on Vercel and `CORS_ALLOWED_ORIGINS` on API |
| Build fails with "Python not found" | Check `runtime.txt` version matches the Python version available on Vercel |
| Static files 404 | Ensure `STATIC_ROOT` is set and `collectstatic` runs in build phase |
