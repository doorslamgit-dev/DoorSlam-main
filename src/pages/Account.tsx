// src/pages/Account.tsx
// Refactored: Extracted components and hooks for better maintainability
// January 2026

import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faExclamationTriangle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../contexts/AuthContext";
import { PageLayout } from "../components/layout";
import {
  AvatarUpload,
  ProfileSection,
  AddressSection,
} from "../components/account";
import { useAccountData } from "../hooks/useAccountData";
import type { ProfileData, ChildProfileData } from "../hooks/useAccountData";

export default function Account() {
  const navigate = useNavigate();
  const { user, isChild, isParent, loading: authLoading, refresh } = useAuth();

  const {
    parentData,
    childData,
    childId,
    loading,
    error,
    setParentData,
    setChildData,
    setError,
  } = useAccountData(user?.id, isParent, isChild);

  // Redirect if not logged in
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Handle avatar change - refresh header
  const handleAvatarChange = async (newUrl: string | null) => {
    if (isParent && parentData) {
      setParentData({ ...parentData, avatar_url: newUrl });
    } else if (childData) {
      setChildData({ ...childData, avatar_url: newUrl });
    }
    await refresh();
  };

  // Handle profile data updates
  const handleProfileUpdate = (data: ProfileData | ChildProfileData) => {
    if (isParent) {
      setParentData(data as ProfileData);
    } else {
      setChildData(data as ChildProfileData);
    }
  };

  // Handle address data updates
  const handleAddressUpdate = (data: ProfileData) => {
    setParentData(data);
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-neutral-600">Loading account...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user) return null;

  const displayName =
    isParent
      ? parentData?.full_name
      : childData?.preferred_name || childData?.first_name;
  const avatarUrl = isParent ? parentData?.avatar_url : childData?.avatar_url;
  const userId = isParent ? user.id : childId;

  return (
    <PageLayout>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-primary-600">
              My Account
            </h1>
            <p className="text-neutral-500">Manage your profile information</p>
          </div>

          {/* Settings link for parents */}
          {isParent && (
            <Link
              to="/parent/settings"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
            >
              <FontAwesomeIcon icon={faCog} />
              <span className="font-medium">Settings</span>
            </Link>
          )}
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

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Avatar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-6">
              <AvatarUpload
                currentAvatarUrl={avatarUrl || null}
                userId={userId || ""}
                userType={isParent ? "parent" : "child"}
                userName={displayName || "User"}
                onAvatarChange={handleAvatarChange}
              />

              {/* Display name under avatar */}
              <div className="text-center mt-4 pt-4 border-t border-neutral-200">
                <h2 className="text-lg font-semibold text-neutral-700">
                  {displayName}
                </h2>
                <p className="text-sm text-neutral-500">
                  {isParent ? "Parent Account" : "Student Account"}
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <ProfileSection
              isParent={isParent}
              isChild={isChild}
              parentData={parentData}
              childData={childData}
              childId={childId}
              userId={user.id}
              onUpdate={handleProfileUpdate}
              onError={setError}
            />

            {/* Address Section (Parents only) */}
            {isParent && parentData && (
              <AddressSection
                parentData={parentData}
                userId={user.id}
                onUpdate={handleAddressUpdate}
                onError={setError}
              />
            )}

            {/* Link to Settings for parents */}
            {isParent && (
              <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-700">
                      Looking for notifications, security, or analytics?
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1">
                      These settings have moved to a dedicated page
                    </p>
                  </div>
                  <Link
                    to="/parent/settings"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={faCog} />
                    Go to Settings
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
