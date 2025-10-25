# NovaPulse Platform

NovaPulse is a production-ready full-stack starter built with Next.js 15, Prisma, NextAuth.js, Socket.io, and Tailwind CSS. It ships with an enterprise-grade admin console, a polished marketing site, authenticated client dashboards, and a real-time collaboration layer that keeps experiences in sync across audiences.

> **Tip:** After running migrations, create an initial Admin user via `npm run prisma:studio` or a SQL insert so you can access the admin console immediately.

## Features

### Admin Console
- Role-based access (Admin & Manager) backed by NextAuth.js with JWT sessions
- Live analytics dashboard powered by Prisma queries and Socket.io broadcasts
- User management with search, filtering, bulk actions, CSV export, and CRUD APIs
- Content management system with rich text editing, scheduling, and drag-and-drop image uploads
- Settings panel for branding, email configuration, API keys, and notification preferences
- Real-time notifications, activity feed, and analytics updates shared across admin sessions

### Client Experience
- Marketing pages (home, about, products, contact) consuming dynamic content managed in the admin console
- Auth flows (register, login) with password hashing and automatic session creation
- Authenticated user dashboard with personalized content, live notifications, and quick actions
- Profile management with secure password updates and avatar management
- Responsive layouts with theme-aware design tokens (light & dark mode)

### Platform Infrastructure
- PostgreSQL database schema managed by Prisma
- RESTful API routes with Zod validation, pagination helpers, and structured JSON responses
- Socket.io server and client integrations for bidirectional real-time communication
- File uploads for content images stored locally in `/public/uploads` (compatible with object storage)
- Tailwind CSS design system with reusable UI primitives and design tokens
- Comprehensive TypeScript configuration, path aliases, and strict typing

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS, Tailwind CSS Forms plugin, Tailwind CSS Animate
- **ORM & Database:** Prisma ORM + PostgreSQL
- **Authentication:** NextAuth.js (credentials provider with JWT strategy)
- **Real-Time:** Socket.io (server + client)
- **State Management:** Zustand (WebSocket store) + React Query patterns with SWR-style fetches
- **Rich Text:** Tiptap editor (Starter Kit)
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod resolvers
- **Notifications:** react-hot-toast

## Application Structure

```
app/
  (admin)/admin/              # Admin console routes & layout
    dashboard/
    users/
    content/
    analytics/
    settings/
  (client)/                   # Public + authenticated client experiences
    (marketing)/              # Marketing site routes
      page.tsx
      about/
      products/
      contact/
      content/[slug]/
    (user)/                   # Authenticated user routes
      dashboard/
      profile/
components/
  admin/
  client/
  shared/
lib/
  auth/
  db/
  utils/
  websocket/
prisma/
  schema.prisma
public/
  uploads/                    # Uploaded media assets (gitignored, .gitkeep included)
```

## Getting Started

### Prerequisites
- Node.js 18.17+
- npm 9+ (or pnpm/yarn)
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Apply database migrations (creates initial schema)
npm run prisma:migrate
```

> **Note:** `npm run prisma:migrate` runs `prisma migrate dev --name init`. Update the migration name or use `prisma migrate dev` after the initial run as needed.

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret used to sign JWTs and session tokens |
| `NEXTAUTH_URL` | Application URL (e.g., `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Public URL used by the Socket.io client |
| `WEBSOCKET_URL` | WebSocket URL for production (e.g., `wss://yourdomain.com`) |
| `SMTP_*` | Optional email configuration |
| `AWS_S3_BUCKET` | Optional storage bucket reference |

### Running Locally

```bash
# Start the development server at http://localhost:3000
npm run dev
```

The Socket.io server is exposed at `/api/websocket`. Admin-only API routes require an authenticated session with an Admin or Manager role.

### Testing

Vitest is configured for future unit and integration tests:

```bash
npm run test
```

(Add tests under `tests/` or colocate near features.)

### Formatting & Linting

Use the provided scripts:

```bash
npm run lint
```

Formatting is handled by Prettier (configure via editor integration or run `npx prettier --write .`).

## API Reference

All routes respond with JSON objects: `{ success: boolean, data?: any, error?: string }`.

### Authentication

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new user (name, email, password) |
| `POST` | `/api/auth/[...nextauth]` | NextAuth credential exchange (handled via `next-auth/react`) |

### Admin (Protected)

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/admin/users` | List users with pagination, search, role filters |
| `POST` | `/api/admin/users` | Create a new user (Admin/Manager/User roles) |
| `GET` | `/api/admin/users/:id` | Retrieve user detail |
| `PATCH` | `/api/admin/users/:id` | Update user details or password |
| `DELETE` | `/api/admin/users/:id` | Delete user (Admin only) |
| `GET` | `/api/admin/content` | List content with filters and pagination |
| `POST` | `/api/admin/content` | Create content (rich text, publish state) |
| `GET` | `/api/admin/content/:id` | Fetch a single content item |
| `PATCH` | `/api/admin/content/:id` | Update content fields |
| `DELETE` | `/api/admin/content/:id` | Remove content |
| `POST` | `/api/admin/content/upload` | Upload cover images (drag-and-drop handler) |
| `GET` | `/api/admin/settings` | Retrieve key/value settings |
| `POST` | `/api/admin/settings` | Upsert a setting |
| `GET` | `/api/admin/analytics` | Aggregated analytics metrics, activity logs |

### Client

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/client/content` | Public content feed with search |
| `GET` | `/api/client/content/:slug` | Fetch a published article |
| `POST` | `/api/client/contact` | Submit contact form (logs + placeholder notification) |
| `GET` | `/api/client/profile` | Fetch authenticated user profile |
| `PATCH` | `/api/client/profile` | Update profile (name, avatar URL, password) |

### WebSocket Events

Socket.io broadcasts occur on `/api/websocket` with JWT-authenticated connections. Events include:

| Event | Direction | Payload |
| --- | --- | --- |
| `content:update` | Admin → Client | `{ slug, title, ... }` real-time content notifications |
| `user:joined` | Any → Admin/Client | `{ userId, name, role }` when a user connects |
| `notification:new` | Server → Client | `{ id, title, message, type }` bell notifications |
| `analytics:update` | Admin ↔ Admin | Aggregated stats for dashboards |
| `admin:action` | Admin ↔ Admin | Ad-hoc admin collaboration events |

Configure the client store in `lib/websocket/client.ts` to react to events or dispatch new ones.

## Image Uploads

Uploaded images are stored in `public/uploads` with random UUID filenames. The directory is gitignored (a `.gitkeep` file is provided). In production (Vercel), consider replacing the upload handler with an object storage integration (S3, Cloudinary, etc.) and update `MediaUpload` accordingly.

## Deployment (Vercel)

1. Push the repository to GitHub/GitLab/Bitbucket
2. Import the project into Vercel
3. Configure the following build settings (also codified in `vercel.json`):
   - Install Command: `npm install`
   - Build Command: `prisma generate && next build`
   - Output Directory: `.vercel/output` (handled by Next.js)
4. In the Vercel dashboard, add the required environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, etc.) under **Settings → Environment Variables**. Provide the values directly instead of referencing Vercel secrets so deployments don't fail when a secret alias is missing.
5. After deployment, run Prisma migrations in production:
   ```bash
   npx prisma migrate deploy
   ```
6. Validate real-time connectivity (Socket.io), NextAuth callbacks, and database connectivity.

## Troubleshooting

| Issue | Solution |
| --- | --- |
| `P1001` Prisma error | Verify database credentials and network access |
| NextAuth callback errors | Ensure `NEXTAUTH_URL` matches the deployed domain and `NEXTAUTH_SECRET` is set |
| Socket connection refused | Set `NEXT_PUBLIC_APP_URL` to the correct origin in both `.env` and Vercel project settings |
| Image uploads fail on Vercel | Switch the upload API to an object storage provider (the local file system is read-only in serverless) |
| Tailwind classes not applied | Restart the dev server after adding new file paths; ensure `tailwind.config.ts` content paths are correct |

## Roadmap & Extensions

- Integrate object storage (S3/Cloudinary) for production-grade media handling
- Add end-to-end Playwright tests for mission-critical flows
- Wire-up email notifications (`SMTP_*` variables) and admin digest jobs
- Extend analytics with caching (Redis) and scheduled background jobs
- Localize the client experience with next-intl or next-translate

---

NovaPulse is built as a launchpad for ambitious teams. Customize the schema, extend API routes, and plug in your preferred infrastructure to move from prototype to production with confidence.
