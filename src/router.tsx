import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import HomePage from '@/views/HomePage';

const Login = lazy(() => import('@/views/Login'));
const SignUp = lazy(() => import('@/views/SignUp'));
const Pricing = lazy(() => import('@/views/parent/Pricing'));
const Account = lazy(() => import('@/views/Account'));

const AdminDashboard = lazy(() => import('@/views/admin/AdminDashboard'));
const CurriculumAdmin = lazy(() => import('@/views/admin/CurriculumAdmin'));

const ParentDashboardV3 = lazy(() =>
  import('@/views/parent/ParentDashboardV3').then((m) => ({ default: m.ParentDashboardV3 }))
);
const ParentOnboardingPage = lazy(() => import('@/views/parent/ParentOnboardingPage'));
const InsightsDashboard = lazy(() => import('@/views/parent/InsightsDashboard'));
const InsightsReport = lazy(() => import('@/views/parent/InsightsReport'));
const RewardManagement = lazy(() =>
  import('@/views/parent/RewardManagement').then((m) => ({ default: m.RewardManagement }))
);
const ParentSettingsPage = lazy(() => import('@/views/parent/ParentSettingsPage'));
const DesignGuidelines = lazy(() => import('@/views/parent/DesignGuidelines'));
const SubjectProgress = lazy(() => import('@/views/parent/SubjectProgress'));
const Timetable = lazy(() => import('@/views/parent/Timetable'));

const Today = lazy(() => import('@/views/child/Today'));
const ChildTimetable = lazy(() => import('@/views/child/ChildTimetable'));
const ChildRewardsCatalog = lazy(() =>
  import('@/views/child/ChildRewardsCatalog').then((m) => ({ default: m.ChildRewardsCatalog }))
);
const ChildSignUp = lazy(() => import('@/views/child/ChildSignUp'));
const SessionRun = lazy(() => import('@/views/child/SessionRun'));

function SessionRunRedirect() {
  const { plannedSessionId } = useParams();
  return <Navigate to={`/child/session/${plannedSessionId}`} replace />;
}

export function AppRouter() {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
            Loading...
          </div>
        }
      >
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/account" element={<Account />} />

          {/* Parent routes */}
          <Route path="/parent" element={<ParentDashboardV3 />} />
          <Route path="/parent/onboarding" element={<ParentOnboardingPage />} />
          <Route path="/parent/insights" element={<InsightsDashboard />} />
          <Route path="/parent/insights/report" element={<InsightsReport />} />
          <Route path="/parent/rewards" element={<RewardManagement />} />
          <Route path="/parent/settings" element={<ParentSettingsPage />} />
          <Route path="/parent/design-guidelines" element={<DesignGuidelines />} />
          <Route path="/parent/subjects" element={<SubjectProgress />} />
          <Route path="/parent/timetable" element={<Timetable />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="curriculum" element={<CurriculumAdmin />} />
          </Route>

          {/* Child routes */}
          <Route path="/child/today" element={<Today />} />
          <Route path="/child/timetable" element={<ChildTimetable />} />
          <Route path="/child/rewards" element={<ChildRewardsCatalog />} />
          <Route path="/child/signup" element={<ChildSignUp />} />
          <Route path="/child/session/:plannedSessionId" element={<SessionRun />} />
          <Route
            path="/child/session/:plannedSessionId/run"
            element={<SessionRunRedirect />}
          />

          {/* Catch-all: redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}
