-- RAG schema for AI Tutor conversations and messages
-- Module 1: App Shell — conversation persistence
-- Documents, chunks, and embeddings tables will be added in Module 2.

-- Enable pgvector (must be enabled in dashboard first)
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Create RAG schema
CREATE SCHEMA IF NOT EXISTS rag;

-- ---------------------------------------------------------------------------
-- Conversations (parent or child chat threads)
-- ---------------------------------------------------------------------------
CREATE TABLE rag.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.children(id),
    subject_id UUID REFERENCES public.subjects(id),
    title TEXT,
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_active_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Messages within conversations
-- ---------------------------------------------------------------------------
CREATE TABLE rag.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES rag.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]'::jsonb,
    token_count INTEGER,
    model_name TEXT,
    latency_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_rag_conversations_user ON rag.conversations(user_id);
CREATE INDEX idx_rag_conversations_child ON rag.conversations(child_id);
CREATE INDEX idx_rag_messages_conversation ON rag.messages(conversation_id);
CREATE INDEX idx_rag_messages_created ON rag.messages(created_at);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE rag.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag.messages ENABLE ROW LEVEL SECURITY;

-- Users can manage their own conversations
CREATE POLICY "conversations_own" ON rag.conversations
    FOR ALL USING (user_id = auth.uid());

-- Parents can view their children's conversations
CREATE POLICY "conversations_parent_read" ON rag.conversations
    FOR SELECT USING (
        child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
    );

-- Messages visible via conversation ownership
CREATE POLICY "messages_own" ON rag.messages
    FOR ALL USING (
        conversation_id IN (SELECT id FROM rag.conversations WHERE user_id = auth.uid())
    );

-- Parents can view messages in their children's conversations
CREATE POLICY "messages_parent_read" ON rag.messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM rag.conversations
            WHERE child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
        )
    );

-- Service role can read/write all (for Python backend ingestion)
CREATE POLICY "service_role_all_conversations" ON rag.conversations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_messages" ON rag.messages
    FOR ALL USING (auth.role() = 'service_role');
