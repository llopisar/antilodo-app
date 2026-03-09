# Antilodo Operations App

Production-oriented restaurant operations web app built with Next.js App Router, TypeScript, Tailwind, shadcn/ui, Prisma, PostgreSQL, and Auth.js credentials.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL
- Auth.js (credentials)

## Included

- Public landing page (`/`)
- Login route (`/login`)
- Role-protected operational routes
- Role-based dashboards
- Core modules: orders, services, schedules, shift notes, tasks, alerts
- Management overview and activity/audit history
- Realistic interconnected demo seed data

## Roles

- Head Chef
- Sous Chef
- Floor Manager
- Manager
- General Manager

## Demo Credentials

All demo users share the same password:

- Password: `DemoPass123!`

Users:

- Head Chef: `head.chef@antilodo.app`
- Sous Chef: `sous.chef@antilodo.app`
- Floor Manager: `floor.manager@antilodo.app`
- Manager: `manager@antilodo.app`
- General Manager: `gm@antilodo.app`

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env
```

3. Generate Prisma client

```bash
npm run prisma:generate
```

4. Push schema and seed demo environment

```bash
npm run db:push
npm run db:seed
```

5. Start development server

```bash
npm run dev
```

## Demo Environment Notes

Seed data is coherent and interconnected across all modules:

- Multiple services (completed, active, planned)
- Orders linked to services with realistic statuses
- Schedules assigned by role and service window
- Shift notes linked to services/schedules and authored by role users
- Tasks linked to users/services/orders
- Alerts linked to reporter/owner/service/order/task when relevant
- Activity history entries with valid entity references and before/after payloads

## Quick Test Checklist

1. Sign in as `head.chef@antilodo.app` and verify kitchen modules are editable.
2. Sign in as `floor.manager@antilodo.app` and verify floor modules are editable.
3. Sign in as `manager@antilodo.app` and verify supervision-oriented views and audit history.
4. Sign in as `gm@antilodo.app` and verify high-level oversight + activity filtering.

## Structure

- `app/(public)` public pages
- `app/(protected)` protected application routes
- `features/operations` module actions, queries, permissions, validation
- `lib/permissions.ts` route and role permission matrix
- `prisma/schema.prisma` data model
- `prisma/seed.ts` demo users + operational dataset
