// src/pages/parent/ParentSettingsPage.tsx
// Refactored: Extracted components and hooks for better maintainability
// January 2026

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faExclamationTriangle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../contexts/AuthContext";
import { PageLayout } from "../../components/layout";
import {
  AdvancedAnalyticsSection,
  NotificationsSection,
  SecuritySection,
  DangerZoneSection,
} from "../../components/settings";
import { useSettingsData } from "../../hooks/useSettingsData";

export default function ParentSettingsPage() {
  const navigate = useNavigate();
  const { user, isParent, loading: authLoading } = useAuth();

  const {
    shareAnalytics,
    notifications,
    children,
    loading,
    error,
    setShareAnalytics,
    setNotifications,
    setChildren,
    setError,
  } = useSettingsData(user?.id, isParent);

  // Redirect if not parent
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/", { replace: true });
    } else if (!isParent) {
      navigate("/child/today", { replace: true });
    }
  }, [authLoading, user, isParent, navigate]);

  // Loading state
  if (authLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-neutral-600">Loading settings...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user || !isParent) return null;

  return (
    <PageLayout>
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FontAwesomeIcon
              icon={faCog}
              className="text-primary-600 text-xl"
            />
            <h1 className="text-2xl font-bold text-primary-600">Settings</h1>
          </div>
          <p className="text-neutral-500">
            Manage your preferences, notifications, and security
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl flex items-center gap-3 bg-red-50 border border-red-200">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-accent-red"
            />
            <p className="text-sm text-accent-red">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <FontAwesomeIcon icon={faTimes} className="text-accent-red" />
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Advanced Analytics Section */}
          <AdvancedAnalyticsSection
            shareAnalytics={shareAnalytics}
            children={children}
            userId={user.id}
            onAnalyticsChange={setShareAnalytics}
            onChildrenChange={setChildren}
          />

          {/* Notifications Section */}
          <NotificationsSection
            notifications={notifications}
            shareAnalytics={shareAnalytics}
            userId={user.id}
            onUpdate={setNotifications}
            onError={setError}
          />

          {/* Security Section */}
          <SecuritySection />

          {/* Danger Zone */}
          <DangerZoneSection />
        </div>
      </main>
    </PageLayout>
  );
}
