-- Grant permissions on rag schema to PostgREST roles
-- Required for service_role (Python backend) and authenticated (RLS) access

GRANT USAGE ON SCHEMA rag TO service_role, authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA rag TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA rag TO authenticated;

-- Ensure future tables in rag schema inherit the same permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA rag GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA rag GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
