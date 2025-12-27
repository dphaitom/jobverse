-- V10__add_chat_feature.sql
-- Add conversations and messages tables for chat between employer and candidate

-- Drop old chat_messages table if exists (from V1, which had different schema)
DROP TABLE IF EXISTS chat_messages;

-- Conversations table
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    candidate_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id BIGINT REFERENCES jobs(id) ON DELETE SET NULL,  -- optional context
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unique constraint: one conversation per company-candidate-job triple
-- For conversations without job context (job_id IS NULL), use a partial unique index
CREATE UNIQUE INDEX idx_conversations_unique_with_job 
    ON conversations(company_id, candidate_user_id, job_id) 
    WHERE job_id IS NOT NULL;

CREATE UNIQUE INDEX idx_conversations_unique_without_job 
    ON conversations(company_id, candidate_user_id) 
    WHERE job_id IS NULL;

-- Messages table
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('COMPANY', 'CANDIDATE')),
    sender_id BIGINT NOT NULL,  -- company_id or user_id depending on sender_type
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_conversations_company ON conversations(company_id);
CREATE INDEX idx_conversations_candidate ON conversations(candidate_user_id);
CREATE INDEX idx_conversations_job ON conversations(job_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(conversation_id) WHERE read_at IS NULL;
