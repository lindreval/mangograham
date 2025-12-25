# React Native Mobile App Migration Plan

## Quick Navigation

**For Project Managers & Decision Makers:**
- Jump to "MVP Scope & Timeline" to see what ships first
- Check "MVP Release Checklist" for sign-off criteria

**For Developers:**
- Start with "Phase 1-9: MVP Implementation" (4-5 weeks)
- Use "Technical Reference & Implementation Guide" for detailed specs
- Reference "Implementation Checklist" while building each phase

**For Post-MVP Planning:**
- Review "Post-MVP Features" section (Phases 10-13)
- Estimates provided for future prioritization

---

## Project Overview

This document outlines the comprehensive plan for translating the **Yung Salita** multilingual urban dictionary from Next.js web application to a React Native mobile app with Expo deployment.

### Current State
- **Web Framework:** Next.js 15.3.4 with App Router
- **Database:** PostgreSQL (Supabase)
- **Authentication:** NextAuth.js with Google OAuth
- **UI Framework:** Tailwind CSS + shadcn/ui
- **Lines of Code:** ~8,960 (TypeScript/TSX)

### Target State
- **Mobile Framework:** React Native with Expo
- **Deployment:** Expo (both iOS and Android)
- **Database:** Same PostgreSQL (Supabase) backend
- **Authentication:** Expo AuthSession with Google OAuth
- **Styling:** NativeWind or StyleSheet with theme context

### Scope & Timeline

This document is organized into two sections:

**MVP (Minimum Viable Product) - Weeks 1-5:**
Focus on core features that make the app immediately useful. See "MVP Scope & Timeline" section for details. Includes 15 essential features: login, browse, search, vote, submit, profiles, reputation, tags, and flagging.

**Post-MVP Features - Future Development:**
Advanced features documented in "Post-MVP Features" section (Phases 10-13) for development after the initial release. Includes admin panel, achievements & notifications, feedback system, and advanced filters.

**Technical Reference:** Comprehensive sections on API specs, database schema, business logic, authentication, and validation apply to both MVP and Post-MVP features.

---

## Architecture Overview

### Shared Backend Infrastructure
The mobile app will reuse the existing backend:
- All REST API endpoints remain unchanged
- Database schema stays the same
- NextAuth.js authentication on backend (mobile implements OAuth client)
- Same environment variables and configurations

### Architectural Benefits
1. **Server-First Architecture:** Next.js API routes decouple from UI layer
2. **Clear Separation:** Client-side and server-side logic are distinct
3. **Type Safety:** TypeScript types and Prisma schema enable code sharing
4. **OAuth Standard:** Google OAuth is platform-agnostic

---

## Technical Reference & Implementation Guide

### Complete API Endpoint Specification

#### API Endpoints Summary Table

| Endpoint | Method | Screen/Component | Auth | Default Limit | Key Details |
|----------|--------|------------------|------|--------|------------|
| `/api/languages` | GET | LanguageScreen | No | 20 | Lists languages with phrase count aggregation |
| `/api/phrases` | GET | HomeScreen | No | 20 | Lists approved/pending phrases, pagination-based infinite scroll |
| `/api/language-phrases` | GET | PhrasesScreen | No | 20 | Phrases filtered by languageId |
| `/api/search` | GET | SearchResultsScreen | No | 20 | Searches normalized + transliteration fields, max 8 results for preview |
| `/api/search-preview` | GET | SearchScreen (typeahead) | No | 8 | Returns quick suggestions (min 2 chars) |
| `/api/tags` | GET | TagSelector | No | - | Returns all tags with phrase count |
| `/api/tags` | POST | SubmitPhraseScreen | Required | - | Creates tag with case-insensitive duplicate check |
| `/api/contributions` | GET | ContributionsScreen | Required | 10 | User contributions with sorting (recent/upvotes/oldest) |
| `/api/profile` | GET | ProfileScreen | Optional | - | Current user profile (protected endpoints only) |
| `/api/profile` | PUT | EditProfileScreen | Required | - | Updates bio, location, languagesSpoken, username |
| `/api/profile` | DELETE | ProfileScreen (logout) | Required | - | Hard delete user and all cascade relationships |
| `/api/flag-definition` | POST | PhraseDetailScreen | Required | - | Flags phrase/definition/example, sets status to "needs review" |
| `/api/feedback` | POST | FeedbackScreen | Optional | - | Stores feedback with type, subject, message |
| `/api/achievements/poll` | GET | Achievement polling hook | Required | - | Returns unnotified achievements from last 30 seconds |
| `/api/votes/definition` (via actions) | POST | VoteButtons | Required | - | Vote on definitions (value: 1/-1/0) |
| `/api/votes/example` (via actions) | POST | VoteButtons | Required | - | Vote on examples (value: 1/-1/0) |
| `/api/admin/phrases` | GET | AdminScreen | Admin | 10 | Lists pending/needs-review phrases |
| `/api/admin/phrases/action` | POST | AdminScreen | Admin | - | Single phrase status update |
| `/api/admin/phrases/bulk-action` | POST | AdminScreen | Admin | - | Bulk phrase status update, returns count |
| `/api/admin/definitions/...` | GET/POST/POST | AdminScreen | Admin | 10 | Same structure as phrases admin endpoints |
| `/api/admin/examples/...` | GET/POST/POST | AdminScreen | Admin | 10 | Same structure as phrases admin endpoints |
| `/api/admin/edit-phrase/[id]` | GET/PUT | AdminScreen | Admin | - | Edit phrase fields directly |

#### API Response Formats

**Success Response:**
```typescript
{
  success: true,
  data?: T,
  message?: string
}
```

**Pagination Response:**
```typescript
{
  data: T[],
  hasMore: boolean,
  totalCount?: number,
  currentPage?: number
}
```

**Admin Bulk Operation Response:**
```typescript
{
  success: true,
  updatedCount: number,
  action: string
}
```

**Error Response:**
```typescript
{
  error: string
}
```

**HTTP Status Codes:**
- 200 OK: Successful request
- 400 Bad Request: Invalid parameters, missing required fields
- 401 Unauthorized: Missing/invalid session
- 404 Not Found: Resource doesn't exist
- 500 Internal Server Error: Database/unexpected errors

---

### Prisma Database Schema Reference

#### Complete Data Models

**Language Model:**
```prisma
model Language {
  id              Int      @id @default(autoincrement())
  name            String   @unique
  isoCode         String   @unique
  transliteration Boolean  @default(false)
  phrases         Phrase[]
}
```

**Phrase Model:**
```prisma
model Phrase {
  id              Int       @id @default(autoincrement())
  textOriginal    String
  normalized      String    @db.VarChar(255)  // Lowercase, indexed
  slug            String    @unique
  partOfSpeech    String?
  pronunciation   String?
  transliteration String?
  languageId      Int
  language        Language  @relation(fields: [languageId], references: [id])
  authorId        String
  author          User      @relation("phraseAuthor", fields: [authorId], references: [id])
  status          String    @default("pending") // pending|approved|rejected|needs review
  definitions     Definition[]
  tags            PhraseTag[]
  flags           Feedback[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([languageId, normalized])
  @@index([textOriginal, languageId])
}
```

**Definition Model:**
```prisma
model Definition {
  id              Int       @id @default(autoincrement())
  body            String
  mediaUrl        String?
  authorId        String
  author          User      @relation("definitionAuthor", fields: [authorId], references: [id])
  phraseId        Int
  phrase          Phrase    @relation(fields: [phraseId], references: [id], onDelete: Cascade)
  status          String    @default("pending")
  examples        Example[]
  votes           DefinitionVote[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

**Example Model:**
```prisma
model Example {
  id              Int       @id @default(autoincrement())
  text            String
  translation     String?
  authorId        String
  author          User      @relation("exampleAuthor", fields: [authorId], references: [id])
  definitionId    Int
  definition      Definition @relation(fields: [definitionId], references: [id], onDelete: Cascade)
  status          String    @default("pending")
  votes           ExampleVote[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

**User Model (Extended from NextAuth):**
```prisma
model User {
  id                    String   @id @default(cuid())
  email                 String?  @unique
  emailVerified         DateTime?
  name                  String?
  username              String   @unique  // Auto-generated, max 15 chars
  image                 String?
  bio                   String?
  location              String?
  languagesSpoken       String[] @default([])
  reputation            Int      @default(0)
  role                  String   @default("user") // user|moderator|admin
  totalAchievements     Int      @default(0)
  achievementPoints     Int      @default(0)
  lastAchievementAt     DateTime?

  // NextAuth relations
  accounts              Account[]
  sessions              Session[]

  // Content authored
  phrases               Phrase[] @relation("phraseAuthor")
  definitions           Definition[] @relation("definitionAuthor")
  examples              Example[] @relation("exampleAuthor")

  // Votes and achievements
  definitionVotes       DefinitionVote[]
  exampleVotes          ExampleVote[]
  userAchievements      UserAchievement[]

  feedback              Feedback[]
  tags                  Tag[]
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

**Vote Models:**
```prisma
model DefinitionVote {
  userId          String
  user            User @relation(fields: [userId], references: [id], onDelete: Cascade)
  definitionId    Int
  definition      Definition @relation(fields: [definitionId], references: [id], onDelete: Cascade)
  value           Int  // -1, 0, or 1
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@id([userId, definitionId])
}

model ExampleVote {
  userId          String
  user            User @relation(fields: [userId], references: [id], onDelete: Cascade)
  exampleId       Int
  example         Example @relation(fields: [exampleId], references: [id], onDelete: Cascade)
  value           Int  // -1, 0, or 1
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@id([userId, exampleId])
}
```

**Achievement Models:**
```prisma
model Achievement {
  id              String   @id @default(cuid())
  name            String
  description     String
  icon            String
  category        String   // REPUTATION|CONTRIBUTION|SOCIAL|LEARNING|MILESTONE|HIDDEN
  tier            Int?     // For progressive achievements
  requirements    Json     // { profileCompleted: true, definitionsCreated: 5 }
  points          Int      // Reputation bonus
  isHidden        Boolean  @default(false)

  userAchievements UserAchievement[]
  createdAt       DateTime @default(now())
}

model UserAchievement {
  id              String   @id @default(cuid())
  userId          String
  user            User @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievementId   String
  achievement     Achievement @relation(fields: [achievementId], references: [id])
  progress        Int      @default(0)
  maxProgress     Int      @default(1)
  isCompleted     Boolean  @default(false)
  notified        Boolean  @default(false)
  unlockedAt      DateTime?
  createdAt       DateTime @default(now())

  @@unique([userId, achievementId])
}
```

**Other Models:**
```prisma
model Tag {
  id              Int       @id @default(autoincrement())
  name            String    @unique
  color           String    @default("#3B82F6")
  authorId        String
  author          User      @relation(fields: [authorId], references: [id])
  phrases         PhraseTag[]
  createdAt       DateTime  @default(now())
}

model PhraseTag {
  phraseId        Int
  phrase          Phrase    @relation(fields: [phraseId], references: [id], onDelete: Cascade)
  tagId           Int
  tag             Tag       @relation(fields: [tagId], references: [id])
  createdAt       DateTime  @default(now())

  @@id([phraseId, tagId])
}

model Feedback {
  id              Int       @id @default(autoincrement())
  type            String    // bug|feature|general
  subject         String
  message         String
  email           String?
  userId          String?
  user            User?     @relation(fields: [userId], references: [id])
  status          String    @default("pending")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

#### Key Database Constraints & Defaults

| Model | Field | Type | Constraint | Default |
|-------|-------|------|-----------|---------|
| Phrase | normalized | VARCHAR(255) | Unique with languageId | Auto-generated |
| Phrase | status | String | pending/approved/rejected/needs review | "pending" |
| User | username | String | UNIQUE, max 15 chars | Auto-generated |
| User | reputation | Int | Calculated from votes | 0 |
| User | role | String | user/moderator/admin | "user" |
| Vote | value | Int | -1, 0, or 1 | - |
| UserAchievement | progress | Int | Partial completion tracker | 0 |
| Achievement | isHidden | Boolean | Secret achievements | false |

#### Cascade Delete Behavior

- **User deleted:** Cascades to all content (phrases, definitions, examples, votes, feedback)
- **Phrase deleted:** Cascades to definitions and phrase_tags
- **Definition deleted:** Cascades to examples and votes
- **Example deleted:** Cascades to votes
- **Account deleted:** Cascades to sessions

---

### Business Logic Implementation Details

#### Reputation Calculation Algorithm

**Formula:**
```
reputation = (definitionUpvotes × 2) - (definitionDownvotes × 1)
           + (exampleUpvotes × 1) - (exampleDownvotes × 0.5)
           + (approvedPhrases × 1)

Final: max(0, reputation)  // Cannot go negative
```

**Example:**
```
User has:
- 10 definition upvotes → 10 × 2 = 20 points
- 2 definition downvotes → 2 × 1 = 2 points
- 5 example upvotes → 5 × 1 = 5 points
- 1 example downvote → 1 × 0.5 = 0.5 points
- 3 approved phrases → 3 × 1 = 3 points

Total = 20 - 2 + 5 - 0.5 + 3 = 25.5 ≈ 25 reputation
```

**Reputation Tiers:**
| Tier | Reputation Range |
|------|------------------|
| Newbie | 0-24 |
| Helper | 25-99 |
| Contributor | 100-499 |
| Expert | 500-999 |
| Legend | 1000+ |

**Implementation Location:** `src/lib/reputation.ts` in web codebase
**Mobile Implementation:** Must be ported to `src/lib/reputation.ts` in mobile app with exact same formula

#### Vote System - Toggle Behavior

**Critical Implementation Detail:**

When a user votes on a definition or example:
- **First vote (no prior vote):** Creates new vote with value 1 or -1
- **Same value voted again:** Deletes the vote (toggle off)
- **Different value voted:** Updates existing vote to new value (upsert)

**Database Implementation:**
Uses composite primary key `[userId, definitionId]` / `[userId, exampleId]`
Prisma `upsert` pattern with collision detection

**Pseudo-code:**
```typescript
const existingVote = await prisma.definitionVote.findUnique({
  where: { userId_definitionId: { userId, definitionId } }
});

if (existingVote?.value === newVoteValue) {
  // Same vote value → delete (toggle off)
  await prisma.definitionVote.delete({...});
} else {
  // Create or update
  await prisma.definitionVote.upsert({...});
}
```

**Mobile Must Implement:**
- Same toggle logic on VoteButtons component
- Optimistic UI updates for vote state
- Race condition handling for simultaneous votes
- Vote value in state must match database

#### Achievement System

**Trigger Events:**
- `VOTE_CAST`: User votes on definition/example
- `VOTE_RECEIVED`: User's content receives a vote
- `DEFINITION_CREATED`: User creates new definition
- `EXAMPLE_CREATED`: User creates new example
- `PHRASE_CREATED`: User creates new phrase
- `PROFILE_UPDATED`: User edits profile
- `INITIALIZATION`: App startup (once per session)

**Achievement Unlocking Flow:**
1. Event triggered
2. `checkAndAwardAchievements(userId, event)` called
3. Evaluates ALL incomplete achievements for user
4. For each achievement, checks if `requirements` object is satisfied
5. If satisfied, creates `UserAchievement` with `isCompleted=true` and `unlockedAt=now()`
6. Marks `notified=false` so notification system can display
7. Polling endpoint returns unnotified achievements every 30 seconds

**Achievement Requirements Example:**
```json
{
  "profileCompleted": true,
  "definitionsCreated": 5,
  "reputation": 100,
  "certificationsEarned": 1
}
```

**Progress Tracking:**
Some achievements are progressive:
- `UserAchievement.progress`: Current progress (e.g., 3 definitions created)
- `UserAchievement.maxProgress`: Goal (e.g., 5 definitions)
- `UserAchievement.isCompleted`: True when progress >= maxProgress

**Phase 1 Achievements (8 total):**

**Onboarding (5):**
1. Getting Started (profile complete)
2. Curious Mind (first search)
3. Language Explorer (visit first language)
4. Welcome Back (return visit)
5. First Recognition (receive first upvote)

**Contribution (3):**
1. First Definition (create first definition)
2. Example Giver (create first example)
3. First Vote (cast first vote)

**Polling Mechanism:**
- Endpoint: `/api/achievements/poll`
- Interval: Every 30 seconds on client
- Returns: Achievements with `notified=false` from last 30 seconds
- Shows: Toast/modal notification with achievement name, icon, points

#### Username Generation Algorithm

**Location:** `src/lib/username-generator.ts`

**Algorithm:**
1. Extract from user name (slugify, take first 15 chars)
2. If no name, use email prefix
3. Check uniqueness in database
4. If collision, append counter: "user1", "user2"... up to 999
5. If still collision after 999, append 6-char timestamp suffix

**Mobile Must Implement:**
- Same algorithm during OAuth signup
- Validation must happen server-side before user record created
- Return generated username in OAuth response

#### Search Algorithm

**Multi-field Search:**
- Searches 3 fields: `normalized` (lowercase), `transliteration`, `textOriginal`
- Case-insensitive matching
- Returns full nested data (phrase → definitions → examples → votes)
- Ordered by `createdAt DESC` (newest first)
- Only returns items with status "approved" or "pending"

**Search Preview (Typeahead):**
- Minimum 2 characters required
- Returns maximum 8 results
- Used in SearchScreen for dropdown suggestions

**Pagination:**
- Page-based (not cursor-based)
- Default limit: 20 results
- `hasMore` boolean indicates if more pages exist

#### Tag System

**Key Rules:**
- Tags are case-insensitive
- Duplicate check normalizes to lowercase before comparison
- Tags can have optional color hex value (default: #3B82F6)
- Multiple tags can be assigned to single phrase
- Tags created by users (stored with authorId)

**Mobile Must Implement:**
- Case-insensitive duplicate prevention
- Tag color display in UI
- Tag selection in phrase submission form

#### Admin Bulk Operations

**Endpoints:**
- `/api/admin/phrases/bulk-action`
- `/api/admin/definitions/bulk-action`
- `/api/admin/examples/bulk-action`

**Request Format:**
```typescript
{
  phraseIds: string[],  // Array of IDs to modify
  action: "approved" | "rejected"
}
```

**Response Format:**
```typescript
{
  success: true,
  updatedCount: number,
  action: string
}
```

**Behavior:**
- Only affects items with status "pending" or "needs review"
- Returns count of successfully updated items
- Mobile admin screen should show success toast with count

---

### Authentication & Authorization Details

#### OAuth Flow

**Backend Setup:**
1. Environment variables: `CLIENT_ID`, `CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
2. NextAuth.js with Google provider configured
3. PrismaAdapter handles User/Account/Session records

**User Creation Event:**
```typescript
// NextAuth createUser callback
const user = await prisma.user.create({
  data: {
    email: profile.email,
    name: profile.name,
    image: profile.image,
    username: await generateUsername(profile.name || profile.email)
  }
});
```

**Mobile OAuth Flow:**
1. Use `expo-auth-session` to open Google OAuth
2. Get authorization code/ID token
3. Exchange token with backend: `POST /api/auth/oauth`
4. Backend verifies token and returns session token
5. Store session token in SecureStore
6. Use session token in Authorization header for subsequent requests

#### Session Structure

**NextAuth Session Object:**
```typescript
{
  user: {
    id: string,           // CUID
    email: string,
    name: string,
    image?: string,
    username: string,
    role: "user" | "moderator" | "admin"
  },
  expires: string         // ISO datetime
}
```

#### Role-Based Access Control

**Roles:**
- `user`: Default, can submit content and vote
- `moderator`: (Not currently implemented)
- `admin`: Can access `/api/admin/*` endpoints

**Authorization Checks:**
All admin endpoints validate:
```typescript
const session = await getServerSession(authOptions);
if (session?.user?.role !== "admin") {
  return { error: "Unauthorized" };
}
```

#### Protected Routes

**Require Authentication:**
- `/submit` - Phrase submission
- `/profile` - User profile
- `/admin/*` - Admin panel
- Voting endpoints
- Achievement polling

**NSFW Content Protection:**
- PhraseCard component checks authentication
- Unauthenticated users clicking NSFW phrase → redirect to signin
- Authenticated users see full content

---

### Validation Rules & Error Handling

#### Per-Model Validation

**Phrase Validation:**
- `textOriginal`: Required, non-empty, trimmed
- `languageId`: Required, must exist
- `status`: Must be in ["pending", "approved", "rejected", "needs review"]

**Definition Validation:**
- `body`: Required, non-empty text
- `phraseId`: Required, must exist
- `status`: Must be in ["pending", "approved", "rejected", "needs review"]

**Example Validation:**
- `text`: Required, non-empty text
- `translation`: Optional string
- `definitionId`: Required, must exist

**User Validation:**
- `email`: Required, unique, valid format
- `username`: Required, unique, max 15 characters
- `languagesSpoken`: Optional array of strings

**Vote Validation:**
- `value`: Must be -1, 0, or 1
- `definitionId` or `exampleId`: Required, must exist
- `userId`: Required, must be authenticated

**Tag Validation:**
- `name`: Required, unique (case-insensitive), non-empty
- `color`: Optional hex color (default #3B82F6)

**Feedback Validation:**
- `type`: Required (bug|feature|general)
- `subject`: Required, non-empty
- `message`: Required, non-empty
- `email`: Optional (uses session email if available)

#### Error Codes & Messages

| HTTP Status | Scenario |
|------------|----------|
| 400 | Missing required fields, invalid parameters, array length 0 |
| 401 | Missing/invalid session, unauthorized access |
| 404 | Resource doesn't exist (phrase, definition, user) |
| 500 | Database error, unexpected server error |

#### Client vs Server Validation

**Client-Side (Mobile):**
- Form validation for required fields
- Input length checks
- Format validation (email, color)
- User feedback via form errors

**Server-Side (Backend):**
- All validation repeated (don't trust client)
- Database constraint checks
- Business logic validation (uniqueness, existence)
- Authorization checks

---

### Performance & Caching Strategy

#### Query Optimization Patterns

**Selective Field Inclusion:**
```typescript
// Only fetch needed fields
const author = await prisma.user.findUnique({
  where: { id: authorId },
  select: { name: true, username: true, image: true }
});
```

**Parallel Queries:**
```typescript
// Fetch vote and author in parallel
const [existingVote, author] = await Promise.all([
  prisma.definitionVote.findUnique({...}),
  prisma.user.findUnique({...})
]);
```

**Status Filtering at Query Level:**
```typescript
// Filter rejected items at database level
const phrases = await prisma.phrase.findMany({
  where: {
    status: { in: ["approved", "pending"] }
  }
});
```

#### Pagination Implementation

**Page-Based (NOT Cursor-Based):**
```typescript
const PAGE_SIZE = 20;
const phrases = await prisma.phrase.findMany({
  skip: (page - 1) * PAGE_SIZE,
  take: PAGE_SIZE,
  orderBy: { createdAt: "desc" }
});

const hasMore = phrases.length === PAGE_SIZE;
```

**Mobile Must Implement:**
- Track `currentPage` state
- Return `hasMore` boolean from API
- Increment page on "load more" click
- Not cursor-based (don't use IDs for pagination)

#### ISR & Cache Invalidation

**Web Uses ISR:**
- Homepage revalidates every 60 seconds
- `revalidatePath("/")` called after vote operations

**Mobile Should:**
- Use React Query cache invalidation
- Invalidate queries after mutations
- Set sensible stale time (30-60 seconds)
- Implement background refetching

---

### Critical Implementation Notes for Mobile

1. **Vote Toggle Behavior:** Same vote value = delete vote (toggle off), different value = update
2. **Achievement Polling:** 30-second interval, returns unnotified achievements from last 30 seconds
3. **Pagination:** Page-based (not cursor-based), track page numbers not IDs
4. **Status Filtering:** Rejected items never returned by any API
5. **Cascade Deletes:** Account deletion cascades all content
6. **Username Uniqueness:** Must be unique, validated during OAuth flow
7. **Reputation Formula:** Three components (definitions, examples, phrases) - match exactly
8. **Tag Case-Insensitivity:** Tag names stored lowercase, search must account for this
9. **Search Multi-Field:** Must search normalized AND transliteration fields
10. **Admin Bulk Response:** Returns updated count, not individual results
11. **NSFW Protection:** Unauthenticated users redirected to signin on click
12. **Composite Keys:** Vote tables use [userId, definitionId]/[userId, exampleId] as primary key
13. **Field Limits:** `Phrase.normalized` is VARCHAR(255), username max 15 chars
14. **Enum Values:** Status: pending/approved/rejected/needs review
15. **Default Values:** User role="user", reputation=0, status="pending"

---

### Mobile-Specific Implementation Considerations

#### Offline Mode
- Cache phrases/definitions with React Query
- Queue votes/submissions for sync when online
- Show cached content with "offline" indicator
- Sync when connection restored

#### Network Handling
- Timeout: 10 seconds (configurable)
- Retry logic: exponential backoff
- Error messages: Display user-friendly messages
- Loading states: Show skeleton screens

#### Performance on Mobile
- Memoize expensive components
- Virtualize long lists (FlatList already does this)
- Optimize images (Google URLs only)
- Code splitting: Lazy load screens
- Bundle size: Monitor and optimize

#### Session Management
- Store token in SecureStore (not AsyncStorage)
- Refresh token if expired
- Clear token on logout
- Handle 401 responses with re-authentication

---

## MVP Scope & Timeline

### MVP Feature Set (Priority Order)

**MVP (Must Ship):**
1. **Login** - Google OAuth authentication
2. **Browse phrases** - By language, with pagination
3. **Search phrases** - Global search with pagination
4. **View phrase details** - Definitions + examples + author info
5. **Vote on definitions/examples** - Upvote/downvote with toggle behavior
6. **Submit phrases** - New phrase + initial definition
7. **Add definitions/examples** - To existing phrases
8. **User profile** - View own profile, edit bio/location/languages
9. **Public user profiles** - View other users' profiles
10. **Reputation system** - Display & calculation (read-only)
11. **Contributions list** - View own submissions
12. **Tags system** - Select tags when submitting
13. **Edit/delete submissions** - User can edit own content
14. **Content flagging** - Report inappropriate content
15. **Logout** - Clear auth session

**Post-MVP (Future Releases):**
1. Admin moderation panel (approve/reject content)
2. Achievements & notifications (unlock system, polling)
3. Feedback system (bug reports, feature requests)
4. Advanced search filters (by language, tags, author)
5. Offline mode (cached content)

### Development Timeline (MVP Only)

**Total Duration:** 4-5 weeks
**Team Size:** 1 developer recommended

| Phase | Duration | Objective | Features |
|-------|----------|-----------|----------|
| Phase 1 | 3-4 days | Setup & Infrastructure | Expo init, project structure, dependencies, environment config |
| Phase 2 | 2-3 days | API Client & Auth | Axios setup, OAuth flow, SecureStore token management |
| Phase 3 | 2-3 days | Navigation & Base Components | Bottom tab navigation, reusable UI components, theming |
| Phase 4 | 3-4 days | Browse & Search | Languages screen, phrases list, search, pagination |
| Phase 5 | 2-3 days | Phrase Details & Voting | Definition/example display, vote buttons, author info |
| Phase 6 | 4-5 days | Submit & Edit Content | Submit phrase, add definitions/examples, edit/delete content |
| Phase 7 | 3-4 days | User Profiles & Reputation | Own profile, public profiles, reputation, contributions, profile editing |
| Phase 8 | 2-3 days | Tags & Flagging | Tag selection in forms, content flagging UI |
| Phase 9 | 2-3 days | Polish & Testing | Bug fixes, performance optimization, device testing, production build |

**Total: ~4-5 weeks for fully functional MVP**

---

## Phase 1: Project Setup & Infrastructure

### 1.1 Initialize Expo Project

```bash
# Create new Expo project
npx create-expo-app yung-salita-mobile --template

# Navigate to project
cd yung-salita-mobile

# Initialize TypeScript
npx expo install typescript
npx tsc --init

# Install Expo CLI globally (optional)
npm install -g eas-cli
```

### 1.2 Project Structure

```
yung-salita-mobile/
├── src/
│   ├── screens/               # Screen components (replaces pages/)
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   ├── home/
│   │   │   ├── LanguagesScreen.tsx
│   │   │   ├── PhrasesScreen.tsx
│   │   │   └── PhraseDetailScreen.tsx
│   │   ├── search/
│   │   │   ├── SearchScreen.tsx
│   │   │   └── SearchResultsScreen.tsx
│   │   ├── submit/
│   │   │   ├── SubmitPhraseScreen.tsx
│   │   │   └── AddDefinitionScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── EditProfileScreen.tsx
│   │   │   ├── AchievementsScreen.tsx
│   │   │   ├── ContributionsScreen.tsx
│   │   │   └── PublicProfileScreen.tsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── ManagePhrasesScreen.tsx
│   │   │   ├── ManageDefinitionsScreen.tsx
│   │   │   └── ManageExamplesScreen.tsx
│   │   └── settings/
│   │       ├── AboutScreen.tsx
│   │       ├── FeedbackScreen.tsx
│   │       └── SettingsScreen.tsx
│   │
│   ├── components/            # Reusable UI components
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── TabBar.tsx
│   │   │   ├── SegmentedControl.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   └── Avatar.tsx
│   │   ├── PhraseCard.tsx
│   │   ├── DefinitionCard.tsx
│   │   ├── VoteButtons.tsx
│   │   ├── ReputationBadge.tsx
│   │   ├── AchievementBadge.tsx
│   │   ├── LanguageTag.tsx
│   │   ├── LoadingSkeletons.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── NavigationHeader.tsx
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── usePhrases.ts
│   │   ├── useSearch.ts
│   │   ├── useVote.ts
│   │   ├── useProfile.ts
│   │   ├── useAchievements.ts
│   │   ├── useAppState.ts
│   │   └── usePagination.ts
│   │
│   ├── api/                   # API client & data fetching
│   │   ├── client.ts          # Axios/fetch setup
│   │   ├── phraseApi.ts       # Phrase endpoints
│   │   ├── definitionApi.ts   # Definition endpoints
│   │   ├── userApi.ts         # User/auth endpoints
│   │   ├── searchApi.ts       # Search endpoints
│   │   ├── voteApi.ts         # Vote endpoints
│   │   ├── achievementApi.ts  # Achievement endpoints
│   │   ├── feedbackApi.ts     # Feedback endpoints
│   │   └── types.ts           # API response types
│   │
│   ├── store/                 # State management (Zustand)
│   │   ├── authStore.ts
│   │   ├── phraseStore.ts
│   │   ├── userStore.ts
│   │   ├── achievementStore.ts
│   │   └── uiStore.ts
│   │
│   ├── lib/                   # Shared utilities
│   │   ├── reputation.ts      # Reputation calculation (shared with web)
│   │   ├── achievements.ts    # Achievement logic (shared with web)
│   │   ├── slugify.ts         # URL slug generation (shared with web)
│   │   ├── username-generator.ts (shared with web)
│   │   ├── constants.ts       # Achievement definitions, languages
│   │   ├── validation.ts      # Zod schemas (shared with web)
│   │   └── utils.ts           # Utility functions
│   │
│   ├── types/                 # TypeScript types
│   │   ├── index.ts           # Re-export common types
│   │   └── api.ts             # API response types
│   │
│   ├── navigation/            # Navigation setup
│   │   ├── RootNavigator.tsx  # Auth-based conditional navigation
│   │   ├── AuthNavigator.tsx  # Auth stack (login, signup)
│   │   ├── AppNavigator.tsx   # App stack (home, search, submit, etc.)
│   │   ├── linking.ts         # Deep linking configuration
│   │   └── types.ts           # Navigation type definitions
│   │
│   ├── styles/                # Theme & styling
│   │   ├── colors.ts          # Color palette
│   │   ├── spacing.ts         # Spacing/sizing system
│   │   ├── typography.ts      # Font sizes, weights
│   │   ├── theme.ts           # Theme context
│   │   └── tailwind.config.js # NativeWind config (if using)
│   │
│   ├── assets/                # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   ├── fonts/             # Downloaded Geist fonts
│   │   └── animations/
│   │
│   ├── context/               # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── NotificationContext.tsx
│   │
│   └── App.tsx                # Root component
│
├── app.json                   # Expo app configuration
├── eas.json                   # EAS build configuration
├── tsconfig.json              # TypeScript config
├── package.json
├── babel.config.js
├── metro.config.js
└── README.md
```

### 1.3 Core Dependencies

```json
{
  "dependencies": {
    "react": "~18.3.1",
    "react-native": "0.76.3",
    "expo": "~52.0.0",
    "expo-auth-session": "~7.0.0",
    "expo-web-browser": "~13.0.0",
    "expo-secure-store": "~13.0.0",
    "expo-clipboard": "~6.0.3",
    "expo-font": "~12.0.7",
    "react-navigation": "^6.1.18",
    "react-native-screens": "~4.0.0",
    "react-native-safe-area-context": "~4.10.5",
    "react-native-gesture-handler": "~2.21.0",
    "react-native-reanimated": "~3.15.0",
    "react-native-vector-icons": "^10.1.0",
    "@react-navigation/native": "^6.1.18",
    "@react-navigation/bottom-tabs": "^6.6.0",
    "@react-navigation/native-stack": "^6.11.0",
    "zustand": "^4.5.5",
    "@tanstack/react-query": "^5.45.0",
    "axios": "^1.7.2",
    "zod": "^3.25.74",
    "nativewind": "^2.0.11",
    "tailwindcss": "^3.4.1",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "@types/react": "~18.3.3",
    "@types/react-native": "^0.73.0",
    "typescript": "~5.3.3",
    "@react-native/metro-config": "^0.73.0",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.4.3"
  }
}
```

### 1.4 Configuration Files

**app.json** (Expo configuration)
```json
{
  "expo": {
    "name": "Yung Salita",
    "slug": "yung-salita",
    "version": "1.0.0",
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.yungsalita.app"
    },
    "android": {
      "package": "com.yungsalita.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon-foreground.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-font",
      "expo-secure-store"
    ]
  }
}
```

**eas.json** (EAS build configuration)
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview2": {
      "android": {
        "gradleCommand": ":app:assembleRelease"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### 1.5 Environment Variables

Create `.env` file with API configuration:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## Phase 2: Backend API Layer & Authentication

### 2.1 API Client Setup

**src/api/client.ts** - Axios configuration
```typescript
import axios, { AxiosError, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      await SecureStore.deleteItemAsync('authToken');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2.2 API Service Modules

**src/api/phraseApi.ts** - Phrase operations
```typescript
import apiClient from './client';
import { Phrase, Definition, Example } from '@/types';

export const phraseApi = {
  getLanguages: () => apiClient.get('/api/languages'),
  getPhrases: (languageId: string, page: number = 1) =>
    apiClient.get('/api/phrases', { params: { languageId, page } }),
  getPhraseBySlug: (lang: string, slug: string) =>
    apiClient.get(`/api/${lang}/${slug}`),
  searchPhrases: (query: string, language?: string) =>
    apiClient.get('/api/search', { params: { q: query, language } }),
  submitPhrase: (data: any) => apiClient.post('/api/phrases', data),
  editPhrase: (id: string, data: any) => apiClient.put(`/api/phrases/${id}`, data),
  addDefinition: (phraseId: string, data: any) =>
    apiClient.post(`/api/definitions`, { ...data, phraseId }),
  addExample: (definitionId: string, data: any) =>
    apiClient.post(`/api/examples`, { ...data, definitionId }),
};
```

**src/api/voteApi.ts** - Voting operations
```typescript
export const voteApi = {
  voteDefinition: (definitionId: string, value: 1 | -1) =>
    apiClient.post('/api/votes/definition', { definitionId, value }),
  voteExample: (exampleId: string, value: 1 | -1) =>
    apiClient.post('/api/votes/example', { exampleId, value }),
  flagDefinition: (definitionId: string, reason: string) =>
    apiClient.post('/api/flag-definition', { definitionId, reason }),
};
```

Similar modules for: `userApi`, `searchApi`, `achievementApi`, `feedbackApi`

### 2.3 OAuth Authentication

**src/api/auth.ts** - Authentication setup
```typescript
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

// Configure OAuth
const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;
const REDIRECT_URI = AuthSession.getRedirectUrl();

export const googleAuth = {
  async login() {
    const request = new AuthSession.AuthRequest({
      clientId: CLIENT_ID,
      scopes: ['profile', 'email'],
      redirectUrl: REDIRECT_URI,
    });

    const result = await request.promptAsync({
      useProxy: true,
      skipCodeExchange: false,
    });

    if (result.type === 'success' && result.params.id_token) {
      // Exchange token with backend
      const response = await fetch(`${API_URL}/api/auth/oauth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: result.params.id_token }),
      });

      const data = await response.json();
      if (data.sessionToken) {
        await SecureStore.setItemAsync('authToken', data.sessionToken);
        return data.user;
      }
    }
    throw new Error('Authentication failed');
  },

  async logout() {
    await SecureStore.deleteItemAsync('authToken');
  },

  async getSession() {
    return await SecureStore.getItemAsync('authToken');
  },
};
```

### 2.4 State Management - Auth Store

**src/store/authStore.ts** - Zustand auth state
```typescript
import { create } from 'zustand';
import { googleAuth } from '@/api/auth';

interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  reputation: number;
  role: 'user' | 'moderator' | 'admin';
  image?: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await googleAuth.login();
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  logout: async () => {
    await googleAuth.logout();
    set({ user: null });
  },

  checkSession: async () => {
    const token = await googleAuth.getSession();
    if (token) {
      // Fetch user info from API
      const response = await apiClient.get('/api/profile/me');
      set({ user: response.data });
    }
  },
}));
```

### 2.5 Data Fetching with React Query

**src/hooks/usePhrases.ts** - Custom hook with TanStack Query
```typescript
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { phraseApi } from '@/api/phraseApi';

export const usePhrases = (languageId: string) => {
  return useInfiniteQuery({
    queryKey: ['phrases', languageId],
    queryFn: ({ pageParam = 1 }) => phraseApi.getPhrases(languageId, pageParam),
    getNextPageParam: (lastPage, pages) => pages.length + 1,
  });
};

export const useSearchPhrases = (query: string, language?: string) => {
  return useQuery({
    queryKey: ['search', query, language],
    queryFn: () => phraseApi.searchPhrases(query, language),
    enabled: query.length > 0,
  });
};
```

---

## Phase 3: Core UI Components & Navigation

### 3.1 Theme System

**src/styles/theme.ts** - Theme configuration
```typescript
export const colors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  background: '#FFFFFF',
  surface: '#F3F4F6',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  nsfw: '#9F1239',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: 'bold', lineHeight: 32 },
  body: { fontSize: 16, fontWeight: 'normal', lineHeight: 24 },
  caption: { fontSize: 12, fontWeight: 'normal', lineHeight: 16 },
};

export const theme = { colors, spacing, typography };
```

### 3.2 Core UI Components

**src/components/ui/Button.tsx** - Reusable button
```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '@/styles/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}) => {
  const colors = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    danger: theme.colors.danger,
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors[variant] },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Text style={styles.text}>{loading ? 'Loading...' : label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});
```

Similar components needed:
- `Card.tsx` - Content container
- `Input.tsx` - Text input with validation
- `Badge.tsx` - Tags and status indicators
- `Modal.tsx` - Dialogs and bottom sheets
- `Avatar.tsx` - User profile images
- `Skeleton.tsx` - Loading placeholders
- `Toast.tsx` - Notifications

### 3.3 Navigation Setup

**src/navigation/RootNavigator.tsx** - Conditional auth-based navigation
```typescript
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';

export const RootNavigator = () => {
  const { user, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
```

**src/navigation/AppNavigator.tsx** - Main app with bottom tabs
```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';

// Import screens
import { HomeScreen } from '@/screens/home/HomeScreen';
import { SearchScreen } from '@/screens/search/SearchScreen';
import { SubmitScreen } from '@/screens/submit/SubmitPhraseScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Search') iconName = 'search';
          else if (route.name === 'Submit') iconName = 'add-circle';
          else if (route.name === 'Profile') iconName = 'person';
          else if (route.name === 'Settings') iconName = 'settings';
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Search" component={SearchStackNavigator} />
      <Tab.Screen name="Submit" component={SubmitStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
};

// Stack navigators for each tab
const HomeStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// Similar for other tabs...
```

---

## Phase 4: Feature Implementation - Core Features

### 4.1 Browse Languages & Phrases

**src/screens/home/HomeScreen.tsx**
```typescript
import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { phraseApi } from '@/api/phraseApi';
import { LanguageCard } from '@/components/LanguageCard';
import { Skeleton } from '@/components/ui/Skeleton';

export const HomeScreen = ({ navigation }) => {
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | null>(null);

  const { data: languages, isLoading: languagesLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: () => phraseApi.getLanguages(),
  });

  const { data: phrases, isLoading: phrasesLoading } = useQuery({
    queryKey: ['phrases', selectedLanguageId],
    queryFn: () => selectedLanguageId ? phraseApi.getPhrases(selectedLanguageId) : null,
    enabled: !!selectedLanguageId,
  });

  return (
    <View style={styles.container}>
      {!selectedLanguageId ? (
        // Languages list view
        <FlatList
          data={languages}
          renderItem={({ item }) => (
            <LanguageCard
              language={item}
              onPress={() => setSelectedLanguageId(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
        />
      ) : (
        // Phrases list view
        <FlatList
          data={phrases}
          renderItem={({ item }) => (
            <PhraseCard
              phrase={item}
              onPress={() => navigation.navigate('PhraseDetail', { slug: item.slug })}
            />
          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
});
```

### 4.2 Phrase Detail Screen

**src/screens/home/PhraseDetailScreen.tsx**
```typescript
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { phraseApi } from '@/api/phraseApi';
import { PhraseCard } from '@/components/PhraseCard';
import { DefinitionCard } from '@/components/DefinitionCard';
import { VoteButtons } from '@/components/VoteButtons';

export const PhraseDetailScreen = ({ route }) => {
  const { slug } = route.params;
  const { lang } = route.params;

  const { data: phrase, isLoading } = useQuery({
    queryKey: ['phrase', lang, slug],
    queryFn: () => phraseApi.getPhraseBySlug(lang, slug),
  });

  if (isLoading) return <Skeleton />;

  return (
    <ScrollView style={styles.container}>
      <PhraseCard phrase={phrase} />
      {phrase?.definitions.map((def) => (
        <DefinitionCard
          key={def.id}
          definition={def}
          onVote={(value) => voteApi.voteDefinition(def.id, value)}
        />
      ))}
    </ScrollView>
  );
};
```

### 4.3 Search Functionality

**src/screens/search/SearchScreen.tsx**
```typescript
import React, { useState, useCallback } from 'react';
import { View, TextInput, FlatList, StyleSheet, Keyboard } from 'react-native';
import { debounce } from 'lodash';
import { useSearchPhrases } from '@/hooks/usePhrases';
import { PhraseCard } from '@/components/PhraseCard';

export const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useSearchPhrases(query);

  const handleSearch = useCallback(
    debounce((text: string) => {
      setQuery(text);
    }, 300),
    []
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search phrases..."
        onChangeText={handleSearch}
        placeholderTextColor="#999"
      />
      {isLoading && <Text>Searching...</Text>}
      <FlatList
        data={results}
        renderItem={({ item }) => (
          <PhraseCard
            phrase={item}
            onPress={() => navigation.navigate('PhraseDetail', { slug: item.slug })}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
});
```

### 4.4 Voting System

**src/components/VoteButtons.tsx**
```typescript
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuthStore } from '@/store/authStore';
import { voteApi } from '@/api/voteApi';

interface VoteButtonsProps {
  definitionId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  onVoteSuccess?: () => void;
}

export const VoteButtons: React.FC<VoteButtonsProps> = ({
  definitionId,
  initialUpvotes,
  initialDownvotes,
  onVoteSuccess,
}) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);
  const { user } = useAuthStore();

  const handleVote = async (value: 1 | -1) => {
    if (!user) {
      // Redirect to login
      return;
    }

    try {
      await voteApi.voteDefinition(definitionId, value);

      if (userVote === 0) {
        if (value === 1) setUpvotes(upvotes + 1);
        else setDownvotes(downvotes + 1);
      } else if (userVote === value) {
        // Undo vote
        if (value === 1) setUpvotes(upvotes - 1);
        else setDownvotes(downvotes - 1);
      }

      setUserVote(userVote === value ? 0 : value);
      onVoteSuccess?.();
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, userVote === 1 && styles.active]}
        onPress={() => handleVote(1)}
      >
        <Ionicons name="thumbs-up" size={20} color={userVote === 1 ? '#10B981' : '#999'} />
        <Text style={styles.count}>{upvotes}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, userVote === -1 && styles.active]}
        onPress={() => handleVote(-1)}
      >
        <Ionicons name="thumbs-down" size={20} color={userVote === -1 ? '#EF4444' : '#999'} />
        <Text style={styles.count}>{downvotes}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  active: {
    backgroundColor: '#E8F5E9',
  },
  count: {
    marginLeft: 4,
    color: '#666',
    fontWeight: '500',
  },
});
```

---

## Phase 5: Feature Implementation - User Features

### 5.1 User Profile Screen

**src/screens/profile/ProfileScreen.tsx**
```typescript
import React from 'react';
import { View, ScrollView, Text, StyleSheet, FlatList } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/userApi';
import { Avatar } from '@/components/ui/Avatar';
import { ReputationBadge } from '@/components/ReputationBadge';
import { Button } from '@/components/ui/Button';

export const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => userApi.getProfile(user!.id),
  });

  return (
    <ScrollView style={styles.container}>
      {/* Header with avatar and name */}
      <View style={styles.header}>
        <Avatar source={{ uri: user?.image }} size={80} />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
      </View>

      {/* Reputation section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reputation</Text>
        <ReputationBadge reputation={user?.reputation} />
      </View>

      {/* Contributions section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contributions</Text>
        <Button
          label="View All"
          onPress={() => navigation.navigate('Contributions')}
        />
      </View>

      {/* Achievements section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <Button
          label="View Achievements"
          onPress={() => navigation.navigate('Achievements')}
        />
      </View>

      {/* Action buttons */}
      <Button
        label="Edit Profile"
        onPress={() => navigation.navigate('EditProfile')}
      />
      <Button
        label="Logout"
        variant="danger"
        onPress={logout}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  username: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
});
```

### 5.2 Edit Profile

**src/screens/profile/EditProfileScreen.tsx**
```typescript
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { userApi } from '@/api/userApi';

export const EditProfileScreen = ({ navigation }) => {
  const { user, setUser } = useAuthStore();
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updated = await userApi.updateProfile(user!.id, {
        bio,
        location,
      });
      setUser(updated);
      Alert.alert('Success', 'Profile updated');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Input
        label="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
      />
      <Input
        label="Location"
        value={location}
        onChangeText={setLocation}
      />
      <Button
        label="Save Changes"
        onPress={handleSave}
        loading={isLoading}
      />
    </ScrollView>
  );
};
```

### 5.3 User Contributions

**src/screens/profile/ContributionsScreen.tsx**
```typescript
import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Pressable, Text } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/userApi';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

export const ContributionsScreen = () => {
  const [tab, setTab] = useState<'definitions' | 'examples' | 'phrases'>('definitions');
  const { user } = useAuthStore();

  const { data: contributions } = useQuery({
    queryKey: ['contributions', user?.id, tab],
    queryFn: () => userApi.getContributions(user!.id, tab),
  });

  return (
    <View style={styles.container}>
      <SegmentedControl
        values={['Definitions', 'Examples', 'Phrases']}
        selectedIndex={['definitions', 'examples', 'phrases'].indexOf(tab)}
        onChange={(index) => setTab(['definitions', 'examples', 'phrases'][index])}
      />
      <FlatList
        data={contributions}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.text || item.body}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  item: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});
```

---

## Post-MVP Features

The following features are documented here for development **after the MVP release**. They are not included in the initial 4-5 week timeline.

### Phase 10 (Post-MVP): Admin Moderation Panel

Admin features for content approval/rejection:
- List pending phrases, definitions, examples
- Bulk approve/reject actions
- Individual content editing
- Status filtering (pending, needs review)

See the "Business Logic Implementation Details" section for admin bulk operations format.

### Phase 11 (Post-MVP): Achievements & Notifications

Achievement system with polling:
- Achievement unlocking based on user activity
- 30-second polling for new achievements
- Achievement notifications with animations
- Achievement progress tracking

See the "Achievement System" section under "Business Logic Implementation Details" for complete implementation details.

### Phase 12 (Post-MVP): Feedback System

User feedback collection:
- Bug reports
- Feature requests
- General feedback
- Feedback tracking and status updates

### Phase 13 (Post-MVP): Advanced Features

- Advanced search filters (by language, tags, author)
- Offline mode with cached content
- Background sync for queued submissions
- Push notifications (optional)

---

## MVP Phase Details

### Phase 6: Feature Implementation - Contribution & Moderation (Submit & Edit)

#### 6.1 Submit Phrase Screen

**src/screens/submit/SubmitPhraseScreen.tsx**
```typescript
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SelectLanguage } from '@/components/SelectLanguage';
import { TagSelector } from '@/components/TagSelector';
import { phraseApi } from '@/api/phraseApi';

export const SubmitPhraseScreen = () => {
  const { user } = useAuthStore();
  const [phrase, setPhrase] = useState('');
  const [languageId, setLanguageId] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [definition, setDefinition] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!phrase || !languageId || !definition) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await phraseApi.submitPhrase({
        textOriginal: phrase,
        languageId,
        pronunciation,
        tags,
        definition,
      });
      Alert.alert('Success', 'Phrase submitted for moderation');
      // Reset form
      setPhrase('');
      setDefinition('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit phrase');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <SelectLanguage value={languageId} onChange={setLanguageId} />
      <Input
        label="Phrase"
        value={phrase}
        onChangeText={setPhrase}
        placeholder="Enter the phrase"
        required
      />
      <Input
        label="Pronunciation (optional)"
        value={pronunciation}
        onChangeText={setPronunciation}
      />
      <Input
        label="Definition"
        value={definition}
        onChangeText={setDefinition}
        multiline
        placeholder="Explain the phrase"
        required
      />
      <TagSelector selectedTags={tags} onSelectTags={setTags} />
      <Button
        label="Submit Phrase"
        onPress={handleSubmit}
        loading={isLoading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
});
```

### 6.2 Admin Dashboard

**src/screens/admin/AdminDashboard.tsx**
```typescript
import React from 'react';
import { View, FlatList, StyleSheet, Pressable, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';

export const AdminDashboard = ({ navigation }) => {
  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminApi.getStats(),
  });

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('ManagePhrases')}
      >
        <Text style={styles.cardTitle}>Manage Phrases</Text>
        <Text style={styles.cardCount}>{stats?.pendingPhrases || 0} Pending</Text>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('ManageDefinitions')}
      >
        <Text style={styles.cardTitle}>Manage Definitions</Text>
        <Text style={styles.cardCount}>{stats?.pendingDefinitions || 0} Pending</Text>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('ManageExamples')}
      >
        <Text style={styles.cardTitle}>Manage Examples</Text>
        <Text style={styles.cardCount}>{stats?.pendingExamples || 0} Pending</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginTop: 8,
  },
});
```

---

---

## Post-MVP Implementation Details (Phases 10-13)

### Phase 11 (Post-MVP): Achievements & Notifications - Detailed Implementation

#### 11.1 Reputation System Display

**src/components/ReputationBadge.tsx**
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const getTierInfo = (reputation: number) => {
  if (reputation < 25) return { tier: 'Newbie', color: '#6B7280' };
  if (reputation < 100) return { tier: 'Helper', color: '#3B82F6' };
  if (reputation < 500) return { tier: 'Contributor', color: '#10B981' };
  if (reputation < 1000) return { tier: 'Expert', color: '#F59E0B' };
  return { tier: 'Legend', color: '#9F1239' };
};

export const ReputationBadge: React.FC<{ reputation: number }> = ({ reputation }) => {
  const { tier, color } = getTierInfo(reputation);

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <Text style={[styles.tier, { color }]}>{tier}</Text>
      <Text style={styles.reputation}>{reputation} points</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  tier: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  reputation: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
```

#### 11.2 Achievement System Screen

**src/screens/profile/AchievementsScreen.tsx**
```typescript
import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { achievementApi } from '@/api/achievementApi';
import { AchievementBadge } from '@/components/AchievementBadge';

export const AchievementsScreen = () => {
  const { user } = useAuthStore();
  const { data: achievements } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: () => achievementApi.getAchievements(user!.id),
  });

  const unlockedCount = achievements?.filter((a) => a.unlockedAt).length || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.count}>{unlockedCount}</Text>
        <Text style={styles.label}>Achievements Unlocked</Text>
      </View>

      <FlatList
        data={achievements}
        numColumns={3}
        renderItem={({ item }) => (
          <AchievementBadge
            achievement={item}
            unlocked={!!item.unlockedAt}
          />
        )}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.grid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
  },
  count: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  grid: {
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});
```

#### 11.3 Achievement Notifications

**src/components/achievements/AchievementNotification.tsx**
```typescript
import React, { useEffect, useState } from 'react';
import { Animated, View, Text, StyleSheet, Easing } from 'react-native';
import { useAchievementStore } from '@/store/achievementStore';

export const AchievementNotification = () => {
  const { unlockedAchievement, clearNotification } = useAchievementStore();
  const slideAnim = new Animated.Value(-100);

  useEffect(() => {
    if (unlockedAchievement) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      const timeout = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 500,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(() => clearNotification());
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [unlockedAchievement]);

  if (!unlockedAchievement) return null;

  return (
    <Animated.View
      style={[styles.notification, { transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.icon}>{unlockedAchievement.icon}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>Achievement Unlocked!</Text>
        <Text style={styles.description}>{unlockedAchievement.name}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  notification: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 2,
  },
});
```

#### 11.4 Achievement Polling Hook

**src/hooks/useAchievementPolling.ts**
```typescript
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAchievementStore } from '@/store/achievementStore';
import { achievementApi } from '@/api/achievementApi';

export const useAchievementPolling = () => {
  const { user } = useAuthStore();
  const { setUnlockedAchievement } = useAchievementStore();
  const intervalRef = useRef<number | null>(null);
  const pollCountRef = useRef(0);

  useEffect(() => {
    if (!user) return;

    const startPolling = () => {
      const poll = async () => {
        try {
          const newAchievements = await achievementApi.checkNewAchievements(user.id);

          if (newAchievements.length > 0) {
            newAchievements.forEach((achievement) => {
              setUnlockedAchievement(achievement);
            });
            pollCountRef.current = 0; // Reset count
          } else {
            pollCountRef.current++;
          }

          // Exponential backoff: increase interval based on poll count
          const nextInterval = Math.min(10000, 1000 * Math.pow(2, pollCountRef.current));
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = setInterval(poll, nextInterval) as any;
        } catch (error) {
          console.error('Achievement polling error:', error);
        }
      };

      poll();
    };

    startPolling();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);
};
```

---

## Phase 8: Performance, Testing & Deployment

### 8.1 Performance Optimization

**Memoization:**
```typescript
import { memo } from 'react';
import { PhraseCard } from '@/components/PhraseCard';

export const MemoizedPhraseCard = memo(PhraseCard, (prevProps, nextProps) => {
  return prevProps.phrase.id === nextProps.phrase.id;
});
```

**FlatList Optimization:**
```typescript
<FlatList
  data={phrases}
  renderItem={({ item }) => <MemoizedPhraseCard phrase={item} />}
  keyExtractor={(item) => item.id}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={20}
  removeClippedSubviews={true}
/>
```

### 8.2 Testing Setup

**Jest configuration** in `package.json`:
```json
{
  "jest": {
    "preset": "react-native",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
    "testEnvironment": "node"
  }
}
```

**Example unit test:**
```typescript
// src/lib/__tests__/reputation.test.ts
import { calculateReputation } from '@/lib/reputation';

describe('Reputation calculation', () => {
  it('calculates correct reputation from votes', () => {
    const reputation = calculateReputation({
      definitionUpvotes: 5,
      definitionDownvotes: 1,
      exampleUpvotes: 10,
      exampleDownvotes: 2,
      approvedPhrases: 3,
    });

    expect(reputation).toBe(5 * 2 - 1 + 10 * 1 - 2 * 0.5 + 3);
  });
});
```

### 8.3 Build Configuration

**EAS build for iOS:**
```bash
eas build --platform ios
```

**EAS build for Android:**
```bash
eas build --platform android
```

**Submit to app stores:**
```bash
eas submit --platform ios  # TestFlight
eas submit --platform android  # Google Play
```

### 8.4 Error Handling

**Global Error Boundary:**
```typescript
import React from 'react';
import { View, Text, Button } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Something went wrong</Text>
          <Button title="Reload" onPress={() => this.setState({ hasError: false })} />
        </View>
      );
    }

    return this.props.children;
  }
}
```

---

## Code Sharing Between Web & Mobile

### Shared Files (Can be reused)

1. **Type Definitions**
   - Prisma schema types
   - API response types
   - Zod validation schemas

2. **Utility Functions**
   - `lib/reputation.ts` - Reputation calculations
   - `lib/achievements.ts` - Achievement logic
   - `lib/slugify.ts` - URL slug generation
   - `lib/username-generator.ts` - Username generation
   - `lib/constants.ts` - Achievement definitions

3. **Validation**
   - Zod schemas for forms and API responses
   - Shared validation logic

### Not Shareable

1. **UI Components** - Different platform requirements
2. **Next.js Server Logic** - Use REST API instead
3. **NextAuth.js** - Replace with Expo AuthSession
4. **Styling** - Tailwind → StyleSheet/NativeWind

---

## Environment Configuration

### Development

```bash
# .env (development)
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_GOOGLE_CLIENT_ID=dev_client_id
```

### Production

```bash
# .env.production
EXPO_PUBLIC_API_URL=https://yungsalita.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID=prod_client_id
```

---

## Migration Dependencies

### Required API Changes on Backend

1. ✅ **OAuth Endpoint:** Create `/api/auth/oauth` for mobile token exchange
2. ✅ **CORS Configuration:** Enable mobile app origin
3. ✅ **Session Validation:** Support bearer token validation (in addition to session cookies)

### Optional Backend Enhancements

1. Push notifications endpoint (for achievement alerts)
2. Offline sync queues (if offline-first features needed)
3. Image upload endpoints (for profile pictures)

---

## Success Criteria

- [ ] Users can authenticate via Google OAuth
- [ ] All core dictionary features work (browse, search, view phrases)
- [ ] Users can submit phrases and definitions
- [ ] Voting system works with real-time updates
- [ ] User profiles display correctly with reputation and achievements
- [ ] Admin panel functional for moderating content
- [ ] App performs well on iOS and Android devices
- [ ] App builds and deploys via EAS successfully
- [ ] Offline mode gracefully degrades (shows cached content)
- [ ] Responsive design works on phones and tablets

---

## Next Steps

1. Start Phase 1: Initialize Expo project and install dependencies
2. Create project structure and configuration files
3. Proceed sequentially through phases, testing after each major feature
4. Keep backend API synchronized with mobile requirements
5. Test on real devices early and often

---

### Backend API Changes Required

The following backend changes are **required** to support mobile app:

1. **OAuth Token Exchange Endpoint:**
   ```
   POST /api/auth/oauth
   Body: { token: string }  // ID token from Google
   Response: { sessionToken: string, user: User }
   ```

2. **Bearer Token Support:**
   - API should accept `Authorization: Bearer <token>` header
   - Currently only supports session cookies
   - Implement token validation middleware

3. **CORS Configuration:**
   - Add mobile app origin to CORS allowed origins
   - Consider using `expo://` protocol for deep linking

4. **Session Token Generation:**
   - Create secure session tokens for mobile (not JWT)
   - Store tokens in secure format
   - Implement token expiration and refresh

### TypeScript Type Definitions for Mobile

**Core Types to Export from Backend:**

```typescript
// User
interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  image?: string;
  bio?: string;
  location?: string;
  languagesSpoken: string[];
  reputation: number;
  role: 'user' | 'moderator' | 'admin';
  totalAchievements: number;
  achievementPoints: number;
  createdAt: string;
}

// Language
interface Language {
  id: number;
  name: string;
  isoCode: string;
  transliteration: boolean;
  _count?: { phrases: number };
}

// Phrase
interface Phrase {
  id: number;
  textOriginal: string;
  normalized: string;
  slug: string;
  partOfSpeech?: string;
  pronunciation?: string;
  transliteration?: string;
  languageId: number;
  language?: Language;
  authorId: string;
  author?: User;
  status: 'pending' | 'approved' | 'rejected' | 'needs review';
  definitions?: Definition[];
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}

// Definition
interface Definition {
  id: number;
  body: string;
  mediaUrl?: string;
  authorId: string;
  author?: User;
  phraseId: number;
  status: 'pending' | 'approved' | 'rejected' | 'needs review';
  examples?: Example[];
  votes?: DefinitionVote[];
  _count?: { votes: number };
  createdAt: string;
  updatedAt: string;
}

// Example
interface Example {
  id: number;
  text: string;
  translation?: string;
  authorId: string;
  author?: User;
  definitionId: number;
  status: 'pending' | 'approved' | 'rejected' | 'needs review';
  votes?: ExampleVote[];
  _count?: { votes: number };
  createdAt: string;
  updatedAt: string;
}

// Votes
interface DefinitionVote {
  userId: string;
  definitionId: number;
  value: -1 | 0 | 1;
  createdAt: string;
}

interface ExampleVote {
  userId: string;
  exampleId: number;
  value: -1 | 0 | 1;
  createdAt: string;
}

// Achievement
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'REPUTATION' | 'CONTRIBUTION' | 'SOCIAL' | 'LEARNING' | 'MILESTONE' | 'HIDDEN';
  points: number;
  isHidden: boolean;
}

interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement?: Achievement;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  notified: boolean;
  unlockedAt?: string;
}

// Tag
interface Tag {
  id: number;
  name: string;
  color: string;
  authorId: string;
  _count?: { phrases: number };
}

// Feedback
interface Feedback {
  id: number;
  type: 'bug' | 'feature' | 'general';
  subject: string;
  message: string;
  email?: string;
  userId?: string;
  status: string;
  createdAt: string;
}

// API Responses
interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  totalCount?: number;
  currentPage?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

---

### Quick Reference: Endpoint to Screen Mapping

| Web URL | Mobile Screen | Endpoint |
|---------|---------------|----------|
| `/[lang]` | LanguagesScreen → PhrasesScreen | `/api/languages`, `/api/language-phrases` |
| `/[lang]/[slug]` | PhraseDetailScreen | Direct from list selection |
| `/search?q=...` | SearchResultsScreen | `/api/search` |
| `/submit` | SubmitPhraseScreen | `/api/phrases` (POST) |
| `/profile` | ProfileScreen | `/api/profile` (GET) |
| `/profile/edit` | EditProfileScreen | `/api/profile` (PUT) |
| `/user/[username]` | PublicProfileScreen | Need endpoint or use from list |
| `/admin` | AdminDashboard | `/api/admin/*` |
| `/feedback` | FeedbackScreen | `/api/feedback` (POST) |

---

### Known Quirks & Edge Cases

1. **Vote Race Conditions:** Two votes submitted simultaneously might both succeed before toggle check
   - **Solution:** Implement optimistic UI and handle conflicts gracefully

2. **Achievement Notification Double-Trigger:** Polling might show same achievement twice if timing is off
   - **Solution:** Mark as notified immediately, use idempotent notifications

3. **Username Collision During Signup:** Rare race condition if two users OAuth at exact same time
   - **Solution:** Server-side uniqueness validation (database unique constraint)

4. **Search with Empty Query:** Should not search on empty string
   - **Solution:** Client-side min length check (2 characters)

5. **Pagination at Boundary:** User at last page might get page with fewer than limit items
   - **Solution:** Check `hasMore` boolean, don't request next page if false

6. **NSFW Blur on Offline:** Cached NSFW phrases might show blur even when authenticated
   - **Solution:** Store NSFW status with cache, check local auth state

7. **Transliteration Search:** Some languages may not have transliteration field
   - **Solution:** Gracefully handle null transliteration field in search

8. **Reputation Calculation Mismatch:** Complex formula might have floating point precision issues
   - **Solution:** Round to nearest integer, match web implementation exactly

---

## References & Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query (TanStack Query)](https://tanstack.com/query/latest)
- [NativeWind](https://www.nativewind.dev/)
- [EAS Build & Submit](https://docs.expo.dev/build/introduction/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)

---

## Implementation Checklist

### Pre-Development
- [ ] Backend OAuth endpoint `/api/auth/oauth` implemented
- [ ] Bearer token validation middleware added
- [ ] CORS configuration updated for mobile
- [ ] Session token generation implemented
- [ ] Type definitions exported from backend
- [ ] Database backup created

### Phase 1-3 Checklist
- [ ] Expo project initialized with TypeScript
- [ ] Project structure created
- [ ] Core dependencies installed
- [ ] Prisma schema studied and documented
- [ ] API client with interceptors implemented
- [ ] OAuth flow tested end-to-end
- [ ] Navigation structure implemented
- [ ] 5+ core UI components created

### Phase 4 Checklist (Browse & Search)
- [ ] Languages list screen working
- [ ] Phrases list by language with pagination
- [ ] Search functionality with results
- [ ] Search preview (typeahead) working
- [ ] Page-based pagination implemented
- [ ] All lists virtualized with FlatList

### Phase 5 Checklist (Phrase Details & Voting)
- [ ] Phrase detail screen displaying definitions & examples
- [ ] Vote buttons with toggle behavior working
- [ ] Vote counts display correctly
- [ ] Author information displayed
- [ ] Optimistic UI updates for votes
- [ ] Proper error handling for vote failures

### Phase 6 Checklist (Submit & Edit Content)
- [ ] Submit phrase form complete
- [ ] Add definition form working
- [ ] Add example form working
- [ ] Edit phrase/definition/example working
- [ ] Delete submissions working
- [ ] Tag selection in forms
- [ ] Form validation working

### Phase 7 Checklist (User Profiles & Reputation)
- [ ] Own profile screen complete
- [ ] Profile editing working
- [ ] Public user profile screen accessible
- [ ] Reputation display and calculations correct
- [ ] Reputation tiers display correctly
- [ ] Contributions list with sorting
- [ ] Profile images displaying

### Phase 8 Checklist (Tags & Flagging)
- [ ] Tag selection in submit forms
- [ ] Tag creation working
- [ ] Content flagging UI complete
- [ ] Flag submission to API working
- [ ] Flag UI confirmation showing

### Phase 9 Checklist (Polish & Testing)
- [ ] Performance metrics reviewed
- [ ] Bundle size acceptable
- [ ] FlatList optimization implemented
- [ ] Unit tests for core logic (reputation, vote toggling)
- [ ] Integration tests for API calls
- [ ] Error boundaries in place
- [ ] All features tested on real iOS device
- [ ] All features tested on real Android device
- [ ] Network error handling tested
- [ ] Accessibility review completed
- [ ] UI/UX polish applied
- [ ] Final bug fixes
- [ ] Production build created
- [ ] EAS configuration complete
- [ ] Ready for MVP release

---

## MVP Release Checklist

Before initial app store release:

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint passing with no warnings
- [ ] No console errors or warnings in development mode
- [ ] Error boundaries in place and tested

### Functionality Testing (MVP Features)
- [ ] OAuth login successful (iOS & Android)
- [ ] Browse languages and phrases working
- [ ] Search functionality working
- [ ] Vote system working (toggle behavior correct)
- [ ] Submit phrases working
- [ ] Add definitions/examples working
- [ ] User profiles working (own + public)
- [ ] Reputation calculation correct
- [ ] Tags system working
- [ ] Content flagging working
- [ ] Pagination working (page-based)
- [ ] Edit/delete submissions working

### Performance
- [ ] App loads in < 2 seconds
- [ ] Scrolling smooth (60 FPS)
- [ ] No memory leaks
- [ ] Battery usage reasonable
- [ ] Network requests optimized

### Platform-Specific
- [ ] iOS status bar styling
- [ ] Android safe area handling
- [ ] Back button handling (Android)
- [ ] Notch handling (Dynamic Island, etc.)
- [ ] Permission handling (if needed)

### Legal & Compliance
- [ ] Privacy policy linked and updated
- [ ] Terms of service linked and updated
- [ ] Age rating set correctly
- [ ] GDPR compliance verified
- [ ] Content rating appropriate

### App Store Metadata
- [ ] App name and description finalized
- [ ] App icons created (all sizes)
- [ ] Screenshots created for both platforms
- [ ] Video preview created (optional)
- [ ] Keywords optimized for search

---

## Troubleshooting Common Issues

### OAuth Not Working
- Check CLIENT_ID and CLIENT_SECRET in environment variables
- Verify redirect URI matches Expo config
- Check CORS configuration on backend
- Test with web version first

### Vote Updates Not Reflecting
- Ensure optimistic UI matches database state
- Check vote toggle logic implementation
- Verify API response format
- Test race condition scenarios

### Search Results Not Showing
- Verify normalized field populated correctly
- Check transliteration field for language
- Confirm status filtering (approved/pending only)
- Test with simple queries first

### Performance Issues
- Profile using React Native debugger
- Check FlatList rendering count
- Monitor memory usage
- Optimize images and assets
