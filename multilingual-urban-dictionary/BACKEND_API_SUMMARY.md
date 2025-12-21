# Backend API Summary - Multilingual Urban Dictionary

## Project Structure

**Root Directory**: `/Users/lourdrickvalsote/Documents/Projects/dev/mangograham/multilingual-urban-dictionary/`

### Technology Stack
- **Framework**: Next.js (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Language**: TypeScript

### Key Directories
```
src/
├── app/api/                    # All API endpoints (Next.js App Router)
├── lib/                        # Utility libraries and services
│   ├── auth.ts                # NextAuth configuration
│   ├── achievements.ts        # Achievement system service
│   ├── reputation.ts          # Reputation calculation system
│   ├── prisma.ts             # Prisma client singleton
│   └── ...other utilities
└── ...other app structure
```

---

## API Routes Structure

### Directory Tree
```
src/app/api/
├── achievements/
│   ├── check-return-visit/route.ts
│   └── poll/route.ts
├── admin/
│   ├── definitions/
│   │   ├── route.ts (GET)
│   │   ├── action/route.ts (POST)
│   │   └── bulk-action/route.ts (POST)
│   ├── examples/
│   │   ├── route.ts (GET)
│   │   ├── action/route.ts (POST)
│   │   └── bulk-action/route.ts (POST)
│   ├── phrases/
│   │   ├── route.ts (GET)
│   │   ├── action/route.ts (POST)
│   │   └── bulk-action/route.ts (POST)
│   └── edit-phrase/[id]/route.ts (PUT)
├── auth/[...nextauth]/route.ts
├── contributions/route.ts (GET)
├── feedback/route.ts (POST)
├── flag-definition/route.ts (POST)
├── language-phrases/route.ts (GET)
├── languages/route.ts (GET)
├── languages/[languageId]/contributors/route.ts (GET)
├── phrases/route.ts (GET)
├── profile/route.ts (PUT, DELETE)
├── search/route.ts (GET)
├── search-preview/route.ts
├── tags/route.ts (GET, POST)
└── sitemap.xml/route.ts
```

---

## Core Entities & Database Schema

### Key Models

```typescript
// User
model User {
  id: string (CUID)
  name: string?
  username: string? @unique
  email: string? @unique
  emailVerified: DateTime?
  image: string?
  bio: string?
  location: string?
  languagesSpoken: string[] (array of language codes)
  reputation: int @default(0)
  role: string @default("user")
  
  // Achievement tracking
  totalAchievements: int @default(0)
  achievementPoints: int @default(0)
  lastAchievementAt: DateTime?
  
  createdAt: DateTime
  
  // Relations
  definitions: Definition[]
  examples: Example[]
  phrases: Phrase[]
  tags: Tag[]
  definitionVotes: DefinitionVote[]
  exampleVotes: ExampleVote[]
  userAchievements: UserAchievement[]
  feedback: Feedback[]
}

// Phrase (a term/word in a specific language)
model Phrase {
  id: int
  textOriginal: string
  normalized: string (lowercase version)
  slug: string @unique
  partOfSpeech: string?
  pronunciation: string?
  transliteration: string?
  languageId: int
  authorId: string?
  status: string @default("pending") // "pending", "approved", "rejected", "needs review"
  createdAt: DateTime
  updatedAt: DateTime
  
  definitions: Definition[]
  language: Language
  author: User?
  tags: PhraseTag[]
  
  @@unique([languageId, normalized])
}

// Definition (explanation of a phrase)
model Definition {
  id: int
  body: string
  mediaUrl: string?
  authorId: string
  phraseId: int
  status: string @default("pending")
  createdAt: DateTime
  updatedAt: DateTime
  
  author: User
  phrase: Phrase
  votes: DefinitionVote[]
  examples: Example[]
}

// Example (usage example for a definition)
model Example {
  id: int
  text: string
  translation: string?
  authorId: string
  definitionId: int
  status: string @default("pending")
  createdAt: DateTime
  updatedAt: DateTime
  
  author: User
  definition: Definition
  votes: ExampleVote[]
}

// Voting system
model DefinitionVote {
  userId: string
  definitionId: int
  value: int (1 or -1)
  createdAt: DateTime
  @@id([userId, definitionId])
}

model ExampleVote {
  userId: string
  exampleId: int
  value: int (1 or -1)
  createdAt: DateTime
  @@id([userId, exampleId])
}

// Achievement system
model Achievement {
  id: string (CUID)
  name: string
  description: string
  icon: string (emoji/icon identifier)
  category: AchievementCategory
  tier: int @default(1)
  requirements: Json (flexible criteria storage)
  points: int @default(0)
  isHidden: boolean @default(false)
}

model UserAchievement {
  userId: string
  achievementId: string
  progress: int
  maxProgress: int
  isCompleted: boolean
  notified: boolean
  unlockedAt: DateTime?
}

// Feedback system
model Feedback {
  id: int
  type: string (feedback type)
  subject: string
  message: string
  email: string?
  userId: string?
  status: string @default("pending")
  createdAt: DateTime
  updatedAt: DateTime
  user: User?
}

// Tags & Organization
model Tag {
  id: int
  name: string @unique
  color: string? @default("#3B82F6")
  authorId: string
  createdAt: DateTime
  updatedAt: DateTime
  author: User
  phrases: PhraseTag[]
}

model PhraseTag {
  phraseId: int
  tagId: int
  createdAt: DateTime
  @@id([phraseId, tagId])
}
```

---

## API Endpoints Reference

### AUTHENTICATION
**Endpoint**: `POST /api/auth/[...nextauth]`
- Uses NextAuth.js with Google OAuth provider
- Database sessions (no JWT)
- User auto-created on first login with generated username

---

### USER PROFILE

#### GET /api/profile
**Note**: No explicit GET endpoint in the code, but PUT/DELETE exist

#### PUT /api/profile
**Authentication**: Required (user must be logged in)

**Request Body**:
```typescript
{
  name?: string | null
  username?: string | null
  bio?: string | null
  location?: string | null
  languagesSpoken?: string[] // array of language codes
}
```

**Response**:
```typescript
{
  message: string
  user: User {
    id: string
    name: string | null
    username: string | null
    email: string
    image: string | null
    bio: string | null
    location: string | null
    languagesSpoken: string[]
    reputation: int
    role: string
    totalAchievements: int
    achievementPoints: int
    createdAt: Date
  }
  achievements: Achievement[] // newly unlocked achievements
}
```

**Status Codes**:
- 200: Profile updated successfully
- 400: Username already taken
- 401: Unauthorized
- 500: Server error

#### DELETE /api/profile
**Authentication**: Required

**Response**:
```typescript
{
  message: "Account deleted successfully"
}
```

**Status Codes**:
- 200: Account deleted
- 401: Unauthorized
- 500: Server error

---

### USER CONTRIBUTIONS

#### GET /api/contributions
**Authentication**: Required

**Query Parameters**:
```typescript
{
  page?: number (default: 1)
  limit?: number (default: 10)
  type?: "phrases" | "definitions" | "examples" (default: "phrases")
  sortBy?: "recent" | "upvotes" | "oldest" (default: "recent")
  userId?: string (optional, for fetching other users' contributions)
}
```

**Response**:
```typescript
{
  data: Phrase[] | Definition[] | Example[] // depends on 'type' parameter
  hasMore: boolean
  type: "phrases" | "definitions" | "examples"
  totalCounts: {
    phrases: number
    definitions: number
    examples: number
  }
}
```

**Response Shape Examples**:

**Type: "phrases"**:
```typescript
{
  data: {
    id: number
    textOriginal: string
    normalized: string
    slug: string
    partOfSpeech: string | null
    pronunciation: string | null
    transliteration: string | null
    languageId: number
    status: string
    createdAt: Date
    updatedAt: Date
    language: {
      id: number
      name: string
      isoCode: string
      transliteration: boolean
    }
    definitions: {
      body: string
      votes: DefinitionVote[]
    }[]
  }[]
}
```

**Type: "definitions"**:
```typescript
{
  data: {
    id: number
    body: string
    mediaUrl: string | null
    status: string
    createdAt: Date
    authorId: string
    phraseId: number
    phrase: {
      id: number
      textOriginal: string
      language: {
        id: number
        name: string
        isoCode: string
      }
    }
    votes: DefinitionVote[]
    examples: Example[]
  }[]
}
```

**Type: "examples"**:
```typescript
{
  data: {
    id: number
    text: string
    translation: string | null
    status: string
    createdAt: Date
    authorId: string
    definitionId: number
    definition: {
      id: number
      body: string
      phrase: {
        id: number
        textOriginal: string
        language: {
          id: number
          name: string
          isoCode: string
        }
      }
    }
    votes: ExampleVote[]
  }[]
}
```

**Status Codes**:
- 200: Success
- 401: Unauthorized
- 400: Invalid type parameter
- 500: Server error

---

### ACHIEVEMENTS

#### GET /api/achievements/poll
**Authentication**: Required
**Purpose**: Client-side polling for newly unlocked achievements

**Response**:
```typescript
{
  achievements: Achievement[] // only achievements unlocked in last 30 seconds
}
```

**Behavior**: 
- Polls for achievements unlocked in the last 30 seconds with `notified: false`
- Automatically marks returned achievements as notified
- Returns empty array if no new achievements

**Status Codes**:
- 200: Success (may be empty)
- 401: Unauthorized
- 500: Server error

---

### FEEDBACK

#### POST /api/feedback
**Authentication**: Optional (can submit without login)

**Request Body**:
```typescript
{
  type: string // feedback category/type
  subject: string // feedback subject line
  message: string // main feedback message
  email?: string // optional email, uses session email if not provided
}
```

**Response**:
```typescript
{
  success: true
  message: "Feedback submitted successfully"
}
```

**Validation**:
- type, subject, message are required
- email is optional (uses logged-in user's email or provided email)

**Status Codes**:
- 200: Feedback submitted
- 400: Missing required fields
- 500: Server error

---

### ADMIN ENDPOINTS

All admin endpoints require `role === "admin"`

#### GET /api/admin/phrases
**Query Parameters**:
```typescript
{
  page?: number (default: 1)
  limit?: number (default: 10)
}
```

**Response**:
```typescript
{
  phrases: {
    id: number
    textOriginal: string
    normalized: string
    slug: string
    status: string // "pending" or "needs review"
    createdAt: Date
    language: {
      id: number
      name: string
      isoCode: string
    }
    definitions: {
      body: string
    }[]
  }[]
  totalCount: number
  hasMore: boolean
  currentPage: number
}
```

#### POST /api/admin/phrases/action
**Request Body**:
```typescript
{
  phraseId: number
  action: "approved" | "rejected"
}
```

**Response**:
```typescript
{
  success: true
}
```

#### POST /api/admin/phrases/bulk-action
**Request Body**:
```typescript
{
  phraseIds: number[] // array of phrase IDs
  action: "approved" | "rejected"
}
```

**Response**:
```typescript
{
  success: true
  updatedCount: number // number of phrases updated
  action: "approved" | "rejected"
}
```

#### GET /api/admin/definitions
**Query Parameters**:
```typescript
{
  page?: number (default: 1)
  limit?: number (default: 10)
}
```

**Response**:
```typescript
{
  definitions: {
    id: number
    body: string
    mediaUrl: string | null
    status: string
    createdAt: Date
    phrase: {
      id: number
      textOriginal: string
      language: {
        id: number
        name: string
        isoCode: string
      }
    }
    examples: Example[]
  }[]
  totalCount: number
  hasMore: boolean
  currentPage: number
}
```

#### POST /api/admin/definitions/action
**Request Body**:
```typescript
{
  definitionId: number
  action: "approved" | "rejected"
}
```

#### GET /api/admin/examples
**Query Parameters**: Same as phrases/definitions

**Response**: Examples with nested definition and phrase info

#### POST /api/admin/examples/action
**Request Body**:
```typescript
{
  exampleId: number
  action: "approved" | "rejected"
}
```

#### PUT /api/admin/edit-phrase/[id]
**Parameters**: 
- `id` (path): phrase ID

**Request Body**:
```typescript
{
  textOriginal: string
  transliteration?: string
  pronunciation?: string
  partOfSpeech?: string
  languageId: number
  status: string
  selectedTags?: number[] // tag IDs
  definitions?: {
    id?: number // if provided, updates existing; if not, creates new
    body: string
    status: string
    examples?: {
      id?: number
      text: string
      translation?: string
      status: string
    }[]
  }[]
}
```

**Response**:
```typescript
{
  id: number
  textOriginal: string
  normalized: string
  slug: string
  languageId: number
  status: string
  createdAt: Date
  updatedAt: Date
}
```

**Behavior**:
- Handles creation and update of phrases, definitions, and examples
- Deletes definitions/examples not included in the request
- Auto-updates slug if textOriginal changes
- Cascades updates to related records

---

## PUBLIC/GENERAL ENDPOINTS

### GET /api/phrases
**Query Parameters**:
```typescript
{
  page?: number (default: 1)
  limit?: number (default: 20)
}
```

**Response**:
```typescript
{
  phrases: {
    id: number
    textOriginal: string
    slug: string
    language: {
      id: number
      name: string
      isoCode: string
    }
    tags: {
      tag: {
        id: number
        name: string
        color: string
        authorId: string
      }
    }[]
    definitions: {
      id: number
      body: string
      mediaUrl: string | null
      status: string
      votes: DefinitionVote[]
      author: {
        name: string | null
        email: string
      }
      examples: {
        id: number
        text: string
        status: string
        votes: ExampleVote[]
      }[]
    }[]
  }[]
  hasMore: boolean
}
```

---

### GET /api/search
**Query Parameters**:
```typescript
{
  q: string // required: search query
  page?: number (default: 1)
  limit?: number (default: 20)
}
```

**Response**: Same shape as `/api/phrases`

**Behavior**: 
- Searches against normalized text and transliteration
- Case-insensitive search

---

### GET /api/languages
**Query Parameters**:
```typescript
{
  page?: number (default: 1)
  limit?: number (default: 20)
}
```

**Response**:
```typescript
{
  languages: {
    id: number
    name: string
    isoCode: string
    transliteration: boolean
    _count: {
      phrases: number
    }
  }[]
  hasMore: boolean
}
```

---

### GET /api/language-phrases
**Query Parameters**:
```typescript
{
  languageId: number // required
  page?: number (default: 1)
  limit?: number (default: 20)
}
```

**Response**: Same shape as `/api/phrases`

---

### GET /api/languages/[languageId]/contributors
**Parameters**: 
- `languageId` (path): language ID

**Query Parameters**:
```typescript
{
  period?: "all-time" | "weekly" | "monthly" (default: "all-time")
}
```

**Response**:
```typescript
[
  {
    id: string
    name: string | null
    username: string | null
    phraseCount: number
    definitionCount: number
    exampleCount: number
    totalContributions: number
  }
]
// Top 10 contributors, sorted by totalContributions desc
```

---

### GET /api/tags
**Response**:
```typescript
{
  tags: {
    id: number
    name: string
    color: string
    authorId: string
    author: {
      name: string | null
      username: string | null
    }
    _count: {
      phrases: number
    }
  }[]
}
```

---

### POST /api/tags
**Authentication**: Required

**Request Body**:
```typescript
{
  name: string // required, will be normalized to lowercase
  color?: string // optional, defaults to "#3B82F6"
}
```

**Response**:
```typescript
{
  tag: {
    id: number
    name: string
    color: string
    authorId: string
    author: {
      name: string | null
      username: string | null
    }
    _count: {
      phrases: number
    }
  }
}
```

**Status Codes**:
- 201: Tag created
- 400: Tag already exists or invalid name
- 401: Unauthorized
- 500: Server error

---

### POST /api/flag-definition
**Authentication**: Required

**Request Body**:
```typescript
{
  definitionId?: number
  exampleId?: number
  phraseId?: number
  // Must provide exactly one of the above
}
```

**Response**:
```typescript
{
  success: true
  message: "Definition|Example|Phrase flagged successfully"
}
```

**Behavior**:
- Flags content for review by changing status to "needs review"
- Can only flag one item at a time
- Only flags approved content

**Status Codes**:
- 200: Content flagged
- 400: Invalid request (multiple items or not approved)
- 401: Unauthorized
- 404: Content not found
- 500: Server error

---

## Core Services & Utilities

### Achievement Service (`/src/lib/achievements.ts`)

```typescript
class AchievementService {
  // Initialize achievements for new user
  static async initializeUserAchievements(userId: string): Promise<void>
  
  // Ensure user has achievement records
  static async ensureUserInitialized(userId: string): Promise<void>
  
  // Check and award achievements
  static async checkAndAwardAchievements(
    userId: string, 
    triggerType: string
  ): Promise<Achievement[]>
  
  // Award specific achievement
  static async awardAchievement(
    userId: string, 
    achievementId: string
  ): Promise<boolean>
  
  // Get user's achievements with progress
  static async getUserAchievements(
    userId: string
  ): Promise<UserAchievementWithAchievement[]>
  
  // Get achievement progress for dashboard
  static async getAchievementProgress(
    userId: string
  ): Promise<AchievementProgress[]>
  
  // Seed achievements to database
  static async seedAchievements(): Promise<void>
}
```

**Key Types**:
```typescript
interface AchievementProgress {
  achievement: Achievement
  progress: number
  maxProgress: number
  isCompleted: boolean
  unlockedAt?: Date
}

interface UserStats {
  reputation: number
  daysSinceMembership: number
  definitionsCreated: number
  examplesCreated: number
  phrasesCreated: number
  votesCast: number
  totalVotesReceived: number
  upvotesReceived: number
  phrasesViewed: number
  languagesExplored: number
  languagePagesVisited: number
  searchesPerformed: number
  profileCompleted: boolean
  returnVisit: boolean
}
```

---

### Reputation System (`/src/lib/reputation.ts`)

```typescript
// Calculate reputation breakdown
async function calculateUserReputation(userId: string): Promise<ReputationBreakdown>

// Update user's reputation score
async function updateUserReputation(userId: string): Promise<number>

// Get reputation level information
function getReputationLevel(reputation: number): {
  level: string
  color: string
  minRep: number
  nextLevel?: { name: string; minRep: number }
}
```

**Reputation Calculation**:
- Definition upvote: +2 points
- Definition downvote: -1 point
- Example upvote: +1 point
- Example downvote: -0.5 point
- Approved phrase: +1 point

**Reputation Levels**:
- Newbie: 0-24 reputation
- Helper: 25-99 reputation
- Contributor: 100-499 reputation
- Expert: 500-999 reputation
- Legend: 1000+ reputation

---

### Authentication (`/src/lib/auth.ts`)

```typescript
export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma)
  providers: [Google({ clientId, clientSecret })]
  // Uses database sessions (not JWT)
  callbacks: {
    session({ session, user }) {
      // Attaches user ID and role to session
    }
  }
  events: {
    createUser({ user }) {
      // Auto-generates and assigns username on first login
    }
  }
}

export async function auth(): Promise<Session | null>
```

**Session Shape**:
```typescript
{
  user: {
    id: string
    role: string ("user" or "admin")
    name?: string | null
    email?: string | null
    image?: string | null
  }
}
```

---

### Utilities

**Prisma Client** (`/src/lib/prisma.ts`):
- Singleton pattern to prevent multiple instances in development
- Singleton exported as `export const prisma`

**Utils** (`/src/lib/utils.ts`):
```typescript
// Tailwind/className utility
function cn(...inputs: ClassValue[]): string
```

---

## Common Patterns & Conventions

### Error Handling
- All endpoints use try-catch blocks
- Consistent error response format: `{ error: string, status: number }`
- Standard HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error)

### Authentication
- Most endpoints use `getServerSession(authConfig)` to get the session
- Returns `NextResponse.json({ error: "Unauthorized" }, { status: 401 })` if not authenticated
- Admin endpoints check `session.user?.role !== "admin"`

### Pagination
- Query parameters: `page` and `limit`
- Returns `hasMore` boolean to indicate if more results exist
- Standard pagination: `skip = (page - 1) * limit`

### Database Queries
- Use Prisma for all database operations
- Includes related data with `include` when needed
- Counts use `_count` with `select` for specific relationship counts
- Timestamps: `createdAt`, `updatedAt` on most models

### Status Transitions
- Content (phrases, definitions, examples) flow through statuses: pending → approved/rejected/needs review
- "needs review" status is used when content is flagged by users
- Admins approve/reject pending and "needs review" items

---

## Summary Statistics

- **Total API Routes**: 25+ distinct endpoints
- **Admin-Protected Endpoints**: 8 (phrases, definitions, examples with action/bulk-action variants)
- **Public Endpoints**: ~12 (search, phrases, languages, tags, etc.)
- **Authenticated User Endpoints**: 5 (profile, contributions, achievements, feedback, flag)
- **Database Models**: 12 core entities
- **Auth Strategy**: NextAuth.js with Google OAuth + Database Sessions

