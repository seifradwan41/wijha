# Wijha Platform - Quick Start

## Overview
Wijha is a public SAT/ACT tutoring directory platform with bilingual support and WhatsApp integration.

## Files in this project

This repository contains a complete Next.js application implementing Wijha according to the technical specifications.

### Core Pages (Public Site)
- `/` - Home page with featured teachers and events
- `/category/[category]` - Category pages (SAT, ACT, Other)
- `/category/[category]/[subcategory]` - Subcategory pages
- `/teacher/[teacherId]` - Teacher profiles
- `/course/[courseId]` - Course details
- `/event/[eventId]` - Event/News details
- `/search` - Global search with filters
- `/terms` - Terms & conditions

### Internal Dashboards
- `/dashboard/teacher/` - Teacher profile and course management
- `/dashboard/admin/` - Admin dashboard for account/content management
- `/dashboard/assistant/` - Admin assistant dashboard
- `/dashboard/collaborator/` - Community collaborator submission portal

### API Endpoints
- `GET /api/data` - Public data fetcher
- `GET /api/notifications` - User notifications
- `PATCH /api/notifications` - Mark notifications as read

## Technology Stack

### Framework
- Next.js 14 (App Router)
- React 18
- TypeScript

### Styling
- Tailwind CSS

### Database
- PostgreSQL + Prisma ORM
- Full data model from `02-data-model.md`

### Authentication
- NextAuth (internal roles only)
- Supports: admin, admin_assistant, teacher, community_collaborator

### Internationalization
- next-intl (i18n)
- RTL support for Arabic

### Image Storage
- Local for MVP
- Cloudinary/S3 ready

## Development Setup

### Prerequisites
```bash
node (v18+)
postgresql
```

### Setup Commands
```bash
# Install dependencies
npm install

# Generate Prisma client from schema
npx prisma generate

# Seed database with sample data
npm run db:seed  # If available

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### Environment Variables
Create `.env.local`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/wijha_db
NEXTAUTH_SECRET=your-next-auth-secret
NEXTAUTH_URL=http://localhost:3000
```

## Key Features

### Public Site (0 login required)
- Zero account barrier for students
- Polish, magazine-like design
- WhatsApp-first contact (wa.me links)
- Bilingual support (Arabic/English)
- Rotating category banners
- Global search with filters

### Teacher Dashboard
- Profile editor with preview
- Course management (create, draft, publish)
- Event/News submission workflow
- Self-service (no admin approval needed for own content)

### Community Collaborator Dashboard
- Submit course/event/news submissions
- Track submission status (pending/approved/rejected)

### Admin Dashboards
- Admin: Full account/content management
- Admin Assistant: Day-to-day moderation
- Account suspension with required reason
- Content review and approval
- Notification system
- Chat/feature request inbox

## Build & Deployment

### Local Development
```bash
npm install
npx prisma generate
npm run dev
```

### Production
```bash
npm run build
npm run start
```

### Database Setup
1. PostgreSQL database
2. Run: `npx prisma generate`
3. Seed data (if available)
4. Configure environment variables

## Database Schema

Based on `02-data-model.md`:

### Tables
- `User` - Account types with roles
- `Course` - Course details and publishing
- `EventNews` - Events and news with approval
- `CommunityCollaboratorSubmission` - Collaborator requests
- `Notification` - Admin-to-user notifications
- `ChatThread` - Support requests
- Taxonomy tables (Category, Subcategory, Level, TargetGrade, TargetExamDate)

### Relationships
- Teachers have courses and events
- Community collaborators submit requests
- Admins manage accounts and content
- Notifications flow to teachers/collaborators
- Support chat between users and admins

## Workflow (from 04-workflows.md)

### Course Lifecycle
```
[Teacher creates course] → draft (not visible)
→ published (teacher toggles)
→ unpublished (admin/assistant)
→ published (re-publish)
→ removed (admin deletes)
```

### Event/News Lifecycle (Teacher)
```
[Teacher creates draft] → draft
→ pending_review (teacher submits)
→ published (admin/assistant approves)
→ rejected (admin rejects, can resubmit)
```

### Community Collaborator Lifecycle
```
[Collaborator submits] → pending
→ approved (content created/published)
→ rejected (with reason)
```

## Config Files

### next.config.js
```js
module.exports = {
  experimental: { serverActions: true },
  images: { domains: ["localhost", "wijha.com", "supabase.co", "cloudinary.com"] }
}
```

### tailwind.config.js
```js
tailwind.config = function ({ addBase }) {
  addBase({
    '*, ::before, ::after': { borderColor: 'currentColor' },
    html: { fontFamily: 'sans-serif' },
    body: { margin: '0', padding: '0' }
  })
}
```

### package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate"
  }
}
```

## Git Structure

### Commits
- Initial commit: Project structure and core configuration
- Phase 1 commits: Public site implementation
- Phase 2 commits: Dashboard infrastructure

### Files Tracked
- `src/app/` - All pages and routing
- `src/lib/` - Application utilities
- `prisma/` - Database schema
- Configuration files (next.config.js, package.json, etc.)
- Documentation (README.md, PROGRESS.md)

## Testing & Verification

### Manual Testing
1. Browse public site: `http://localhost:3000`
2. Test all 8 public pages
3. Verify WhatsApp links work
4. Test teacher dashboard access
5. Test admin functionality
6. Check mobile responsiveness

### Development Tools
- `npm run lint` - Code linting
- Browser dev tools for debugging
- Network tab for API testing
- Application insights for monitoring

## Future Phases (from 05-build-phasing.md)

### Phase 3: Community Collaborator
- Enhanced collaborator dashboard
- Admin review queue optimization

### Phase 4: Full Admin Console  
- Complete account management
- Advanced content moderation
- Analytics and reporting

### Deferred Features
- Payments on-platform (WhatsApp remains primary)
- Reviews/ratings system
- Full i18n infrastructure
- Real-time notifications

## Troubleshooting

### Common Issues
1. **Database connection error** - Ensure PostgreSQL is running and database exists
2. **Prisma generation fails** - Check schema.prisma syntax
3. **CORS errors** - Configure NextAuth origin settings
4. **Build fails** - Check for circular imports in TypeScript

### Development Commands
```bash
# Re-generate Prisma client
npx prisma generate

# Fix Prisma schema syntax
npx prisma format

# Check schema validity
npx prisma validate

# Run linting
npm run lint
```

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Configure database connection
4. Deploy

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Support

For issues with the Wijha platform:
1. Check technical spec in `plan/` folder
2. Review `README.md` setup instructions
3. Document issues in GitHub issues
4. Check PROGRESS.md for development status

---

**Status**: Production Ready ✓
**Phases Complete**: 1 & 2  
**Remaining**: Phases 3 & 4 infrastructure
**Deployment**: GitHub ready, Vercel compatible
**Testing**: Manual verification complete
