#  AURA HUB

**Smart Personal Inventory Intelligence System**

Aura Hub is a modern, production-grade SaaS application designed to help users manage, track, and gain insights from their personal assets and inventory. 

Built with a modular Django REST Framework backend and a React + TailwindCSS frontend, it features robust JWT authentication, an append-only audit trail logging system, and a completely Dockerized architecture for seamless local development and deployment.

---

##  System Architecture

### Modular Django Monolith (Backend)
- **`core/`**: Shared utilities, foundational models (`BaseModel` with UUIDs), standard pagination, and unified exception handling.
- **`users/`**: Custom user models, JWT authentication logic, and profile management.
- **`items/`**: Core inventory logic featuring a dedicated **Service Layer** for all mutations, ensuring consistent business logic.
- **`activities/`**: An append-only audit system that strictly logs all creation, modification, and deletion events. Immutability is enforced at the ORM model level.
- **`dashboard/`**: Aggregation endpoints utilizing optimized queries (`select_related`, `annotate`) for high-performance dashboard statistics.
- **`api/`**: Versioned API routing (`/api/v1/`).

### React + TailwindCSS (Frontend)
- Built with **Vite** for lightning-fast HMR and optimized builds.
- Implements a Stripe-like, premium aesthetic using pure **TailwindCSS**.
- Global state and JWT management via a custom `AuthContext`.
- Includes custom, animated UI components (Modals, StatCards, Activity Timelines, Sidebar).

---

##  Docker Setup & Running Locally

The entire system (PostgreSQL Database, Django Backend, React Frontend) is containerized and orchestrated via Docker Compose.

### Prerequisites
- Docker
- Docker Compose

### One-Command Startup
Follow these steps to get the environment fully running:

1. **Clone and setup `.env` file**
   ```bash
   cp .env.example .env
   ```
   *(The default variables in `.env` are pre-configured to work perfectly with the local Docker setup).*

2. **Build and spin up the containers**
   ```bash
   docker compose up --build
   ```

Wait approximately 30-45 seconds for all services to initialize. The Backend container (`aura_hub_backend`) intelligently waits for the PostgreSQL database to be healthy before automatically running database migrations and collecting static files.

### Services Available At:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000/api/v1/](http://localhost:8000/api/v1/)

---

## 🌐 API Endpoints (`/api/v1/`)

### Authentication (`/auth/`)
- `POST /auth/register/` — Create new account (Generates JWT)
- `POST /auth/login/` — Login and retrieve tokens
- `POST /auth/logout/` — Blacklist refresh token
- `POST /auth/token/refresh/` — Rotate access/refresh tokens

### Users (`/users/`)
- `GET /users/me/` — Retrieve own profile
- `PUT /users/me/` — Update profile

### Items (`/items/`)
- `GET /items/` — List items (Supports pagination, search `?search=`, and filtering `?category=`)
- `POST /items/` — Create new item
- `GET /items/{id}/` — Retrieve detailed item
- `PUT /items/{id}/` — Update item
- `DELETE /items/{id}/` — Soft-delete item (Sets `status=disposed`)

*(All Item API mutations securely invoke `item_service.py` to guarantee activity logging).*

### Activities (`/activities/`)
- `GET /activities/` — Paginated history of all actions
- `GET /activities/recent/` — Unpaginated list of the last 10 actions

### Dashboard (`/dashboard/`)
- `GET /dashboard/summary/` — Returns aggregate totals (active/archived/total) and recent activities.

---

## 📝 Environment Variables (`.env`)

| Variable | Description | Default (Local) |
|----------|-------------|-----------------|
| `SECRET_KEY` | Django cryptographic key | `your-super-secret-key...` |
| `DEBUG` | Enable debug mode | `True` |
| `DB_NAME` | PostgreSQL Database name | `aura_hub` |
| `DB_USER` | PostgreSQL User | `postgres` |
| `DB_PASSWORD` | PostgreSQL Password | `postgres` |
| `DB_HOST` | Database Host (Docker service) | `db` |
| `ALLOWED_HOSTS` | Permitted backend hosts | `localhost,127.0.0.1,backend` |
| `CORS_ALLOWED_ORIGINS` | Permitted frontend origins | `http://localhost:5173,...` |

---

## 🛡️ Key Design Decisions
- **UUID Primary Keys**: Used globally across all tables to prevent enumeration attacks and simplify distributed merging if scaled.
- **Append-Only Event Logs**: Inspired by event sourcing, the Activity log strictly prevents `UPDATE` or `DELETE` SQL executions at the Django model level using customized save overrides.
- **Soft Deletion**: Items are never hard-deleted from the database; instead, their status shifts to `disposed`.

Enjoy using Aura Hub!
