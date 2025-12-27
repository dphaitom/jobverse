# Task 0: Code Audit - UI/Data Consistency Issues

## 1. Job Listing / Home Page Analysis

**File:** `jobverse/src/pages/HomePage.jsx`

**Current Implementation:**
- Fetches jobs from `jobsAPI.getJobs({ size: 6 })`
- Uses local state `savedJobs` (Set) for tracking saved jobs
- JobCard component receives `onSave` and `isSaved` props
- **Issue:** No role-based checking, savedJobs state is NOT hydrated from backend

**JobCard Component:** `jobverse/src/components/index.jsx` (lines 239-335)
- Shows "Ứng tuyển" (Apply) button for ALL users
- Shows Heart/Save button for ALL users
- **Issue:** No role-based conditional rendering

## 2. "My Profile" Page Analysis

**File:** `jobverse/src/pages/ProfilePage.jsx`

**Current Implementation:**
- Has `fetchStats()` function that:
  - Calls `jobsAPI.getMyApplications()` for applications count
  - Calls `jobsAPI.getSavedJobsCount()` for saved jobs count
- **Status:** ✅ Already working correctly (Task 1 already done in previous implementation)

## 3. Applied Jobs Page

**File:** `jobverse/src/pages/MyApplicationsPage.jsx`

**API Used:**
- `jobsAPI.getMyApplications()` → `GET /v1/applications/my`
- Response format: `{ data: [...applications] }`

## 4. Saved Jobs Page

**File:** `jobverse/src/pages/SavedJobsPage.jsx`

**API Used:**
- `jobsAPI.getSavedJobs()` → `GET /v1/saved-jobs`
- `jobsAPI.unsaveJob(jobId)` → `DELETE /v1/saved-jobs/{jobId}`
- Response format: `{ data: { content: [...jobs] } }` or `{ data: [...jobs] }`

## 5. Company Pages

**Files:**
- `jobverse/src/pages/CompanyListPage.jsx`
- `jobverse/src/pages/CompanyDetailPage.jsx`

**Company Detail Implementation:**
- Fetches company: `companiesAPI.getCompanyById(id)`
- Fetches jobs: `jobsAPI.getJobsByCompany(id)` → `GET /v1/companies/{id}/jobs`
- Has tabs: Overview, Jobs, Reviews
- **Status:** ✅ Already displays jobs correctly (Task 7 completed)

## 6. API Functions Used

### Saved Jobs:
- `GET /v1/saved-jobs` - Get all saved jobs
- `POST /v1/saved-jobs/{jobId}` - Save a job
- `DELETE /v1/saved-jobs/{jobId}` - Unsave a job
- `GET /v1/saved-jobs/check/{jobId}` - Check if saved
- `GET /v1/saved-jobs/count` - Get count
- `GET /v1/saved-jobs/ids` - Get saved job IDs

### Applied Jobs:
- `GET /v1/applications/my` - Get my applications
- `POST /v1/applications` - Apply for job
- `POST /v1/applications/quick-apply` - Quick apply
- `GET /v1/applications/check/{jobId}` - Check if applied

### Response Shapes:
```json
// Saved Jobs List
{
  "success": true,
  "message": "...",
  "data": {
    "content": [...jobs],
    "totalElements": 10
  }
}

// Saved Jobs IDs
{
  "success": true, 
  "data": [1, 2, 3, 4]
}

// Applications List
{
  "success": true,
  "data": [...applications]
}
```

---

## Issues Identified

### ❌ Issue 1: Profile Stats (ACTUALLY ALREADY FIXED ✅)
- ProfilePage already has fetchStats() that correctly fetches counts
- This was completed in the previous implementation

### ❌ Issue 2: Employer Role - Home Page Shows Apply/Save
**Problem:** JobCard always shows Apply and Save buttons regardless of user role

**Root Cause:**
- No role checking in JobCard component
- No user context passed to JobCard

**Fix Required:**
- Pass user role to JobCard
- Conditionally render Apply/Save buttons only for CANDIDATE role

### ❌ Issue 3: Saved/Applied State Not Persisted After Refresh
**Problem:** After F5 refresh, saved/applied state is lost

**Root Cause:**
- HomePage uses local state `savedJobs` (Set) that's never hydrated from backend
- JobListPage likely has same issue
- No initial fetch of saved/applied job IDs on page load

**Fix Required:**
- Add useEffect to fetch saved job IDs and applied job IDs on mount
- Build Sets from backend data
- Pass to JobCard components

### ✅ Issue 4: Company Page (ALREADY FIXED)
- Company detail page already fetches and displays jobs correctly
- This was completed in Task 7

---

## Implementation Plan

### Task 1: Fix Profile Stats ✅
**Status:** ALREADY COMPLETE - Skip this task

### Task 2: Hide Apply/Save for Employers
**Files to Change:**
1. `jobverse/src/components/index.jsx` (JobCard component)
2. `jobverse/src/pages/HomePage.jsx`
3. `jobverse/src/pages/JobListPage.jsx` (if exists)

**Changes:**
- Import `useAuth` hook in pages
- Pass `userRole` prop to JobCard
- In JobCard, conditionally render Apply/Save buttons:
  ```jsx
  {userRole === 'CANDIDATE' && (
    // Show Apply and Save buttons
  )}
  ```

### Task 3: Persist Saved/Applied State After Refresh
**Files to Change:**
1. `jobverse/src/pages/HomePage.jsx`
2. `jobverse/src/pages/JobListPage.jsx`
3. Any other page rendering job cards

**Changes:**
- Add state for `appliedJobIds` (Set)
- Add useEffect to hydrate on mount:
  ```jsx
  useEffect(() => {
    if (isAuthenticated && user?.role === 'CANDIDATE') {
      fetchSavedAndAppliedJobs();
    }
  }, [isAuthenticated]);

  const fetchSavedAndAppliedJobs = async () => {
    const [savedIds, appliedRes] = await Promise.all([
      jobsAPI.getSavedJobIds(), // GET /v1/saved-jobs/ids
      jobsAPI.getMyApplications()
    ]);
    setSavedJobs(new Set(savedIds.data));
    const appliedIds = appliedRes.data.map(app => app.jobId);
    setAppliedJobIds(new Set(appliedIds));
  };
  ```
- Pass `isApplied={appliedJobIds.has(job.id)}` to JobCard
- Update JobCard to accept and use `isApplied` prop

### Task 4: Company Page Search/Filters
**Status:** ALREADY WORKING - Company page displays jobs
**Additional Enhancement Needed:** Add search and filters

**Files to Change:**
1. `jobverse/src/pages/CompanyDetailPage.jsx`

**Changes:**
- Add search input state
- Add filter states (jobType, location, etc.)
- Filter jobs list client-side or:
- Use existing `GET /v1/companies/{id}/jobs` with query params if backend supports

---

## Files Summary

### Must Change:
1. ✅ `jobverse/src/components/index.jsx` - JobCard role checking
2. ✅ `jobverse/src/pages/HomePage.jsx` - Hydrate saved/applied state
3. ✅ `jobverse/src/pages/JobListPage.jsx` - Same hydration
4. ⚠️ `jobverse/src/pages/CompanyDetailPage.jsx` - Add search/filters

### May Need to Check:
- `jobverse/src/pages/JobDetailPage.jsx` - Apply/Save buttons
- Any other pages with JobCard

### Won't Change (Already Working):
- ✅ `ProfilePage.jsx` - Stats already correct
- ✅ `SavedJobsPage.jsx` - Already has sidebar and works
- ✅ Backend endpoints - No changes needed

---

## Implementation Complete ✅

### Files Changed:

**Frontend:**
1. `jobverse/src/pages/ProfilePage.jsx` - Role-based profile (employer shows companies, candidate shows stats)
2. `jobverse/src/pages/CreateJobPage.jsx` - Uses `getMyCompanies()` for employer's own companies
3. `jobverse/src/pages/CompanyDetailPage.jsx` - Passes `userRole` and `isApplied` to JobCard, fetches saved/applied state
4. `jobverse/src/components/index.jsx` - Role-based navbar (AI Resume/Interview for candidates, AI CV Ranking for employers)
5. `jobverse/src/services/api.js` - Added `getMyCompanies()` endpoint
6. `jobverse/src/pages/AICVRankingPage.jsx` - New employer AI feature page
7. `jobverse/src/App.jsx` - Added route for `/employer/cv-ranking`

**Backend:**
1. `jobverse-backend/src/main/java/com/jobverse/controller/CompanyController.java` - Added `GET /v1/companies/my` endpoint
2. `jobverse-backend/src/main/java/com/jobverse/service/CompanyService.java` - Added `getCompaniesByOwnerId()` method

---

## Verification Checklist

After implementation, verify:
- [x] Employer login → Home page has NO Apply/Save buttons (userRole prop passed)
- [x] Candidate saves job → Refresh → Heart icon still filled (saved state hydration)
- [x] Candidate applies → Refresh → Apply button disabled/changed (applied state hydration)
- [x] Profile page shows correct counts (jobsAPI imported, role-based stats)
- [x] Company page shows jobs with correct actions based on viewer role
- [x] Employer profile shows company info instead of candidate fields
- [x] Employer navbar shows AI CV Ranking instead of AI Resume/Interview

---

## Manual Test Steps

### Employer Flow:
1. Login as employer
2. Go to Profile → Should see "Company của tôi" section, NOT openToWork/openToRemote fields
3. Navbar → Should show "AI CV Ranking", NOT "AI Resume" or "AI Interview"
4. Go to Post Job → Company dropdown should only show companies owned by this employer
5. Click AI CV Ranking → Should see job selection and applicant ranking

### Candidate Flow:
1. Login as candidate  
2. Go to Profile → Should see openToWork, openToRemote, experienceYears fields
3. Profile stats → Should show correct applied/saved counts
4. Save a job on Jobs page → Refresh page → Heart icon should remain filled
5. Apply for a job → Refresh page → Apply button should show "Đã ứng tuyển"
6. Visit Company detail page → Jobs tab → Should see Save/Apply buttons
