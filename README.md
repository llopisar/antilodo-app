# Antilodo Operations App (Scaffold)

Production-oriented scaffold for a restaurant operations web app using Next.js App Router, TypeScript, Tailwind, shadcn/ui, Prisma, PostgreSQL, and Auth.js (NextAuth credentials).

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS + shadcn/ui components
- Prisma + PostgreSQL
- Auth.js (NextAuth) with role-aware sessions

## Implemented in this scaffold

- Public landing page at `/`
- Login route at `/login`
- Protected operational route groups
- Role-based route protection middleware
- Role-based navigation and dashboard shells
- Prisma schema for operational entities
- Seed script with realistic demo users and demo operational data

## Roles

- Head Chef
- Sous Chef
- Floor Manager
- Manager
- General Manager

## Demo Users

All demo users use password: `DemoPass123!`

- `head.chef@antilodo.app`
- `sous.chef@antilodo.app`
- `floor.manager@antilodo.app`
- `manager@antilodo.app`
- `gm@antilodo.app`

## Local Setup

1. Copy env values:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Push schema and seed data:

```bash
npm run db:push
npm run db:seed
```

5. Run app:

```bash
npm run dev
```

## Structure

- `app/(public)` public pages
- `app/(protected)` protected route shells and dashboards
- `app/api/auth/[...nextauth]` auth endpoints
- `lib/auth.ts` auth configuration
- `lib/permissions.ts` role and route guards
- `prisma/schema.prisma` data model
- `prisma/seed.ts` demo users and operations data
