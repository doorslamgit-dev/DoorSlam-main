

// src/views/parent/ParentSettingsPage.tsx
// Refactored: Extracted components and hooks for better maintainability
// January 2026

import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Alert from "../../components/ui/Alert";
import AppIcon from "../../components/ui/AppIcon";
import { useAuth } from "../../contexts/AuthContext";
import { PageLayout } from "../../components/layout";
import {
  AdvancedAnalyticsSection,
  NotificationsSection,
  SecuritySection,
  DangerZoneSection,
} from "../../components/settings";
import { useSettingsData } from "../../hooks/useSettingsData";
import ParentalControlsSection from "../../components/parent/settings/ParentalControlsSection";
import { useSubscriptionContext } from "../../contexts/SubscriptionContext";

export default function ParentSettingsPage() {
  const navigate = useNavigate();
  const { user, isParent, loading: authLoading } = useAuth();
  const { canUseParentalControls } = useSubscriptionContext();

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
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading settings...</p>
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
            <AppIcon
              name="settings"
              className="w-6 h-6 text-primary"
            />
            <h1 className="text-2xl font-bold text-primary">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your preferences, notifications, and security
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
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

          {/* Parental Controls Section */}
          <ParentalControlsSection
            parentId={user.id}
            children={children.map((c) => ({
              child_id: c.id,
              child_name: c.preferred_name || c.first_name,
            }))}
            canUse={canUseParentalControls}
          />

          {/* Security Section */}
          <SecuritySection />

          {/* Design Guidelines */}
          <div className="bg-background rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AppIcon name="palette" className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-semibold text-foreground">Design Guidelines</h2>
                  <p className="text-sm text-muted-foreground">
                    Component library and design token reference
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/parent/design-guidelines')}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary transition-colors"
              >
                View
                <AppIcon name="arrow-right" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <DangerZoneSection />
        </div>
      </main>
    </PageLayout>
  );
}
