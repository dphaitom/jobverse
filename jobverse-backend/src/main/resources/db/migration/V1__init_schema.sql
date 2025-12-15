-- V1__init_schema.sql
-- JobVerse Database Schema

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    phone VARCHAR(20) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'CANDIDATE',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    email_verified BOOLEAN DEFAULT FALSE,
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    avatar_url VARCHAR(500),
    date_of_birth DATE,
    gender VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(100),
    bio TEXT,
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    experience_years INTEGER,
    current_position VARCHAR(100),
    expected_salary_min DECIMAL(15, 2),
    expected_salary_max DECIMAL(15, 2),
    open_to_work BOOLEAN DEFAULT TRUE,
    open_to_remote BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_url VARCHAR(500),
    cover_url VARCHAR(500),
    description TEXT,
    industry VARCHAR(100),
    company_size VARCHAR(50),
    founded_year INTEGER,
    website VARCHAR(255),
    headquarters VARCHAR(255),
    tax_code VARCHAR(50) UNIQUE,
    verification_status VARCHAR(20) DEFAULT 'PENDING',
    rating_avg DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    employee_count INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    description VARCHAR(255),
    parent_id BIGINT REFERENCES categories(id),
    job_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Skills table
CREATE TABLE skills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    category_id BIGINT REFERENCES categories(id),
    is_trending BOOLEAN DEFAULT FALSE,
    job_count INTEGER DEFAULT 0,
    candidate_count INTEGER DEFAULT 0
);

-- Jobs table
CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    posted_by BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    category_id BIGINT REFERENCES categories(id),
    job_type VARCHAR(20) NOT NULL,
    experience_level VARCHAR(20) NOT NULL,
    salary_min DECIMAL(15, 2),
    salary_max DECIMAL(15, 2),
    salary_negotiable BOOLEAN DEFAULT FALSE,
    currency VARCHAR(10) DEFAULT 'VND',
    location VARCHAR(255) NOT NULL,
    is_remote BOOLEAN DEFAULT FALSE,
    remote_type VARCHAR(20),
    positions_count INTEGER DEFAULT 1,
    deadline DATE,
    status VARCHAR(20) DEFAULT 'DRAFT',
    is_featured BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    video_intro_url VARCHAR(500),
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job skills table
CREATE TABLE job_skills (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id),
    proficiency VARCHAR(20),
    is_required BOOLEAN DEFAULT TRUE,
    UNIQUE(job_id, skill_id)
);

-- Job benefits table
CREATE TABLE job_benefits (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    benefit_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50)
);

-- User skills table
CREATE TABLE user_skills (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id),
    proficiency VARCHAR(20),
    years_experience INTEGER,
    is_verified BOOLEAN DEFAULT FALSE,
    certificate_url VARCHAR(500),
    UNIQUE(user_id, skill_id)
);

-- Resumes table
CREATE TABLE resumes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    parsed_content TEXT,
    ai_analysis JSONB,
    is_primary BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES jobs(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    resume_id BIGINT REFERENCES resumes(id),
    cover_letter TEXT,
    expected_salary DECIMAL(15, 2),
    status VARCHAR(20) DEFAULT 'PENDING',
    ai_match_score INTEGER,
    ai_analysis JSONB,
    rejection_reason VARCHAR(255),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    viewed_at TIMESTAMP,
    UNIQUE(job_id, user_id)
);

-- Saved jobs table
CREATE TABLE saved_jobs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

-- Notifications table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    action_url VARCHAR(500),
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company images table
CREATE TABLE company_images (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    display_order INTEGER DEFAULT 0
);

-- Company reviews table
CREATE TABLE company_reviews (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    pros TEXT,
    cons TEXT,
    is_current_employee BOOLEAN DEFAULT FALSE,
    job_title VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interviews table
CREATE TABLE interviews (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id),
    interview_type VARCHAR(20) NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link VARCHAR(500),
    location VARCHAR(255),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    rating INTEGER,
    feedback TEXT
);

-- Chat messages table
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(id),
    receiver_id BIGINT NOT NULL REFERENCES users(id),
    application_id BIGINT REFERENCES applications(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'TEXT',
    file_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI match logs table
CREATE TABLE ai_match_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    job_id BIGINT NOT NULL REFERENCES jobs(id),
    match_score INTEGER,
    skill_matches JSONB,
    experience_match JSONB,
    salary_match JSONB,
    location_match JSONB,
    recommendations TEXT,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Salary insights table
CREATE TABLE salary_insights (
    id BIGSERIAL PRIMARY KEY,
    job_title VARCHAR(200) NOT NULL,
    location VARCHAR(100),
    category_id BIGINT REFERENCES categories(id),
    experience_level VARCHAR(20),
    salary_min DECIMAL(15, 2),
    salary_median DECIMAL(15, 2),
    salary_max DECIMAL(15, 2),
    sample_count INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_category ON jobs(category_id);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);
CREATE INDEX idx_jobs_featured ON jobs(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_jobs_urgent ON jobs(is_urgent) WHERE is_urgent = TRUE;
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Full-text search index for jobs
CREATE INDEX idx_jobs_search ON jobs USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
