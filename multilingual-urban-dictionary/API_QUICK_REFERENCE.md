# API Endpoints - Quick Reference

## Authentication & User Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/[...nextauth]` | OAuth | Google OAuth login |
| PUT | `/api/profile` | YES | Update user profile |
| DELETE | `/api/profile` | YES | Delete user account |

## User Content

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/contributions` | YES | Get user's contributions (phrases/definitions/examples) |
| GET | `/api/achievements/poll` | YES | Poll for newly unlocked achievements |
| POST | `/api/feedback` | OPT | Submit feedback |
| POST | `/api/flag-definition` | YES | Flag content for review |

## Public Content

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/phrases` | NO | Get all approved phrases (paginated) |
| GET | `/api/search` | NO | Search phrases (by normalized text) |
| GET | `/api/languages` | NO | Get all languages with phrase counts |
| GET | `/api/language-phrases` | NO | Get phrases for specific language |
| GET | `/api/languages/[id]/contributors` | NO | Get top contributors for a language |
| GET | `/api/tags` | NO | Get all tags |
| POST | `/api/tags` | YES | Create new tag |

## Admin Only Endpoints

### Phrases
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/phrases` | List pending/needs-review phrases |
| POST | `/api/admin/phrases/action` | Approve/reject single phrase |
| POST | `/api/admin/phrases/bulk-action` | Approve/reject multiple phrases |
| PUT | `/api/admin/edit-phrase/[id]` | Edit phrase with definitions & examples |

### Definitions
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/definitions` | List pending/needs-review definitions |
| POST | `/api/admin/definitions/action` | Approve/reject single definition |
| POST | `/api/admin/definitions/bulk-action` | Approve/reject multiple definitions |

### Examples
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/examples` | List pending/needs-review examples |
| POST | `/api/admin/examples/action` | Approve/reject single example |
| POST | `/api/admin/examples/bulk-action` | Approve/reject multiple examples |

---

## Key Request/Response Shapes

### PUT /api/profile

**Request:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "bio": "Language enthusiast",
  "location": "New York",
  "languagesSpoken": ["en", "es", "fr"]
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user123",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "bio": "Language enthusiast",
    "location": "New York",
    "languagesSpoken": ["en", "es", "fr"],
    "reputation": 42,
    "role": "user",
    "totalAchievements": 3,
    "achievementPoints": 50,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "achievements": []
}
```

### GET /api/contributions?type=definitions&sortBy=upvotes&page=1&limit=10

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "body": "A slang term for...",
      "mediaUrl": null,
      "status": "approved",
      "createdAt": "2024-01-15T10:30:00Z",
      "authorId": "user123",
      "phraseId": 5,
      "phrase": {
        "id": 5,
        "textOriginal": "Mantra",
        "language": {
          "id": 1,
          "name": "English",
          "isoCode": "en"
        }
      },
      "votes": [
        { "userId": "user2", "definitionId": 1, "value": 1 },
        { "userId": "user3", "definitionId": 1, "value": 1 }
      ],
      "examples": [
        {
          "id": 10,
          "text": "That's my mantra!",
          "votes": []
        }
      ]
    }
  ],
  "hasMore": true,
  "type": "definitions",
  "totalCounts": {
    "phrases": 5,
    "definitions": 12,
    "examples": 28
  }
}
```

### GET /api/achievements/poll

**Response:**
```json
{
  "achievements": [
    {
      "id": "ach123",
      "name": "First Definition",
      "description": "Create your first definition",
      "icon": "✍️",
      "category": "CONTRIBUTION",
      "tier": 1,
      "requirements": { "definitionsCreated": 1 },
      "points": 10,
      "isHidden": false
    }
  ]
}
```

### POST /api/feedback

**Request:**
```json
{
  "type": "bug",
  "subject": "Search feature not working",
  "message": "When I search for 'hola', no results appear",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully"
}
```

### GET /api/admin/phrases?page=1&limit=10

**Response:**
```json
{
  "phrases": [
    {
      "id": 1,
      "textOriginal": "Mantra",
      "normalized": "mantra",
      "slug": "mantra",
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00Z",
      "language": {
        "id": 1,
        "name": "English",
        "isoCode": "en"
      },
      "definitions": [
        {
          "body": "A repeated phrase or saying"
        }
      ]
    }
  ],
  "totalCount": 25,
  "hasMore": true,
  "currentPage": 1
}
```

### POST /api/admin/phrases/action

**Request:**
```json
{
  "phraseId": 1,
  "action": "approved"
}
```

**Response:**
```json
{
  "success": true
}
```

### POST /api/admin/phrases/bulk-action

**Request:**
```json
{
  "phraseIds": [1, 2, 3, 4, 5],
  "action": "approved"
}
```

**Response:**
```json
{
  "success": true,
  "updatedCount": 5,
  "action": "approved"
}
```

### PUT /api/admin/edit-phrase/[id]

**Request:**
```json
{
  "textOriginal": "Mantra",
  "transliteration": "मंत्र",
  "pronunciation": "MUHN-truh",
  "partOfSpeech": "noun",
  "languageId": 1,
  "status": "approved",
  "selectedTags": [1, 3, 5],
  "definitions": [
    {
      "id": 10,
      "body": "A repeated phrase or saying",
      "status": "approved",
      "examples": [
        {
          "text": "That's my mantra!",
          "translation": "Ese es mi mantra!",
          "status": "approved"
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "textOriginal": "Mantra",
  "normalized": "mantra",
  "slug": "mantra",
  "languageId": 1,
  "status": "approved",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-16T14:25:00Z"
}
```

### GET /api/languages/[languageId]/contributors?period=monthly

**Response:**
```json
[
  {
    "id": "user1",
    "name": "Alice Smith",
    "username": "asmith",
    "phraseCount": 12,
    "definitionCount": 28,
    "exampleCount": 45,
    "totalContributions": 85
  },
  {
    "id": "user2",
    "name": "Bob Johnson",
    "username": "bjohnson",
    "phraseCount": 8,
    "definitionCount": 20,
    "exampleCount": 30,
    "totalContributions": 58
  }
]
```

### POST /api/tags

**Request:**
```json
{
  "name": "slang",
  "color": "#FF6B6B"
}
```

**Response:**
```json
{
  "tag": {
    "id": 5,
    "name": "slang",
    "color": "#FF6B6B",
    "authorId": "user123",
    "author": {
      "name": "John Doe",
      "username": "johndoe"
    },
    "_count": {
      "phrases": 12
    }
  }
}
```

### POST /api/flag-definition

**Request:**
```json
{
  "definitionId": 42
}
```

**Response:**
```json
{
  "success": true,
  "message": "Definition flagged successfully"
}
```

---

## Status Codes Reference

| Code | Meaning | Typical Use |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid parameters or data |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Authenticated but not authorized (e.g., not admin) |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected server error |

---

## Authentication Notes

- **Session-based**: Uses NextAuth.js with database sessions (not JWT)
- **Provider**: Google OAuth
- **Session object contains**:
  - `user.id`: User's unique identifier
  - `user.role`: "user" or "admin"
  - `user.email`, `user.name`, `user.image`: Profile info
- **Header**: Include cookies automatically with credentials

---

## Common Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10-20 | Results per page |
| `sortBy` | string | "recent" | Sort order (recent/upvotes/oldest) |
| `type` | string | - | Content type (phrases/definitions/examples) |
| `q` | string | - | Search query (required for search endpoint) |
| `period` | string | "all-time" | Time period filter (all-time/weekly/monthly) |

---

## Database Relationships

```
User (1) ──────→ (Many) Phrase
User (1) ──────→ (Many) Definition
User (1) ──────→ (Many) Example
User (1) ──────→ (Many) DefinitionVote
User (1) ──────→ (Many) ExampleVote
User (1) ──────→ (Many) UserAchievement
User (1) ──────→ (Many) Tag
User (1) ──────→ (Many) Feedback

Language (1) ──→ (Many) Phrase
Phrase (1) ────→ (Many) Definition
Phrase (1) ────→ (Many) PhraseTag
Definition (1) →→ (Many) Example
Definition (1) →→ (Many) DefinitionVote
Example (1) ───→ (Many) ExampleVote

Tag (1) ──────→ (Many) PhraseTag
Achievement (1) → (Many) UserAchievement
```

