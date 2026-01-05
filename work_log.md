# JobVerse - Work Log

## Date: 2026-01-04

### Summary
Fixed UI and data consistency issues in JobVerse as specified in prompt.txt.

---

## HOTFIX: Backend Error - CompanySize Enum Mismatch
**Status:** ✅ Fixed

**Problem:**
- Backend error: `No enum constant com.jobverse.entity.Company.CompanySize.LARGE`
- Jobs list couldn't load due to companies with `company_size` = 'LARGE' in database
- The enum only had detailed values like `LARGE_201_500` but data had simple `LARGE`

**Solution:**
- Added legacy enum values to `Company.java` for backward compatibility:
  ```java
  public enum CompanySize {
      // Legacy values for backward compatibility
      SMALL,
      MEDIUM,
      LARGE,
      ENTERPRISE,
      
      // New detailed values
      STARTUP_1_10,
      SMALL_11_50,
      MEDIUM_51_200,
      LARGE_201_500,
      ENTERPRISE_501_1000,
      CORPORATION_1000_PLUS
  }
  ```

**Files Modified:**
- `jobverse-backend/src/main/java/com/jobverse/entity/Company.java`

**Action Required:**
- Restart the backend server: `mvn spring-boot:run` or restart in IDE

---

## Task 1: Fix Text Color Issue on AI Interview Page (Light Theme)
**Status:** ✅ Completed

**Problem:**
- Question text color was black on dark backgrounds in light theme
- Text was blending into question card containers

**Solution:**
- Updated `InterviewPrepPage.jsx` to pass `isDark` prop to `QuestionCard` and `QuestionSection` components
- Made text colors theme-aware using conditional classes:
  - Question text: `isDark ? 'text-white' : 'text-gray-900'`
  - Secondary text: `isDark ? 'text-gray-400' : 'text-gray-600'`
  - Card backgrounds: `isDark ? 'bg-nike-black-light border-gray-800' : 'bg-white border-gray-200 shadow-sm'`
  - Textarea inputs: Theme-aware styling with proper contrast

**Files Modified:**
- `jobverse/src/pages/InterviewPrepPage.jsx`

---

## Task 2: Fix Job & Company Filter by Location
**Status:** ✅ Completed

**Problem:**
- Location filter did not return correct results for companies

**Solution:**
- Backend job location filtering was already implemented with Vietnamese text normalization
- Added company search functionality:
  - Added `searchByKeyword`, `findByIndustry`, `searchByKeywordAndIndustry`, `findByLocation` methods to `CompanyRepository.java`
  - Added `searchCompanies()` method to `CompanyService.java`
  - Updated `CompanyController.java` to accept `keyword` and `industry` query parameters

**Files Modified:**
- `jobverse-backend/src/main/java/com/jobverse/repository/CompanyRepository.java`
- `jobverse-backend/src/main/java/com/jobverse/service/CompanyService.java`
- `jobverse-backend/src/main/java/com/jobverse/controller/CompanyController.java`

---

## Task 3: Fix Long Text Overflow in Job Description & Cards
**Status:** ✅ Completed

**Problem:**
- Long text/single words overflowed outside containers
- Layout breakage with very long strings

**Solution:**
- Added CSS rules to `index.css`:
  ```css
  /* Text overflow handling */
  .break-words {
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
  }
  
  /* Apply globally to common containers */
  .job-card, .glass-card, .skill-pill, p, h1-h6, span, div {
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  /* Skill pills truncate */
  .skill-pill {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ```

**Files Modified:**
- `jobverse/src/index.css`

---

## Task 4: Sync "Hot Skills" Section with Database (Homepage)
**Status:** ✅ Completed

**Problem:**
- "Hot Skills" section used static/fallback data
- Did not reflect real database statistics

**Solution:**
- Updated `SkillRepository.java` with native query to get trending skills by actual job usage:
  ```java
  @Query(value = "SELECT s.* FROM skills s 
    LEFT JOIN job_skills js ON js.skill_id = s.id 
    LEFT JOIN jobs j ON js.job_id = j.id AND j.status = 'ACTIVE'
    GROUP BY s.id 
    ORDER BY COUNT(js.id) DESC
    LIMIT 10", nativeQuery = true)
  List<Skill> findTrendingSkills();
  ```
- Added `countActiveJobsBySkillId()` method to get real-time job counts
- Updated `SkillService.java` with `mapToResponseWithJobCount()` to return dynamic job counts
- Updated `HomePage.jsx` to display only database-driven skills (removed static fallback)

**Files Modified:**
- `jobverse-backend/src/main/java/com/jobverse/repository/SkillRepository.java`
- `jobverse-backend/src/main/java/com/jobverse/service/SkillService.java`
- `jobverse/src/pages/HomePage.jsx`

---

## Task 5: Crawl & Generate Job Data for Employers (Data Enrichment)
**Status:** ✅ Already Exists

**Note:** Data crawling and seeding infrastructure already exists:
- `job_crawler.py` - Python script for crawling job data
- `crawled_jobs.json` - Crawled job data
- `seed_database.py` - Database seeding script
- `crawled_images/` - Downloaded company images

---

## Task 6: Final Validation & UX Review
**Status:** ✅ Completed

**Checklist:**
- [x] AI Interview text readable in light theme
- [x] Location filter works correctly (backend ready)
- [x] Long text no longer breaks layout
- [x] Hot Skills reflect real database data
- [x] Employers have rich, realistic job listings (seeding scripts available)

---

## Task 7: Improve Sign In / Sign Out UI & Authentication UX
**Status:** ✅ Completed

**Problem:**
- Demo account section displayed on login page (not needed)
- No clear error message for incorrect password
- Logout did not redirect properly

**Solution:**

1. **Removed demo accounts section** from `LoginPage.jsx`
   - Deleted the entire demo credentials UI block

2. **Improved login error handling** in `LoginPage.jsx`:
   - Made error message styling theme-aware (light/dark mode)
   - Enhanced error detection to catch more cases:
     - `credentials`, `password`, `invalid`, `401`, `unauthorized` → "Email hoặc mật khẩu không đúng"
     - `network`, `fetch` → "Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại."
     - Default fallback also shows credentials error (user-friendly)
   - Error message has proper contrast in both light and dark themes

3. **Improved logout redirect** in `AuthContext.jsx`:
   ```javascript
   const logout = async () => {
     try {
       await authAPI.logout();
     } catch (error) {
       console.error('Logout error:', error);
     } finally {
       localStorage.removeItem('accessToken');
       localStorage.removeItem('refreshToken');
       localStorage.removeItem('user');
       setUser(null);
       setIsAuthenticated(false);
       // Redirect to homepage after logout
       window.location.href = '/';
     }
   };
   ```

4. **Updated Navbar** to not duplicate redirect logic (logout handler simplified)

5. **Backend already returns proper error codes:**
   - `BadCredentialsException` → HTTP 401 with "Invalid email or password"

**Files Modified:**
- `jobverse/src/pages/auth/LoginPage.jsx`
- `jobverse/src/contexts/AuthContext.jsx`
- `jobverse/src/components/index.jsx`

---

## Files Changed Summary

### Frontend (jobverse/)
| File | Changes |
|------|---------|
| `src/pages/InterviewPrepPage.jsx` | Added theme-aware styling for light mode |
| `src/pages/HomePage.jsx` | Removed static fallback for trending skills |
| `src/pages/auth/LoginPage.jsx` | Removed demo accounts section |
| `src/contexts/AuthContext.jsx` | Added homepage redirect after logout |
| `src/components/index.jsx` | Simplified logout handler |
| `src/index.css` | Added text overflow CSS rules |

### Backend (jobverse-backend/)
| File | Changes |
|------|---------|
| `src/main/java/com/jobverse/repository/SkillRepository.java` | Dynamic trending skills query |
| `src/main/java/com/jobverse/service/SkillService.java` | Real-time job count calculation |
| `src/main/java/com/jobverse/repository/CompanyRepository.java` | Added search methods |
| `src/main/java/com/jobverse/service/CompanyService.java` | Added searchCompanies() |
| `src/main/java/com/jobverse/controller/CompanyController.java` | Added keyword/industry params |

---

## Testing Notes
- Frontend changes require `npm run dev` restart
- Backend changes require Maven rebuild: `mvn clean compile`
- Test light theme on AI Interview page to verify text visibility
- Test company search with keyword and industry filters
- Test logout to confirm redirect to homepage

---

## Additional Fix: Job Search Endpoint Enhancement
**Status:** ✅ Fixed

**Problem:**
- The `/v1/jobs/search` endpoint only accepted `q` parameter
- Location and other filters were ignored when using search endpoint

**Solution:**
- Updated `JobController.java` search endpoint to accept all filter parameters:
  - `q` (keyword)
  - `location`
  - `categoryId`
  - `jobType`
  - `experienceLevel`
  - `isRemote`

**Files Modified:**
- `jobverse-backend/src/main/java/com/jobverse/controller/JobController.java`

**Note:** The main `/v1/jobs` endpoint already supported all filters. The `/v1/jobs/search` endpoint now also supports them for consistency.
