# Documentation Index

This file serves as a guide to all documentation in the project.

## Backend API Documentation

### New Documentation (Generated November 13, 2025)

1. **BACKEND_API_SUMMARY.md** (21 KB)
   - Most comprehensive API reference
   - Full endpoint documentation with request/response shapes
   - Complete database schema with all models
   - Service implementations (Achievement, Reputation, Auth)
   - Common patterns and conventions
   - Status codes and error handling
   - **Start here for**: Understanding complete API contract

2. **API_QUICK_REFERENCE.md** (9 KB)
   - Quick lookup tables for all endpoints
   - Example request/response JSON
   - Status code reference
   - Authentication notes
   - Database relationship diagrams
   - **Use for**: Quick checks and integration examples

3. **API_ARCHITECTURE.txt**
   - ASCII visual diagrams of system architecture
   - Authentication flow diagrams
   - Content status transitions
   - Reputation calculation rules
   - Database relationships
   - File location references
   - **Use for**: Understanding system design visually

4. **EXPLORATION_SUMMARY.md**
   - Summary of exploration findings
   - File references and code locations
   - Code quality observations
   - Integration recommendations
   - Statistics and metrics
   - **Use for**: Overview and project summary

## Existing Documentation

### Product & Requirements

- **PRD.md** - Product requirements document
- **CLAUDE.md** - Claude/AI system instructions
- **MOBILE.md** - Mobile application specifications

### Feature Documentation

- **ACHIEVEMENT.md** - Achievement system detailed documentation
- **ACHIEVEMENT_ROADMAP.md** - Achievement roadmap and planned features

---

## Quick Navigation

### By Use Case

**I want to...**

- **Build a feature that calls an API endpoint**
  - Use: BACKEND_API_SUMMARY.md (find endpoint)
  - Reference: API_QUICK_REFERENCE.md (see example)

- **Understand how authentication works**
  - Use: API_ARCHITECTURE.txt (flow diagram)
  - Reference: BACKEND_API_SUMMARY.md (auth section)

- **Check request/response shapes**
  - Use: API_QUICK_REFERENCE.md (example JSON)
  - Deep dive: BACKEND_API_SUMMARY.md (full details)

- **Understand the database structure**
  - Use: BACKEND_API_SUMMARY.md (core entities section)
  - Visual: API_ARCHITECTURE.txt (database diagram)

- **Debug an admin endpoint**
  - Use: API_QUICK_REFERENCE.md (admin table)
  - Details: BACKEND_API_SUMMARY.md (admin section)

- **Understand the reputation/achievement system**
  - Use: API_ARCHITECTURE.txt (reputation calculation)
  - Details: BACKEND_API_SUMMARY.md (services section)
  - Features: ACHIEVEMENT.md, ACHIEVEMENT_ROADMAP.md

### By Role

**Frontend Developer**
- Priority 1: BACKEND_API_SUMMARY.md
- Priority 2: API_QUICK_REFERENCE.md
- Reference: API_ARCHITECTURE.txt

**Backend Developer**
- Priority 1: BACKEND_API_SUMMARY.md
- Priority 2: EXPLORATION_SUMMARY.md
- Reference: Actual source code in /src/app/api

**Product Manager**
- Priority 1: PRD.md
- Priority 2: ACHIEVEMENT.md
- Reference: BACKEND_API_SUMMARY.md (features overview)

**DevOps/Infrastructure**
- Priority 1: API_ARCHITECTURE.txt
- Priority 2: BACKEND_API_SUMMARY.md (tech stack section)

---

## File Locations

### API Route Files
```
/src/app/api/
├── achievements/
├── admin/
├── auth/
├── contributions/
├── feedback/
├── flag-definition/
├── language-phrases/
├── languages/
├── phrases/
├── profile/
├── search/
└── tags/
```

### Library/Service Files
```
/src/lib/
├── auth.ts                    # NextAuth configuration
├── achievements.ts            # Achievement service
├── reputation.ts              # Reputation system
├── prisma.ts                  # Database client
├── utils.ts                   # Utilities
├── username-generator.ts
├── achievement-definitions.ts
└── achievementNotificationService.ts
```

### Database
```
/prisma/schema.prisma         # Data model definition
```

---

## API Endpoint Summary

**Total Endpoints**: 25+

| Category | Count | Auth Required | Details |
|----------|-------|---------------|---------|
| Public | 12 | No | Search, browse, language info |
| User | 5 | Yes | Profile, contributions, feedback |
| Admin | 8 | Admin Only | Content moderation |
| Auth | 1 | OAuth | Google login |

---

## Key Features Documented

- User Authentication (Google OAuth)
- User Profiles & Settings
- Content Contribution (Phrases, Definitions, Examples)
- Content Moderation (Admin approval/rejection)
- Voting System (Upvote/downvote definitions & examples)
- Achievement System (Gamification with 30+ achievements)
- Reputation System (5 levels: Newbie to Legend)
- Search Functionality (Full-text search with transliteration)
- Multi-language Support
- Content Flagging (User-reported content)
- Contributor Rankings
- Feedback System

---

## Documentation Maintenance

**Last Updated**: November 13, 2025
**API Version**: Current (as of exploration date)
**Database Schema Version**: From /prisma/schema.prisma

When updating documentation:
1. Start with BACKEND_API_SUMMARY.md (most detailed)
2. Update API_QUICK_REFERENCE.md with examples
3. Update API_ARCHITECTURE.txt with diagrams
4. Update EXPLORATION_SUMMARY.md with findings

---

## Glossary

- **Phrase**: A term or word in a specific language (e.g., "Mantra")
- **Definition**: An explanation of what a phrase means
- **Example**: A usage example for a definition
- **Vote**: User rating (upvote/downvote) for definitions/examples
- **Reputation**: User's accumulated points from contributions
- **Achievement**: Gamified milestone users can unlock
- **Admin**: User with moderation privileges
- **Status**: Content state (pending, approved, rejected, needs review)
- **Language**: A language context (English, Spanish, etc. with ISO code)

---

## Common Tasks

### Find an endpoint
1. Check API_QUICK_REFERENCE.md table
2. Find endpoint in BACKEND_API_SUMMARY.md
3. See example request/response

### Check request format
1. Search API_QUICK_REFERENCE.md for the endpoint
2. See "Request Body" or "Query Parameters" section
3. Look at JSON example

### Understand response format
1. Find endpoint in API_QUICK_REFERENCE.md
2. Scroll to "Response" section
3. See JSON example or TypeScript shape

### Add new endpoint
1. Review BACKEND_API_SUMMARY.md patterns
2. Check API_ARCHITECTURE.txt for conventions
3. Follow existing endpoint structure
4. Update documentation

---

## Support

For questions about:
- **API contract**: See BACKEND_API_SUMMARY.md
- **System design**: See API_ARCHITECTURE.txt
- **Quick answers**: See API_QUICK_REFERENCE.md
- **Features**: See ACHIEVEMENT.md, PRD.md
- **Specific files**: See EXPLORATION_SUMMARY.md (file references)

