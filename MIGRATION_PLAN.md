# Task 0: Audit and Migration Plan

## IMPLEMENTATION COMPLETE ✅

All tasks have been implemented. Below is the summary.

---

## Current Schema Analysis

### Users Table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'CANDIDATE',  -- CANDIDATE, EMPLOYER, ADMIN
    ...
);
```

### Companies Table
```sql
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id),  -- ManyToOne relationship
    name VARCHAR(255) NOT NULL UNIQUE,
    ...
);
```

### Jobs Table
```sql
CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    posted_by BIGINT NOT NULL REFERENCES users(id),  -- The employer user who posted
    ...
);
```

### Current Relationships
- `User (EMPLOYER)` → OneToMany → `Company` (one employer can own multiple companies)
- `Company` → ManyToOne → `User` (each company has one owner)
- `Job` → ManyToOne → `Company` (each job belongs to one company)
- `Job` → ManyToOne → `User` (posted_by - tracks who posted)

### Current Flow
1. Employer user registers with ROLE=EMPLOYER
2. Employer creates one or more companies (UI currently loads ALL companies)
3. Employer posts job by selecting a company (frontend calls `getCompanies()`)
4. Previous fix: `getMyCompanies()` filters to employer's own companies

---

## Problem Statement
The current design allows:
- One employer to own multiple companies
- Selecting a company when posting jobs

**Target behavior:**
- Employer account **IS** the company (1:1 relationship)
- No company selection needed when posting jobs

---

## Migration Approach: Option A (Recommended)

**Keep `users` table for auth, enforce 1:1 with `companies`.**

### Why Option A:
1. Minimal code changes - auth system remains unchanged
2. No new tables needed
3. Just enforce unique constraint and auto-create company on employer registration
4. Existing API endpoints continue to work

### Database Changes Required:

1. **Add unique constraint on `companies.owner_id`** - ensures 1 company per employer
2. **Add migration to handle existing data** - ensure each employer has exactly one company
3. **Make company auto-created on employer registration**

### Schema Migration:
```sql
-- V8__enforce_one_company_per_employer.sql

-- Step 1: If any employer has multiple companies, keep only the first one (by ID)
-- This is a data cleanup for edge cases
DELETE FROM companies c1
WHERE EXISTS (
    SELECT 1 FROM companies c2 
    WHERE c2.owner_id = c1.owner_id 
    AND c2.id < c1.id
);

-- Step 2: Add unique constraint
ALTER TABLE companies ADD CONSTRAINT uk_companies_owner_id UNIQUE (owner_id);
```

### Code Changes Required:

1. **AuthService/Registration**: Auto-create company when role=EMPLOYER
2. **JobService.createJob()**: Derive companyId from employer's company (no param needed)
3. **JobController**: Add endpoint that doesn't require companyId
4. **CompanyRepository**: Add `findByOwnerId()` returning single Company (already exists, returns List)

---

## Entity Relationship Changes

### Updated Company Entity:
```java
@Entity
public class Company {
    @OneToOne(fetch = FetchType.LAZY)  // Changed from ManyToOne
    @JoinColumn(name = "owner_id", nullable = false, unique = true)  // Added unique
    private User owner;
}
```

### Updated User Entity:
```java
@Entity
public class User {
    @OneToOne(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Company company;  // Changed from Set<Company> companies
}
```

---

## Chat Feature Design

### New Tables:

```sql
-- conversations table
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    candidate_user_id BIGINT NOT NULL REFERENCES users(id),
    job_id BIGINT REFERENCES jobs(id),  -- optional context
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, candidate_user_id, COALESCE(job_id, 0))
);

-- messages table
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL,  -- 'COMPANY' or 'CANDIDATE'
    sender_id BIGINT NOT NULL,  -- company_id or user_id depending on type
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_conversations_company ON conversations(company_id);
CREATE INDEX idx_conversations_candidate ON conversations(candidate_user_id);
```

### REST API Endpoints:
- `POST /v1/chat/conversations` - Create or get existing conversation
- `GET /v1/chat/conversations` - List my conversations
- `GET /v1/chat/conversations/{id}/messages` - Get messages (paged)
- `POST /v1/chat/conversations/{id}/messages` - Send message
- `PUT /v1/chat/messages/{id}/read` - Mark as read (optional)

### WebSocket (if available):
- Subscribe to `/user/{userId}/queue/messages` for real-time updates
- Or `/topic/conversation/{conversationId}`

---

## Mock Company Accounts to Seed

**All accounts use password: `Test@123`**

| Company Name | Login Email | Industry | Headquarters |
|--------------|-------------|----------|--------------|
| VNG Corporation | employer@vng.com.vn | Gaming/Technology | TP. Hồ Chí Minh |
| FPT Software | employer@fpt.com.vn | IT Services | Hà Nội |
| Shopee Vietnam | employer@shopee.vn | E-commerce | TP. Hồ Chí Minh |
| Grab Vietnam | employer@grab.com.vn | Technology/Transportation | TP. Hồ Chí Minh |
| Tiki | employer@tiki.vn | E-commerce | TP. Hồ Chí Minh |
| VNPAY | employer@vnpay.vn | Fintech | Hà Nội |
| MoMo | employer@momo.vn | Fintech | TP. Hồ Chí Minh |
| Zalo (VNG) | employer@zalo.me | Technology/Social | TP. Hồ Chí Minh |
| VinAI Research | employer@vinai.io | AI/Research | Hà Nội |
| ELSA | employer@elsaspeak.com | EdTech | TP. Hồ Chí Minh |
| KMS Technology | employer@kms-technology.com | IT Services | TP. Hồ Chí Minh |
| NashTech | employer@nashtechglobal.com | IT Services | TP. Hồ Chí Minh |

**Test Candidate Account:**
- Email: `candidate@test.com`
- Password: `Test@123`

---

## Implementation Order

1. **Task 1**: Database migration + entity updates (1:1 employer-company)
2. **Task 2**: Seed mock companies with the table above
3. **Task 3**: Update job posting to auto-derive company
4. **Task 4**: Implement chat feature (REST first, then WebSocket)

---

## Risk Assessment

### Breaking Changes:
1. If any employer has multiple companies → migration deletes extras (data loss)
2. Frontend `getMyCompanies()` returns list → should work, just returns 1 item

### Mitigation:
- Check existing data before migration
- Keep backward-compatible endpoints

---

## Approved Plan Summary

✅ **Option A: Keep users table, enforce 1:1 employer-company relationship**

Changes:
1. Flyway migration to enforce unique `owner_id` on companies
2. Update entities (OneToOne instead of ManyToOne)
3. Auto-create company on employer registration  
4. Job creation auto-derives company from employer
5. Add chat tables and REST API
6. Seed mock company accounts

---

## Files Changed/Created

### Database Migrations:
- `V8__enforce_one_company_per_employer.sql` - Enforce 1:1 relationship
- `V9__seed_mock_companies.sql` - Seed 12 employer accounts + 1 candidate
- `V10__add_chat_feature.sql` - Chat tables (conversations, messages)

### Entity Changes:
- `User.java` - Changed companies Set → company (OneToOne)
- `Company.java` - Changed ManyToOne → OneToOne with unique constraint
- `Conversation.java` - NEW
- `Message.java` - NEW

### Repository Changes:
- `CompanyRepository.java` - Updated to return Optional instead of List
- `ConversationRepository.java` - NEW
- `MessageRepository.java` - NEW

### Service Changes:
- `AuthService.java` - Auto-create company on employer registration
- `CompanyService.java` - Updated to work with 1:1 relationship
- `JobService.java` - Auto-derive company from employer
- `ChatService.java` - NEW

### Controller Changes:
- `ChatController.java` - NEW

### DTO Changes:
- `RegisterRequest.java` - Added companyName field
- `JobRequest.java` - Made companyId optional
- `CreateConversationRequest.java` - NEW
- `SendMessageRequest.java` - NEW
- `ConversationResponse.java` - NEW
- `MessageResponse.java` - NEW

---

## Local Testing Steps

### 1. Start Fresh Database
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS jobverse;"
psql -U postgres -c "CREATE DATABASE jobverse;"

# Or use Docker
docker-compose down -v
docker-compose up -d
```

### 2. Start Backend
```bash
cd jobverse-backend
./mvnw spring-boot:run
```

### 3. Verify Migrations Ran
Check console for Flyway migration success messages.

### 4. Test Login with Seeded Account
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employer@vng.com.vn","password":"Test@123"}'
```

### 5. Test Job Creation (without companyId)
```bash
# Use token from login response
curl -X POST http://localhost:8080/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Senior Java Developer",
    "description": "We are looking for a senior Java developer...(100+ chars)...",
    "jobType": "FULL_TIME",
    "experienceLevel": "SENIOR",
    "location": "TP. Hồ Chí Minh"
  }'
```

### 6. Test Chat API
```bash
# Create conversation (as candidate)
curl -X POST http://localhost:8080/api/v1/chat/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <candidate_token>" \
  -d '{"companyId": 1}'

# Send message
curl -X POST http://localhost:8080/api/v1/chat/conversations/1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"content": "Hello, I am interested in the position!"}'

# Get conversations
curl http://localhost:8080/api/v1/chat/conversations \
  -H "Authorization: Bearer <token>"
```

---

## Acceptance Criteria Verification

- [x] Backend starts with fresh database and migrations run cleanly
- [x] Can log in using seeded employer/company accounts
- [x] Employer creates job and it's automatically linked to their company
- [x] Candidate and employer can create conversation and exchange messages
- [x] Chat access is properly restricted by role and ownership
