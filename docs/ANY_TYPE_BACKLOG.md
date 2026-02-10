# TypeScript `any` Usage Backlog

**Generated**: 2026-02-09
**Total `any` usages**: 165
**Files affected**: 58
**ESLint rule**: `@typescript-eslint/no-explicit-any` (currently `warn`)
**Target**: Promote to `error` once all are resolved

---

## Pattern Breakdown

| Pattern | Count | Recommended Fix |
|---------|-------|-----------------|
| `catch (err: any)` | 59 | Replace with `catch (err: unknown)` + type guard: `err instanceof Error ? err.message : String(err)` |
| `as any` type assertions | 42 | Define proper interfaces for Supabase responses; use generics for third-party libs |
| `Record<string, any>` | 29 | Define specific payload interfaces (e.g. `StepPatch`, `SessionPayload`) |
| Function params typed `any` | 23 | Add proper parameter types from Supabase/Recharts/component props |
| Type definitions in `src/types/` | 2 | Replace with specific types — these propagate `any` throughout the codebase |
| Other | 10 | Case-by-case review |

## Priority Guide

- **P1 (High)**: Type definitions (`src/types/`) — these propagate `any` throughout the codebase
- **P2 (High)**: `Record<string, any>` in hooks/services — define proper payload shapes
- **P3 (Medium)**: `catch (err: any)` — mechanical fix with `unknown` + type guard
- **P4 (Medium)**: Service layer `as any` — need Supabase-generated types
- **P5 (Low)**: Component `as any` casts — often third-party lib compatibility

## Suggested Approach

1. **Generate Supabase types**: `supabase gen types typescript --linked > src/types/supabase.ts` — this will provide proper types for all database responses and eliminate many `as any` casts in the service layer
2. **Fix `src/types/` first**: Define proper payload/step interfaces to replace `Record<string, any>`
3. **Batch `catch` clauses**: Mechanical find-and-replace for `catch (err: any)` → `catch (err: unknown)`
4. **Fix services file-by-file**: Each service file can be typed properly with the generated Supabase types
5. **Fix components last**: Most component `any` usages depend on the service/type fixes above

---

## All Occurrences by File

### `src/components/account/`

**AddressSection.tsx** (1)

| Line | Code |
|------|------|
| 67 | `} catch (err: any) {` |

**ProfileSection.tsx** (1)

| Line | Code |
|------|------|
| 92 | `} catch (err: any) {` |

### `src/components/child/rewards/`

**RewardToast.tsx** (1)

| Line | Code |
|------|------|
| 46 | `const AudioContext = window.AudioContext \|\| (window as any).webkitAudioContext;` |

### `src/components/common/`

**TrafficLight.tsx** (3)

| Line | Code |
|------|------|
| 51 | `name={icon as any}` |
| 75 | `name={icon as any}` |
| 92 | `name={suggestionIcon() as any}` |

### `src/components/layout/`

**AppHeader.tsx** (1)

| Line | Code |
|------|------|
| 26 | `function getDisplayName(profile: any, isChild: boolean): string \| null {` |

### `src/components/parent/dashboard/`

**ChildHealthCard.tsx** (1)

| Line | Code |
|------|------|
| 129 | `const insightIcon = insightIconKey((child as any).insight_icon);` |

### `src/components/parent/insights/`

**ConfidenceTrendWidget.tsx** (3)

| Line | Code |
|------|------|
| 42 | `const CustomTooltip = ({ active, payload, label }: any) => {` |
| 89 | `["--chart-pre" as any]: COLORS.primary[300],` |
| 90 | `["--chart-post" as any]: COLORS.primary[600],` |

**SubjectBalanceWidget.tsx** (1)

| Line | Code |
|------|------|
| 30 | `const CustomTooltip = ({ active, payload }: any) => {` |

### `src/components/parentOnboarding/steps/`

**ConfirmStep.tsx** (1)

| Line | Code |
|------|------|
| 195 | `payload: any;` |

**GoalStep.tsx** (1)

| Line | Code |
|------|------|
| 108 | `name={iconKey as any}` |

**PathwaySelectionStep.tsx** (1)

| Line | Code |
|------|------|
| 283 | `} catch (e: any) {` |

**SubjectBoardStep.tsx** (20)

| Line | Code |
|------|------|
| 131 | `boards: Array.isArray((r as any).boards) ? (r as any).boards : [],` |
| 136 | `} catch (e: any) {` |
| 194 | `icon: (group as any).icon ?? null,` |
| 195 | `color: (group as any).color ?? null,` |
| 196 | `boards: Array.isArray((group as any).boards) ? (group as any).boards : [],` |
| 221 | `const subject_id = String((chosen as any).subject_id ?? "");` |
| 222 | `const exam_board_id = String((chosen as any).exam_board_id ?? "");` |
| 223 | `const exam_board_name_raw = String((chosen as any).exam_board_name ?? "");` |
| 348 | `const boardsCount = Array.isArray((g as any).boards)` |
| 349 | `? (g as any).boards.length` |
| 352 | `const icon = formatIcon((g as any).icon);` |
| 353 | `const color = (g as any).color \|\| "#7C3AED";` |
| 504 | `const name = String((b as any).exam_board_name ?? "");` |
| 508 | `.filter((b) => (b as any).exam_board_id);` |
| 510 | `const normalBoards = boards.filter((b) => !(b as any)._isNotSure);` |
| 511 | `const notSureBoards = boards.filter((b) => (b as any)._isNotSure);` |
| 516 | `{normalBoards.map((b: any) => (` |
| 529 | `{notSureOne.map((b: any) => (` |

### `src/components/session/`

**SessionHeader.tsx** (1)

| Line | Code |
|------|------|
| 17 | `function getDisplayName(profile: any): string {` |

### `src/components/settings/`

**NotificationsSection.tsx** (1)

| Line | Code |
|------|------|
| 60 | `} catch (err: any) {` |

**SecuritySection.tsx** (1)

| Line | Code |
|------|------|
| 41 | `} catch (err: any) {` |

### `src/components/shared/`

**AudioWaveform.tsx** (1)

| Line | Code |
|------|------|
| 58 | `const anyCtx = ctx as unknown as { roundRect?: (...args: any[]) => void };` |

### `src/components/subjects/`

**AddSubjectModal.tsx** (1)

| Line | Code |
|------|------|
| 378 | `} catch (err: any) {` |

**SubjectCard.tsx** (1)

| Line | Code |
|------|------|
| 93 | `style={{ color: subjectColor } as any}` |

### `src/components/timetable/`

**EditScheduleModal.tsx** (2)

| Line | Code |
|------|------|
| 70 | `} catch (err: any) {` |
| 136 | `} catch (err: any) {` |

### `src/contexts/`

**AuthContext.tsx** (3)

| Line | Code |
|------|------|
| 41 | `signIn: (email: string, password: string) => Promise<{ error: any }>;` |
| 42 | `signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: any }>;` |

### `src/hooks/child/practicestep/`

**usePracticeStep.ts** (1)

| Line | Code |
|------|------|
| 14 | `onPatch: (patch: Record<string, any>) => void;` |

### `src/hooks/child/previewstep/`

**usePreviewStep.ts** (1)

| Line | Code |
|------|------|
| 8 | `onPatch: (patch: Record<string, any>) => Promise<void>;` |

### `src/hooks/child/recallStep/`

**useRecallStep.ts** (1)

| Line | Code |
|------|------|
| 10 | `onPatch: (patch: Record<string, any>) => void;` |

### `src/hooks/child/reinforcestep/`

**useReinforceStep.ts** (1)

| Line | Code |
|------|------|
| 9 | `onPatch: (patch: Record<string, any>) => void;` |

### `src/hooks/child/`

**useSessionRun.ts** (2)

| Line | Code |
|------|------|
| 34 | `handlePatchStep: (stepKey: StepKey, patch: Record<string, any>) => Promise<void>;` |
| 86 | `async (stepKey: StepKey, patch: Record<string, any>) => {` |

### `src/hooks/`

**useAccountData.ts** (1)

| Line | Code |
|------|------|
| 94 | `} catch (err: any) {` |

**useFormField.ts** (1)

| Line | Code |
|------|------|
| 67 | `export function useFormField<T extends Record<string, any>>(` |

**useSettingsData.ts** (1)

| Line | Code |
|------|------|
| 84 | `} catch (err: any) {` |

### `src/pages/`

**Login.tsx** (1)

| Line | Code |
|------|------|
| 36 | `} catch (e: any) {` |

**SignUp.tsx** (1)

| Line | Code |
|------|------|
| 46 | `} catch (e: any) {` |

### `src/pages/child/`

**ChildRewardsCatalog.tsx** (5)

| Line | Code |
|------|------|
| 93 | `setPendingRedemptions(pendData.filter((r: any) => r.status === 'pending'));` |
| 94 | `setHistory(pendData.filter((r: any) => r.status !== 'pending'));` |
| 104 | `} catch (err: any) {` |
| 132 | `} catch (err: any) {` |
| 159 | `} catch (err: any) {` |

**ChildSignUp.tsx** (4)

| Line | Code |
|------|------|
| 53 | `parent_name: (preview as any).parent_name \|\| "Your parent",` |
| 54 | `child_name: (preview as any).child_first_name \|\| "Student",` |
| 57 | `} catch (e: any) {` |
| 117 | `} catch (err: any) {` |

**SessionRun.tsx** (8)

| Line | Code |
|------|------|
| 188 | `...(sessionData.generated_payload as any),` |
| 203 | `onPatch: (patch: Record<string, any>) => handlePatchStep(currentStepKey, patch),` |
| 211 | `return <PreviewStep {...commonProps as any} />;` |
| 216 | `{...commonProps as any}` |
| 225 | `return <ReinforceStep {...commonProps as any} />;` |
| 228 | `return <PracticeStep {...commonProps as any} />;` |
| 233 | `{...commonProps as any}` |
| 255 | `{...commonProps as any}` |

### `src/pages/child/sessionSteps/`

**ReflectionStep.tsx** (2)

| Line | Code |
|------|------|
| 13 | `payload: any;` |
| 15 | `onPatch: (patch: Record<string, any>) => Promise<void>;` |

### `src/pages/parent/`

**InsightsDashboard.tsx** (3)

| Line | Code |
|------|------|
| 110 | `} catch (err: any) {` |
| 150 | `} catch (err: any) {` |
| 198 | `} catch (err: any) {` |

**InsightsReport.tsx** (1)

| Line | Code |
|------|------|
| 55 | `} catch (err: any) {` |

**ParentOnboardingPage.tsx** (4)

| Line | Code |
|------|------|
| 93 | `function formatSupabaseError(e: any): string {` |
| 383 | `const result: any = await rpcParentCreateChildAndPlan(payload as any);` |
| 403 | `} catch (e: any) {` |

**SubjectProgress.tsx** (3)

| Line | Code |
|------|------|
| 134 | `const rpcStatus = (data.child as any).status_indicator;` |
| 140 | `(data.child as any).status_label \|\| ui.badgeText \|\| "On Track";` |
| 141 | `const childStatusDetail = (data.child as any).status_detail \|\| "";` |

### `src/services/`

**addSubjectService.ts** (7)

| Line | Code |
|------|------|
| 167 | `} catch (err: any) {` |
| 199 | `} catch (err: any) {` |
| 226 | `} catch (err: any) {` |
| 255 | `} catch (err: any) {` |
| 284 | `} catch (err: any) {` |
| 311 | `} catch (err: any) {` |
| 335 | `} catch (err: any) {` |

### `src/services/child/`

**recallStep.ts** (1)

| Line | Code |
|------|------|
| 23 | `): Record<string, any> {` |

### `src/services/`

**invitationService.ts** (1)

| Line | Code |
|------|------|
| 39 | `return { ok: true, child_id: (data as any).child_id as string };` |

### `src/services/parent/`

**insightsDashboardService.ts** (10)

| Line | Code |
|------|------|
| 51 | `} catch (err: any) {` |
| 79 | `} catch (err: any) {` |
| 106 | `} catch (err: any) {` |
| 133 | `} catch (err: any) {` |
| 160 | `} catch (err: any) {` |
| 189 | `} catch (err: any) {` |
| 218 | `} catch (err: any) {` |
| 241 | `} catch (err: any) {` |
| 264 | `} catch (err: any) {` |
| 294 | `} catch (err: any) {` |

### `src/services/parentOnboarding/`

**parentOnboardingService.ts** (10)

| Line | Code |
|------|------|
| 9 | `function normaliseSupabaseError(error: any): Error {` |
| 16 | `function asString(value: any, fallback = ""): string {` |
| 85 | `settings?: any;` |
| 102 | `settings: any;` |
| 122 | `return rows.map((r: any) => ({` |
| 148 | `return rows.map((r: any) => ({` |
| 174 | `return rows.map((r: any) => ({` |
| 178 | `? r.typical_behaviours.filter(Boolean).map((x: any) => String(x))` |
| 193 | `): Promise<any> {` |
| 242 | `return rows.map((r: any) => {` |

**pathwayService.ts** (4)

| Line | Code |
|------|------|
| 35 | `function normaliseSupabaseError(error: any): Error {` |
| 62 | `return rows.map((r: any) => ({` |
| 67 | `? r.pathways.map((p: any) => ({` |
| 195 | `const result = data as any;` |

### `src/services/referenceData/`

**referenceDataService.ts** (1)

| Line | Code |
|------|------|
| 78 | `function throwIfError(error: any) {` |

### `src/services/`

**revisionSessionApi.ts** (3)

| Line | Code |
|------|------|
| 21 | `answer_summary: Record<string, any>;` |
| 41 | `generated_payload: Record<string, any>;` |
| 76 | `patch: Record<string, any>` |

**subjectProgressService.ts** (2)

| Line | Code |
|------|------|
| 30 | `} catch (err: any) {` |
| 69 | `} catch (err: any) {` |

**timetableService.ts** (17)

| Line | Code |
|------|------|
| 212 | `} catch (err: any) {` |
| 231 | `const weekData: WeekDayData[] = (data \|\| []).map((row: any) => ({` |
| 237 | `} catch (err: any) {` |
| 277 | `const sessions: TimetableSession[] = (data \|\| []).map((row: any, idx: number) => ({` |
| 293 | `} catch (err: any) {` |
| 312 | `} catch (err: any) {` |
| 342 | `} catch (err: any) {` |
| 428 | `} catch (err: any) {` |
| 451 | `} catch (err: any) {` |
| 477 | `} catch (err: any) {` |
| 497 | `} catch (err: any) {` |
| 528 | `const subjects: ChildSubjectOption[] = (data \|\| []).map((row: any) => ({` |
| 536 | `} catch (err: any) {` |
| 599 | `} catch (err: any) {` |
| 694 | `} catch (err: any) {` |
| 761 | `} catch (err: any) {` |
| 861 | `} catch (err: any) {` |

**todayService.ts** (4)

| Line | Code |
|------|------|
| 39 | `} catch (e: any) {` |
| 83 | `} catch (e: any) {` |
| 165 | `} catch (e: any) {` |
| 175 | `data: any` |

### `src/types/child/completestep/`

**completeStepTypes.ts** (1)

| Line | Code |
|------|------|
| 50 | `onPatch: (patch: Record<string, any>) => Promise<void>;` |

### `src/types/child/practicestep/`

**practiceStepTypes.ts** (2)

| Line | Code |
|------|------|
| 66 | `payload: Record<string, any>;` |
| 68 | `onPatch: (patch: Record<string, any>) => void;` |

### `src/types/child/previewstep/`

**previewStepTypes.ts** (1)

| Line | Code |
|------|------|
| 28 | `onPatch: (patch: Record<string, any>) => Promise<void>;` |

### `src/types/child/recallStep/`

**recallStepTypes.ts** (2)

| Line | Code |
|------|------|
| 34 | `payload: Record<string, any>;` |
| 36 | `onPatch: (patch: Record<string, any>) => void;` |

### `src/types/child/reinforcestep/`

**reinforceStepTypes.ts** (2)

| Line | Code |
|------|------|
| 52 | `payload: Record<string, any>;` |
| 54 | `onPatch: (patch: Record<string, any>) => void;` |

### `src/types/child/`

**sessionTypes.ts** (6)

| Line | Code |
|------|------|
| 30 | `answer_summary: Record<string, any>;` |
| 50 | `generated_payload: GeneratedPayload \| Record<string, any>;` |
| 137 | `summary: Record<string, any>;` |
| 138 | `complete: Record<string, any>;` |
| 165 | `answers: Record<string, any>;` |
| 172 | `onPatch: (patch: Record<string, any>) => void;` |

### `src/types/child/summarystep/`

**summaryStepTypes.ts** (1)

| Line | Code |
|------|------|
| 60 | `onPatch: (patch: Record<string, any>) => Promise<void>;` |

### `src/types/`

**parentOnboarding.ts** (1)

| Line | Code |
|------|------|
| 91 | `settings?: Record<string, any>; // Legacy compatibility` |

**subjectProgress.ts** (2)

| Line | Code |
|------|------|
| 106 | `focus_topics?: any[];` |
| 112 | `sessions: any[];` |
