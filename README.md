# Task Management System

A production-style full-stack task manager monorepo with secure JWT auth, task CRUD, and a modern Next.js dashboard.

## Tech Stack
- Backend: Express, TypeScript, Prisma, PostgreSQL
- Frontend: Next.js (App Router), TypeScript, React Query, Tailwind CSS
- Tooling: npm workspaces, Vitest

## Features
- Access + refresh token authentication
- Protected dashboard and session bootstrap
- Task CRUD with pagination and filtering
- Optimistic task mutations with React Query
- Health endpoint for runtime checks

## Folder Structure
```text
apps/
  api/        # Express + Prisma backend
  web/        # Next.js frontend
packages/
  config/     # shared config placeholder
  types/      # shared types placeholder
```

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment files:
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.local.example apps/web/.env.local
   ```
3. Generate Prisma client and run migrations:
   ```bash
   npm run prisma:generate -w @tms/api
   npm run prisma:migrate -w @tms/api
   ```

## Run
- Development (both apps):
  ```bash
  npm run dev
  ```
- Lightweight development mode:
  ```bash
  npm run dev:light
  ```
- Production build:
  ```bash
  npm run build
  ```
- Production start:
  ```bash
  npm run start
  ```

## API Endpoints (Overview)
- Auth:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
  - `GET /auth/me`
- Tasks:
  - `GET /tasks`
  - `POST /tasks`
  - `GET /tasks/:id`
  - `PATCH /tasks/:id`
  - `DELETE /tasks/:id`
  - `PATCH /tasks/:id/toggle`
- Health:
  - `GET /health`

## Screenshots
- Add dashboard screenshot here
- Add login/register screenshot here

## Notes
- Never commit `.env` files.
- Prisma client must be generated after schema changes.
- API requires `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `DATABASE_URL`.
