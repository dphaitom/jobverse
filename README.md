# JobVerse - AI-Powered Job Portal

AI-powered job search platform with smart matching, interview prep, and resume analysis.

## Quick Start

### Prerequisites
- PostgreSQL 16 (port 5432)
- Java 17
- Node.js 18+
- Python 3.8+

### Setup

1. **Start PostgreSQL**
   ```bash
   # Make sure PostgreSQL 16 service is running on port 5432
   ```

2. **Start Backend**
   ```bash
   ./START_BACKEND_POSTGRES.bat
   # Wait 60 seconds for Flyway migrations
   ```

3. **Seed Database**
   ```bash
   cd scripts
   ./simple_seed.bat
   ```

4. **Start Frontend**
   ```bash
   cd jobverse
   npm install
   npm run dev
   ```

5. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080/api
   - Swagger UI: http://localhost:8080/api/swagger-ui.html

## Features

- 🔍 Smart Job Search with AI matching
- 🤖 AI Interview Practice
- 📄 AI Resume Analysis
- 💼 100+ Sample Jobs
- 🏢 Top Vietnamese Tech Companies

## Tech Stack

**Backend**: Spring Boot 3.2.1, PostgreSQL 16, Flyway, JWT
**Frontend**: React 18, Vite, Tailwind CSS
**AI**: OpenAI GPT-3.5

## Default Credentials

After seeding:
- Admin: admin@jobverse.com
- Or register a new account

---

Built with ❤️ by JobVerse Team
