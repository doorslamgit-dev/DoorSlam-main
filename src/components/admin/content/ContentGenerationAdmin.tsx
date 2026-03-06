// src/components/admin/content/ContentGenerationAdmin.tsx
// Main admin view for content generation pipeline: coverage grid, source audit, staging review.

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import ContentReviewPanel from '@/components/admin/content/ContentReviewPanel';
import {
  fetchContentStats,
  fetchStagingItems,
  fetchSubjects,
  fetchTopicCoverage,
  generateContent,
  promoteApproved,
} from '@/services/contentGenerationService';
import {
  CONTENT_TYPE_SHORT,
  STAGING_STATUS_LABELS,
} from '@/types/contentGeneration';
import type {
  ContentStatsResponse,
  ContentType,
  StagingItem,
  StagingStatus,
  TopicCoverage,
} from '@/types/contentGeneration';
import type { SubjectOption } from '@/types/curriculumAdmin';

type Tab = 'coverage' | 'staging' | 'stats';

export default function ContentGenerationAdmin() {
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [tab, setTab] = useState<Tab>('coverage');
  const [loading, setLoading] = useState(false);

  // Coverage
  const [topics, setTopics] = useState<TopicCoverage[]>([]);

  // Staging
  const [stagingItems, setStagingItems] = useState<StagingItem[]>([]);
  const [stagingFilter, setStagingFilter] = useState<StagingStatus | ''>('');
  const [stagingTotal, setStagingTotal] = useState(0);

  // Stats
  const [stats, setStats] = useState<ContentStatsResponse | null>(null);

  // Load subjects on mount
  useEffect(() => {
    fetchSubjects().then(({ data }) => {
      if (data) setSubjects(data);
    });
  }, []);

  // Load data when subject changes
  const loadData = useCallback(async () => {
    if (!selectedSubjectId) return;
    setLoading(true);

    if (tab === 'coverage') {
      const { data } = await fetchTopicCoverage(selectedSubjectId);
      if (data) setTopics(data);
    } else if (tab === 'staging') {
      const { data, total } = await fetchStagingItems({
        subjectId: selectedSubjectId,
        status: (stagingFilter as StagingStatus) || undefined,
      });
      if (data) setStagingItems(data);
      setStagingTotal(total);
    } else if (tab === 'stats') {
      const { data } = await fetchContentStats(selectedSubjectId);
      if (data) setStats(data);
    }

    setLoading(false);
  }, [selectedSubjectId, tab, stagingFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePromote = async () => {
    if (!selectedSubjectId) return;
    const { data, error } = await promoteApproved(selectedSubjectId);
    if (error) {
      alert(`Promote failed: ${error}`);
      return;
    }
    alert(`Promoted ${data?.promoted_count ?? 0} items to production.`);
    loadData();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Content Generation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage revision content: coverage, staging review, and promotion to production.
        </p>
      </div>

      {/* Subject selector */}
      <div className="flex items-center gap-4">
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Select subject...</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.subject_name} ({s.exam_board_name}){s.spec_code && s.spec_code !== 'NULL' ? ` — ${s.spec_code}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      {selectedSubjectId && (
        <>
          <div className="flex gap-1 border-b border-border">
            {(['coverage', 'staging', 'stats'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === t
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'coverage' ? 'Coverage Grid' : t === 'staging' ? 'Staging Review' : 'Statistics'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : (
            <>
              {tab === 'coverage' && <CoverageGrid topics={topics} subjectId={selectedSubjectId} onGenerated={loadData} />}
              {tab === 'staging' && (
                <div className="space-y-4">
                  {/* Staging filters */}
                  <div className="flex items-center gap-3">
                    <select
                      value={stagingFilter}
                      onChange={(e) => setStagingFilter(e.target.value as StagingStatus | '')}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                    >
                      <option value="">All statuses</option>
                      {Object.entries(STAGING_STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground">
                      {stagingTotal} item{stagingTotal !== 1 ? 's' : ''}
                    </span>
                    <div className="flex-1" />
                    <button
                      onClick={handlePromote}
                      className="px-4 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Promote approved
                    </button>
                  </div>
                  <ContentReviewPanel
                    items={stagingItems}
                    onReviewComplete={loadData}
                  />
                </div>
              )}
              {tab === 'stats' && stats && <StatsPanel stats={stats} />}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Coverage Grid — topics as rows, content types as columns
// ---------------------------------------------------------------------------

function CoverageGrid({
  topics,
  subjectId,
  onGenerated,
}: {
  topics: TopicCoverage[];
  subjectId: string;
  onGenerated: () => void;
}) {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (topics.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No topics found. Ensure curriculum data has been imported.
      </div>
    );
  }

  const contentTypes: ContentType[] = ['flashcard', 'teaching_slide', 'worked_example', 'practice_question'];
  const isBusy = generatingId !== null || generatingAll;

  const handleGenerate = async (topicId: string) => {
    if (isBusy) return;
    setGeneratingId(topicId);
    setResultMessage(null);

    const { data, error } = await generateContent(subjectId, [topicId]);

    setGeneratingId(null);
    if (error) {
      setResultMessage(`Error: ${error}`);
    } else if (data) {
      setResultMessage(`Created ${data.items_created} item${data.items_created !== 1 ? 's' : ''}`);
      onGenerated();
    }
  };

  const handleGenerateAll = async () => {
    if (isBusy) return;
    setGeneratingAll(true);
    setResultMessage(null);

    const { data, error } = await generateContent(subjectId);

    setGeneratingAll(false);
    if (error) {
      setResultMessage(`Error: ${error}`);
    } else if (data) {
      setResultMessage(
        `Generated ${data.items_created} items across ${data.topics_processed} topic${data.topics_processed !== 1 ? 's' : ''}` +
          (data.items_with_errors > 0 ? ` (${data.items_with_errors} error${data.items_with_errors !== 1 ? 's' : ''})` : '')
      );
      onGenerated();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-muted-foreground">
          {topics.length} topic{topics.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={handleGenerateAll}
          disabled={isBusy}
          className="px-4 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generatingAll ? 'Generating...' : 'Generate all topics'}
        </button>
      </div>
      {resultMessage && (
        <div
          className={`px-3 py-2 text-sm rounded-lg ${
            resultMessage.startsWith('Error')
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
          }`}
        >
          {resultMessage}
        </div>
      )}
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Topic</th>
            <th className="text-left py-2 px-1 text-muted-foreground font-medium w-12">Code</th>
            {contentTypes.map((ct) => (
              <th key={ct} className="text-center py-2 px-2 text-muted-foreground font-medium w-16">
                {CONTENT_TYPE_SHORT[ct]}
              </th>
            ))}
            <th className="text-center py-2 px-2 text-muted-foreground font-medium w-16">Total</th>
            <th className="text-center py-2 px-2 text-muted-foreground font-medium w-20">Staging</th>
            <th className="text-center py-2 px-2 text-muted-foreground font-medium w-24">Action</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => (
            <tr key={topic.topic_id} className="border-b border-border/50 hover:bg-muted/30">
              <td className="py-2 px-3 text-foreground">{topic.topic_name}</td>
              <td className="py-2 px-1 text-xs text-muted-foreground font-mono">{topic.canonical_code ?? '-'}</td>
              <CoverageCell count={topic.flashcard_count} />
              <CoverageCell count={topic.teaching_slide_count} />
              <CoverageCell count={topic.worked_example_count} />
              <CoverageCell count={topic.practice_question_count} />
              <td className="text-center py-2 px-2">
                <span className={`text-xs font-medium ${topic.total > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {topic.total}
                </span>
              </td>
              <td className="text-center py-2 px-2">
                {topic.staging_count > 0 ? (
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    {topic.staging_count}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </td>
              <td className="text-center py-2 px-2">
                <button
                  onClick={() => handleGenerate(topic.topic_id)}
                  disabled={isBusy}
                  className="text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingId === topic.topic_id ? 'Generating...' : 'Generate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function CoverageCell({ count }: { count: number }) {
  if (count === 0) {
    return (
      <td className="text-center py-2 px-2">
        <span className="inline-block w-5 h-5 rounded bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800" />
      </td>
    );
  }
  return (
    <td className="text-center py-2 px-2">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        {count}
      </span>
    </td>
  );
}

// ---------------------------------------------------------------------------
// Stats Panel
// ---------------------------------------------------------------------------

function StatsPanel({ stats }: { stats: ContentStatsResponse }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card title="Production Content" padding="md">
        <div className="space-y-2">
          {Object.entries(stats.production)
            .filter(([k]) => k !== 'total')
            .map(([type, count]) => (
              <div key={type} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{type.replace('_', ' ')}</span>
                <span className="font-medium text-foreground">{count}</span>
              </div>
            ))}
          <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span>{stats.production.total ?? 0}</span>
          </div>
        </div>
      </Card>
      <Card title="Staging Content" padding="md">
        <div className="space-y-2">
          {Object.entries(stats.staging)
            .filter(([k]) => k !== 'total')
            .map(([status, count]) => (
              <div key={status} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{status.replace('_', ' ')}</span>
                <span className="font-medium text-foreground">{count}</span>
              </div>
            ))}
          <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span>{stats.staging.total ?? 0}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
