# Wijha — SAT/ACT Tutoring Platform

A public directory of SAT/ACT tutoring courses in the Middle East. Students browse the full site with no account — teachers and collaborators manage content behind login-protected dashboards.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Push schema to database
npx prisma db push

# 4. Seed sample data (idempotent, safe to re-run)
npx tsx scripts/seed.ts

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Login Credentials

| Role            | Email                 | Password      |
| --------------- | --------------------- | ------------- |
| Admin           | `admin@wijha.com`     | `password123` |
| Admin Assistant | `assistant@wijha.com` | `password123` |
| Teacher         | `amr@wijha.com`       | `password123` |
| Teacher         | `sarah@wijha.com`     | `password123` |
| Teacher         | `michael@wijha.com`   | `password123` |
| Teacher         | `aisha@wijha.com`     | `password123` |
| Collaborator    | `layla@wijha.com`     | `password123` |

## Tech Stack

| Layer     | Technology                                  |
| --------- | ------------------------------------------- |
| Framework | Next.js 14 (App Router)                     |
| Language  | TypeScript                                  |
| Styling   | Custom CSS with design tokens (no Tailwind) |
| Database  | PostgreSQL (Neon)                           |
| ORM       | Prisma                                      |
| Auth      | NextAuth v5 (Credentials provider, JWT)     |
| Passwords | bcryptjs                                    |

### Design Tokens

Defined in `src/app/globals.css`:

```css
--ink-900: #12182b /* dark backgrounds */ --paper: #f5f2ea /* warm off-white */
  --blue: #2f6fed /* primary accent */ --teal: #2e7d8c /* secondary accent */;
```

**Fonts:** Fraunces (headings), Inter (body), IBM Plex Mono (utility/labels).

## Architecture

### Public Pages (no login required)

All public pages fetch data from Prisma at request time (server components). No hardcoded data.

| Route                                | File                                                 | Description                                                                             |
| ------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `/`                                  | `src/app/page.tsx`                                   | Homepage — hero, category cards, teacher row, events/news carousel, mission, search CTA |
| `/category/[category]`               | `src/app/category/[category]/page.tsx`               | Category page — subcategory cards, teacher list                                         |
| `/category/[category]/[subcategory]` | `src/app/category/[category]/[subcategory]/page.tsx` | Subcategory — expandable teacher cards with courses/events                              |
| `/teacher/[teacherId]`               | `src/app/teacher/[teacherId]/page.tsx`               | Teacher profile — banner, two-column layout, fact panel, courses                        |
| `/course/[courseId]`                 | `src/app/course/[courseId]/page.tsx`                 | Course detail — fact grid, price, WhatsApp link, similar courses                        |
| `/event/[eventId]`                   | `src/app/event/[eventId]/page.tsx`                   | Event/news detail — description, WhatsApp CTA                                           |
| `/search`                            | `src/app/search/page.tsx`                            | Search — filter panel, course cards, teacher cards                                      |
| `/terms`                             | `src/app/terms/page.tsx`                             | Terms of service                                                                        |

### Client Components

| File                                                                   | Purpose                                                    |
| ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| `src/components/ConstellationHero.tsx`                                 | Animated SVG constellation hero                            |
| `src/components/CategoryPaths.tsx`                                     | Rotating teacher photo category cards                      |
| `src/components/ScrollReveal.tsx`                                      | Scroll-triggered fade-in animation                         |
| `src/components/EventsNews.tsx`                                        | Events/news carousel (takes `events` and `news` props)     |
| `src/components/PublicNav.tsx`                                         | Top navigation bar (hidden on `/dashboard/*` and `/login`) |
| `src/components/PublicFooter.tsx`                                      | Site footer (hidden on `/dashboard/*` and `/login`)        |
| `src/components/Providers.tsx`                                         | SessionProvider wrapper for client-side auth               |
| `src/app/category/[category]/CategoryTeachers.tsx`                     | Client-side rotation animation for category cards          |
| `src/app/category/[category]/[subcategory]/SubcategoryTeacherList.tsx` | Expandable teacher cards with courses/events               |

### Teacher Dashboard

| Route                        | File                                         | Description                                             |
| ---------------------------- | -------------------------------------------- | ------------------------------------------------------- |
| `/dashboard/teacher`         | `src/app/dashboard/teacher/page.tsx`         | Overview — stat cards (courses, events, profile status) |
| `/dashboard/teacher/profile` | `src/app/dashboard/teacher/profile/page.tsx` | Profile editor with live preview                        |
| `/dashboard/teacher/courses` | `src/app/dashboard/teacher/courses/page.tsx` | Course CRUD — create, edit, publish/unpublish/delete    |
| `/dashboard/teacher/events`  | `src/app/dashboard/teacher/events/page.tsx`  | Events CRUD — create, submit for review, delete         |

Layout: `src/app/dashboard/teacher/layout.tsx` — sidebar with 240px width.

### Collaborator Dashboard

| Route                                 | File                                                  | Description                                        |
| ------------------------------------- | ----------------------------------------------------- | -------------------------------------------------- |
| `/dashboard/collaborator`             | `src/app/dashboard/collaborator/page.tsx`             | Overview — stats (pending/approved/rejected/total) |
| `/dashboard/collaborator/submit`      | `src/app/dashboard/collaborator/submit/page.tsx`      | Submit course/event/news form                      |
| `/dashboard/collaborator/submissions` | `src/app/dashboard/collaborator/submissions/page.tsx` | View own submissions with status badges            |

Layout: `src/app/dashboard/collaborator/layout.tsx` — sidebar with 240px width.

### Admin Dashboard

| Route                            | File                                             | Description                                                           |
| -------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| `/dashboard/admin`               | `src/app/dashboard/admin/page.tsx`               | Review queue — approve/reject collaborator submissions                |
| `/dashboard/admin/courses`       | `src/app/dashboard/admin/courses/page.tsx`       | All courses — filter by status, unpublish/delete any                  |
| `/dashboard/admin/events`        | `src/app/dashboard/admin/events/page.tsx`        | Events/news review — approve/reject teacher submissions               |
| `/dashboard/admin/accounts`      | `src/app/dashboard/admin/accounts/page.tsx`      | Account management — view/suspend/delete, create new accounts         |
| `/dashboard/admin/assistants`    | `src/app/dashboard/admin/assistants/page.tsx`    | Admin assistant management — create/suspend/delete                    |
| `/dashboard/admin/taxonomy`      | `src/app/dashboard/admin/taxonomy/page.tsx`      | Taxonomy CRUD — categories, subcategories, levels, grades, exam dates |
| `/dashboard/admin/notifications` | `src/app/dashboard/admin/notifications/page.tsx` | Send notifications to any user, view sent history                     |
| `/dashboard/admin/chat`          | `src/app/dashboard/admin/chat/chat/page.tsx`     | Chat threads — two-way with teachers/collaborators                    |

Layout: `src/app/dashboard/admin/layout.tsx` — sidebar with 256px width, grouped navigation.

### API Routes

| Endpoint                                 | Methods                  | Auth             | Description                   |
| ---------------------------------------- | ------------------------ | ---------------- | ----------------------------- |
| `/api/auth/[...nextauth]`                | GET, POST                | —                | NextAuth handler              |
| **Teacher**                              |                          |                  |                               |
| `/api/teacher/profile`                   | GET, PATCH               | teacher          | Get/update own profile        |
| `/api/teacher/courses`                   | GET, POST, PATCH, DELETE | teacher          | CRUD own courses              |
| `/api/teacher/events`                    | GET, POST, PATCH, DELETE | teacher          | CRUD own events               |
| **Collaborator**                         |                          |                  |                               |
| `/api/collaborator/submissions`          | GET, POST                | collaborator     | List/create own submissions   |
| **Admin**                                |                          |                  |                               |
| `/api/admin/users`                       | GET, POST                | admin            | List users / create account   |
| `/api/admin/users/[id]`                  | PATCH, DELETE            | admin            | Suspend/delete user           |
| `/api/admin/courses`                     | GET                      | admin, assistant | List all courses              |
| `/api/admin/courses/[id]`                | PATCH, DELETE            | admin, assistant | Unpublish/delete course       |
| `/api/admin/events`                      | GET                      | admin, assistant | List all events               |
| `/api/admin/events/[id]`                 | PATCH                    | admin, assistant | Approve/reject event          |
| `/api/admin/submissions`                 | GET                      | admin, assistant | List all submissions          |
| `/api/admin/submissions/[id]`            | PATCH                    | admin, assistant | Approve/reject submission     |
| `/api/admin/assistants`                  | GET, POST                | admin            | List/create admin assistants  |
| `/api/admin/assistants/[id]`             | PATCH, DELETE            | admin            | Manage assistant accounts     |
| `/api/admin/notifications`               | GET, POST                | authed           | List/send notifications       |
| `/api/admin/chat`                        | GET                      | admin, assistant | List chat threads             |
| `/api/admin/chat/[id]`                   | POST, PATCH              | admin, assistant | Send message / resolve thread |
| `/api/admin/taxonomy/categories`         | GET, POST                | admin            | List/create categories        |
| `/api/admin/taxonomy/categories/[id]`    | DELETE                   | admin            | Delete category               |
| `/api/admin/taxonomy/subcategories`      | POST                     | admin            | Create subcategory            |
| `/api/admin/taxonomy/subcategories/[id]` | DELETE                   | admin            | Delete subcategory            |
| `/api/admin/taxonomy/levels`             | GET, POST                | admin            | List/create levels            |
| `/api/admin/taxonomy/levels/[id]`        | DELETE                   | admin            | Delete level                  |
| `/api/admin/taxonomy/grades`             | GET, POST                | admin            | List/create target grades     |
| `/api/admin/taxonomy/grades/[id]`        | DELETE                   | admin            | Delete target grade           |
| `/api/admin/taxonomy/exam-dates`         | GET, POST                | admin            | List/create exam dates        |
| `/api/admin/taxonomy/exam-dates/[id]`    | DELETE                   | admin            | Delete exam date              |

## Data Model

14 tables defined in `prisma/schema.prisma`:

| Model                             | Purpose                                                                   |
| --------------------------------- | ------------------------------------------------------------------------- |
| `User`                            | All accounts — teachers, collaborators, admins, admin assistants          |
| `Course`                          | Courses with status lifecycle (draft → published → unpublished → removed) |
| `EventNews`                       | Events and news items with approval workflow                              |
| `CommunityCollaboratorSubmission` | Collaborator content submissions (pending → approved/rejected)            |
| `Category`                        | Top-level categories (SAT, ACT, Other)                                    |
| `Subcategory`                     | Subjects scoped to a category (Math, English/RW, etc.)                    |
| `Level`                           | Course levels (Beginner, Intermediate, Advanced, Test-Prep)               |
| `TargetGrade`                     | Target grades (9, 10, 11, 12)                                             |
| `TargetExamDate`                  | Exam windows (August 2026 SAT, etc.)                                      |
| `Notification`                    | Admin-to-user messages with read/unread state                             |
| `ChatThread`                      | Two-way chat between users and admin                                      |
| `AdminAssistantMessage`           | Admin ↔ Admin Assistant 1:1 messaging                                     |

## Workflows

### Course Lifecycle

```
Teacher creates → draft (invisible)
Teacher publishes → published (visible on site)
Admin/assistant unpublishes → unpublished (hidden)
Teacher/admin re-publishes → published
Admin/assistant deletes → removed (permanent)
```

### Event/News Lifecycle

```
Teacher creates draft → draft
Teacher submits for review → pending_review
Admin/assistant approves → published
Admin/assistant rejects → rejected (with reason, teacher notified)
```

### Collaborator Submission

```
Collaborator submits → pending
Admin/assistant approves → approved (course/event created on platform)
Admin/assistant rejects → rejected (with reason, collaborator notified)
```

### Account Lifecycle

```
Admin/assistant creates → active
Admin/assistant suspends → suspended (reason required, user notified)
Admin/assistant lifts suspension → active
Admin/assistant deletes → deleted (permanent)
```

## Middleware

Route protection in `src/middleware.ts`:

| Route Pattern                  | Allowed Roles              |
| ------------------------------ | -------------------------- |
| `/dashboard/teacher/*`         | `teacher`                  |
| `/dashboard/admin/*`           | `admin`                    |
| `/dashboard/admin-assistant/*` | `admin`, `admin_assistant` |
| `/dashboard/collaborator/*`    | `community_collaborator`   |
| `/login`                       | Public                     |

Unauthenticated users are redirected to `/login?callbackUrl=<original>`.

## File Structure

```
wijha/
├── prisma/
│   └── schema.prisma           # 14 models
├── scripts/
│   └── seed.ts                 # Idempotent seed (safe to re-run)
├── src/
│   ├── app/
│   │   ├── globals.css          # Design tokens, fonts, component classes
│   │   ├── layout.tsx           # Root layout (Providers, nav, footer)
│   │   ├── page.tsx             # Homepage
│   │   ├── login/page.tsx       # Login form
│   │   ├── terms/page.tsx       # Terms of service
│   │   ├── search/page.tsx      # Search with filters
│   │   ├── category/            # Category + subcategory pages
│   │   ├── teacher/             # Teacher profile
│   │   ├── course/              # Course detail
│   │   ├── event/               # Event/news detail
│   │   ├── dashboard/
│   │   │   ├── teacher/         # Teacher dashboard (4 pages)
│   │   │   ├── collaborator/    # Collaborator dashboard (3 pages)
│   │   │   └── admin/           # Admin dashboard (8 pages)
│   │   └── api/
│   │       ├── auth/            # NextAuth
│   │       ├── teacher/         # Teacher APIs (3 routes)
│   │       ├── collaborator/    # Collaborator APIs (1 route)
│   │       └── admin/           # Admin APIs (14 route groups)
│   ├── components/              # Shared client components
│   ├── lib/
│   │   ├── auth.ts              # NextAuth config
│   │   └── prisma.ts            # Prisma client singleton
│   └── middleware.ts            # Route protection
├── .env                         # DATABASE_URL, AUTH_SECRET
└── package.json
```

## Design System

### Component Classes (globals.css)

- `.btn-primary` — Blue CTA button
- `.btn-whatsapp` — Green WhatsApp button
- `.course-card` — Course listing card
- `.teacher-card` — Teacher listing card
- `.path-card` — Category/subcategory card with rotation
- `.fact-panel` — Information panel
- `.fact-grid` — Grid of facts
- `.search-panel` — Search with filter panel
- `.scroll-row` — Horizontal scrollable row
- `.tag` / `.tag.sat` / `.tag.act` — Category tags
- `.two-col` — Two-column layout (main + sidebar)

### Responsive

Single breakpoint at 880px. Below that, two-column layouts stack vertically.

### Accessibility

- `prefers-reduced-motion` disables all animations
- Semantic HTML with proper headings
- Keyboard-navigable forms and buttons
- WhatsApp links open in new tab with `rel="noopener noreferrer"`

## Build

```bash
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
npx tsc --noEmit # TypeScript check
```

## Environment Variables

In `.env`:

```
DATABASE_URL=postgresql://...     # Neon/Postgres connection string
AUTH_SECRET=...                   # NextAuth secret (generated with `openssl rand -base64 32`)
```

## Seeding

The seed script (`scripts/seed.ts`) is **idempotent** — it uses upsert/skip logic and is safe to run multiple times. It creates:

- 3 categories (SAT, ACT, Other) with 7 subcategories
- 4 levels, 4 target grades, 4 exam dates
- 4 teachers with profiles
- 1 admin, 1 collaborator, 1 admin assistant
- 7 courses, 4 events/news items

```bash
npx tsx scripts/seed.ts
```

## Built With

This project was built using AI-assisted development tools:

- **Codex** (OpenAI) — code generation, refactoring, and debugging
- **Claude Code** (Anthropic) — architecture, security hardening, testing, and deployment planning
