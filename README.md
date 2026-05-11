# AURA HUB

Smart Personal Inventory Intelligence System.

AURA HUB is a production-oriented Django REST Framework and React monorepo for tracking personal inventory, logging all item actions, and exposing dashboard analytics. The backend follows a modular app architecture with service-layer business logic, JWT authentication, soft-deletion for items, and append-only activity logs.

## Tech Stack

- Backend: Django, Django REST Framework, SimpleJWT, django-filter
- Frontend: React, Vite, TailwindCSS
- Database: PostgreSQL (local/prod), SQLite in CI
- Background Jobs: Celery with Redis broker/result backend
- Caching: Django cache (locmem by default), dashboard summary caching
- DevOps: Docker Compose, GitHub Actions CI

## Project Structure

```text
backend/
  api/            # API route composition
  config/         # Django settings, urls, wsgi/asgi, celery app
  core/           # Base models, pagination, shared utilities
  users/          # Auth, user profile
  items/          # Item CRUD, soft-delete, service layer
  activities/     # Activity logs, read/append-only API
  dashboard/      # Summary and aggregation endpoints
frontend/         # React + Vite application
.github/workflows # CI workflow definitions
docker-compose.yml
```

## API Base URLs

- Versioned: `/api/v1/`
- Compatible alias: `/api/`

## Core Backend Features

- JWT-based authentication with register, login, refresh, logout
- Item lifecycle management with service-layer mutations
- Soft delete behavior (`disposed` status) instead of hard delete
- Activity logs with append-only model behavior
- Activities API supports list, retrieve, and create; update/delete methods are not allowed
- Dashboard summary endpoint with aggregated inventory stats and recent activity
- Optional async background processing for activity logging and dashboard precomputation

## API Endpoints

### Authentication

- `POST /auth/register/`
- `POST /auth/login/`
- `POST /auth/logout/`
- `POST /auth/token/refresh/`

### Users

- `GET /users/me/`
- `PUT /users/me/` (partial update supported by view logic)

### Items

- `GET /items/`
- `POST /items/`
- `GET /items/{id}/`
- `PUT /items/{id}/`
- `PATCH /items/{id}/`
- `DELETE /items/{id}/` (soft delete)

### Activities

- `GET /activities/`
- `POST /activities/` (append-only insert)
- `GET /activities/{id}/`
- `GET /activities/recent/`

### Dashboard

- `GET /dashboard/summary/`

## Background Tasks (Celery)

Configured Celery integration:

- `backend/config/celery.py` initializes Celery and autodiscovers tasks.
- `activities.tasks.async_activity_log_task` for asynchronous log creation.
- `dashboard.tasks.async_dashboard_aggregation_task` for async summary precompute/caching.

Redis defaults:

- `CELERY_BROKER_URL=redis://localhost:6379/0`
- `CELERY_RESULT_BACKEND=redis://localhost:6379/0`

Safety behavior:

- If Celery/Redis is unavailable, activity logging falls back to synchronous creation.
- CI uses eager task mode and does not require external Redis.

## Environment Configuration

Key backend environment variables:

- `SECRET_KEY`
- `DEBUG`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `CORS_ALLOWED_ORIGINS`
- `CELERY_BROKER_URL`
- `CELERY_RESULT_BACKEND`

Database selection:

- If `CI=true` -> SQLite in-memory (`:memory:`)
- Else -> PostgreSQL via `DB_*` variables

## Local Development

### Prerequisites

- Docker
- Docker Compose

### Run with Docker

```bash
cp .env.example .env
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api/v1/`

## Testing

Backend test suite includes API-level coverage for:

- Users auth flows
- Items CRUD and soft-delete behavior
- Activity log generation and append-only API behavior
- Dashboard summary aggregation and auth

Run tests from backend:

```bash
python manage.py test
```

## CI Pipeline

GitHub Actions workflow: `.github/workflows/ci.yml`

On each push and pull request to `main`, CI runs:

1. Backend job
   - Python 3.11
   - Dependency install from `backend/requirements.txt`
   - Django checks and tests
   - `CI=true` for SQLite-based test DB behavior
2. Frontend job
   - Node 18
   - `npm install`
   - `npm run build`

Both backend and frontend jobs run in parallel.

## Design Notes

- UUID primary keys across domain models
- Service-layer mutation path for item write operations
- Append-only activity log model with immutability guard
- Read/append-only activities API surface
- Hybrid sync/async behavior to preserve reliability in environments without Redis
