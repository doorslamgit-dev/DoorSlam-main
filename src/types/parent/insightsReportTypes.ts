export interface ReportData {
  child_name: string;
  generated_at: string;
  report_date: string;
  lifetime: LifetimeMetrics;
  this_month: PeriodMetrics;
  this_week: PeriodMetrics;
  subjects: SubjectMetric[];
  strengths: TopicStrength[];
  areas_for_support: TopicSupport[];
  recent_sessions: RecentSession[];
  streak: StreakData;
}

export interface LifetimeMetrics {
  total_sessions: number;
  total_planned: number;
  completion_rate: number;
  avg_confidence_change: number;
  first_session_date: string;
  sessions_with_improvement: number;
}

export interface PeriodMetrics {
  total_sessions: number;
  total_planned: number;
  completion_rate: number;
  avg_confidence_change: number;
  focus_mode_usage: number;
}

export interface SubjectMetric {
  subject_id: string;
  subject_name: string;
  session_count: number;
  avg_pre_confidence: number;
  avg_post_confidence: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface TopicStrength {
  topic_id: string;
  topic_name: string;
  subject_name: string;
  confidence_percent: number;
  sessions_completed: number;
}

export interface TopicSupport {
  topic_id: string;
  topic_name: string;
  subject_name: string;
  confidence_percent: number;
  sessions_completed: number;
  last_reviewed: string;
}

export interface RecentSession {
  date: string;
  topic_name: string;
  subject_name: string;
  pre_confidence: string;
  post_confidence: string;
  focus_mode: boolean;
}

export interface StreakData {
  current: number;
  longest: number;
}
