# Phase 4 — Full Admin Console

## What was built

Phase 4 adds the complete admin and admin assistant dashboard with 8 new pages and 18+ API routes.

## New Pages

### `/dashboard/admin` — Review Queue
- Lists pending collaborator submissions
- Approve creates the course/event on the platform automatically
- Reject with reason modal (user gets notified)

### `/dashboard/admin/courses` — All Courses
- Lists all courses across all teachers
- Filter by status: published, draft, unpublished
- Unpublish any published course (teacher notified)
- Delete any course (with confirmation)

### `/dashboard/admin/events` — Events & News
- Lists all teacher event/news items
- Filter by status: pending_review, published, rejected, draft
- Approve pending items (teacher notified)
- Reject with reason (teacher notified)

### `/dashboard/admin/accounts` — Account Management
- Lists all users with role filter
- Create new teacher/collaborator/admin_assistant accounts
- Suspend with required reason (user notified)
- Reactivate suspended accounts
- Delete accounts (with confirmation)

### `/dashboard/admin/assistants` — Admin Assistants
- Lists all admin assistant accounts
- Create new assistant accounts
- Suspend/activate/delete assistants
- Birthday mode toggle (fun feature from spec)

### `/dashboard/admin/taxonomy` — Taxonomy Management
Two-column layout with full CRUD:
- **Categories** — Add/remove categories (SAT, ACT, Other)
- **Subcategories** — Add/remove subcategories per category
- **Levels** — Add/remove course levels
- **Target Grades** — Add/remove target grades
- **Exam Dates** — Add/remove exam date windows

### `/dashboard/admin/notifications` — Notifications
- Send notification to any user (select recipient + message)
- View all sent notifications with read/unread state

### `/dashboard/admin/chat` — Chat
- Thread list with status badges (open/resolved)
- Chat area with message bubbles
- Send messages as admin
- Mark threads as resolved

## New API Routes

### User Management
- `GET /api/admin/users` — List all users (admin only)
- `POST /api/admin/users` — Create account with hashed password
- `PATCH /api/admin/users/[id]` — Suspend/activate (triggers notification on suspend)
- `DELETE /api/admin/users/[id]` — Delete account (admin only)

### Content Moderation
- `GET /api/admin/courses` — List all courses with teacher info
- `PATCH /api/admin/courses/[id]` — Change status (triggers notification on unpublish)
- `DELETE /api/admin/courses/[id]` — Delete course
- `GET /api/admin/events` — List all events with teacher info
- `PATCH /api/admin/events/[id]` — Approve/reject (triggers notification)

### Admin Assistants
- `GET /api/admin/assistants` — List assistants
- `POST /api/admin/assistants` — Create assistant with hashed password
- `PATCH /api/admin/assistants/[id]` — Update status/birthday mode
- `DELETE /api/admin/assistants/[id]` — Delete assistant

### Notifications
- `GET /api/admin/notifications` — List notifications for current user
- `POST /api/admin/notifications` — Send notification to any user

### Chat
- `GET /api/admin/chat` — List all threads
- `POST /api/admin/chat/[id]` — Send message (appends to thread)
- `PATCH /api/admin/chat/[id]` — Resolve thread

### Taxonomy (6 resource groups, 12 routes)
- `GET/POST /api/admin/taxonomy/categories` — List/create
- `DELETE /api/admin/taxonomy/categories/[id]` — Delete (cascades subcategories)
- `POST /api/admin/taxonomy/subcategories` — Create
- `DELETE /api/admin/taxonomy/subcategories/[id]` — Delete
- `GET/POST /api/admin/taxonomy/levels` — List/create
- `DELETE /api/admin/taxonomy/levels/[id]` — Delete
- `GET/POST /api/admin/taxonomy/grades` — List/create
- `DELETE /api/admin/taxonomy/grades/[id]` — Delete
- `GET/POST /api/admin/taxonomy/exam-dates` — List/create
- `DELETE /api/admin/taxonomy/exam-dates/[id]` — Delete

## Sidebar Navigation

The admin sidebar is grouped into sections:

```
MODERATION
  Review Queue
  All Courses
  Events & News

PEOPLE
  Accounts
  Admin Assistants

CONTENT
  Taxonomy

COMMUNICATION
  Notifications
  Chat
```

## Seeded Data

A new admin assistant account was seeded:
- Email: `assistant@wijha.com`
- Password: `password123`
- Name: Omar Assistant

## Build Status

- TypeScript: passes clean
- Next.js build: passes clean (39 routes)
- All warnings are from bcryptjs in Edge Runtime (harmless)
