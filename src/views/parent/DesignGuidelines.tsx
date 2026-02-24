// src/views/parent/DesignGuidelines.tsx
// Storybook-style design system reference page.
// Linked from /parent/settings →"Design Guidelines".

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import AppIcon, { ICON_MAP } from '@/components/ui/AppIcon';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FormField from '@/components/ui/FormField';
import EmptyState from '@/components/ui/EmptyState';
import ThemeToggle from '@/components/ui/ThemeToggle';
import ProgressBar from '@/components/ui/ProgressBar';
import StatCard from '@/components/ui/StatCard';
import IconCircle from '@/components/ui/IconCircle';
import CircularProgress from '@/components/ui/CircularProgress';
import AvatarCircle from '@/components/ui/AvatarCircle';
import { PageLayout } from '@/components/layout';
import Footer from '@/components/layout/Footer';
import DashboardHeroCard from '@/components/parent/dashboard/DashboardHeroCard';
import HealthScoreCard from '@/components/parent/dashboard/HealthScoreCard';
import DashboardRevisionPlan from '@/components/parent/dashboard/DashboardRevisionPlan';
import SubjectCard from '@/components/subjects/SubjectCard';
import { RewardTemplateCard } from '@/components/parent/rewards/RewardTemplateCard';
import type { IconKey } from '@/components/ui/AppIcon';
import type { BadgeVariant, BadgeStyle } from '@/components/ui/Badge';
import type { ButtonVariant, ButtonSize } from '@/components/ui/Button';
import type { CardVariant } from '@/components/ui/Card';
import type { ProgressBarColor, ProgressBarSize } from '@/components/ui/ProgressBar';
import type { IconCircleColor, IconCircleVariant, IconCircleSize } from '@/components/ui/IconCircle';
import type {
  ChildSummary,
  DailyPattern,
  SubjectCoverage as DashboardSubjectCoverage,
  ComingUpSession,
} from '@/types/parent/parentDashboardTypes';
import type { PlanCoverageOverview } from '@/services/timetableService';
import type { SubjectProgress, TopicCovered, TopicComingUp } from '@/types/subjectProgress';

// ============================================================================
// SECTION LAYOUT HELPERS
// ============================================================================

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
 return (
 <div id={id} className="scroll-mt-6">
 <div className="mb-4 pb-2 border-b border-neutral-200">
 <h2 className="text-xl font-bold text-neutral-700">{title}</h2>
 </div>
 <div className="space-y-6">{children}</div>
 </div>
 );
}

function SubSection({ title, children }: { title: string; children: ReactNode }) {
 return (
 <div>
 <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
 {title}
 </h3>
 {children}
 </div>
 );
}

function DemoPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
 return (
 <div
 className={`bg-neutral-0 rounded-xl border border-neutral-200 p-6 ${className}`}
 >
 {children}
 </div>
 );
}

// ============================================================================
// NAV
// ============================================================================

const NAV_SECTIONS = [
 { id: 'colors', label: 'Colors' },
 { id: 'typography', label: 'Typography' },
 { id: 'spacing', label: 'Spacing' },
 { id: 'radius', label: 'Border Radius' },
 { id: 'shadows', label: 'Shadows' },
 { id: 'icons', label: 'Icons' },
 { id: 'buttons', label: 'Button' },
 { id: 'cards', label: 'Card' },
 { id: 'alerts', label: 'Alert' },
 { id: 'badges', label: 'Badge' },
 { id: 'spinners', label: 'LoadingSpinner' },
 { id: 'forms', label: 'FormField' },
 { id: 'empty-states', label: 'EmptyState' },
 { id: 'theme-toggle', label: 'ThemeToggle' },
 { id: 'progress-bar', label: 'ProgressBar' },
 { id: 'stat-card', label: 'StatCard' },
 { id: 'icon-circle', label: 'IconCircle' },
 { id: 'circular-progress', label: 'CircularProgress' },
 { id: 'avatar-circle', label: 'AvatarCircle' },
] as const;

const MODULE_NAV_SECTIONS = [
 { id: 'mod-navigation', label: 'Navigation' },
 { id: 'mod-dashboard', label: 'Dashboard' },
 { id: 'mod-subjects', label: 'Subjects' },
 { id: 'mod-timetable', label: 'Timetable' },
 { id: 'mod-rewards', label: 'Rewards' },
 { id: 'mod-insights', label: 'Insights' },
 { id: 'mod-pricing', label: 'Pricing' },
] as const;

// ============================================================================
// DESIGN TOKEN DATA
// ============================================================================

const primaryColors = [
 { shade: '50', hex: '#F7F4FF', tw: 'bg-primary-50', dark: false },
 { shade: '100', hex: '#EDE7FF', tw: 'bg-primary-100', dark: false },
 { shade: '200', hex: '#DDD3FF', tw: 'bg-primary-200', dark: false },
 { shade: '300', hex: '#C3B5FF', tw: 'bg-primary-300', dark: false },
 { shade: '400', hex: '#A890FF', tw: 'bg-primary-400', dark: false },
 { shade: '500', hex: '#8C6CFF', tw: 'bg-primary-500', dark: true },
 { shade: '600', hex: '#5B2CFF', tw: 'bg-primary-600', dark: true, main: true },
 { shade: '700', hex: '#4A1FDB', tw: 'bg-primary-700', dark: true },
 { shade: '800', hex: '#3D1AB3', tw: 'bg-primary-800', dark: true },
 { shade: '900', hex: '#32168A', tw: 'bg-primary-900', dark: true },
];

const neutralColors = [
 { shade: '0', hex: '#FFFFFF', tw: 'bg-neutral-0' },
 { shade: '50', hex: '#F9FAFB', tw: 'bg-neutral-50' },
 { shade: '100', hex: '#F3F4F6', tw: 'bg-neutral-100' },
 { shade: '200', hex: '#E5E7EB', tw: 'bg-neutral-200' },
 { shade: '300', hex: '#D1D5DB', tw: 'bg-neutral-300' },
 { shade: '400', hex: '#9CA3AF', tw: 'bg-neutral-400' },
 { shade: '500', hex: '#6B7280', tw: 'bg-neutral-500' },
 { shade: '600', hex: '#4B5563', tw: 'bg-neutral-600' },
 { shade: '700', hex: '#1F2330', tw: 'bg-neutral-700' },
 { shade: '800', hex: '#1A1D28', tw: 'bg-neutral-800' },
 { shade: '900', hex: '#111318', tw: 'bg-neutral-900' },
];

const accentColors = [
 { name: 'Green', role: 'Success / Completion', hex: '#1EC592', tw: 'bg-accent-green' },
 { name: 'Amber', role: 'Warning / Attention', hex: '#FFB547', tw: 'bg-accent-amber' },
 { name: 'Red', role: 'Error / Danger', hex: '#EF4444', tw: 'bg-accent-red' },
 { name: 'Blue', role: 'Info / Links', hex: '#3B82F6', tw: 'bg-accent-blue' },
 { name: 'Purple', role: 'Accent', hex: '#8B5CF6', tw: 'bg-accent-purple' },
 { name: 'Pink', role: 'Accent', hex: '#EC4899', tw: 'bg-accent-pink' },
];

const semanticColors = [
 { name: 'Success', bg: 'bg-success-bg', border: 'border-success-border', text: 'text-success', hex: '#1EC592' },
 { name: 'Warning', bg: 'bg-warning-bg', border: 'border-warning-border', text: 'text-warning', hex: '#FFB547' },
 { name: 'Error', bg: 'bg-error-bg', border: 'border-error-border', text: 'text-error', hex: '#EF4444' },
 { name: 'Info', bg: 'bg-info-bg', border: 'border-info-border', text: 'text-info', hex: '#3B82F6' },
];

const fontSizes = [
 { label: 'xs', value: '12px', tw: 'text-xs' },
 { label: 'sm', value: '14px', tw: 'text-sm' },
 { label: 'base', value: '16px', tw: 'text-base' },
 { label: 'lg', value: '18px', tw: 'text-lg' },
 { label: 'xl', value: '20px', tw: 'text-xl' },
 { label: '2xl', value: '24px', tw: 'text-2xl' },
 { label: '3xl', value: '30px', tw: 'text-3xl' },
 { label: '4xl', value: '36px', tw: 'text-4xl' },
];

const fontWeights = [
 { label: 'normal', value: '400', tw: 'font-normal' },
 { label: 'medium', value: '500', tw: 'font-medium' },
 { label: 'semibold', value: '600', tw: 'font-semibold' },
 { label: 'bold', value: '700', tw: 'font-bold' },
];

const spacingScale = [
 { token: '1', px: '4px', tw: 'w-1' },
 { token: '2', px: '8px', tw: 'w-2' },
 { token: '3', px: '12px', tw: 'w-3' },
 { token: '4', px: '16px', tw: 'w-4' },
 { token: '5', px: '20px', tw: 'w-5' },
 { token: '6', px: '24px', tw: 'w-6' },
 { token: '8', px: '32px', tw: 'w-8' },
 { token: '10', px: '40px', tw: 'w-10' },
 { token: '12', px: '48px', tw: 'w-12' },
 { token: '16', px: '64px', tw: 'w-16' },
 { token: '20', px: '80px', tw: 'w-20' },
 { token: '24', px: '96px', tw: 'w-24' },
];

const radiusScale = [
 { label: 'sm', px: '6px', tw: 'rounded-sm' },
 { label: 'md', px: '8px', tw: 'rounded-md' },
 { label: 'lg', px: '12px', tw: 'rounded-lg' },
 { label: 'xl', px: '16px', tw: 'rounded-xl' },
 { label: '2xl', px: '24px', tw: 'rounded-2xl' },
 { label: 'full', px: '9999px', tw: 'rounded-full' },
];

const shadowScale = [
 { label: 'sm', tw: 'shadow-sm' },
 { label: 'md', tw: 'shadow-md' },
 { label: 'lg', tw: 'shadow-lg' },
 { label: 'xl', tw: 'shadow-xl' },
 { label: 'card', tw: 'shadow-card' },
 { label: 'card-hover',tw: 'shadow-card-hover'},
 { label: 'soft', tw: 'shadow-soft' },
 { label: 'button', tw: 'shadow-button' },
];

// ============================================================================
// COMPONENT PROP VARIANTS
// ============================================================================

const buttonVariants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
const buttonSizes: ButtonSize[] = ['sm', 'md', 'lg'];
const cardVariants: CardVariant[] = ['default', 'elevated', 'outlined', 'flat'];
const badgeVariants: BadgeVariant[] = ['default', 'primary', 'success', 'warning', 'danger', 'info'];
const badgeStyles: BadgeStyle[] = ['soft', 'solid', 'outline'];

// ============================================================================
// MOCK DATA — used exclusively in the Modules tab showcase
// ============================================================================

const MOCK_CHILD: ChildSummary = {
 child_id: 'mock-child-1',
 child_name: 'Alex Johnson',
 first_name: 'Alex',
 last_name: 'Johnson',
 preferred_name: null,
 year_group: 11,
 exam_type: 'GCSE',
 subjects: [],
 mocks_flag: false,
 mocks_message: null,
 next_focus: null,
 week_sessions_completed: 4,
 week_sessions_total: 6,
 week_topics_covered: 5,
 prev_week_sessions_completed: 3,
 auth_user_id: 'mock-auth-id',
 invitation_code: null,
 avatar_url: null,
 current_streak: 5,
 longest_streak: 12,
 status_indicator: 'on_track',
 status_label: 'On Track',
 status_reason: 'progressing_well',
 status_detail: 'Alex is making good progress this week.',
 insight_message: 'Keep up the current routine.',
 insight_sub_message: 'Alex has completed 4 of 6 sessions this week.',
 insight_icon: 'check-circle',
 next_session_time: null,
 hero_sentence: '4 of 6 sessions done — strong progress.',
};

const _MOCK_DAILY_PATTERN: DailyPattern[] = [
 { day_of_week: 'Monday', day_name_short: 'Mon', day_index: 0, sessions_completed: 1, sessions_total: 1, total_minutes: 45, is_rest_day: false },
 { day_of_week: 'Tuesday', day_name_short: 'Tue', day_index: 1, sessions_completed: 1, sessions_total: 1, total_minutes: 60, is_rest_day: false },
 { day_of_week: 'Wednesday', day_name_short: 'Wed', day_index: 2, sessions_completed: 1, sessions_total: 1, total_minutes: 45, is_rest_day: false },
 { day_of_week: 'Thursday', day_name_short: 'Thu', day_index: 3, sessions_completed: 1, sessions_total: 1, total_minutes: 0, is_rest_day: false },
 { day_of_week: 'Friday', day_name_short: 'Fri', day_index: 4, sessions_completed: 0, sessions_total: 1, total_minutes: 0, is_rest_day: false },
 { day_of_week: 'Saturday', day_name_short: 'Sat', day_index: 5, sessions_completed: 0, sessions_total: 1, total_minutes: 0, is_rest_day: false },
 { day_of_week: 'Sunday', day_name_short: 'Sun', day_index: 6, sessions_completed: 0, sessions_total: 0, total_minutes: 0, is_rest_day: true },
];

const MOCK_DASHBOARD_COVERAGE: DashboardSubjectCoverage[] = [
 { child_id: 'mock-child-1', child_name: 'Alex Johnson', subject_id: 's1', subject_name: 'Mathematics', subject_color: '#5B2CFF', subject_icon: 'calculator', sessions_completed: 8, topics_covered: 6 },
 { child_id: 'mock-child-1', child_name: 'Alex Johnson', subject_id: 's2', subject_name: 'English Literature', subject_color: '#1EC592', subject_icon: 'book', sessions_completed: 5, topics_covered: 4 },
 { child_id: 'mock-child-1', child_name: 'Alex Johnson', subject_id: 's3', subject_name: 'Biology', subject_color: '#3B82F6', subject_icon: 'atom', sessions_completed: 2, topics_covered: 2 },
];

const MOCK_PLAN_OVERVIEW: PlanCoverageOverview = {
 child_id: 'mock-child-1',
 revision_period: {
   end_date: '2025-06-15',
   days_remaining: 112,
   weeks_remaining: 16,
 },
 totals: {
   planned_sessions: 48,
   completed_sessions: 18,
   remaining_sessions: 30,
   total_minutes: 2880,
   total_hours: 48,
   completion_percent: 38,
 },
 subjects: [
   { subject_id: 's1', subject_name: 'Mathematics', color: '#5B2CFF', icon: 'calculator', planned_sessions: 16, completed_sessions: 8, remaining_sessions: 8, total_minutes: 720, completion_percent: 50 },
   { subject_id: 's2', subject_name: 'English Literature', color: '#1EC592', icon: 'book', planned_sessions: 16, completed_sessions: 5, remaining_sessions: 11, total_minutes: 480, completion_percent: 31 },
   { subject_id: 's3', subject_name: 'Biology', color: '#3B82F6', icon: 'atom', planned_sessions: 16, completed_sessions: 5, remaining_sessions: 11, total_minutes: 480, completion_percent: 31 },
 ],
 status: 'on_track',
 pace: { sessions_per_week_needed: 3, hours_per_week_needed: 3 },
};

const _MOCK_COMING_UP: ComingUpSession[] = [
 { planned_session_id: '1', child_id: 'mock-child-1', child_name: 'Alex Johnson', child_avatar_url: null, subject_id: 's1', subject_name: 'Mathematics', subject_color: '#5B2CFF', subject_icon: 'calculator', topic_name: 'Quadratic Equations', session_date: '2025-02-24', session_duration_minutes: 45, is_today: true, is_tomorrow: false, day_label: 'Mon' },
 { planned_session_id: '2', child_id: 'mock-child-1', child_name: 'Alex Johnson', child_avatar_url: null, subject_id: 's2', subject_name: 'English Literature', subject_color: '#1EC592', subject_icon: 'book', topic_name: 'Macbeth Act II', session_date: '2025-02-25', session_duration_minutes: 60, is_today: false, is_tomorrow: true, day_label: 'Tue' },
 { planned_session_id: '3', child_id: 'mock-child-1', child_name: 'Alex Johnson', child_avatar_url: null, subject_id: 's3', subject_name: 'Biology', subject_color: '#3B82F6', subject_icon: 'atom', topic_name: 'Cell Division', session_date: '2025-02-26', session_duration_minutes: 45, is_today: false, is_tomorrow: false, day_label: 'Wed' },
 { planned_session_id: '4', child_id: 'mock-child-1', child_name: 'Alex Johnson', child_avatar_url: null, subject_id: 's1', subject_name: 'Mathematics', subject_color: '#5B2CFF', subject_icon: 'calculator', topic_name: 'Circle Theorems', session_date: '2025-02-27', session_duration_minutes: 45, is_today: false, is_tomorrow: false, day_label: 'Thu' },
];

const mockTopicsCovered: TopicCovered[] = [
 { topic_id: 't1', topic_name: 'Quadratic Equations', theme_name: 'Algebra', session_count: 2, last_covered_date: '2025-02-22', days_since: 1, was_revisited: true, confidence_level: 'high' },
 { topic_id: 't2', topic_name: 'Trigonometry', theme_name: 'Geometry', session_count: 1, last_covered_date: '2025-02-20', days_since: 3, was_revisited: false, confidence_level: 'medium' },
];

const mockTopicsComingUp: TopicComingUp[] = [
 { topic_id: 't3', topic_name: 'Circle Theorems', theme_name: 'Geometry', session_date: '2025-02-27', days_until: 4, is_tomorrow: false },
 { topic_id: 't4', topic_name: 'Vectors', theme_name: 'Algebra', session_date: '2025-02-28', days_until: 5, is_tomorrow: false },
];

const MOCK_SUBJECTS: SubjectProgress[] = [
 {
   subject_id: 's1',
   subject_name: 'Mathematics',
   subject_color: '#5B2CFF',
   subject_icon: 'calculator',
   exam_board_name: 'Edexcel',
   exam_type: 'GCSE',
   status: 'in_progress',
   topics_covered_total: 14,
   topics_remaining: 12,
   completion_percentage: 54,
   sessions_completed: 8,
   sessions_total: 16,
   recently_covered: mockTopicsCovered,
   coming_up: mockTopicsComingUp,
 },
 {
   subject_id: 's2',
   subject_name: 'English Literature',
   subject_color: '#1EC592',
   subject_icon: 'book',
   exam_board_name: 'AQA',
   exam_type: 'GCSE',
   status: 'needs_attention',
   topics_covered_total: 6,
   topics_remaining: 18,
   completion_percentage: 25,
   sessions_completed: 3,
   sessions_total: 16,
   recently_covered: [{ topic_id: 't5', topic_name: 'Macbeth Act I', theme_name: 'Shakespeare', session_count: 1, last_covered_date: '2025-02-18', days_since: 5, was_revisited: false, confidence_level: 'low' }],
   coming_up: [{ topic_id: 't6', topic_name: 'Macbeth Act II', theme_name: 'Shakespeare', session_date: '2025-02-25', days_until: 2, is_tomorrow: true }],
 },
 {
   subject_id: 's3',
   subject_name: 'Biology',
   subject_color: '#3B82F6',
   subject_icon: 'atom',
   exam_board_name: 'OCR',
   exam_type: 'GCSE',
   status: 'in_progress',
   topics_covered_total: 10,
   topics_remaining: 14,
   completion_percentage: 42,
   sessions_completed: 5,
   sessions_total: 16,
   recently_covered: [{ topic_id: 't7', topic_name: 'Photosynthesis', theme_name: 'Plants', session_count: 1, last_covered_date: '2025-02-21', days_since: 2, was_revisited: false, confidence_level: 'medium' }],
   coming_up: [{ topic_id: 't8', topic_name: 'Cell Division', theme_name: 'Cells', session_date: '2025-02-26', days_until: 3, is_tomorrow: false }],
 },
];

// ============================================================================
// MODULES TAB — Static mockup helpers
// ============================================================================

/** A placeholder chart area used in Insights mockups */
function ChartPlaceholder({ height = 'h-32', label }: { height?: string; label: string }) {
 return (
   <div className={`${height} bg-neutral-50 rounded-xl border border-neutral-200 border-dashed flex items-center justify-center`}>
     <div className="text-center">
       <AppIcon name="chart-bar" className="w-6 h-6 text-neutral-300 mx-auto mb-1" />
       <span className="text-xs text-neutral-400">{label}</span>
     </div>
   </div>
 );
}

/** Tag showing the component source path */
function SourceTag({ path }: { path: string }) {
 return (
   <p className="text-xs text-neutral-400 font-mono mt-1 mb-4 -mt-3">
     {path}
   </p>
 );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DesignGuidelines() {
 const navigate = useNavigate();
 const [formValue, setFormValue] = useState('');
 const [textareaValue, setTextareaValue] = useState('');
 const [activeTab, setActiveTab] = useState<'tokens' | 'modules'>('tokens');

 const iconKeys = Object.keys(ICON_MAP) as IconKey[];

 const scrollTo = (id: string) => {
   document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
 };

 return (
 <PageLayout>
 <div className="min-h-screen bg-neutral-50">
 {/* ── Page Header ── */}
 <div className="bg-neutral-0 border-b border-neutral-200 px-6 py-4">
 <div className="max-w-7xl mx-auto">
   {/* Top row: back + title */}
   <div className="flex items-center gap-4 mb-4">
     <Button
       variant="ghost"
       size="sm"
       leftIcon="arrow-left"
       onClick={() => navigate('/parent/settings')}
     >
       Settings
     </Button>
     <div className="h-4 w-px bg-neutral-200" />
     <div>
       <h1 className="text-xl font-bold text-neutral-700">Design Guidelines</h1>
       <p className="text-xs text-neutral-500">
         Component library · Design token reference · Page modules · Live examples
       </p>
     </div>
   </div>

   {/* Tab navigation */}
   <div className="flex gap-1 border-b border-neutral-200 -mb-4">
     <button
       onClick={() => setActiveTab('tokens')}
       className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg border-b-2 -mb-px ${
         activeTab === 'tokens'
           ? 'text-primary-600 border-primary-600 bg-primary-50'
           : 'text-neutral-500 border-transparent hover:text-neutral-700 hover:bg-neutral-50'
       }`}
     >
       Tokens &amp; Components
     </button>
     <button
       onClick={() => setActiveTab('modules')}
       className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg border-b-2 -mb-px ${
         activeTab === 'modules'
           ? 'text-primary-600 border-primary-600 bg-primary-50'
           : 'text-neutral-500 border-transparent hover:text-neutral-700 hover:bg-neutral-50'
       }`}
     >
       Page Modules
     </button>
   </div>
 </div>
 </div>

 {/* ── TAB 1: Tokens & Components ── */}
 {activeTab === 'tokens' && (
   <div className="max-w-7xl mx-auto flex gap-8 px-6 py-8">
     {/* Sticky sidebar nav */}
     <aside className="w-44 shrink-0 hidden lg:block">
       <div className="sticky top-6">
         <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
           Contents
         </p>
         <nav className="space-y-0.5">
           {NAV_SECTIONS.map((s) => (
             <button
               key={s.id}
               onClick={() => scrollTo(s.id)}
               className="block w-full text-left text-sm px-2 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
             >
               {s.label}
             </button>
           ))}
         </nav>
       </div>
     </aside>

     {/* ── Main scrollable content ── */}
     <main className="flex-1 min-w-0 space-y-14">

       {/* ════════════════════════════════ COLORS ════════════════════════════════ */}
       <Section id="colors" title="Colors">
         <SubSection title="Primary Palette">
           <div className="flex gap-2 flex-wrap">
             {primaryColors.map(({ shade, hex, tw, main }) => (
               <div key={shade} className="flex flex-col items-center gap-1.5">
                 <div
                   className={`w-12 h-12 rounded-xl ${tw} ${
                     main ? 'ring-2 ring-offset-2 ring-primary-600' : ''
                   }`}
                   title={hex}
                 />
                 <span className="text-xs font-medium text-neutral-600">
                   {shade}
                 </span>
                 <span className="text-xs text-neutral-400 font-mono">{hex}</span>
               </div>
             ))}
           </div>
         </SubSection>

         <SubSection title="Neutral Palette">
           <div className="flex gap-2 flex-wrap">
             {neutralColors.map(({ shade, hex, tw }) => (
               <div key={shade} className="flex flex-col items-center gap-1.5">
                 <div
                   className={`w-12 h-12 rounded-xl border border-neutral-200 ${tw}`}
                   title={hex}
                 />
                 <span className="text-xs font-medium text-neutral-600">
                   {shade}
                 </span>
                 <span className="text-xs text-neutral-400 font-mono">{hex}</span>
               </div>
             ))}
           </div>
         </SubSection>

         <SubSection title="Accent Colors">
           <div className="flex gap-5 flex-wrap">
             {accentColors.map(({ name, role, hex, tw }) => (
               <div key={name} className="flex flex-col items-center gap-1.5">
                 <div className={`w-16 h-16 rounded-xl ${tw}`} title={hex} />
                 <span className="text-xs font-semibold text-neutral-700">
                   {name}
                 </span>
                 <span className="text-xs text-neutral-400 text-center max-w-[72px]">{role}</span>
                 <span className="text-xs text-neutral-400 font-mono">{hex}</span>
               </div>
             ))}
           </div>
         </SubSection>

         <SubSection title="Semantic Colors">
           <div className="grid grid-cols-2 gap-3">
             {semanticColors.map(({ name, bg, border, text, hex }) => (
               <div key={name} className={`${bg} border ${border} rounded-xl p-3 flex items-center justify-between`}>
                 <span className={`text-sm font-semibold ${text}`}>{name}</span>
                 <span className="text-xs text-neutral-500 font-mono">{hex}</span>
               </div>
             ))}
           </div>
         </SubSection>
       </Section>

       {/* ════════════════════════════════ TYPOGRAPHY ════════════════════════════════ */}
       <Section id="typography" title="Typography">
         <SubSection title="Font Family">
           <DemoPanel>
             <div className="space-y-4">
               <div>
                 <p className="text-xs text-neutral-400 mb-1 font-mono">
                   --font-family-sans · Inter, system-ui, sans-serif
                 </p>
                 <p className="text-lg text-neutral-700">
                   ABCDEFGHIJKLMNOPQRSTUVWXYZ · abcdefghijklmnopqrstuvwxyz · 0123456789
                 </p>
               </div>
               <div>
                 <p className="text-xs text-neutral-400 mb-1 font-mono">
                   --font-family-mono · Fira Code, Monaco, Courier New
                 </p>
                 <p className="text-base text-neutral-700 font-mono">
                   ABCDEFGHIJKLMNOPQRSTUVWXYZ · abcdefghijklmnopqrstuvwxyz
                 </p>
               </div>
             </div>
           </DemoPanel>
         </SubSection>

         <SubSection title="Font Sizes">
           <DemoPanel className="p-0 divide-y divide-neutral-100">
             {fontSizes.map(({ label, value, tw }) => (
               <div key={label} className="flex items-center gap-4 px-6 py-3">
                 <code className="text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 w-20 shrink-0 font-mono">
                   text-{label}
                 </code>
                 <span className="text-xs text-neutral-400 w-10 shrink-0">{value}</span>
                 <span className={`${tw} text-neutral-700`}>
                   The quick brown fox jumps over the lazy dog
                 </span>
               </div>
             ))}
           </DemoPanel>
         </SubSection>

         <SubSection title="Font Weights">
           <DemoPanel className="p-0 divide-y divide-neutral-100">
             {fontWeights.map(({ label, value, tw }) => (
               <div key={label} className="flex items-center gap-4 px-6 py-3">
                 <code className="text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 w-24 shrink-0 font-mono">
                   font-{label}
                 </code>
                 <span className="text-xs text-neutral-400 w-8 shrink-0">{value}</span>
                 <span className={`${tw} text-neutral-700 text-lg`}>
                   Doorslam GCSE Revision
                 </span>
               </div>
             ))}
           </DemoPanel>
         </SubSection>
       </Section>

       {/* ════════════════════════════════ SPACING ════════════════════════════════ */}
       <Section id="spacing" title="Spacing">
         <p className="text-sm text-neutral-500 -mt-2">
           4px grid-based scale. Use Tailwind padding, margin, gap utilities (
           <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs font-mono">
             p-*, m-*, gap-*
           </code>
           ).
         </p>
         <DemoPanel className="space-y-3">
           {spacingScale.map(({ token, px, tw }) => (
             <div key={token} className="flex items-center gap-3">
               <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600 w-8 text-center shrink-0 font-mono">
                 {token}
               </code>
               <span className="text-xs text-neutral-400 w-10 shrink-0">{px}</span>
               <div className={`${tw} h-5 bg-primary-400 rounded-sm`} />
             </div>
           ))}
         </DemoPanel>
       </Section>

       {/* ════════════════════════════════ BORDER RADIUS ════════════════════════════════ */}
       <Section id="radius" title="Border Radius">
         <div className="flex flex-wrap gap-8">
           {radiusScale.map(({ label, px, tw }) => (
             <div key={label} className="flex flex-col items-center gap-2">
               <div
                 className={`w-20 h-20 bg-primary-100 border-2 border-primary-300 ${tw}`}
               />
               <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600 font-mono">
                 rounded-{label}
               </code>
               <span className="text-xs text-neutral-400">{px}</span>
             </div>
           ))}
         </div>
       </Section>

       {/* ════════════════════════════════ SHADOWS ════════════════════════════════ */}
       <Section id="shadows" title="Shadows">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {shadowScale.map(({ label, tw }) => (
             <div key={label} className="flex flex-col items-center gap-3">
               <div
                 className={`w-full h-16 bg-neutral-0 rounded-xl ${tw}`}
               />
               <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600 font-mono">
                 shadow-{label}
               </code>
             </div>
           ))}
         </div>
       </Section>

       {/* ════════════════════════════════ ICONS ════════════════════════════════ */}
       <Section id="icons" title="Icons">
         <p className="text-sm text-neutral-500 -mt-2">
           All icons via{' '}
           <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs font-mono">
             {'<AppIcon name="..." />'}
           </code>{' '}
           using Lucide. {iconKeys.length} registered names (includes aliases). Hover for name.
         </p>
         <DemoPanel>
           <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1">
             {iconKeys.map((key) => (
               <div
                 key={key}
                 className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-100 transition-colors group cursor-default"
                 title={key}
               >
                 <AppIcon
                   name={key}
                   className="w-5 h-5 text-neutral-500 group-hover:text-primary-600"
                 />
                 <span
                   className="text-neutral-400 text-center truncate w-full"
                   style={{ fontSize: '9px' }}
                 >
                   {key}
                 </span>
               </div>
             ))}
           </div>
         </DemoPanel>
       </Section>

       {/* ════════════════════════════════ BUTTON ════════════════════════════════ */}
       <Section id="buttons" title="Button">
         <SubSection title="Variants × Sizes">
           <DemoPanel className="space-y-4">
             {buttonSizes.map((size) => (
               <div key={size} className="flex items-center gap-3 flex-wrap">
                 <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500 font-mono w-7 text-center shrink-0">
                   {size}
                 </code>
                 {buttonVariants.map((variant) => (
                   <Button key={variant} variant={variant} size={size}>
                     {variant.charAt(0).toUpperCase() + variant.slice(1)}
                   </Button>
                 ))}
               </div>
             ))}
           </DemoPanel>
         </SubSection>

         <SubSection title="With Icons">
           <DemoPanel className="flex flex-wrap gap-3">
             <Button variant="primary" leftIcon="plus">Add item</Button>
             <Button variant="secondary" leftIcon="arrow-left">Go back</Button>
             <Button variant="ghost" leftIcon="search">Search</Button>
             <Button variant="danger" leftIcon="trash-2">Delete</Button>
             <Button variant="primary" rightIcon="arrow-right">Continue</Button>
             <Button variant="secondary" rightIcon="chevron-down">More options</Button>
           </DemoPanel>
         </SubSection>

         <SubSection title="States">
           <DemoPanel className="flex flex-wrap gap-3">
             <Button variant="primary" loading>Saving...</Button>
             <Button variant="secondary" loading>Loading</Button>
             <Button variant="primary" disabled>Disabled</Button>
             <Button variant="secondary" disabled>Disabled</Button>
           </DemoPanel>
         </SubSection>

         <SubSection title="Full Width">
           <DemoPanel>
             <Button variant="primary" fullWidth>Full-width button</Button>
           </DemoPanel>
         </SubSection>
       </Section>

       {/* ════════════════════════════════ CARD ════════════════════════════════ */}
       <Section id="cards" title="Card">
         <SubSection title="Variants">
           <div className="grid grid-cols-2 gap-4">
             {cardVariants.map((variant) => (
               <Card key={variant} variant={variant} padding="md">
                 <p className="text-sm font-semibold text-neutral-700 mb-1 capitalize">
                   {variant}
                 </p>
                 <p className="text-xs text-neutral-500">
                   This is the <strong>{variant}</strong> card variant. It uses{' '}
                   {variant === 'default'
                     ? 'a subtle shadow and light border'
                     : variant === 'elevated'
                     ? 'a prominent shadow'
                     : variant === 'outlined'
                     ? 'a border with no shadow'
                     : 'a background colour with no border or shadow'}
                   .
                 </p>
               </Card>
             ))}
           </div>
         </SubSection>

         <SubSection title="With Header">
           <Card
             title="Card Title"
             subtitle="Optional subtitle"
             padding="md"
             action={<Button size="sm" variant="secondary">Action</Button>}
           >
             <p className="text-sm text-neutral-600">
               Card body content rendered below the header.
             </p>
           </Card>
         </SubSection>

         <SubSection title="Interactive">
           <Card variant="outlined" interactive padding="md">
             <p className="text-sm text-neutral-600">
               Interactive card — hover to see the border highlight effect.
             </p>
           </Card>
         </SubSection>
       </Section>

       {/* ════════════════════════════════ ALERT ════════════════════════════════ */}
       <Section id="alerts" title="Alert">
         <SubSection title="Variants">
           <div className="space-y-3">
             {(['error', 'success', 'warning', 'info'] as const).map((variant) => (
               <Alert key={variant} variant={variant}>
                 This is a <strong>{variant}</strong> alert message.
               </Alert>
             ))}
           </div>
         </SubSection>

         <SubSection title="With Title">
           <Alert variant="warning" title="Session Expiring">
             Your session will expire in 5 minutes. Save your work.
           </Alert>
         </SubSection>

         <SubSection title="With Action">
           <Alert
             variant="info"
             title="Tip"
             action={<Button size="sm" variant="secondary">Learn more</Button>}
           >
             You can add multiple children from the parent dashboard.
           </Alert>
         </SubSection>
       </Section>

       {/* ════════════════════════════════ BADGE ════════════════════════════════ */}
       <Section id="badges" title="Badge">
         <SubSection title="Variants × Styles">
           <DemoPanel className="space-y-5">
             {badgeStyles.map((style) => (
               <div key={style}>
                 <p className="text-xs text-neutral-400 font-mono mb-2">{style}</p>
                 <div className="flex flex-wrap gap-2">
                   {badgeVariants.map((variant) => (
                     <Badge key={variant} variant={variant} badgeStyle={style}>
                       {variant.charAt(0).toUpperCase() + variant.slice(1)}
                     </Badge>
                   ))}
                 </div>
               </div>
             ))}
           </DemoPanel>
         </SubSection>

         <SubSection title="Sizes">
           <DemoPanel className="flex flex-wrap items-center gap-3">
             <Badge variant="primary" size="sm">Small</Badge>
             <Badge variant="primary" size="md">Medium</Badge>
             <Badge variant="primary" size="lg">Large</Badge>
           </DemoPanel>
         </SubSection>

         <SubSection title="With Icon & Dot">
           <DemoPanel className="flex flex-wrap gap-3">
             <Badge variant="success" icon="check-circle">Completed</Badge>
             <Badge variant="warning" icon="clock">Pending</Badge>
             <Badge variant="danger" icon="triangle-alert">Error</Badge>
             <Badge variant="info" icon="info">Info</Badge>
             <Badge variant="success" dot>Active</Badge>
             <Badge variant="warning" dot>Pending</Badge>
             <Badge variant="danger" dot>Offline</Badge>
           </DemoPanel>
         </SubSection>
       </Section>

       {/* ════════════════════════════════ LOADING SPINNER ════════════════════════════════ */}
       <Section id="spinners" title="LoadingSpinner">
         <SubSection title="Spinner variant · all sizes">
           <DemoPanel className="flex flex-wrap items-end gap-10">
             {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
               <div key={size} className="flex flex-col items-center gap-3">
                 <LoadingSpinner size={size} />
                 <code className="text-xs text-neutral-400 font-mono">{size}</code>
               </div>
             ))}
           </DemoPanel>
         </SubSection>

         <SubSection title="Dots variant · all sizes">
           <DemoPanel className="flex flex-wrap items-end gap-10">
             {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
               <div key={size} className="flex flex-col items-center gap-3">
                 <LoadingSpinner size={size} variant="dots" />
                 <code className="text-xs text-neutral-400 font-mono">{size}</code>
               </div>
             ))}
           </DemoPanel>
         </SubSection>

         <SubSection title="Centred with message">
           <DemoPanel>
             <LoadingSpinner size="md" message="Loading your dashboard..." centered />
           </DemoPanel>
         </SubSection>
       </Section>

       {/* ════════════════════════════════ FORM FIELD ════════════════════════════════ */}
       <Section id="forms" title="FormField">
         <DemoPanel className="grid grid-cols-2 gap-4">
           <FormField
             label="Normal input"
             placeholder="Enter something..."
             value={formValue}
             onChange={(e) => setFormValue(e.target.value)}
             name="demo-normal"
           />
           <FormField
             label="With error"
             placeholder="Enter something..."
             value=""
             onChange={() => undefined}
             error="This field is required"
             name="demo-error"
           />
           <FormField
             label="Required field"
             placeholder="Required..."
             value=""
             onChange={() => undefined}
             required
             name="demo-required"
           />
           <FormField
             label="Disabled input"
             value="Cannot be edited"
             onChange={() => undefined}
             disabled
             name="demo-disabled"
           />
           <div className="col-span-2">
             <FormField.Textarea
               label="Textarea"
               placeholder="Write your notes here..."
               value={textareaValue}
               onChange={(e) => setTextareaValue(e.target.value)}
               rows={3}
               helperText="Optional helper text appears below the field"
               name="demo-textarea"
             />
           </div>
         </DemoPanel>
       </Section>

       {/* ════════════════════════════════ EMPTY STATE ════════════════════════════════ */}
       <Section id="empty-states" title="EmptyState">
         <div className="grid grid-cols-3 gap-4">
           <DemoPanel>
             <EmptyState
               variant="default"
               icon="book"
               title="No resources"
               description="Add your first resource to get started."
             />
           </DemoPanel>
           <DemoPanel>
             <EmptyState
               variant="minimal"
               icon="calendar"
               title="No sessions"
               description="Schedule your first revision session."
               action={<Button size="sm">Add session</Button>}
             />
           </DemoPanel>
           <DemoPanel>
             <EmptyState
               icon="party-popper"
               title="All done!"
               description="You've completed everything."
             />
           </DemoPanel>
         </div>
       </Section>

       {/* ════════════════════════════════ THEME TOGGLE ════════════════════════════════ */}
       <Section id="theme-toggle" title="ThemeToggle">
         <DemoPanel>
           <div className="space-y-6">
             {(['switch', 'button', 'icon'] as const).map((variant) => (
               <div key={variant} className="flex items-center gap-4">
                 <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500 font-mono w-14 shrink-0">
                   {variant}
                 </code>
                 <ThemeToggle variant={variant} />
               </div>
             ))}
           </div>
         </DemoPanel>
       </Section>

       {/* ════════════════════════════════ PROGRESS BAR ════════════════════════════════ */}
       <Section id="progress-bar" title="ProgressBar">
         <p className="text-sm text-neutral-500 -mt-2">
           Accessible horizontal progress bar used for session completion, topic coverage, subject progress, and rewards.
         </p>

         <SubSection title="Colors">
           <DemoPanel className="space-y-4">
             {(['primary', 'success', 'warning', 'danger', 'info'] as ProgressBarColor[]).map((color) => (
               <ProgressBar key={color} value={65} color={color} label={color} showValue size="md" />
             ))}
           </DemoPanel>
         </SubSection>

         <SubSection title="Sizes">
           <DemoPanel className="space-y-4">
             {(['sm', 'md', 'lg', 'xl'] as ProgressBarSize[]).map((size) => (
               <div key={size} className="flex items-center gap-4">
                 <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded font-mono text-neutral-500 w-7 text-center shrink-0">
                   {size}
                 </code>
                 <div className="flex-1">
                   <ProgressBar value={72} size={size} color="primary" />
                 </div>
               </div>
             ))}
           </DemoPanel>
         </SubSection>

         <SubSection title="With label + value">
           <DemoPanel className="space-y-5">
             <ProgressBar value={40} color="success" size="lg" showValue label="Topic Coverage" />
             <ProgressBar value={85} color="primary" size="md" showValue label="Sessions Completed" />
             <ProgressBar value={20} color="warning" size="md" showValue label="Revision Plan" />
             <ProgressBar value={0} color="danger" size="sm" label="Not started" />
             <ProgressBar value={100} color="success" size="md" showValue label="All done!" />
           </DemoPanel>
         </SubSection>
       </Section>

       {/* ════════════════════════════════ STAT CARD ════════════════════════════════ */}
       <Section id="stat-card" title="StatCard">
         <p className="text-sm text-neutral-500 -mt-2">
           Compact KPI cell used in dashboard hero cards, insights widgets, and reward summaries.
           Renders a label, a primary value, and an optional sub-label.
         </p>

         <SubSection title="Sizes">
           <DemoPanel>
             <div className="grid grid-cols-3 gap-3">
               <StatCard size="sm" label="Small" value="4/7" sublabel="57% rate" />
               <StatCard size="md" label="Medium (default)" value="4/7" sublabel="57% rate" />
               <StatCard size="lg" label="Large" value="4/7" sublabel="57% rate" />
             </div>
           </DemoPanel>
         </SubSection>

         <SubSection title="Value colors">
           <DemoPanel>
             <div className="grid grid-cols-3 gap-3">
               <StatCard label="Default" value="4/7" valueColor="default" sublabel="Primary 900" />
               <StatCard label="Primary" value="+12%" valueColor="primary" sublabel="Brand purple" />
               <StatCard label="Success" value="85%" valueColor="success" sublabel="On track" />
               <StatCard label="Warning" value="42%" valueColor="warning" sublabel="Keep an eye" />
               <StatCard label="Danger" value="11%" valueColor="danger" sublabel="Needs attention" />
               <StatCard label="Muted" value="0/0" valueColor="muted" sublabel="Nothing yet" />
             </div>
           </DemoPanel>
         </SubSection>

         <SubSection title="Backgrounds">
           <DemoPanel className="flex gap-3">
             <StatCard background="neutral" label="Neutral (default)" value="4/7" sublabel="bg-neutral-50" className="flex-1" />
             <StatCard background="white" label="White" value="4/7" sublabel="bg-neutral-0" className="flex-1 border border-neutral-200" />
             <StatCard background="primary" label="Primary tint" value="4/7" sublabel="bg-primary-50" className="flex-1" />
             <StatCard background="none" label="Transparent" value="4/7" sublabel="no background" className="flex-1" />
           </DemoPanel>
         </SubSection>
       </Section>

       {/* ════════════════════════════════ ICON CIRCLE ════════════════════════════════ */}
       <Section id="icon-circle" title="IconCircle">
         <p className="text-sm text-neutral-500 -mt-2">
           A circular container holding a single AppIcon. Used in 12+ components for status indicators,
           empty states, insight rows, and section headers.
         </p>

         <SubSection title="Variants × Colors">
           <DemoPanel>
             {(['solid', 'soft', 'ghost'] as IconCircleVariant[]).map((variant) => (
               <div key={variant} className="mb-5 last:mb-0">
                 <p className="text-xs text-neutral-400 font-mono mb-3">{variant}</p>
                 <div className="flex flex-wrap gap-4">
                   {(['primary', 'success', 'warning', 'danger', 'info', 'neutral'] as IconCircleColor[]).map((color) => (
                     <div key={color} className="flex flex-col items-center gap-1.5">
                       <IconCircle name="star" color={color} variant={variant} size="md" />
                       <span className="text-xs text-neutral-400">{color}</span>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
           </DemoPanel>
         </SubSection>

         <SubSection title="Sizes">
           <DemoPanel className="flex flex-wrap items-end gap-6">
             {(['xs', 'sm', 'md', 'lg', 'xl'] as IconCircleSize[]).map((size) => (
               <div key={size} className="flex flex-col items-center gap-2">
                 <IconCircle name="flame" color="warning" variant="soft" size={size} />
                 <code className="text-xs text-neutral-400 font-mono">{size}</code>
               </div>
             ))}
           </DemoPanel>
         </SubSection>

         <SubSection title="Common usage patterns">
           <DemoPanel className="flex flex-wrap gap-4">
             <IconCircle name="check-circle" color="success" variant="soft" size="md" />
             <IconCircle name="triangle-alert" color="warning" variant="soft" size="md" />
             <IconCircle name="x-circle" color="danger" variant="soft" size="md" />
             <IconCircle name="info" color="info" variant="soft" size="md" />
             <IconCircle name="book" color="primary" variant="solid" size="sm" />
             <IconCircle name="calendar" color="neutral" variant="ghost" size="sm" />
             <IconCircle name="flame" color="warning" variant="solid" size="lg" />
             <IconCircle name="lightbulb" color="primary" variant="ghost" size="lg" />
           </DemoPanel>
         </SubSection>
       </Section>

       {/* ════════════════════════════════ CIRCULAR PROGRESS ════════════════════════════════ */}
       <Section id="circular-progress" title="CircularProgress">
         <p className="text-sm text-neutral-500 -mt-2">
           SVG ring progress indicator. Used for health scores, streak trackers, and pace rings.
           Accepts design-token colour names or any CSS colour string.
         </p>

         <SubSection title="Size presets">
           <DemoPanel className="flex flex-wrap items-end gap-8">
             {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
               <div key={size} className="flex flex-col items-center gap-3">
                 <CircularProgress value={72} size={size} color="primary">
                   <span className="text-xs font-bold text-primary-900">72%</span>
                 </CircularProgress>
                 <code className="text-xs text-neutral-400 font-mono">{size}</code>
               </div>
             ))}
           </DemoPanel>
         </SubSection>

         <SubSection title="Color tokens">
           <DemoPanel className="flex flex-wrap gap-8">
             {(['primary', 'success', 'warning', 'danger', 'info'] as const).map((color) => (
               <div key={color} className="flex flex-col items-center gap-3">
                 <CircularProgress value={68} size="md" color={color}>
                   <span className="text-sm font-bold text-neutral-700">68%</span>
                 </CircularProgress>
                 <code className="text-xs text-neutral-400 font-mono">{color}</code>
               </div>
             ))}
           </DemoPanel>
         </SubSection>

         <SubSection title="Real-world examples">
           <DemoPanel className="flex flex-wrap gap-10 items-start">
             {/* Health score style */}
             <div className="text-center">
               <CircularProgress value={82} max={100} color="success" size="lg">
                 <span className="text-2xl font-bold text-neutral-800">82</span>
               </CircularProgress>
               <p className="text-xs text-neutral-500 mt-2">Health Score</p>
             </div>
             {/* Streak tracker style */}
             <div className="text-center">
               <CircularProgress value={5} max={7} color="primary" size="lg">
                 <span className="text-2xl font-bold text-primary-900">5</span>
                 <span className="text-xs text-neutral-500">day streak</span>
               </CircularProgress>
               <p className="text-xs text-neutral-500 mt-2">Streak</p>
             </div>
             {/* Pace ring style */}
             <div className="text-center">
               <CircularProgress value={63} max={100} color="warning" size="lg">
                 <span className="text-2xl font-bold text-accent-amber">63%</span>
                 <span className="text-xs text-neutral-500">weekly pace</span>
               </CircularProgress>
               <p className="text-xs text-neutral-500 mt-2">Pace</p>
             </div>
             {/* Zero state */}
             <div className="text-center">
               <CircularProgress value={0} max={100} color="neutral" size="md">
                 <span className="text-sm font-bold text-neutral-500">—</span>
               </CircularProgress>
               <p className="text-xs text-neutral-500 mt-2">Empty state</p>
             </div>
           </DemoPanel>
         </SubSection>
       </Section>

       {/* ════════════════════════════════ AVATAR CIRCLE ════════════════════════════════ */}
       <Section id="avatar-circle" title="AvatarCircle">
         <p className="text-sm text-neutral-500 -mt-2">
           Circular user avatar — renders a photo when a src is provided, otherwise derives initials
           from the name prop. Used in the sidebar, child headers, and session participant lists.
         </p>

         <SubSection title="Initials fallback — sizes">
           <DemoPanel className="flex flex-wrap items-end gap-6">
             {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
               <div key={size} className="flex flex-col items-center gap-2">
                 <AvatarCircle name="Alice Smith" size={size} />
                 <code className="text-xs text-neutral-400 font-mono">{size}</code>
               </div>
             ))}
           </DemoPanel>
         </SubSection>

         <SubSection title="Color variants">
           <DemoPanel className="flex flex-wrap gap-6">
             <div className="flex flex-col items-center gap-2">
               <AvatarCircle name="Bob Jones" size="lg" color="primary" />
               <code className="text-xs text-neutral-400 font-mono">primary</code>
             </div>
             <div className="flex flex-col items-center gap-2">
               <AvatarCircle name="Clara Reed" size="lg" color="soft" />
               <code className="text-xs text-neutral-400 font-mono">soft</code>
             </div>
             <div className="flex flex-col items-center gap-2">
               <AvatarCircle name="Dan Park" size="lg" color="neutral" />
               <code className="text-xs text-neutral-400 font-mono">neutral</code>
             </div>
           </DemoPanel>
         </SubSection>

         <SubSection title="With border">
           <DemoPanel className="flex flex-wrap gap-6">
             <AvatarCircle name="Eve Adams" size="lg" bordered />
             <AvatarCircle name="Frank Hall" size="lg" bordered color="soft" />
             <AvatarCircle name="Grace Kim" size="xl" bordered />
           </DemoPanel>
         </SubSection>

         <SubSection title="With photo (src provided)">
           <DemoPanel className="flex flex-wrap gap-4 items-center">
             <AvatarCircle
               name="Picsum Photo"
               src="https://i.pravatar.cc/80?img=1"
               size="sm"
             />
             <AvatarCircle
               name="Picsum Photo"
               src="https://i.pravatar.cc/80?img=5"
               size="md"
               bordered
             />
             <AvatarCircle
               name="Picsum Photo"
               src="https://i.pravatar.cc/80?img=9"
               size="lg"
               bordered
             />
             {/* Broken src falls through to initials */}
             <AvatarCircle
               name="Broken Image"
               src={null}
               size="md"
             />
           </DemoPanel>
         </SubSection>
       </Section>

     </main>
   </div>
 )}

 {/* ── TAB 2: Page Modules ── */}
 {activeTab === 'modules' && (
   <div className="max-w-7xl mx-auto flex gap-8 px-6 py-8">
     {/* Sticky sidebar nav */}
     <aside className="w-44 shrink-0 hidden lg:block">
       <div className="sticky top-6">
         <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
           Modules
         </p>
         <nav className="space-y-0.5">
           {MODULE_NAV_SECTIONS.map((s) => (
             <button
               key={s.id}
               onClick={() => scrollTo(s.id)}
               className="block w-full text-left text-sm px-2 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
             >
               {s.label}
             </button>
           ))}
         </nav>
       </div>
     </aside>

     <main className="flex-1 min-w-0 space-y-14">

       {/* ════════════════════════════════ NAVIGATION ════════════════════════════════ */}
       <Section id="mod-navigation" title="Navigation">
         <p className="text-sm text-neutral-500 -mt-2">
           Global navigation modules used across all authenticated pages.
         </p>

         {/* Sidebar */}
         <SubSection title="Sidebar Navigation">
           <SourceTag path="src/components/layout/Sidebar.tsx · SidebarNav.tsx" />
           <DemoPanel className="p-0 overflow-hidden">
             <div className="flex" style={{ height: '400px' }}>
               {/* Expanded sidebar mock */}
               <div className="w-60 bg-neutral-0 border-r border-neutral-200/60 flex flex-col shrink-0">
                 {/* Logo header */}
                 <div className="h-16 border-b border-neutral-200/60 flex items-center justify-between px-4">
                   <span className="text-lg font-bold text-primary-700">DoorSlam</span>
                   <button className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400">
                     <AppIcon name="chevron-left" className="w-4 h-4" />
                   </button>
                 </div>
                 {/* Nav items */}
                 <div className="flex-1 py-4 px-3 space-y-1">
                   {/* Child selector */}
                   <div className="relative mb-3">
                     <div className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-700 bg-neutral-100 flex items-center justify-between">
                       <span>Alex Johnson</span>
                       <AppIcon name="chevron-down" className="w-3.5 h-3.5 text-neutral-400" />
                     </div>
                   </div>
                   {[
                     { icon: 'home' as IconKey, label: 'Dashboard', active: true },
                     { icon: 'book-open' as IconKey, label: 'Subjects', active: false },
                     { icon: 'calendar' as IconKey, label: 'Timetable', active: false },
                     { icon: 'gift' as IconKey, label: 'Rewards', active: false },
                     { icon: 'chart-bar' as IconKey, label: 'Insights', active: false },
                     { icon: 'wallet' as IconKey, label: 'Manage Plan', active: false },
                   ].map(({ icon, label, active }) => (
                     <div
                       key={label}
                       className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                         active
                           ? 'bg-primary-50 text-primary-700'
                           : 'text-neutral-600 hover:bg-neutral-100'
                       }`}
                     >
                       <AppIcon name={icon} className={`w-4 h-4 ${active ? 'text-primary-600' : 'text-neutral-500'}`} />
                       {label}
                     </div>
                   ))}
                 </div>
                 {/* Bottom section */}
                 <div className="border-t border-neutral-200/60 px-3 py-4 space-y-1">
                   <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100">
                     <AppIcon name="settings" className="w-4 h-4 text-neutral-500" />
                     Settings
                   </div>
                   <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100">
                     <AppIcon name="log-out" className="w-4 h-4 text-neutral-500" />
                     Sign out
                   </div>
                   <div className="flex items-center gap-3 px-3 py-2 mt-2">
                     <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
                       SJ
                     </div>
                     <div className="min-w-0">
                       <p className="text-xs font-semibold text-neutral-700 truncate">Sarah Johnson</p>
                       <p className="text-xs text-neutral-400 truncate">sarah@example.com</p>
                     </div>
                   </div>
                 </div>
               </div>
               {/* Collapsed sidebar mock */}
               <div className="w-16 bg-neutral-0 border-r border-neutral-200/60 flex flex-col">
                 <div className="h-16 border-b border-neutral-200/60 flex items-center justify-center">
                   <button className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400">
                     <AppIcon name="chevron-right" className="w-4 h-4" />
                   </button>
                 </div>
                 <div className="flex-1 py-4 px-2 space-y-1">
                   {[
                     { icon: 'home' as IconKey, active: true },
                     { icon: 'book-open' as IconKey, active: false },
                     { icon: 'calendar' as IconKey, active: false },
                     { icon: 'gift' as IconKey, active: false },
                     { icon: 'chart-bar' as IconKey, active: false },
                   ].map(({ icon, active }, i) => (
                     <div
                       key={i}
                       className={`flex items-center justify-center p-2.5 rounded-xl ${active ? 'bg-primary-50' : 'hover:bg-neutral-100'}`}
                     >
                       <AppIcon name={icon} className={`w-4 h-4 ${active ? 'text-primary-600' : 'text-neutral-500'}`} />
                     </div>
                   ))}
                 </div>
               </div>
               {/* Label area */}
               <div className="flex-1 bg-neutral-50 flex items-center justify-center">
                 <div className="text-center text-neutral-400">
                   <p className="text-xs font-medium mb-1">Expanded (w-60) · Collapsed (w-16)</p>
                   <p className="text-xs">Toggles via SidebarContext</p>
                 </div>
               </div>
             </div>
           </DemoPanel>
         </SubSection>

         {/* Mobile Navigation */}
         <SubSection title="Mobile Navigation">
           <SourceTag path="src/components/layout/AppHeader.tsx" />
           <DemoPanel className="p-0 overflow-hidden">
             {/* Mobile top bar */}
             <div className="bg-neutral-0 border-b border-neutral-200/60 px-4 py-3 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                   <AppIcon name="menu" className="w-4 h-4 text-neutral-600" />
                 </div>
                 <span className="text-base font-bold text-primary-700">DoorSlam</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                   <AppIcon name="bell" className="w-4 h-4 text-neutral-600" />
                 </div>
                 <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">
                   SJ
                 </div>
               </div>
             </div>
             {/* Mobile drawer overlay mockup */}
             <div className="relative" style={{ height: '200px' }}>
               <div className="absolute inset-0 bg-black/30 flex">
                 <div className="w-64 bg-neutral-0 h-full shadow-xl flex flex-col">
                   <div className="p-4 border-b border-neutral-100">
                     <p className="text-sm font-semibold text-neutral-700">Alex Johnson</p>
                     <p className="text-xs text-neutral-500">Year 11 · GCSE</p>
                   </div>
                   <nav className="p-3 space-y-1">
                     {['Dashboard', 'Subjects', 'Timetable', 'Rewards'].map((item, i) => (
                       <div key={item} className={`px-3 py-2.5 rounded-xl text-sm font-medium ${i === 0 ? 'bg-primary-50 text-primary-700' : 'text-neutral-600'}`}>
                         {item}
                       </div>
                     ))}
                   </nav>
                 </div>
                 <div className="flex-1 flex items-center justify-center">
                   <p className="text-white text-xs opacity-70">Tap to close</p>
                 </div>
               </div>
             </div>
           </DemoPanel>
         </SubSection>

         {/* Footer */}
         <SubSection title="Footer">
           <SourceTag path="src/components/layout/Footer.tsx" />
           <div className="rounded-xl overflow-hidden border border-neutral-200">
             <Footer />
           </div>
         </SubSection>
       </Section>

       {/* ════════════════════════════════ DASHBOARD MODULES ════════════════════════════════ */}
       <Section id="mod-dashboard" title="Dashboard Modules">
         <p className="text-sm text-neutral-500 -mt-2">
           The three main widget cards on the Parent Dashboard — rendered with representative mock data.
         </p>

         {/* This Week's Story */}
         <SubSection title="This Week's Story">
           <SourceTag path="src/components/parent/dashboard/DashboardHeroCard.tsx" />
           <div className="max-w-lg">
             <DashboardHeroCard
               child={MOCK_CHILD}
               childCoverage={MOCK_DASHBOARD_COVERAGE}
               onActionClick={() => undefined}
               onViewDetailedBreakdown={() => undefined}
               planOverview={MOCK_PLAN_OVERVIEW}
               onSetupSchedule={() => undefined}
               onInviteChild={() => undefined}
             />
           </div>
         </SubSection>

         {/* Health Score */}
         <SubSection title="Health Score">
           <SourceTag path="src/components/parent/dashboard/HealthScoreCard.tsx" />
           <div className="max-w-xs">
             <HealthScoreCard
               child={MOCK_CHILD}
               childCoverage={MOCK_DASHBOARD_COVERAGE}
               planOverview={MOCK_PLAN_OVERVIEW}
             />
           </div>
         </SubSection>

         {/* Revision Plan */}
         <SubSection title="Revision Plan">
           <SourceTag path="src/components/parent/dashboard/DashboardRevisionPlan.tsx" />
           <DashboardRevisionPlan
             planOverview={MOCK_PLAN_OVERVIEW}
           />
         </SubSection>
       </Section>

       {/* ════════════════════════════════ SUBJECTS ════════════════════════════════ */}
       <Section id="mod-subjects" title="Subjects">
         <p className="text-sm text-neutral-500 -mt-2">
           Subject cards grid shown on the Subjects page. Each card displays coverage progress, recent topics, and upcoming sessions.
         </p>

         <SubSection title="Subject Card">
           <SourceTag path="src/components/subjects/SubjectCard.tsx" />
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {MOCK_SUBJECTS.map((subject) => (
               <SubjectCard key={subject.subject_id} subject={subject} />
             ))}
           </div>
         </SubSection>

         {/* Stats Grid */}
         <SubSection title="Stats Grid">
           <SourceTag path="src/components/subjects/StatsGrid.tsx" />
           <DemoPanel className="p-0 overflow-hidden">
             <div className="grid grid-cols-2 md:grid-cols-4">
               {[
                 { label: 'Total Subjects', value: '3', icon: 'book-open' as IconKey, bg: 'bg-primary-50', text: 'text-primary-700', iconColor: 'text-primary-600' },
                 { label: 'Sessions This Week', value: '4', icon: 'calendar-check' as IconKey, bg: 'bg-success-bg', text: 'text-success', iconColor: 'text-success' },
                 { label: 'Topics Covered', value: '5', icon: 'chart-bar' as IconKey, bg: 'bg-info-bg', text: 'text-info', iconColor: 'text-info' },
                 { label: 'Need Attention', value: '1', icon: 'triangle-alert' as IconKey, bg: 'bg-warning-bg', text: 'text-warning', iconColor: 'text-warning' },
               ].map(({ label, value, icon, bg, text, iconColor }, i) => (
                 <div key={label} className={`p-5 ${bg} ${i < 3 ? 'border-r border-neutral-200/50' : ''}`}>
                   <div className="flex items-start justify-between">
                     <div>
                       <p className="text-xs text-neutral-500 mb-1">{label}</p>
                       <p className={`text-2xl font-bold ${text}`}>{value}</p>
                     </div>
                     <AppIcon name={icon} className={`w-5 h-5 ${iconColor} mt-0.5`} />
                   </div>
                 </div>
               ))}
             </div>
           </DemoPanel>
         </SubSection>
       </Section>

       {/* ════════════════════════════════ TIMETABLE ════════════════════════════════ */}
       <Section id="mod-timetable" title="Timetable">
         <p className="text-sm text-neutral-500 -mt-2">
           The weekly calendar view with draggable session cards across time-slot rows and day columns.
         </p>

         <SubSection title="Week View">
           <SourceTag path="src/components/timetable/WeekView.tsx · TimeSlotRow.tsx" />
           <DemoPanel className="p-0 overflow-x-auto">
             {/* Timetable grid mockup */}
             <div style={{ minWidth: '640px' }}>
               {/* Header row */}
               <div className="grid border-b border-neutral-200" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
                 <div className="px-3 py-3 text-xs font-semibold text-neutral-500 border-r border-neutral-100">Time</div>
                 {['Mon 24', 'Tue 25', 'Wed 26', 'Thu 27', 'Fri 28', 'Sat 1', 'Sun 2'].map((day, i) => (
                   <div key={day} className={`px-2 py-3 text-center ${i === 0 ? 'bg-primary-50' : ''}`}>
                     <p className={`text-xs font-semibold ${i === 0 ? 'text-primary-700' : 'text-neutral-600'}`}>
                       {day.split(' ')[0]}
                     </p>
                     <p className={`text-xs ${i === 0 ? 'text-primary-500' : 'text-neutral-400'}`}>
                       {day.split(' ')[1]} Feb
                     </p>
                     {i === 0 && <span className="text-[9px] font-bold text-primary-600 bg-primary-100 px-1.5 py-0.5 rounded-full">TODAY</span>}
                   </div>
                 ))}
               </div>
               {/* Time slot rows */}
               {[
                 {
                   time: '4:00pm',
                   sessions: [
                     { day: 0, subject: 'Mathematics', topic: 'Quadratic Equations', color: '#5B2CFF' },
                     { day: 2, subject: 'Biology', topic: 'Cell Division', color: '#3B82F6' },
                   ],
                 },
                 {
                   time: '5:00pm',
                   sessions: [
                     { day: 1, subject: 'English Lit', topic: 'Macbeth Act II', color: '#1EC592' },
                     { day: 3, subject: 'Mathematics', topic: 'Circle Theorems', color: '#5B2CFF' },
                   ],
                 },
                 {
                   time: '6:00pm',
                   sessions: [
                     { day: 4, subject: 'Biology', topic: 'Genetics', color: '#3B82F6' },
                   ],
                 },
                 { time: '7:00pm', sessions: [] },
               ].map(({ time, sessions }) => (
                 <div key={time} className="grid border-b border-neutral-100" style={{ gridTemplateColumns: '80px repeat(7, 1fr)', minHeight: '72px' }}>
                   <div className="px-3 py-3 text-xs text-neutral-400 border-r border-neutral-100 font-medium">{time}</div>
                   {Array.from({ length: 7 }, (_, dayIdx) => {
                     const session = sessions.find((s) => s.day === dayIdx);
                     return (
                       <div key={dayIdx} className={`p-1.5 border-r border-neutral-100 last:border-r-0 ${dayIdx === 0 ? 'bg-primary-50/30' : ''}`}>
                         {session && (
                           <div
                             className="rounded-lg p-2 text-white text-xs h-full cursor-grab"
                             style={{ backgroundColor: session.color }}
                           >
                             <p className="font-semibold leading-tight truncate">{session.subject}</p>
                             <p className="opacity-80 leading-tight truncate mt-0.5">{session.topic}</p>
                           </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
               ))}
             </div>
           </DemoPanel>
         </SubSection>

         {/* Today View */}
         <SubSection title="Today View">
           <SourceTag path="src/components/timetable/TodayView.tsx" />
           <DemoPanel className="max-w-sm">
             <div className="space-y-3">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-bold text-neutral-800">Today&apos;s Sessions</h3>
                 <button className="flex items-center gap-1.5 text-xs text-primary-600 font-medium">
                   <AppIcon name="plus" className="w-3.5 h-3.5" />
                   Add
                 </button>
               </div>
               {[
                 { subject: 'Mathematics', topic: 'Quadratic Equations', time: '4:00 – 4:45pm', color: '#5B2CFF', done: true },
                 { subject: 'Biology', topic: 'Cell Division', time: '5:00 – 5:45pm', color: '#3B82F6', done: false },
               ].map(({ subject, topic, time, color, done }) => (
                 <div key={subject} className={`flex items-center gap-3 p-3 rounded-xl border ${done ? 'border-neutral-100 bg-neutral-50 opacity-60' : 'border-neutral-200 bg-neutral-0'}`}>
                   <div className="w-1 self-stretch rounded-full" style={{ backgroundColor: color }} />
                   <div className="flex-1 min-w-0">
                     <p className={`text-sm font-medium truncate ${done ? 'line-through text-neutral-400' : 'text-neutral-800'}`}>{subject}</p>
                     <p className="text-xs text-neutral-500 truncate">{topic}</p>
                     <p className="text-xs text-neutral-400 mt-0.5">{time}</p>
                   </div>
                   {done ? (
                     <AppIcon name="check-circle" className="w-5 h-5 text-accent-green shrink-0" />
                   ) : (
                     <button className="w-6 h-6 rounded-full border-2 border-neutral-300 shrink-0" />
                   )}
                 </div>
               ))}
             </div>
           </DemoPanel>
         </SubSection>
       </Section>

       {/* ════════════════════════════════ REWARDS ════════════════════════════════ */}
       <Section id="mod-rewards" title="Rewards">
         <p className="text-sm text-neutral-500 -mt-2">
           The reward catalog card with category-specific styling, toggle switches, and editable point values.
         </p>

         <SubSection title="Reward Toggle Card — full mode">
           <SourceTag path="src/components/parent/rewards/RewardTemplateCard.tsx" />
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             <RewardTemplateCard
               id="r1"
               name="1 Hour Screen Time"
               pointsCost={100}
               suggestedPoints={100}
               categoryCode="screen_time"
               isEnabled={true}
               showToggle
               onToggle={() => undefined}
             />
             <RewardTemplateCard
               id="r2"
               name="Favourite Treat"
               pointsCost={75}
               suggestedPoints={75}
               categoryCode="treats"
               isEnabled={true}
               showToggle
               onToggle={() => undefined}
             />
             <RewardTemplateCard
               id="r3"
               name="Cinema Trip"
               pointsCost={300}
               suggestedPoints={300}
               categoryCode="activities"
               isEnabled={false}
               showToggle
               onToggle={() => undefined}
             />
             <RewardTemplateCard
               id="r4"
               name="£5 Pocket Money"
               pointsCost={250}
               suggestedPoints={250}
               categoryCode="pocket_money"
               isEnabled={true}
               showToggle
               onToggle={() => undefined}
             />
             <RewardTemplateCard
               id="r5"
               name="Stay Up Late"
               pointsCost={150}
               suggestedPoints={150}
               categoryCode="privileges"
               isEnabled={false}
               showToggle
               onToggle={() => undefined}
             />
             <RewardTemplateCard
               id="r6"
               name="Custom Reward"
               pointsCost={200}
               categoryCode="custom"
               isEnabled={true}
               showToggle
               onToggle={() => undefined}
             />
           </div>
         </SubSection>

         <SubSection title="Compact mode — Agreed Rewards card">
           <SourceTag path="src/components/parent/rewards/RewardTemplateCard.tsx — compact prop" />
           <DemoPanel>
             <h3 className="text-sm font-bold text-neutral-800 mb-3">Agreed Rewards</h3>
             <div className="grid grid-cols-2 gap-2">
               <RewardTemplateCard
                 id="rc1"
                 name="1 Hour Screen Time"
                 pointsCost={100}
                 categoryCode="screen_time"
                 isEnabled={true}
                 compact
                 showToggle={false}
               />
               <RewardTemplateCard
                 id="rc2"
                 name="Favourite Treat"
                 pointsCost={75}
                 categoryCode="treats"
                 isEnabled={true}
                 compact
                 showToggle={false}
               />
               <RewardTemplateCard
                 id="rc3"
                 name="£5 Pocket Money"
                 pointsCost={250}
                 categoryCode="pocket_money"
                 isEnabled={true}
                 compact
                 showToggle={false}
               />
               <RewardTemplateCard
                 id="rc4"
                 name="Stay Up Late"
                 pointsCost={150}
                 categoryCode="privileges"
                 isEnabled={true}
                 compact
                 showToggle={false}
               />
             </div>
           </DemoPanel>
         </SubSection>
       </Section>

       {/* ════════════════════════════════ INSIGHTS ════════════════════════════════ */}
       <Section id="mod-insights" title="Insights">
         <p className="text-sm text-neutral-500 -mt-2">
           Analytics widgets on the Insights Dashboard. Charts shown as structural placeholders — live data renders Recharts.
         </p>

         {/* Hero Story Widget */}
         <SubSection title="Hero Story Widget">
           <SourceTag path="src/components/parent/insights/HeroStoryWidget.tsx" />
           <DemoPanel className="bg-gradient-to-b from-primary-50 to-neutral-0">
             <div className="flex items-start justify-between mb-4">
               <div>
                 <p className="text-xs text-primary-600 font-semibold uppercase tracking-wider mb-1">This Period</p>
                 <h2 className="text-lg font-bold text-neutral-800">Alex&apos;s Learning Story</h2>
                 <p className="text-sm text-neutral-600 mt-1 max-w-lg">
                   Alex completed <strong>18 sessions</strong> this month — a strong showing with consistent focus across Mathematics and Biology.
                 </p>
               </div>
               <div className="flex gap-2">
                 {(['1w', '1m', '3m'] as const).map((range) => (
                   <button
                     key={range}
                     className={`px-3 py-1.5 rounded-lg text-xs font-medium ${range === '1m' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600'}`}
                   >
                     {range}
                   </button>
                 ))}
               </div>
             </div>
             <div className="grid grid-cols-3 gap-3 mb-4">
               {[
                 { label: 'Sessions', value: '18', sub: 'this period', color: 'text-primary-900' },
                 { label: 'Avg Confidence', value: '+8%', sub: 'pre → post', color: 'text-accent-green' },
                 { label: 'Focus Mode', value: '11/18', sub: '61% usage', color: 'text-primary-900' },
               ].map(({ label, value, sub, color }) => (
                 <div key={label} className="bg-neutral-0 rounded-xl p-3 border border-neutral-200/50">
                   <p className="text-xs text-neutral-500 mb-1">{label}</p>
                   <p className={`text-xl font-bold ${color}`}>{value}</p>
                   <p className="text-xs text-neutral-400">{sub}</p>
                 </div>
               ))}
             </div>
             <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
               <div className="flex items-center gap-1.5 mb-1.5">
                 <AppIcon name="lightbulb" className="w-3.5 h-3.5 text-warning" />
                 <span className="text-xs font-semibold text-neutral-700">Next Best Action</span>
               </div>
               <p className="text-xs text-neutral-500 mb-2">English Literature needs more attention — only 3 sessions this period.</p>
               <div className="flex flex-wrap gap-2">
                 <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium">Adjust Plan</button>
                 <button className="px-3 py-1.5 bg-neutral-0 border border-neutral-200 text-neutral-600 rounded-lg text-xs font-medium">Export Report</button>
               </div>
             </div>
           </DemoPanel>
         </SubSection>

         {/* Progress Plan Widget */}
         <SubSection title="Progress Plan Widget">
           <SourceTag path="src/components/parent/insights/ProgressPlanWidget.tsx" />
           <DemoPanel>
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-base font-bold text-neutral-800">Progress vs Plan</h3>
               <Badge variant="success" badgeStyle="soft">On Track</Badge>
             </div>
             <ChartPlaceholder height="h-40" label="Bar chart — Planned vs Completed sessions per day" />
             <div className="grid grid-cols-2 gap-3 mt-4">
               <div className="bg-success-bg rounded-xl p-3 border border-success-border">
                 <p className="text-xs text-neutral-500 mb-1">Best Day</p>
                 <p className="text-base font-bold text-neutral-800">Thursday</p>
                 <p className="text-xs text-neutral-500">3 sessions completed</p>
               </div>
               <div className="bg-warning-bg rounded-xl p-3 border border-warning-border">
                 <p className="text-xs text-neutral-500 mb-1">Hardest Day</p>
                 <p className="text-base font-bold text-neutral-800">Saturday</p>
                 <p className="text-xs text-neutral-500">0 of 2 sessions done</p>
               </div>
             </div>
           </DemoPanel>
         </SubSection>

         {/* Confidence Trend Widget */}
         <SubSection title="Confidence Trend Widget">
           <SourceTag path="src/components/parent/insights/ConfidenceTrendWidget.tsx" />
           <DemoPanel>
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-base font-bold text-neutral-800">Confidence Trend</h3>
               <div className="flex items-center gap-3 text-xs">
                 <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-primary-400 inline-block" />Pre-session</span>
                 <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-accent-green inline-block" />Post-session</span>
               </div>
             </div>
             <ChartPlaceholder height="h-40" label="Line chart — Pre vs Post confidence across sessions" />
             <div className="grid grid-cols-2 gap-3 mt-4">
               <div className="bg-success-bg rounded-xl p-3 border border-success-border">
                 <p className="text-xs text-neutral-500 mb-1">Largest Lift</p>
                 <p className="text-base font-bold text-neutral-800">+24%</p>
                 <p className="text-xs text-neutral-500">Biology · Cell Division</p>
               </div>
               <div className="bg-warning-bg rounded-xl p-3 border border-warning-border">
                 <p className="text-xs text-neutral-500 mb-1">Most Fragile</p>
                 <p className="text-base font-bold text-neutral-800">English</p>
                 <p className="text-xs text-neutral-500">Avg confidence still low</p>
               </div>
             </div>
           </DemoPanel>
         </SubSection>

         {/* Subject Balance Widget */}
         <SubSection title="Subject Balance Widget">
           <SourceTag path="src/components/parent/insights/SubjectBalanceWidget.tsx" />
           <DemoPanel>
             <h3 className="text-base font-bold text-neutral-800 mb-4">Subject Balance</h3>
             <div className="flex gap-6 items-center">
               <ChartPlaceholder height="h-40" label="Donut chart — time distribution by subject" />
               <div className="space-y-2 min-w-0 flex-1">
                 {[
                   { subject: 'Mathematics', pct: '45%', color: '#5B2CFF', mins: '324 min' },
                   { subject: 'Biology', pct: '32%', color: '#3B82F6', mins: '230 min' },
                   { subject: 'English', pct: '23%', color: '#1EC592', mins: '166 min' },
                 ].map(({ subject, pct, color, mins }) => (
                   <div key={subject} className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                     <span className="text-sm text-neutral-700 truncate flex-1">{subject}</span>
                     <span className="text-xs text-neutral-500 shrink-0">{mins}</span>
                     <span className="text-sm font-semibold text-neutral-800 w-10 text-right shrink-0">{pct}</span>
                   </div>
                 ))}
                 <div className="pt-2 border-t border-neutral-100 flex justify-between text-xs text-neutral-500">
                   <span>18 sessions</span>
                   <span>720 min total</span>
                 </div>
               </div>
             </div>
           </DemoPanel>
         </SubSection>

         {/* Momentum Widget */}
         <SubSection title="Momentum Widget">
           <SourceTag path="src/components/parent/insights/MomentumWidget.tsx" />
           <DemoPanel>
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-base font-bold text-neutral-800">Study Momentum</h3>
               <Badge variant="primary" badgeStyle="soft">5-day streak</Badge>
             </div>
             <ChartPlaceholder height="h-32" label="Activity chart — sessions per day over the period" />
             <div className="grid grid-cols-3 gap-3 mt-4">
               {[
                 { label: 'Current Streak', value: '5 days', icon: 'flame' as IconKey, color: 'text-accent-amber' },
                 { label: 'Longest Streak', value: '12 days', icon: 'trophy' as IconKey, color: 'text-primary-600' },
                 { label: 'Active Days', value: '14/28', icon: 'calendar-check' as IconKey, color: 'text-accent-green' },
               ].map(({ label, value, icon, color }) => (
                 <div key={label} className="bg-neutral-50 rounded-xl p-3 text-center">
                   <AppIcon name={icon} className={`w-5 h-5 ${color} mx-auto mb-1`} />
                   <p className="text-base font-bold text-neutral-800">{value}</p>
                   <p className="text-xs text-neutral-500">{label}</p>
                 </div>
               ))}
             </div>
           </DemoPanel>
         </SubSection>

         {/* Focus Mode Widget */}
         <SubSection title="Focus Mode Widget">
           <SourceTag path="src/components/parent/insights/FocusModeWidget.tsx" />
           <DemoPanel>
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-base font-bold text-neutral-800">Focus Mode Usage</h3>
               <span className="text-sm font-semibold text-primary-600">61%</span>
             </div>
             <div className="flex items-center gap-4 mb-4">
               <CircularProgress value={61} size="lg" color="primary">
                 <span className="text-xl font-bold text-primary-900">61%</span>
               </CircularProgress>
               <div className="space-y-2 flex-1">
                 <div>
                   <div className="flex justify-between text-xs text-neutral-500 mb-1">
                     <span>Focus Mode sessions</span>
                     <span>11 / 18</span>
                   </div>
                   <ProgressBar value={61} color="primary" size="sm" />
                 </div>
                 <div>
                   <div className="flex justify-between text-xs text-neutral-500 mb-1">
                     <span>Avg focus duration</span>
                     <span>38 min</span>
                   </div>
                   <ProgressBar value={76} color="success" size="sm" />
                 </div>
               </div>
             </div>
             <ChartPlaceholder height="h-24" label="Bar chart — Focus Mode usage over time" />
           </DemoPanel>
         </SubSection>

         {/* Tutor Advice Widget */}
         <SubSection title="Tutor Advice Widget">
           <SourceTag path="src/components/parent/insights/TutorAdviceWidget.tsx" />
           <DemoPanel>
             <div className="flex items-start gap-3">
               <IconCircle name="lightbulb" color="primary" variant="soft" size="md" />
               <div>
                 <h3 className="text-base font-bold text-neutral-800 mb-1">AI Tutor Advice</h3>
                 <p className="text-sm text-neutral-600">
                   Alex is making excellent progress in Mathematics — keep the current 3 sessions/week pace.
                   English Literature is the weakest subject right now; consider adding one extra session this week to build confidence before the mock exams.
                 </p>
                 <div className="mt-3 flex flex-wrap gap-2">
                   <Badge variant="primary" badgeStyle="soft" icon="book-open">Mathematics: Strong</Badge>
                   <Badge variant="warning" badgeStyle="soft" icon="triangle-alert">English: Needs Focus</Badge>
                   <Badge variant="success" badgeStyle="soft" icon="check-circle">Biology: On Track</Badge>
                 </div>
               </div>
             </div>
           </DemoPanel>
         </SubSection>

         {/* Confidence Heatmap */}
         <SubSection title="Confidence Heatmap">
           <SourceTag path="src/components/parent/insights/ConfidenceHeatmapWidget.tsx" />
           <DemoPanel>
             <h3 className="text-base font-bold text-neutral-800 mb-4">Topic Confidence Map</h3>
             <div className="space-y-3">
               {[
                 { subject: 'Mathematics', topics: [{ name: 'Quadratic Eq.', score: 4 }, { name: 'Trigonometry', score: 3 }, { name: 'Circle Theorems', score: 2 }, { name: 'Vectors', score: 5 }] },
                 { subject: 'English Lit.', topics: [{ name: 'Macbeth', score: 2 }, { name: 'An Inspector Calls', score: 1 }, { name: 'Poetry', score: 3 }] },
                 { subject: 'Biology', topics: [{ name: 'Photosynthesis', score: 4 }, { name: 'Cell Division', score: 3 }, { name: 'Genetics', score: 2 }] },
               ].map(({ subject, topics }) => (
                 <div key={subject}>
                   <p className="text-xs font-semibold text-neutral-600 mb-1.5">{subject}</p>
                   <div className="flex flex-wrap gap-1.5">
                     {topics.map(({ name, score }) => {
                       const colors = ['', 'bg-error-bg text-error border-error-border', 'bg-warning-bg text-warning border-warning-border', 'bg-neutral-100 text-neutral-600 border-neutral-200', 'bg-success-bg text-success border-success-border', 'bg-primary-50 text-primary-700 border-primary-200'];
                       return (
                         <span key={name} className={`text-xs px-2 py-1 rounded-lg border font-medium ${colors[score]}`}>
                           {name}
                         </span>
                       );
                     })}
                   </div>
                 </div>
               ))}
               <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
                 <span className="text-xs text-neutral-500">Confidence:</span>
                 {[{ label: 'Low', cls: 'bg-error-bg text-error' }, { label: 'Med', cls: 'bg-warning-bg text-warning' }, { label: 'OK', cls: 'bg-neutral-100 text-neutral-600' }, { label: 'High', cls: 'bg-success-bg text-success' }].map(({ label, cls }) => (
                   <span key={label} className={`text-xs px-2 py-0.5 rounded ${cls}`}>{label}</span>
                 ))}
               </div>
             </div>
           </DemoPanel>
         </SubSection>
       </Section>

       {/* ════════════════════════════════ PRICING ════════════════════════════════ */}
       <Section id="mod-pricing" title="Pricing">
         <p className="text-sm text-neutral-500 -mt-2">
           The two subscription tier cards shown on the Pricing page.
         </p>

         <SubSection title="Pricing Cards">
           <SourceTag path="src/views/parent/Pricing.tsx" />
           {/* Plan length selector */}
           <div className="flex justify-center mb-6">
             <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl">
               {['1 Month', '3 Months', '12 Months'].map((label, i) => (
                 <button
                   key={label}
                   className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${i === 2 ? 'bg-neutral-0 text-neutral-800 shadow-sm' : 'text-neutral-500'}`}
                 >
                   {label}
                 </button>
               ))}
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
             {/* Family card */}
             <div className="bg-neutral-0 rounded-2xl border-2 border-neutral-200 p-8 flex flex-col">
               <div className="mb-6">
                 <h3 className="text-xl font-bold text-neutral-800 mb-1">Family</h3>
                 <p className="text-sm text-neutral-500">Everything you need to support your child&apos;s revision.</p>
               </div>
               <div className="text-center mb-6">
                 <div className="flex items-baseline justify-center gap-1">
                   <span className="text-4xl font-bold text-primary-900">£5.99</span>
                   <span className="text-neutral-600">/month</span>
                 </div>
                 <p className="text-sm text-neutral-500 mt-1">£71.88 total</p>
                 <span className="inline-block mt-2 px-3 py-1 bg-accent-green/10 text-accent-green text-sm font-medium rounded-full">
                   Save 40% vs monthly
                 </span>
               </div>
               <ul className="space-y-2.5 mb-8 flex-1">
                 {['Unlimited children', 'Unlimited subjects', 'Full parent dashboard', 'Study Buddy (text)', 'AI Tutor for parents (text)', 'Progress tracking & rewards'].map((feature) => (
                   <li key={feature} className="flex items-center gap-2.5 text-sm text-neutral-700">
                     <AppIcon name="check-circle" className="w-4 h-4 text-accent-green shrink-0" />
                     {feature}
                   </li>
                 ))}
               </ul>
               <button className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors">
                 Start Free Trial
               </button>
             </div>

             {/* Premium card */}
             <div className="bg-primary-900 rounded-2xl border-2 border-primary-700 p-8 flex flex-col relative overflow-hidden">
               <div className="absolute top-4 right-4">
                 <span className="px-2.5 py-1 bg-primary-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                   Best Value
                 </span>
               </div>
               <div className="mb-6">
                 <h3 className="text-xl font-bold text-white mb-1">Premium</h3>
                 <p className="text-sm text-primary-300">Voice AI, advanced analytics, and priority support.</p>
               </div>
               <div className="text-center mb-6">
                 <div className="flex items-baseline justify-center gap-1">
                   <span className="text-4xl font-bold text-white">£9.99</span>
                   <span className="text-primary-300">/month</span>
                 </div>
                 <p className="text-sm text-primary-400 mt-1">£119.88 total</p>
                 <span className="inline-block mt-2 px-3 py-1 bg-white/10 text-primary-200 text-sm font-medium rounded-full">
                   Save 44% vs monthly
                 </span>
               </div>
               <ul className="space-y-2.5 mb-8 flex-1">
                 {['Everything in Family, plus:', 'Voice AI (parents + children)', 'Create custom AI mnemonics', 'Advanced analytics', 'Benchmark comparisons', 'Token top-ups', 'Priority support'].map((feature, i) => (
                   <li key={feature} className={`flex items-center gap-2.5 text-sm ${i === 0 ? 'text-primary-300 font-medium' : 'text-white'}`}>
                     {i > 0 && <AppIcon name="check-circle" className="w-4 h-4 text-primary-400 shrink-0" />}
                     {i === 0 && <span className="w-4 shrink-0" />}
                     {feature}
                   </li>
                 ))}
               </ul>
               <button className="w-full py-3 bg-white text-primary-900 rounded-xl font-semibold hover:bg-primary-50 transition-colors">
                 Start Free Trial
               </button>
             </div>
           </div>
         </SubSection>
       </Section>

     </main>
   </div>
 )}

 </div>
 </PageLayout>
 );
}
