# ProFix — Plumbing & Electrical Services Platform

A complete full-stack web platform for **ProFix Services**: marketing site, online
booking, customer accounts, reviews, and an admin control panel — backed by a
real **PostgreSQL** database (Neon in production).

![Stack](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Express](https://img.shields.io/badge/Express-4-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)

## Features

**Customer-facing**
- Home, Services (search + category filters), Service detail pages, Pricing, About, FAQ, Reviews, Contact
- Online booking with service picker, urgency levels, and date/time preferences
- Customer accounts: register/login (JWT), personal dashboard, booking history, cancel bookings
- Reviews: logged-in customers can publish reviews that appear instantly
- Dark/light theme, fully responsive, animated with Framer Motion

**Admin**
- Control panel (`/admin`): live stats, booking management (status workflow), contact inbox, user role management
- Seeded admin account (see Demo accounts below)

**Backend (`server/`)**
- Express + TypeScript REST API with JWT auth (bcrypt password hashing)
- PostgreSQL via `pg` — works with Neon (pooled connection string + SSL handled automatically)
- Zod validation, helmet, CORS allow-list, rate limiting, consistent `{ data }` / `{ error }` responses
- Idempotent SQL schema + seed (`server/db/schema.sql`, `server/db/seed.sql`) generated from the site catalog
- The frontend **never hard-depends on the API**: catalogs fall back to bundled data and form
  submissions are queued locally (flagged "saved offline") if the API/DB is unreachable

## Quick start

### 1. Frontend only (no database yet)

```bash
npm install
npm run dev          # http://localhost:8080
```

The site renders fully from its bundled catalog. Forms queue locally until the API is connected.

### 2. Full stack with a demo (in-memory) database

```bash
npm install
npm --prefix server install
npm --prefix server run dev:memory   # API on :4000, seeded demo data (resets on restart)
npm run dev                          # frontend on :8080 (proxies /api -> :4000)
```

### 3. Full stack with local PostgreSQL (Docker)

```bash
docker compose up -d                 # PostgreSQL on :5432 (user/pass/db: profix)
cp server/.env.example server/.env   # set DATABASE_URL=postgresql://profix:profix@localhost:5432/profix
npm run db:setup                     # schema + seed + admin user
npm run server:dev                   # API on :4000
npm run dev                          # frontend on :8080
```

## Connecting Neon (production database)

1. Create a project at [neon.tech](https://neon.tech) and copy the **pooled** connection string
   (host contains `-pooler`, ends with `?sslmode=require`).
2. Put it in `server/.env` (never commit this file):
   ```
   DATABASE_URL=postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=<long random string>
   ```
3. Push schema + data to Neon:
   ```bash
   npm run db:setup
   ```
4. Verify: `curl http://localhost:4000/api/health` → `"db":"connected"`.
5. Start the API with `npm run server:start` (after `npm run server:build`) and point
   `VITE_API_URL` at it in production, or keep the `/api` proxy.

_Alternative:_ paste `server/db/schema.sql` then `server/db/seed.sql` into the Neon SQL Editor,
then run `npm run db:seed` once so the admin password gets hashed and stored.

## Demo accounts (after seeding)

| Role     | Email                    | Password     |
|----------|--------------------------|--------------|
| Admin    | admin@profixservices.com | Admin@12345  |
| Customer | *(register your own at /register)* | — |

Change `ADMIN_PASSWORD` / `JWT_SECRET` in `server/.env` before going live.

## API reference (base: `/api`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | Service + DB status |
| GET | `/services?category=&q=` | — | List services |
| GET | `/services/:slug` | — | Service detail |
| POST | `/bookings` | optional | Create booking (attaches user if logged in) |
| GET | `/bookings/me` | user | My bookings |
| PATCH | `/bookings/:id/cancel` | owner/admin | Cancel booking |
| GET | `/bookings` | admin | All bookings (filter `?status=&q=`) |
| PATCH | `/bookings/:id` | admin | Update status / assignment / notes |
| POST | `/auth/register` `/auth/login` | — | Returns JWT + user |
| GET/PATCH | `/auth/me` | user | Profile read/update |
| GET | `/testimonials` | — | Approved reviews |
| POST | `/testimonials` | user | Publish a review |
| GET | `/faqs`, `/pricing`, `/stats` | — | Catalog data |
| POST | `/contact`, `/newsletter` | — | Contact form / subscribe |
| GET | `/contact`, PATCH `/contact/:id/read` | admin | Inbox |
| GET | `/admin/stats` | admin | Dashboard counters |
| GET | `/admin/users`, PATCH `/admin/users/:id/role` | admin | User management |
| POST/PATCH/DELETE | `/services`, `/services/:id` | admin | Service CRUD (delete = deactivate) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Frontend dev server (:8080) |
| `npm run build` | Type-check + production build |
| `npm run server:dev` | API with hot reload (:4000) |
| `npm run server:build` / `server:start` | API production build/run |
| `npm run db:migrate` / `db:seed` / `db:setup` | Apply schema / seed data / both |
| `npm --prefix server run test:smoke` | Schema+seed smoke test (in-memory PG) |
| `npm --prefix server run test:e2e` | Full HTTP API test suite (16 checks) |
| `npm --prefix server run dev:memory` | API + in-memory demo DB |

## Project structure

```
src/                  React frontend (pages, components, lib/api.ts API client)
server/
  src/                Express API (routes, middleware, db pool)
  db/                 schema.sql + seed.sql (Neon-ready)
  scripts/            e2e/smoke tests, demo server, seed generator
docker-compose.yml    Local PostgreSQL for development
```

## Tech stack

React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion ·
Express, node-postgres (`pg`), Zod, bcryptjs, JWT · PostgreSQL (Neon)

## License

Open source. **Web Loom copyright attribution must be included in the footer of
every page** (already present in `src/components/layout/Footer.tsx`).
