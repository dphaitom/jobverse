# 📊 JobVerse - System Diagrams

## 1. System Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ CLIENT LAYER"]
        WEB["🌐 React Web App"]
        MOBILE["📱 Mobile App"]
    end

    subgraph Gateway["🚪 API GATEWAY"]
        NGINX["Nginx Load Balancer"]
        AUTH_FILTER["JWT Auth Filter"]
    end

    subgraph Backend["⚙️ SPRING BOOT"]
        direction TB
        CTRL["Controllers"]
        SVC["Services"]
        REPO["Repositories"]
        SEC["Security"]
    end

    subgraph Data["💾 DATA LAYER"]
        POSTGRES[("PostgreSQL")]
        REDIS[("Redis Cache")]
        ELASTIC[("Elasticsearch")]
    end

    subgraph External["🌍 EXTERNAL"]
        AI["OpenAI API"]
        MAIL["Email Service"]
        S3["AWS S3"]
    end

    subgraph Queue["📨 MESSAGE QUEUE"]
        KAFKA["Apache Kafka"]
    end

    WEB --> NGINX
    MOBILE --> NGINX
    NGINX --> AUTH_FILTER
    AUTH_FILTER --> CTRL
    CTRL --> SVC
    SVC --> REPO
    SVC --> SEC
    REPO --> POSTGRES
    SVC --> REDIS
    SVC --> ELASTIC
    SVC --> KAFKA
    SVC --> AI
    SVC --> MAIL
    SVC --> S3
```

---

## 2. Database ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    USERS ||--o{ USER_PROFILES : has
    USERS ||--o{ RESUMES : uploads
    USERS ||--o{ APPLICATIONS : submits
    USERS ||--o{ SAVED_JOBS : saves
    USERS ||--o{ USER_SKILLS : has

    COMPANIES ||--o{ JOBS : posts
    COMPANIES ||--o{ COMPANY_REVIEWS : receives

    JOBS ||--o{ APPLICATIONS : receives
    JOBS ||--o{ JOB_SKILLS : requires
    JOBS ||--o{ JOB_BENEFITS : offers

    SKILLS ||--o{ USER_SKILLS : used_by
    SKILLS ||--o{ JOB_SKILLS : required_by

    CATEGORIES ||--o{ JOBS : contains

    USERS {
        bigint id PK
        varchar email UK
        varchar password_hash
        enum role
        enum status
        timestamp created_at
    }

    COMPANIES {
        bigint id PK
        bigint owner_id FK
        varchar name UK
        varchar slug UK
        text description
        enum verification_status
    }

    JOBS {
        bigint id PK
        bigint company_id FK
        varchar title
        text description
        enum job_type
        decimal salary_min
        decimal salary_max
        enum status
    }

    APPLICATIONS {
        bigint id PK
        bigint job_id FK
        bigint user_id FK
        enum status
        int ai_match_score
        timestamp applied_at
    }
```

---

## 3. API Endpoints Structure

```mermaid
flowchart LR
    subgraph AUTH["🔐 /api/v1/auth"]
        A1["POST /register"]
        A2["POST /login"]
        A3["POST /refresh-token"]
        A4["POST /forgot-password"]
    end

    subgraph JOBS["💼 /api/v1/jobs"]
        J1["GET /"]
        J2["GET /{id}"]
        J3["POST /"]
        J4["POST /{id}/apply"]
        J5["GET /recommended"]
    end

    subgraph COMPANIES["🏢 /api/v1/companies"]
        C1["GET /"]
        C2["GET /{id}"]
        C3["POST /"]
    end

    subgraph AI["🤖 /api/v1/ai"]
        AI1["POST /match-score"]
        AI2["POST /analyze-resume"]
        AI3["GET /salary-prediction"]
    end
```

---

## 4. Application Flow

```mermaid
sequenceDiagram
    participant C as 👤 Candidate
    participant FE as 🖥️ Frontend
    participant API as ⚙️ Backend
    participant AI as 🤖 AI Service
    participant DB as 🗄️ Database

    C->>FE: Search jobs
    FE->>API: GET /api/v1/jobs/search
    API->>DB: Query jobs
    API->>AI: Calculate match scores
    AI-->>API: Match results
    API-->>FE: Jobs with AI scores
    FE-->>C: Display results

    C->>FE: Apply for job
    FE->>API: POST /api/v1/jobs/{id}/apply
    API->>DB: Create application
    API->>AI: Analyze fit
    API-->>FE: Success
    FE-->>C: Confirmation
```

---

## 5. Project Structure

```
jobverse-backend/
├── src/main/java/com/jobverse/
│   ├── config/           # Security, Redis, Kafka configs
│   ├── controller/       # REST API endpoints
│   ├── service/          # Business logic
│   ├── repository/       # Data access layer
│   ├── entity/           # JPA entities
│   ├── dto/              # Request/Response DTOs
│   ├── security/         # JWT, Auth
│   └── exception/        # Error handling
├── src/main/resources/
│   ├── application.yml   # Configuration
│   └── db/migration/     # Flyway SQL
├── docker-compose.yml    # All services
├── Dockerfile           
└── pom.xml              # Dependencies
```

---

## 6. Tech Stack Overview

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Spring Boot 3.2 + Java 17 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Search | Elasticsearch 8 |
| Queue | Apache Kafka |
| Auth | JWT + OAuth2 |
| AI | OpenAI GPT-4 |
| Storage | AWS S3 |
| Container | Docker + Docker Compose |

---

## 7. Deployment Architecture

```mermaid
flowchart TB
    subgraph Cloud["☁️ Cloud Infrastructure"]
        LB["Load Balancer"]
        
        subgraph App["Application Tier"]
            API1["API Server 1"]
            API2["API Server 2"]
            API3["API Server 3"]
        end
        
        subgraph Data["Data Tier"]
            PG["PostgreSQL Primary"]
            PG_R["PostgreSQL Replica"]
            REDIS["Redis Cluster"]
            ES["Elasticsearch"]
        end
        
        subgraph Storage["Storage"]
            S3["AWS S3"]
            CDN["CloudFront CDN"]
        end
    end
    
    Users["👥 Users"] --> CDN
    CDN --> LB
    LB --> API1 & API2 & API3
    API1 & API2 & API3 --> PG & REDIS & ES
    PG --> PG_R
    API1 & API2 & API3 --> S3
```
