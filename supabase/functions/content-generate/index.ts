// supabase/functions/content-generate/index.ts
// Edge Function: source-first content generation from original revision PDFs.
// Reads PDFs directly from Supabase Storage (exam-documents bucket),
// sends them to Claude for structured content extraction per topic.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// deno-lint-ignore-file

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STORAGE_BUCKET = 'exam-documents';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RequestBody {
  subject_id: string;
  topic_ids?: string[];
}

interface TopicWithContext {
  id: string;
  topic_name: string;
  canonical_code: string | null;
  theme_id: string;
  theme_name: string;
  component_id: string;
  component_name: string;
}

interface RevisionDoc {
  id: string;
  title: string;
  file_key: string;
}

interface GeneratedItem {
  content_type: string;
  content_body: Record<string, unknown>;
  source: string;
  difficulty: number;
  estimated_seconds: number;
  marks_available?: number;
  command_word?: string;
  mark_scheme?: Record<string, unknown>;
}

interface TopicResult {
  topic_id: string;
  topic_name: string;
  items_created: number;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Content body validation (mirrors content_validator.py)
// ---------------------------------------------------------------------------

function validateContentBody(contentType: string, body: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (contentType === 'flashcard') {
    if (typeof body.front !== 'string' || !(body.front as string).trim())
      errors.push('flashcard.front is required');
    if (typeof body.back !== 'string' || !(body.back as string).trim())
      errors.push('flashcard.back is required');
  } else if (contentType === 'teaching_slide') {
    if (typeof body.title !== 'string' || !(body.title as string).trim())
      errors.push('teaching_slide.title is required');
    if (typeof body.content !== 'string' || !(body.content as string).trim())
      errors.push('teaching_slide.content is required');
    if (!Array.isArray(body.key_points) || (body.key_points as unknown[]).length === 0)
      errors.push('teaching_slide.key_points must be a non-empty array');
  } else if (contentType === 'worked_example') {
    if (typeof body.title !== 'string' || !(body.title as string).trim())
      errors.push('worked_example.title is required');
    if (typeof body.question_context !== 'string')
      errors.push('worked_example.question_context must be a string');
    if (!Array.isArray(body.steps) || (body.steps as unknown[]).length === 0)
      errors.push('worked_example.steps must be a non-empty array');
    if (typeof body.final_answer !== 'string')
      errors.push('worked_example.final_answer must be a string');
  } else if (contentType === 'practice_question') {
    if (typeof body.text !== 'string' || !(body.text as string).trim())
      errors.push('practice_question.text is required');
    const validTypes = ['numeric', 'multiple_choice', 'short_text'];
    if (!validTypes.includes(body.questionType as string))
      errors.push(`practice_question.questionType must be one of ${validTypes.join(', ')}`);
    if (typeof body.marks !== 'number') errors.push('practice_question.marks must be a number');
    if (typeof body.explanation !== 'string')
      errors.push('practice_question.explanation must be a string');
    if (body.questionType === 'multiple_choice') {
      if (!Array.isArray(body.options) || (body.options as unknown[]).length < 2)
        errors.push('practice_question.options must have at least 2 items for multiple_choice');
    }
  } else {
    errors.push(`Unknown content_type: ${contentType}`);
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Find revision documents for a theme
// ---------------------------------------------------------------------------

function themeToSlug(themeName: string): string {
  return themeName
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, '') // strip parenthetical qualifiers like "(biology only)"
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function findMatchingDocs(docs: RevisionDoc[], themeName: string): RevisionDoc[] {
  const slug = themeToSlug(themeName);

  // Match docs whose file_key contains the theme slug
  // e.g. theme "Cell division" → slug "cell-division" → matches *_cell-division.pdf
  const matches = docs.filter((d) => {
    const fileSlug = d.file_key.toLowerCase().replace(/_/g, '-');
    return fileSlug.includes(slug);
  });

  // If no exact match, try matching on the most distinctive word (>4 chars)
  if (matches.length === 0) {
    const words = slug.split('-').filter((w) => w.length > 4);
    return docs.filter((d) => {
      const fk = d.file_key.toLowerCase().replace(/_/g, '-');
      return words.some((w) => fk.includes(w));
    });
  }

  return matches;
}

// ---------------------------------------------------------------------------
// Download PDF from Supabase Storage and encode as base64
// ---------------------------------------------------------------------------

async function downloadPdf(
  sb: ReturnType<typeof createClient>,
  fileKey: string
): Promise<string | null> {
  const { data, error } = await sb.storage.from(STORAGE_BUCKET).download(fileKey);

  if (error || !data) {
    console.error(`Failed to download ${fileKey}:`, error?.message);
    return null;
  }

  const arrayBuffer = await data.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ---------------------------------------------------------------------------
// Prompt builder + Claude API call
// ---------------------------------------------------------------------------

function buildPrompt(topicName: string, canonicalCode: string | null, themeName: string): string {
  const codeStr = canonicalCode ? ` (spec code: ${canonicalCode})` : '';

  return `You are an expert GCSE content creator. I am providing you with revision PDF documents covering the theme "${themeName}". Your task is to create structured revision content specifically for the topic "${topicName}"${codeStr} within this theme.

## Instructions

Extract content directly from the source PDFs for this specific topic. Focus only on material relevant to "${topicName}" — ignore content about other topics within the theme.

### Create these content units:
- 5 flashcards (front/back, testing key facts)
- 3 teaching slides (structured explanations with key points)
- 1 worked example (if the material contains a question/problem)
- 2 practice questions (one multiple_choice, one short_text or numeric)

Mark content as "extracted" when taken directly from the PDF, or "ai_generated" when you synthesise or extend beyond what's in the documents.

### Output schemas

Each item must follow its schema exactly:

**flashcard**:
\`\`\`json
{ "content_type": "flashcard", "source": "extracted|ai_generated", "difficulty": 1-5, "estimated_seconds": 15-30, "content_body": { "front": "question text", "back": "answer text" } }
\`\`\`

**teaching_slide**:
\`\`\`json
{ "content_type": "teaching_slide", "source": "extracted|ai_generated", "difficulty": 1-5, "estimated_seconds": 60-120, "content_body": { "title": "slide title", "content": "main explanation text (can use markdown)", "key_points": ["point 1", "point 2"], "examiner_tip": "optional tip", "slide_number": 1 } }
\`\`\`

**worked_example**:
\`\`\`json
{ "content_type": "worked_example", "source": "extracted|ai_generated", "difficulty": 1-5, "estimated_seconds": 120-300, "marks_available": 4, "content_body": { "title": "example title", "question_context": "the question/problem text", "steps": [{ "step_id": "s1", "content": "step explanation", "marks": 1 }], "final_answer": "the final answer" }, "mark_scheme": { "total_marks": 4, "criteria": ["criterion 1"] } }
\`\`\`

**practice_question**:
\`\`\`json
{ "content_type": "practice_question", "source": "extracted|ai_generated", "difficulty": 1-5, "estimated_seconds": 60-180, "marks_available": 2, "command_word": "explain|describe|calculate|state|compare", "content_body": { "questionType": "multiple_choice|short_text|numeric", "text": "question text", "marks": 2, "options": [{ "id": "a", "label": "option text" }], "correct_option_id": "a", "explanation": "why this answer is correct", "mark_scheme": [{ "point": "marking point", "marks": 1 }] } }
\`\`\`

For multiple_choice, provide 4 options with plausible distractors.
For short_text/numeric, omit "options" and "correct_option_id".

## Output

Return ONLY a valid JSON array of content items. No markdown fences, no explanation — just the JSON array.`;
}

async function callClaudeWithPdfs(
  prompt: string,
  pdfDataList: Array<{ filename: string; base64: string }>
): Promise<GeneratedItem[]> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  // Build content blocks: PDFs first, then the text prompt
  const contentBlocks: Record<string, unknown>[] = [];

  for (const pdf of pdfDataList) {
    contentBlocks.push({
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: pdf.base64,
      },
      cache_control: { type: 'ephemeral' },
    });
  }

  contentBlocks.push({ type: 'text', text: prompt });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content: contentBlocks }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Claude API error:', errorText);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.content?.[0]?.text;

  if (!content) {
    throw new Error('No content in Claude response');
  }

  // Parse JSON — handle markdown code fences if present
  let jsonStr = content.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  const parsed = JSON.parse(jsonStr);
  if (!Array.isArray(parsed)) {
    throw new Error('Claude response is not a JSON array');
  }

  return parsed as GeneratedItem[];
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const { subject_id, topic_ids } = (await req.json()) as RequestBody;

    if (!subject_id) {
      throw new Error('subject_id is required');
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Resolve exam_spec_version_id (create if missing)
    const { data: specData } = await sb
      .from('exam_spec_versions')
      .select('id')
      .eq('subject_id', subject_id)
      .order('effective_from', { ascending: false })
      .limit(1);

    let examSpecVersionId: string;
    if (specData && specData.length > 0) {
      examSpecVersionId = specData[0].id;
    } else {
      const { data: subjectData } = await sb
        .from('subjects')
        .select('spec_code')
        .eq('id', subject_id)
        .single();

      const specCode = subjectData?.spec_code || 'current';
      const { data: newSpec, error: createErr } = await sb
        .from('exam_spec_versions')
        .insert({
          subject_id,
          spec_version: specCode,
          is_current: true,
          effective_from: new Date().toISOString().split('T')[0],
        })
        .select('id')
        .single();

      if (createErr || !newSpec) {
        throw new Error(`Failed to create exam spec version: ${createErr?.message}`);
      }
      examSpecVersionId = newSpec.id;
    }

    // Build full topic list with theme/component context
    const { data: compData, error: compError } = await sb
      .from('components')
      .select('id, component_name, themes(id, theme_name, topics(id, topic_name, canonical_code))')
      .eq('subject_id', subject_id)
      .order('order_index');

    if (compError) throw new Error(`Failed to fetch curriculum: ${compError.message}`);

    const allTopics: TopicWithContext[] = [];
    for (const comp of compData || []) {
      const c = comp as Record<string, unknown>;
      for (const theme of (c.themes as Record<string, unknown>[]) || []) {
        for (const topic of (theme.topics as Record<string, unknown>[]) || []) {
          allTopics.push({
            id: topic.id as string,
            topic_name: topic.topic_name as string,
            canonical_code: (topic.canonical_code as string) || null,
            theme_id: theme.id as string,
            theme_name: theme.theme_name as string,
            component_id: c.id as string,
            component_name: c.component_name as string,
          });
        }
      }
    }

    // Filter to requested topics if specified
    const topics =
      topic_ids && topic_ids.length > 0
        ? allTopics.filter((t) => topic_ids.includes(t.id))
        : allTopics;

    if (topics.length === 0) {
      throw new Error('No topics found for the given subject/topic IDs');
    }

    // Get all revision documents for this subject
    const { data: revDocs, error: docError } = await sb
      .schema('rag')
      .from('documents')
      .select('id, title, file_key')
      .eq('subject_id', subject_id)
      .eq('source_type', 'revision');

    if (docError) throw new Error(`Failed to fetch documents: ${docError.message}`);

    const revisionDocs = (revDocs || []) as RevisionDoc[];
    console.log(`Found ${revisionDocs.length} revision documents for subject ${subject_id}`);

    // Create a generation job
    const batchId = crypto.randomUUID();
    await sb.from('content_generation_jobs').insert({
      id: batchId,
      subject_id,
      status: 'running',
      total_topics: topics.length,
      generation_model: 'claude-sonnet-4-20250514',
      started_at: new Date().toISOString(),
    });

    // Group topics by theme to share PDF downloads
    const topicsByTheme = new Map<string, TopicWithContext[]>();
    for (const topic of topics) {
      const key = topic.theme_id;
      if (!topicsByTheme.has(key)) topicsByTheme.set(key, []);
      topicsByTheme.get(key)!.push(topic);
    }

    // Process theme by theme
    const results: TopicResult[] = [];
    let totalItemsCreated = 0;
    let totalErrors = 0;
    let processedTopics = 0;
    let failedTopics = 0;
    const errorLog: Array<{ topic_id: string; error: string }> = [];

    // PDF cache: theme_id → downloaded PDFs
    const pdfCache = new Map<string, Array<{ filename: string; base64: string }>>();

    for (const [themeId, themeTopics] of topicsByTheme) {
      const themeName = themeTopics[0].theme_name;

      // Find and download revision PDFs for this theme (cached per theme)
      if (!pdfCache.has(themeId)) {
        const matchingDocs = findMatchingDocs(revisionDocs, themeName);
        console.log(
          `Theme "${themeName}": ${matchingDocs.length} matching docs (${matchingDocs.map((d) => d.title).join(', ')})`
        );

        const pdfs: Array<{ filename: string; base64: string }> = [];

        // Download up to 3 PDFs per theme to stay within API limits
        for (const doc of matchingDocs.slice(0, 3)) {
          const b64 = await downloadPdf(sb, doc.file_key);
          if (b64) {
            pdfs.push({ filename: doc.title, base64: b64 });
          }
        }

        pdfCache.set(themeId, pdfs);
      }

      const themePdfs = pdfCache.get(themeId)!;

      if (themePdfs.length === 0) {
        // No PDFs found — skip all topics in this theme
        for (const topic of themeTopics) {
          const topicResult: TopicResult = {
            topic_id: topic.id,
            topic_name: topic.topic_name,
            items_created: 0,
            errors: [`No revision documents found for theme "${themeName}"`],
          };
          results.push(topicResult);
          totalErrors++;
          failedTopics++;
          errorLog.push({
            topic_id: topic.id,
            error: `No revision documents for theme "${themeName}"`,
          });
        }
        continue;
      }

      // Process each topic within this theme
      for (const topic of themeTopics) {
        const topicResult: TopicResult = {
          topic_id: topic.id,
          topic_name: topic.topic_name,
          items_created: 0,
          errors: [],
        };

        try {
          const prompt = buildPrompt(topic.topic_name, topic.canonical_code, themeName);
          const generatedItems = await callClaudeWithPdfs(prompt, themePdfs);

          // Validate and prepare rows for insertion
          const rowsToInsert: Record<string, unknown>[] = [];
          for (const item of generatedItems) {
            const validationErrors = validateContentBody(
              item.content_type,
              item.content_body || {}
            );

            rowsToInsert.push({
              subject_id,
              exam_spec_version_id: examSpecVersionId,
              component_id: topic.component_id,
              theme_id: topic.theme_id,
              topic_id: topic.id,
              content_type: item.content_type,
              difficulty: item.difficulty || 1,
              estimated_seconds: item.estimated_seconds || 60,
              content_body: item.content_body,
              source: item.source || 'ai_generated',
              marks_available: item.marks_available || null,
              command_word: item.command_word || null,
              mark_scheme: item.mark_scheme || null,
              source_chunk_ids: [],
              generation_batch_id: batchId,
              generation_model: 'claude-sonnet-4-20250514',
              validation_errors: validationErrors,
              status: 'pending_review',
            });
          }

          if (rowsToInsert.length > 0) {
            const { error: insertError } = await sb
              .from('content_units_staging')
              .insert(rowsToInsert);

            if (insertError) {
              throw new Error(`Failed to insert staging items: ${insertError.message}`);
            }
          }

          topicResult.items_created = rowsToInsert.length;
          totalItemsCreated += rowsToInsert.length;
          processedTopics++;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          topicResult.errors.push(message);
          totalErrors++;
          failedTopics++;
          errorLog.push({ topic_id: topic.id, error: message });
          console.error(`Error processing topic ${topic.topic_name}:`, message);
        }

        results.push(topicResult);
      }
    }

    // Update generation job status
    await sb
      .from('content_generation_jobs')
      .update({
        status: failedTopics === topics.length ? 'failed' : 'completed',
        processed_topics: processedTopics,
        failed_topics: failedTopics,
        total_content_units: totalItemsCreated,
        error_log: errorLog,
        completed_at: new Date().toISOString(),
      })
      .eq('id', batchId);

    return new Response(
      JSON.stringify({
        batch_id: batchId,
        topics_processed: processedTopics,
        items_created: totalItemsCreated,
        items_with_errors: totalErrors,
        results,
      }),
      {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Content generation error:', message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
});
