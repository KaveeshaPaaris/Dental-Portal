# Dental-Portal Architecture & Hosting Report

This report provides a comprehensive overview of the `Dental-Portal` project's architecture, directory structure, technology stack, and hosting considerations. This document is designed to give another AI or developer a complete understanding of the system's current state and deployment patterns.

## 1. Project Structure & Monorepo Setup

The project is structured as a **Monorepo** managed by **Turborepo** and utilizing npm workspaces. The root directory contains standard monorepo configuration files (`turbo.json`, `package.json`) and the main codebase is divided into two primary directories: `apps/` and `supabase/`.

### Directory Layout

```text
Dental-Portal/
├── apps/
│   ├── admin-dashboard/   # Internal admin portal (Next.js)
│   ├── dental-api/        # Backend REST API (Node.js/Express)
│   └── public-web/        # Public facing website (Next.js)
├── supabase/              # Database schema, migrations, and seed data
│   ├── migrations/
│   └── dummy_data.sql
├── package.json           # Root workspace configuration
└── turbo.json             # Turborepo build pipeline configuration
```

## 2. Applications (The `apps/` Directory)

The system consists of three distinct applications, each serving a specific role within the platform.

### A. Admin Dashboard (`apps/admin-dashboard`)
- **Type**: Frontend Web Application
- **Framework**: Next.js 16.2.7 (App Router) & React 19
- **Styling**: Tailwind CSS v4, PostCSS
- **State/Data Fetching**: `@tanstack/react-query`, Axios
- **UI Components**: `@dnd-kit` (drag and drop), `lucide-react` (icons), `react-day-picker` (dates), `@tiptap` (rich text editor)
- **Forms & Validation**: `react-hook-form`, `zod`
- **Database/Auth Client**: `@supabase/supabase-js`
- **Purpose**: Provides an interface for clinic administrators and staff to manage appointments, patients, and clinic operations.

### B. Public Web (`apps/public-web`)
- **Type**: Frontend Web Application
- **Framework**: Next.js 16.2.7 (App Router) & React 19
- **Styling**: Tailwind CSS v4, PostCSS, Framer Motion (for animations)
- **Forms & Validation**: `react-hook-form`, `zod`, `react-phone-number-input`
- **Database/Auth Client**: `@supabase/supabase-js`
- **Purpose**: The public-facing website for patients to discover services, learn about the clinic, and potentially book appointments. Emphasizes SEO and performant animations.

### C. Dental API (`apps/dental-api`)
- **Type**: Backend REST API
- **Framework**: Node.js & Express (`express`) in TypeScript
- **Security & Middleware**: `helmet`, `cors`, `express-rate-limit`, `morgan`
- **Authentication**: JWT (`jsonwebtoken`) & Supabase Auth
- **Database Client**: `@supabase/supabase-js`
- **3rd Party Integrations**:
  - `@google/genai` (Gemini API for AI features/chatbots)
  - `twilio` (SMS notifications)
  - `resend` (Email notifications)
- **Purpose**: A centralized backend service to handle complex business logic, third-party API integrations (AI, SMS, Email), and operations that shouldn't be exposed directly to the frontend clients.

## 3. Database & Backend Services (`supabase/`)

The project heavily relies on **Supabase** as its Backend-as-a-Service (BaaS).
- **Relational Database**: PostgreSQL (configured via Supabase).
- **Migrations**: Found in `supabase/migrations/`, indicating structured database version control.
- **Seed Data**: `supabase/dummy_data.sql` is used to populate the database for local development and testing.
- **Client Access**: All three apps use `@supabase/supabase-js` to interact with the database, authentication, and potentially storage.

## 4. Hosting & Deployment Configuration

Currently, there are **no explicit deployment configuration files** (e.g., `vercel.json`, `Dockerfile`, `fly.toml`, `docker-compose.yml`) committed to the repository. This suggests either a reliance on zero-config deployment platforms or that the deployment pipeline is managed externally.

Based on the technology stack, the standard hosting strategy for this architecture is:

### Frontend Hosting (Next.js Apps)
The `admin-dashboard` and `public-web` applications are standard Next.js apps. They are best suited for Edge network hosting platforms that natively support Next.js SSR/SSG capabilities:
- **Primary Recommendation**: **Vercel** (Seamless integration with Turborepo and Next.js)
- **Alternatives**: AWS Amplify, Netlify, Cloudflare Pages.

### Backend API Hosting (Node.js/Express)
The `dental-api` requires a persistent Node.js runtime.
- **Primary Recommendation**: **Render**, **Railway**, or **Fly.io** (Easy PaaS deployments for Node.js apps)
- **Alternatives**: AWS ECS/Fargate, Google Cloud Run, DigitalOcean App Platform.
- **Note**: A `Dockerfile` could be introduced in `apps/dental-api` to containerize the service for platform-agnostic deployment.

### Database & Auth Hosting
- **Supabase Cloud**: The database, authentication, and edge functions are natively hosted on Supabase's managed cloud platform.

## Summary for AI Assistants
When reasoning about this codebase:
1. **Turborepo**: Use `turbo run build` or `turbo run dev` from the root to manage tasks across workspaces.
2. **Next.js 16/React 19**: Be aware of App Router conventions, Server Components vs. Client Components (`"use client"`), and React 19 specific hooks in the frontends.
3. **Environment Variables**: Ensure `.env` (API) and `.env.local` (Next.js apps) are properly populated with Supabase URLs/Keys, Gemini API Keys, and Twilio/Resend credentials before testing.
4. **Supabase**: Direct DB calls happen via the Supabase client. Look out for Row Level Security (RLS) policies which typically handle authorization at the database level.
