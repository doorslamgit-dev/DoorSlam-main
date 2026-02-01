// src/pages/child/Today.tsx
// REFACTORED: January 2026 - Componentized structure
// FEAT-013: Added RewardsMiniCard alongside StreakMomentumCard

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { PageLayout } from "../../components/layout";
import { fetchTodayData } from "../../services/todayService";
import type { TodayData } from "../../types/today";

// Import child today components
import {
  TodayHeader,
  SessionList,
  UpcomingSection,
  EmptyState,
  LoadingState,
  ErrorState,
  StreakMomentumCard,
  RewardsMiniCard,
  TodayProgressCard,
  TodayTipCard,
} from "../../components/child/today";

export default function Today() {
  const navigate = useNavigate();
  const { user, activeChildId, isParent, profile, loading: authLoading } = useAuth();
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [redirected, setRedirected] = useState(false);

  const childId = useMemo(() => {
    if (activeChildId) return activeChildId;
    const ls = localStorage.getItem("active_child_id");
    return ls || null;
  }, [activeChildId]);

  const childName =
    profile?.preferred_name ||
    profile?.first_name ||
    profile?.full_name?.split(" ")[0] ||
    "there";

  // Handle redirects
  useEffect(() => {
    if (authLoading || redirected) return;
    if (isParent) {
      setRedirected(true);
      navigate("/parent", { replace: true });
    }
  }, [authLoading, isParent, navigate, redirected]);

  // Load data
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (authLoading) return;
      if (!childId) {
        setData(null);
        if (user) {
          setError("Loading your profile...");
        } else {
          setError("Please log in to see your sessions.");
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const result = await fetchTodayData(childId);

      if (!mounted) return;

      if (result.error) {
        setError(result.error);
        setData(null);
      } else {
        setData(result.data);
        setError("");
      }

      setLoading(false);
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [authLoading, user, childId]);

  const handleStartSession = (plannedSessionId: string) => {
    navigate(`/child/session/${plannedSessionId}`);
  };

  // Extract data for rendering
  const todaySessions = data?.todaySessions ?? [];
  const upcomingDays = data?.upcomingDays ?? [];
  const gamification = data?.gamification ?? null;

  // Calculate progress
  const completedCount = todaySessions.filter((s) => s.status === "completed").length;
  const totalCount = todaySessions.length;

  // Find next ready session
  const nextSession = todaySessions.find(
    (s) => s.status === "not_started" || s.status === "started"
  );

  // Current streak
  const currentStreak = gamification?.streak?.current ?? 0;

  // Loading state
  if (authLoading || loading) {
    return (
      <PageLayout bgColor="bg-neutral-100">
        <LoadingState message="Loading your sessions..." />
      </PageLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PageLayout bgColor="bg-neutral-100">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </PageLayout>
    );
  }

  return (
    <PageLayout bgColor="bg-neutral-100">
      <main className="max-w-[1120px] mx-auto px-4 py-6">
        
        {/* Header with greeting and streak badge */}
        <TodayHeader 
          childName={childName} 
          currentStreak={currentStreak} 
        />

        {/* Today's Sessions Card */}
        <section className="mb-8">
          <SessionList
            sessions={todaySessions}
            nextSessionId={nextSession?.planned_session_id}
            onStartSession={handleStartSession}
          />
        </section>

        {/* Coming Up Next */}
        {upcomingDays.length > 0 && (
          <section className="mb-8">
            <UpcomingSection days={upcomingDays.slice(0, 3)} />
          </section>
        )}

        {/* This Week's Progress */}
        <section className="mb-8">
          <TodayProgressCard
            completedToday={completedCount}
            totalToday={totalCount}
            currentStreak={currentStreak}
          />
        </section>

        {/* Streak & Rewards Row - Two Column Layout */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Streak Momentum Card */}
            <StreakMomentumCard
              currentStreak={currentStreak}
              completedToday={completedCount}
              totalToday={totalCount}
            />
            
            {/* Rewards Mini Card */}
            {childId && <RewardsMiniCard childId={childId} />}
          </div>
        </section>

        {/* Today's Tip */}
        <section className="mb-8">
          <TodayTipCard />
        </section>

      </main>
    </PageLayout>
  );
}