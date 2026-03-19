# Task Management System

## Overview
Task Management System is a full-stack monorepo application for managing personal tasks with secure authentication, protected routes, and task lifecycle operations (create, read, update, delete, and status toggle).

## Architecture
- Monorepo using npm workspaces
- Backend API in `apps/api`
- Frontend application in `apps/web`
- Shared workspace placeholders in `packages/`

## Tech Stack
- Backend: Express, TypeScript, Prisma, PostgreSQL
- Frontend: Next.js (App Router), TypeScript, React Query, Tailwind CSS
- Authentication: JWT access token + refresh token rotation with HTTP-only cookies
- Testing: Vitest, Supertest

## Key Features
- User registration, login, logout, refresh session
- Protected dashboard access
- Task CRUD operations with pagination and filtering
- Optimistic updates for task interactions
- Health endpoint for runtime checks

## Project Structure
```text
.
├── apps
│   ├── api
│   │   ├── prisma
│   │   ├── src
│   │   └── tests
│   └── web
│       ├── src
│       └── public
├── docs
│   ├── login.png
│   ├── register.png
│   └── dashboard.png
├── packages
│   ├── config
│   └── types
├── package.json
└── README.md
```

## Environment Configuration
Create local environment files from examples:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

Minimum required variables:

Backend (`apps/api/.env`):
- `PORT`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ALLOWED_ORIGIN`

Frontend (`apps/web/.env.local`):
- `NEXT_PUBLIC_API_URL`

## Installation
```bash
npm install
```

## Database Setup
```bash
npm run prisma:generate -w @tms/api
npm run prisma:migrate -w @tms/api
```

## Run the Application
Development:
```bash
npm run dev
```

Lightweight development mode:
```bash
npm run dev:light
```

Production build:
```bash
npm run build
```

Production start:
```bash
npm run start
```

## API Endpoints (Summary)
Authentication:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

Tasks:
- `GET /tasks`
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `PATCH /tasks/:id/toggle`

System:
- `GET /health`

## Screenshots
### Login
![Login Page](docs/login.png)

### Register
![Register Page](docs/register.png)

### Dashboard
![Dashboard](docs/dashboard.png)

## Testing
```bash
npm run test -w @tms/api
npm run test -w @tms/web
```

## Production Notes
- Do not commit `.env` files.
- Ensure database migrations are applied before starting the API.
- Keep `ALLOWED_ORIGIN` aligned with frontend host/port in local development.
- Generate Prisma client after schema changes.
