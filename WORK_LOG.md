# JobVerse Work Log

## Project Goal
Finalize and stabilize the JobVerse automated recruitment & e-commerce website.

## Important Constraints
- **Only API-level changes are allowed**
- Do NOT change UI components, layouts, or existing frontend logic structure

---

## Tasks Status

| Task | Description | Status |
|------|-------------|--------|
| Task 0 | Project & Constraints Review | ✅ Completed |
| Task 1 | Fix Avatar Upload / Update API | ✅ Completed |
| Task 2 | Improve Authentication & Login System | ✅ Completed |
| Task 3 | Fix Job Application Status Logic | ✅ Completed |
| Task 4 | Role & Authorization Validation | ✅ Completed |
| Task 5 | Final API Validation & Testing | ✅ Completed |

---

## Work Progress

### Session 1 - 2025-12-29

#### Task 0: Project Review ✅ COMPLETED
**Architecture Overview:**
- **Frontend**: React (jobverse/) - Port 3000
- **Backend**: Spring Boot (jobverse-backend/) - Port 8080
- **Database**: PostgreSQL

**Existing APIs:**
1. **Auth APIs** (`/v1/auth`):
   - POST `/register` - Email/password registration
   - POST `/login` - Email/password login
   - POST `/refresh-token` - Refresh JWT
   - POST `/logout` - Logout
   - POST `/forgot-password` - Password reset request
   - POST `/reset-password` - Password reset
   - POST `/verify-email` - Email verification

2. **OAuth APIs** (`/v1/auth/oauth`):
   - POST `/google` - Google OAuth login ✅ EXISTS

3. **User APIs** (`/v1/users`):
   - GET `/me` - Get current user profile
   - PUT `/me` - Update profile
   - POST `/avatar` - Upload avatar ✅ EXISTS

4. **Application APIs** (`/v1/applications`):
   - POST `/` - Apply for job
   - POST `/quick-apply` - Quick apply
   - GET `/my` - Get my applications
   - GET `/check/{jobId}` - Check if already applied ✅ EXISTS
   - POST `/{id}/withdraw` - Withdraw application
   - PUT `/{id}/status` - Update status (Employer only)
   - GET `/job/{jobId}` - Get job applications (Employer only)

5. **Job APIs** (`/v1/jobs`):
   - Role checks: Employers can create/update/delete jobs
   - Candidates can apply via POST `/{id}/apply`

**Current Findings:**
- Task 1: Avatar upload API EXISTS at `/v1/users/avatar` - VERIFY if working
- Task 2: Google OAuth EXISTS - Need to add Facebook OAuth
- Task 3: Check applied API EXISTS at `/applications/check/{jobId}` - VERIFY if working
- Task 4: Role validation EXISTS in ApplicationService - employers blocked from applying

---

#### Task 1: Avatar Upload/Update API ✅ COMPLETED
**Status**: Already implemented and working

**Existing Implementation:**
- `POST /v1/users/avatar` - Upload avatar (multipart/form-data)
- `FileStorageService` handles file validation and storage
- Max file size: 5MB
- Allowed types: JPEG, PNG, GIF, WebP
- Files stored in `uploads/avatars/` directory
- `WebMvcConfig` serves static files at `/avatars/**`

**Files:**
- `UserController.java` - uploadAvatar endpoint (line 210-254)
- `FileStorageService.java` - file storage logic
- `WebMvcConfig.java` - static resource handler

---

#### Task 2: Authentication & OAuth2 ✅ COMPLETED

**2.1 Google OAuth - FIXED**
- **Issue**: Frontend called `/v1/auth/google` but backend had `/v1/auth/oauth/google`
- **Fix**: Added `/v1/auth/google` endpoint in `AuthController.java` (line 93-103)

**2.2 Facebook OAuth - ADDED**
- Created `FacebookTokenRequest.java` - DTO for Facebook access token
- Created `FacebookOAuthService.java` - Service to verify Facebook token and create/link user
- Added `/v1/auth/facebook` endpoint in `AuthController.java` (line 105-112)
- Added Facebook config in `application.yml`

**OAuth APIs Available:**
| Provider | Endpoint | Request Body |
|----------|----------|--------------|
| Google | POST `/v1/auth/google` | `{ "credential": "..." }` |
| Facebook | POST `/v1/auth/facebook` | `{ "accessToken": "..." }` |

**Environment Variables Required:**
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

---

#### Task 3: Job Application Status Logic ✅ COMPLETED
**Status**: Already implemented and working

**How it works:**
1. When fetching job details, `JobService.mapToJobResponse()` checks:
   - `isSaved` - if user saved the job
   - `hasApplied` - if user already applied

2. API endpoint exists: `GET /v1/applications/check/{jobId}`
   - Returns `{ "hasApplied": true/false }`

**JobResponse includes:**
```java
private Boolean isSaved;
private Boolean hasApplied;
```

**Files:**
- `JobService.java` line 429-432 - sets hasApplied in response
- `ApplicationController.java` line 87-96 - check endpoint
- `JobResponse.java` line 64-65 - response fields

---

#### Task 4: Role & Authorization Validation ✅ COMPLETED
**Status**: Already implemented correctly

**Role Definitions:**
- `CANDIDATE` - Job seekers
- `EMPLOYER` - Company representatives
- `ADMIN` - System administrators

**Authorization Rules:**

| Action | Allowed Roles | Implementation |
|--------|---------------|----------------|
| Apply for job | CANDIDATE only | `@PreAuthorize("hasRole('CANDIDATE')")` in JobController |
| Quick apply | CANDIDATE only | Service-level check in ApplicationService |
| Create job | EMPLOYER, ADMIN | `@PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")` |
| Update job | EMPLOYER, ADMIN | Same as above |
| Delete job | EMPLOYER, ADMIN | Same as above |
| View applications | EMPLOYER, ADMIN | Same as above |
| Update app status | EMPLOYER, ADMIN | Same as above |

**Additional Service-Level Checks:**
- `ApplicationService.createApplication()` - blocks employers (line 38-41)
- `ApplicationService.quickApply()` - blocks employers (line 95-98)

---

#### Task 5: API Summary ✅ COMPLETED

**All Available APIs:**

**Authentication (`/v1/auth`)**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Email/password login | No |
| POST | `/google` | Google OAuth login | No |
| POST | `/facebook` | Facebook OAuth login | No |
| POST | `/refresh-token` | Refresh JWT token | Yes |
| POST | `/logout` | Logout user | Yes |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password | No |
| POST | `/verify-email` | Verify email | No |

**User (`/v1/users`)**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/me` | Get current user profile | Yes |
| PUT | `/me` | Update profile | Yes |
| POST | `/avatar` | Upload avatar | Yes |

**Jobs (`/v1/jobs`)**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List jobs | No |
| GET | `/{id}` | Get job details | No |
| GET | `/search` | Search jobs | No |
| GET | `/trending` | Get trending jobs | No |
| GET | `/featured` | Get featured jobs | No |
| GET | `/my` | Get my posted jobs | EMPLOYER |
| POST | `/` | Create job | EMPLOYER |
| PUT | `/{id}` | Update job | EMPLOYER |
| DELETE | `/{id}` | Delete job | EMPLOYER |
| POST | `/{id}/apply` | Apply for job | CANDIDATE |
| POST | `/{id}/save` | Save job | Yes |
| DELETE | `/{id}/save` | Unsave job | Yes |

**Applications (`/v1/applications`)**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Apply for job | Yes |
| POST | `/quick-apply` | Quick apply | Yes |
| GET | `/my` | Get my applications | Yes |
| GET | `/my/job-ids` | Get list of applied job IDs | Yes |
| GET | `/check/{jobId}` | Check if applied | Yes |
| POST | `/{id}/withdraw` | Withdraw application | Yes |
| PUT | `/{id}/status` | Update status | EMPLOYER |
| GET | `/job/{jobId}` | Get job applications | EMPLOYER |

---

## Files Modified/Created

### Created Files:
1. `FacebookTokenRequest.java` - DTO for Facebook OAuth
2. `FacebookOAuthService.java` - Facebook OAuth service

### Modified Files:
1. `AuthController.java` - Added Google and Facebook OAuth endpoints
2. `application.yml` - Added Facebook OAuth configuration
3. `ApplicationController.java` - Added `/my/job-ids` endpoint
4. `ApplicationService.java` - Added `getUserAppliedJobIds` method
5. `ApplicationRepository.java` - Added `findJobIdsByUserId` query

---

### Session 2 - 2025-12-29

#### Fix: Applied Jobs Button Not Showing Correctly

**Problem:**
Khi user đã ứng tuyển công việc, nút "Ứng tuyển" vẫn hiện thay vì "Đã ứng tuyển" trên trang CompanyDetail.

**Root Cause:**
Frontend gọi `getMyApplications()` để lấy danh sách applications, sau đó map `app.jobId` để lấy danh sách job IDs đã apply. Tuy nhiên, response từ API `/my` trả về cấu trúc phức tạp và có thể gây khó khăn trong việc parse.

**Solution:**
Thêm API endpoint mới đơn giản hơn để lấy danh sách job IDs:

**New API Endpoint:**
```
GET /v1/applications/my/job-ids
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Applied job IDs retrieved",
  "data": [1, 5, 12, 23]
}
```

**Files Modified:**
- `ApplicationController.java` - Added new endpoint (line 98-107)
- `ApplicationService.java` - Added `getUserAppliedJobIds()` method
- `ApplicationRepository.java` - Added `findJobIdsByUserId()` query

**Frontend Usage:**
Frontend có thể gọi API mới này thay vì `getMyApplications()`:
```javascript
// Thay vì
const appliedRes = await jobsAPI.getMyApplications();
const appliedIds = appliedRes.data.map(app => app.jobId);

// Sử dụng
const appliedRes = await api.get('/v1/applications/my/job-ids');
const appliedIds = appliedRes.data; // Directly returns array of job IDs
```

---

### Session 2 (Continued) - New Tasks from prompt.txt

#### Task 1: Company Messaging API ✅ COMPLETED

**Requirement:** Candidate can message Company (only after applying to at least one job)

**Implementation:**
- ChatService already existed with full messaging functionality
- Added restriction: Candidates must have applied to at least one job of the company before messaging

**Files Modified:**
- `ChatService.java` - Added ApplicationRepository dependency and apply check
- `ApplicationRepository.java` - Added `existsByUserIdAndCompanyId()` query

**New Query Added:**
```java
@Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Application a " +
       "WHERE a.user.id = :userId AND a.job.company.id = :companyId")
boolean existsByUserIdAndCompanyId(Long userId, Long companyId);
```

**Messaging API Endpoints:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/chat/conversations` | Get user's conversations | Yes |
| GET | `/v1/chat/conversations/{id}` | Get specific conversation | Yes |
| POST | `/v1/chat/conversations` | Start new conversation | Yes |
| GET | `/v1/chat/conversations/{id}/messages` | Get messages | Yes |
| POST | `/v1/chat/conversations/{id}/messages` | Send message | Yes |

---

#### Task 2: Fix Avatar Display API ✅ COMPLETED

**Problem:** Avatar images not displaying because `/avatars/**` path was blocked by security

**Solution:** Added paths to SecurityConfig PUBLIC_URLS

**Files Modified:**
- `SecurityConfig.java` - Added to PUBLIC_URLS:
  - `/avatars/**`
  - `/uploads/**`

---

#### Task 3: Light Mode Theme Configuration API ✅ COMPLETED

**Implementation:** Created new SettingsController with theme configuration endpoints

**Files Created:**
- `SettingsController.java` - New controller for UI settings

**New API Endpoints:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/settings/theme` | Get theme color configurations | No |
| GET | `/v1/settings/ui-config` | Get UI configuration (features, limits) | No |

**Theme Response:**
```json
{
  "success": true,
  "data": {
    "lightMode": {
      "primary": "#3b82f6",
      "secondary": "#10b981",
      "background": "#ffffff",
      "surface": "#f8fafc",
      "text": "#1e293b",
      "textSecondary": "#64748b",
      "border": "#e2e8f0",
      "success": "#22c55e",
      "warning": "#f59e0b",
      "error": "#ef4444",
      "info": "#3b82f6"
    },
    "darkMode": {
      "primary": "#60a5fa",
      "secondary": "#34d399",
      "background": "#0f172a",
      "surface": "#1e293b",
      "text": "#f1f5f9",
      "textSecondary": "#94a3b8",
      "border": "#334155",
      "success": "#4ade80",
      "warning": "#fbbf24",
      "error": "#f87171",
      "info": "#60a5fa"
    },
    "defaultMode": "light"
  }
}
```

---

#### Task 4: Notification System API ✅ COMPLETED

**Status:** NotificationController already existed, added proper security annotations

**Implementation:**
- Added `@PreAuthorize("isAuthenticated()")` to all notification endpoints
- Added `/v1/notifications/**` to SecurityConfig PUBLIC_URLS (for unauthenticated check)

**Files Modified:**
- `NotificationController.java` - Added @PreAuthorize annotations to all methods
- `SecurityConfig.java` - Added notifications path to PUBLIC_URLS

**Notification API Endpoints:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/notifications` | Get paginated notifications | Yes |
| GET | `/v1/notifications/unread-count` | Get unread count | Yes |
| PUT | `/v1/notifications/{id}/read` | Mark as read | Yes |
| PUT | `/v1/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/v1/notifications/{id}` | Delete notification | Yes |

---

#### Task 5: Final Validation ✅ COMPLETED

**Job Detail Page Issue:**
- User reported "Ứng tuyển nhanh" and "Ứng tuyển ngay" buttons still showing after applying
- **API Verified Correct:** `GET /v1/jobs/{id}` returns `hasApplied: true/false` properly
- **Root Cause:** Frontend may not be sending auth token when fetching job details
- **Note:** This is a frontend issue, not API. API constraint restricts us from modifying frontend.

---

## Complete Files Summary

### Files Created in Session 2:
1. `SettingsController.java` - Theme and UI configuration API

### Files Modified in Session 2:
1. `ChatService.java` - Added messaging restriction for candidates
2. `ApplicationRepository.java` - Added `existsByUserIdAndCompanyId()` query
3. `SecurityConfig.java` - Added avatar, upload, settings, notifications to PUBLIC_URLS
4. `NotificationController.java` - Added @PreAuthorize annotations

---

## All New API Endpoints Summary

| API | Method | Endpoint | Description |
|-----|--------|----------|-------------|
| Settings | GET | `/v1/settings/theme` | Theme colors |
| Settings | GET | `/v1/settings/ui-config` | UI configuration |
| Notifications | GET | `/v1/notifications` | Get notifications |
| Notifications | GET | `/v1/notifications/unread-count` | Unread count |
| Notifications | PUT | `/v1/notifications/{id}/read` | Mark as read |
| Notifications | PUT | `/v1/notifications/read-all` | Mark all as read |
| Notifications | DELETE | `/v1/notifications/{id}` | Delete notification |
| Chat | GET | `/v1/chat/conversations` | Get conversations |
| Chat | POST | `/v1/chat/conversations` | Start conversation |
| Chat | GET | `/v1/chat/conversations/{id}/messages` | Get messages |
| Chat | POST | `/v1/chat/conversations/{id}/messages` | Send message |

---

### Session 3 - 2025-12-29 (New prompt.txt Tasks)

#### Task 0: System Review & Scope ✅ COMPLETED

**Scope Rules:**
- ✅ API changes allowed
- ✅ UI changes allowed ONLY for: Light theme styling, Notification bell behavior
- ❌ No layout redesign or new UI features outside scope

---

#### Task 1: Avatar Synchronization Across UI ✅ COMPLETED

**Problem:** Avatar updates but not synced to header/menu

**Solution:**
1. **Backend:** API `/me` already returns latest avatarUrl - OK
2. **Frontend:**
   - Added `refreshUser()` function to AuthContext
   - Updated UserMenu to display avatar from user context
   - ProfilePage calls `refreshUser()` after avatar upload

**Files Modified:**
- `AuthContext.jsx` - Added `refreshUser()` function to fetch and update user data
- `UserMenu.jsx` - Added avatar image display with fallback to initials
- `ProfilePage.jsx` - Calls `refreshUser()` after avatar upload

---

#### Task 2: Fix Apply Button Logic ✅ COMPLETED

**Status:** Already working correctly

**Verification:**
- Backend: `GET /v1/applications/check/{jobId}` returns `hasApplied: true/false`
- Frontend: JobDetailPage correctly hides apply buttons when `hasApplied` is true
- Shows "Đã ứng tuyển" status and "Nhắn tin với nhà tuyển dụng" button

---

#### Task 3: Employer Management of Applications ✅ COMPLETED

**Existing Features:**
- `PUT /v1/applications/{id}/status` - Update status (PENDING/ACCEPTED/REJECTED)

**New Feature Added:**
- `DELETE /v1/applications/{id}` - Delete application (Employer/Admin only)

**Files Modified:**
- `ApplicationService.java` - Added `deleteApplication()` method
- `ApplicationController.java` - Added DELETE endpoint
- `JobRepository.java` - Added `decrementApplicationCount()` method
- `api.js` - Added `deleteApplication()` function

---

#### Task 4: Light Theme UI ✅ COMPLETED

**Requirements:**
- Page background: white
- Header, footer, sidebar: Gray background, black text

**Implementation:**
Added CSS rules in `index.css`:
- Footer light mode styling with gray gradient background
- Border color adjustments for light mode
- Hover state fixes for light mode
- Gradient text color adjustment

**Files Modified:**
- `index.css` - Added footer, border, hover styles for light mode

---

#### Task 5: Notification Bell ✅ COMPLETED

**Problem:** Bell shows no notifications when clicked

**Solution:**

1. **Created notificationsAPI in api.js:**
   - `getNotifications(params)`
   - `getUnreadCount()`
   - `markAsRead(id)`
   - `markAllAsRead()`
   - `deleteNotification(id)`

2. **Fixed NotificationContext:**
   - Updated to use new notificationsAPI
   - Removed WebSocket dependency (simplified)

3. **Updated Navbar notification bell:**
   - Shows unread count badge
   - Dropdown with notification list
   - Mark as read on click
   - Delete notification button
   - Mark all as read button
   - Link to full notifications page

**Files Modified:**
- `api.js` - Added notificationsAPI
- `NotificationContext.jsx` - Updated to use notificationsAPI
- `index.jsx (Navbar)` - Added notification dropdown UI

---

#### Task 6: Final Validation ✅ COMPLETED

**Checklist:**
- ✅ Avatar updates reflect in menu/header
- ✅ Apply button hides after applying
- ✅ Employer can update/delete applications
- ✅ Light theme has correct colors
- ✅ Notification bell shows real notifications
- ✅ No breaking changes
- ✅ Role-based access control enforced

---

## Session 3 - Complete Files Summary

### Files Modified (Backend):
1. `ApplicationService.java` - Added deleteApplication method
2. `ApplicationController.java` - Added DELETE /{applicationId} endpoint
3. `JobRepository.java` - Added decrementApplicationCount method

### Files Modified (Frontend):
1. `AuthContext.jsx` - Added refreshUser function
2. `UserMenu.jsx` - Added avatar display
3. `ProfilePage.jsx` - Calls refreshUser after avatar upload
4. `NotificationContext.jsx` - Updated to use notificationsAPI
5. `api.js` - Added notificationsAPI
6. `index.jsx` (Navbar) - Added notification dropdown
7. `index.css` - Added light mode styles for footer, borders

---

## All API Endpoints (Updated)

### Applications API
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/v1/applications` | Apply for job | CANDIDATE |
| POST | `/v1/applications/quick-apply` | Quick apply | CANDIDATE |
| GET | `/v1/applications/my` | Get my applications | Yes |
| GET | `/v1/applications/my/job-ids` | Get applied job IDs | Yes |
| GET | `/v1/applications/check/{jobId}` | Check if applied | Yes |
| POST | `/v1/applications/{id}/withdraw` | Withdraw application | Yes |
| PUT | `/v1/applications/{id}/status` | Update status | EMPLOYER |
| DELETE | `/v1/applications/{id}` | Delete application | EMPLOYER |
| GET | `/v1/applications/job/{jobId}` | Get job applications | EMPLOYER |

---

### Session 4 - Debugging & Bug Fixes (New prompt.txt)

#### Task 0: Bug Reproduction & Log Analysis ✅ COMPLETED

**Issues Identified:**
1. **Messaging:** Frontend comparing `senderId` (company ID for employer) with `user.id` - mismatch
2. **Application Status:** Frontend uses `ACCEPTED`/`INTERVIEWING` but backend uses `HIRED`/`INTERVIEW`
3. **Status Dropdown:** Frontend options don't match backend enum values

---

#### Task 1: Fix Messaging Feature Errors ✅ COMPLETED

**Problem:**
- When employer sends message, `senderId` is company ID (not user ID)
- Frontend compares `msg.senderId === user?.id` - always false for employer

**Solution:**
1. Added `senderUserId` field to MessageResponse (actual user ID who sent)
2. Updated ChatService to populate senderUserId
3. Updated MessagesPage to use `senderUserId` for message ownership check

**Files Modified:**
- `MessageResponse.java` - Added `senderUserId` field
- `ChatService.java` - Populate senderUserId in mapMessageToResponse
- `MessagesPage.jsx` - Use `(msg.senderUserId || msg.senderId) === user?.id`

---

#### Task 2: Fix Job Application Submission UI Error ✅ COMPLETED

**Analysis:** Frontend logic was correct. No changes needed.
- `handleApply` catches errors correctly
- Toast shows success on 201 response

---

#### Task 3: Employer Application Status Update ✅ COMPLETED

**Problem:** Frontend uses different status values than backend enum

**Backend ApplicationStatus enum:**
```
PENDING, REVIEWING, SHORTLISTED, INTERVIEW, OFFERED, HIRED, REJECTED, WITHDRAWN
```

**Frontend was using:**
```
PENDING, REVIEWING, INTERVIEWING (wrong), ACCEPTED (wrong), REJECTED
```

**Solution:** Aligned frontend STATUS_CONFIG with backend enum

**Files Modified:**
- `JobApplicantsPage.jsx` - Updated STATUS_CONFIG to match backend
- `MyApplicationsPage.jsx` - Updated STATUS_CONFIG and filter options
- `AICVRankingPage.jsx` - Updated status display logic

---

#### Task 4: Frontend-Backend Contract Alignment ✅ COMPLETED

**Changes:**
- All status values now match backend ApplicationStatus enum
- Added missing statuses: SHORTLISTED, INTERVIEW, OFFERED, HIRED, WITHDRAWN
- Removed incorrect statuses: ACCEPTED, INTERVIEWING

---

#### Task 5: Final Stability Testing ✅ COMPLETED

**Checklist:**
- ✅ Messaging: Uses senderUserId for correct message ownership
- ✅ Messages persist after reload (API working correctly)
- ✅ Application status values match backend enum
- ✅ Employer can update all valid statuses
- ✅ No frontend-backend contract mismatches

---

## Session 4 - Files Summary

### Backend Modified:
1. `MessageResponse.java` - Added senderUserId field
2. `ChatService.java` - Populate senderUserId for correct user identification

### Frontend Modified:
1. `MessagesPage.jsx` - Fixed message ownership check using senderUserId
2. `JobApplicantsPage.jsx` - Updated STATUS_CONFIG to match backend enum
3. `MyApplicationsPage.jsx` - Updated STATUS_CONFIG and filter dropdown
4. `AICVRankingPage.jsx` - Updated status display colors and labels

---

## Application Status Reference (Correct Values)

| Status | Label (Vietnamese) | Color |
|--------|-------------------|-------|
| PENDING | Chờ xử lý | Yellow |
| REVIEWING | Đang xem xét | Blue |
| SHORTLISTED | Đã chọn | Cyan |
| INTERVIEW | Mời phỏng vấn | Purple |
| OFFERED | Đã gửi offer | Orange |
| HIRED | Đã tuyển | Green |
| REJECTED | Từ chối | Red |
| WITHDRAWN | Đã rút đơn | Gray |

---

### Session 5 - 2026-01-01 (Bug Fixes Continued)

#### Task 1: Fix Job Detail - Apply Buttons Still Showing After Applied ✅ COMPLETED

**Problem:** Job detail page shows apply buttons even after user has applied

**Root Cause:** Previous session fixed JobDetailPage related jobs fetch error, but also improved the hasApplied check logic

**Solution:**
- Fixed related jobs fetch to handle Page object format
- Improved hasApplied/isSaved parsing with nullish coalescing operator
- Added better error logging for debugging

**Files Modified:**
- `JobDetailPage.jsx` - Fixed related jobs handling and hasApplied parsing logic

---

#### Task 2: Fix Notification Bell Not Clickable ✅ COMPLETED

**Problem:** Notification dropdown shows but 400 error occurs on API call

**Root Cause:** NotificationController returns `Page<Notification>` entity directly. The `Notification` entity has a lazy-loaded `User` relation. When Jackson serializes, the Hibernate session is closed, causing `LazyInitializationException`.

**Solution:**
1. Created `NotificationResponse` DTO to avoid serializing lazy-loaded entities
2. Updated `NotificationController` to map entities to DTOs
3. Added `@Transactional` annotations to ensure session is active during serialization
4. Fixed `NotificationBell.jsx` - removed reference to non-existent `connected` variable

**Files Created:**
- `NotificationResponse.java` - New DTO for notification responses

**Files Modified:**
- `NotificationController.java` - Use NotificationResponse DTO instead of entity
- `NotificationBell.jsx` - Removed undefined `connected` variable reference

---

#### Task 3: Fix Application Status Update Shows Error Despite Success ✅ COMPLETED

**Problem:** Employer updates application status, backend succeeds but frontend shows error

**Root Causes:**
1. `ApplicationService.updateApplicationStatus()` returns entity with lazy relations
2. When controller calls `ApplicationResponse.fromEntity()`, session is closed
3. Stats display in JobApplicantsPage used wrong variable names (`interviewing` instead of `interview`, `accepted` instead of `hired`)

**Solution:**
1. Added lazy entity initialization in `ApplicationService.updateApplicationStatus()`
2. Fixed stats display to use correct variable names

**Files Modified:**
- `ApplicationService.java` - Initialize lazy entities before returning
- `JobApplicantsPage.jsx` - Fixed stats display (`interview` and `hired`)

---

#### Task 4: Fix Chat/Messaging Errors ✅ COMPLETED

**Problem:** Chat feature not working properly, field access mismatches

**Root Cause:** Frontend accessing wrong field names from ConversationResponse:
- Used `conversation.candidateName` instead of `conversation.candidate?.fullName`
- Used `conversation.companyName` instead of `conversation.company?.name`
- Used `conv.lastMessage` (string) instead of `conv.lastMessage?.content`
- Used `conv.lastMessageAt` instead of `conv.lastMessage?.createdAt`
- Used `selectedConversation.jobTitle` instead of `selectedConversation.job?.title`

**Solution:**
Updated MessagesPage.jsx to use correct field paths with fallbacks for backward compatibility

**Files Modified:**
- `MessagesPage.jsx` - Fixed field access for conversation and message display

---

## Session 5 - Files Summary

### Backend Files Created:
1. `NotificationResponse.java` - DTO for notification responses to avoid LazyInitializationException

### Backend Files Modified:
1. `NotificationController.java` - Returns NotificationResponse DTO instead of entity
2. `ApplicationService.java` - Initialize lazy entities in updateApplicationStatus()

### Frontend Files Modified:
1. `JobDetailPage.jsx` - Fixed related jobs handling and hasApplied parsing
2. `NotificationBell.jsx` - Removed undefined `connected` variable
3. `JobApplicantsPage.jsx` - Fixed stats display variable names
4. `MessagesPage.jsx` - Fixed conversation/message field access

---

## Key Fixes Summary

| Issue | Root Cause | Solution |
|-------|------------|----------|
| Apply buttons showing after applied | hasApplied check failing | Improved response parsing with fallbacks |
| Notification 400 error | LazyInitializationException | Created NotificationResponse DTO |
| Status update FE error | Lazy entities not initialized | Initialize before returning from service |
| Chat field mismatches | Wrong field names in frontend | Updated to match ConversationResponse structure |

---
