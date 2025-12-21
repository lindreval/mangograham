# Backend Codebase Exploration - Complete Summary

**Project Location**: `/Users/lourdrickvalsote/Documents/Projects/dev/mangograham/multilingual-urban-dictionary`

**Date**: November 13, 2025

---

## Overview

I've completed a comprehensive exploration of the backend API codebase for the Multilingual Urban Dictionary project. This document summarizes all findings and provides direct file references.

---

## Key Findings

### 1. API Routes (25+ endpoints)

All API routes are located in: `/src/app/api/`

**Route Files Examined**:
- `/src/app/api/profile/route.ts` - User profile management (PUT, DELETE)
- `/src/app/api/contributions/route.ts` - User contributions with filtering (GET)
- `/src/app/api/achievements/poll/route.ts` - Achievement polling for notifications (GET)
- `/src/app/api/feedback/route.ts` - User feedback submission (POST)
- `/src/app/api/admin/phrases/route.ts` - Admin phrase listing (GET)
- `/src/app/api/admin/definitions/route.ts` - Admin definition listing (GET)
- `/src/app/api/admin/examples/route.ts` - Admin example listing (GET)
- `/src/app/api/admin/phrases/action/route.ts` - Single phrase approval/rejection (POST)
- `/src/app/api/admin/phrases/bulk-action/route.ts` - Bulk phrase actions (POST)
- `/src/app/api/admin/definitions/action/route.ts` - Single definition approval/rejection (POST)
- `/src/app/api/admin/definitions/bulk-action/route.ts` - Bulk definition actions (POST)
- `/src/app/api/admin/examples/action/route.ts` - Single example approval/rejection (POST)
- `/src/app/api/admin/examples/bulk-action/route.ts` - Bulk example actions (POST)
- `/src/app/api/admin/edit-phrase/[id]/route.ts` - Admin phrase editing with nested definitions (PUT)
- `/src/app/api/phrases/route.ts` - Public phrase listing (GET)
- `/src/app/api/search/route.ts` - Search functionality (GET)
- `/src/app/api/languages/route.ts` - Language listing (GET)
- `/src/app/api/language-phrases/route.ts` - Phrases by language (GET)
- `/src/app/api/languages/[languageId]/contributors/route.ts` - Top contributors per language (GET)
- `/src/app/api/tags/route.ts` - Tag management (GET, POST)
- `/src/app/api/flag-definition/route.ts` - Content flagging (POST)

---

### 2. Database Schema

**Primary File**: `/prisma/schema.prisma`

**Core Models** (12 entities):
- User - Authentication & profile data
- Phrase - Terms/words in specific languages
- Definition - Explanations of phrases
- Example - Usage examples for definitions
- Language - Available languages
- DefinitionVote & ExampleVote - Rating system
- Achievement & UserAchievement - Gamification
- Tag & PhraseTag - Content organization
- Feedback - User feedback system
- Account, Session, VerificationToken - NextAuth internals

**Key Features**:
- Composite unique constraints (languageId + normalized text for phrases)
- Cascade deletes for related content
- JSON fields for flexible achievement requirements
- Array fields for user language preferences

---

### 3. Core Services & Libraries

**Authentication** (`/src/lib/auth.ts`)
- NextAuth.js configuration
- Google OAuth provider
- Database session strategy (not JWT)
- Auto-username generation on first signup
- Session object includes user ID and role

**Achievement System** (`/src/lib/achievements.ts`)
- Achievement initialization and progress tracking
- Flexible requirement evaluation
- Achievement seeding system
- Methods: `checkAndAwardAchievements()`, `awardAchievement()`, `getUserAchievements()`

**Reputation System** (`/src/lib/reputation.ts`)
- Reputation calculation based on votes and contributions
- 5 reputation levels: Newbie, Helper, Contributor, Expert, Legend
- Points: Definition upvote (+2), Example upvote (+1), etc.

**Database Connection** (`/src/lib/prisma.ts`)
- Singleton Prisma client
- Global instance for hot reloads in development
- Exported as `export const prisma`

**Utilities** (`/src/lib/utils.ts`)
- `cn()` - Tailwind class name merge utility

---

### 4. Endpoint Characteristics

#### User Profile Endpoints

**PUT /api/profile**
- Updates name, username, bio, location, languages spoken
- Validates username uniqueness
- Triggers achievement checks (PROFILE_UPDATED)
- Returns updated user and newly unlocked achievements

**DELETE /api/profile**
- Deletes user account and all related data
- Cascading deletes handle relationships

#### User Contributions Endpoint

**GET /api/contributions**
- Supports three content types: phrases, definitions, examples
- Sorting options: recent, upvotes, oldest
- Returns related data with vote counts
- Includes total contribution counts across all types

#### Achievements Polling

**GET /api/achievements/poll**
- Polls for achievements unlocked in last 30 seconds
- Returns only unnotified achievements
- Auto-marks returned achievements as notified
- Used for real-time achievement notifications

#### Feedback Submission

**POST /api/feedback**
- Optional authentication (can submit without login)
- Requires: type, subject, message
- Optional email (uses session email if logged in)
- Stores in database with pending status

#### Admin Endpoints

**Pattern**: All admin endpoints require `role === "admin"`

**Content Management**:
- GET endpoints list pending/needs-review items
- POST action endpoints approve/reject single items
- POST bulk-action endpoints handle multiple items
- PUT edit-phrase allows full editing with nested definitions and examples

---

## Documentation Generated

Three comprehensive documentation files have been created:

1. **BACKEND_API_SUMMARY.md** (21 KB)
   - Complete API reference with all endpoints
   - Full request/response shapes
   - Database schema details
   - Service documentation
   - Common patterns and conventions
   - Location: `/Users/lourdrickvalsote/Documents/Projects/dev/mangograham/multilingual-urban-dictionary/BACKEND_API_SUMMARY.md`

2. **API_QUICK_REFERENCE.md** (9 KB)
   - Endpoint summary tables
   - Quick lookup for key request/response shapes
   - Status code reference
   - Authentication notes
   - Database relationships diagram
   - Location: `/Users/lourdrickvalsote/Documents/Projects/dev/mangograham/multilingual-urban-dictionary/API_QUICK_REFERENCE.md`

3. **API_ARCHITECTURE.txt** (ASCII diagram)
   - Visual architecture overview
   - Tech stack summary
   - Authentication flow diagram
   - Content status transitions
   - Reputation calculation rules
   - File location references
   - Location: `/Users/lourdrickvalsote/Documents/Projects/dev/mangograham/multilingual-urban-dictionary/API_ARCHITECTURE.txt`

---

## Code Quality Observations

### Strengths
- Consistent error handling with try-catch blocks
- Standard REST patterns and naming conventions
- Proper authentication guards on protected endpoints
- Role-based access control (admin checks)
- Comprehensive data includes/relationships
- Pagination with hasMore indicators
- Transaction-safe operations using Prisma

### Patterns Used
- NextAuth.js session-based authentication
- Prisma ORM for type-safe database queries
- Separation of concerns (endpoints vs. services)
- Singleton pattern for database client
- Cursor-based pagination with skip/take

---

## Authentication Architecture

**Strategy**: Database Sessions (NextAuth.js)

**Flow**:
1. User initiates Google OAuth
2. User record created with auto-generated username
3. Session stored in database
4. Session cookie set in response
5. All protected endpoints check `getServerSession(authConfig)`

**Session Object**:
```typescript
{
  user: {
    id: string,
    role: "user" | "admin",
    name?: string,
    email?: string,
    image?: string
  }
}
```

---

## Key Endpoint Patterns

### Pagination
All list endpoints support:
- `page` (default: 1)
- `limit` (default: 10-20)
- Return `hasMore` boolean

### Sorting
Contributions and similar endpoints:
- `sortBy: "recent" | "upvotes" | "oldest"`
- Server-side sorting for database queries
- Client-side sorting for vote aggregations

### Content Status
All user-submitted content follows:
- `"pending"` - Awaiting admin approval
- `"approved"` - Visible to public
- `"rejected"` - Not visible
- `"needs review"` - Flagged by users for admin review

### Filtering
Time-period filtering on contributor endpoints:
- `"all-time"` (default)
- `"weekly"` - Last 7 days
- `"monthly"` - Last 30 days

---

## Statistics

| Metric | Count |
|--------|-------|
| Total API endpoints | 25+ |
| Public endpoints | 12 |
| Authenticated endpoints | 5 |
| Admin-protected endpoints | 8 |
| Database models | 12 |
| Core service files | 5 |
| Libraries used | NextAuth, Prisma, TypeScript |

---

## Files Referenced in Exploration

### Route Files (25 total)
All located in `/src/app/api/` with structure mirroring endpoint paths

### Library Files
- `/src/lib/auth.ts` - Authentication configuration
- `/src/lib/achievements.ts` - Achievement service (400+ lines)
- `/src/lib/reputation.ts` - Reputation calculation (130 lines)
- `/src/lib/prisma.ts` - Database client
- `/src/lib/utils.ts` - Utilities
- `/src/lib/username-generator.ts` - Username generation
- `/src/lib/achievement-definitions.ts` - Achievement definitions
- `/src/lib/achievementNotificationService.ts` - Notification service

### Database
- `/prisma/schema.prisma` - Complete data model

---

## Recommendations for Frontend Integration

1. **Session Management**: Rely on NextAuth for automatic session handling
2. **Error Handling**: Expect consistent error response format: `{ error: string }`
3. **Pagination**: Always check `hasMore` to know if more results exist
4. **Achievement Polling**: Poll `/api/achievements/poll` every 1-2 seconds for real-time notifications
5. **Admin Routes**: Use `session.user.role` to conditionally show admin UI
6. **Status Filters**: Filter public content by `status: "approved"`
7. **Reputation Levels**: Use `getReputationLevel()` helper to display user badges

---

## Next Steps

The three generated documentation files provide everything needed to:
1. Build frontend integrations
2. Understand the API contract
3. Add new endpoints following existing patterns
4. Debug issues with request/response shapes
5. Implement features that rely on achievement/reputation systems

All documentation files are saved in the project root for easy reference.

