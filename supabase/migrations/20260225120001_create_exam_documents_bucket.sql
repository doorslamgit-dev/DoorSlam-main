-- Create private Storage bucket for original exam document PDFs.
-- Access via signed URLs only (copyrighted materials).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'exam-documents',
    'exam-documents',
    false,
    52428800,  -- 50 MB
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: service_role can upload/manage, authenticated can read via signed URLs
CREATE POLICY "exam_docs_service_all" ON storage.objects
    FOR ALL
    USING (bucket_id = 'exam-documents' AND auth.role() = 'service_role')
    WITH CHECK (bucket_id = 'exam-documents' AND auth.role() = 'service_role');

CREATE POLICY "exam_docs_authenticated_read" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'exam-documents' AND auth.role() = 'authenticated');
