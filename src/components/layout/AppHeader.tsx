'use client';

// src/components/layout/AppHeader.tsx
// Shows ParentNav for parents, ChildNav for children
// Shows avatar image when available, otherwise initials
// Updated 15 Jan 2026: Settings link now goes to /parent/settings
// FEAT-010: AppIcon (Lucide) + theme-ready classes (no FontAwesome, no hex)
// FEAT-013: Added points badge for child users

import { useState, useRef, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppIcon from "../ui/AppIcon";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import ParentNav from "./ParentNav";
import ChildNav from "./ChildNav";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

function getDisplayName(profile: any, isChild: boolean): string | null {
  if (!profile) return null;

  if (isChild) {
    return profile.preferred_name || profile.first_name || "Student";
  }

  if (profile.full_name) {
    return profile.full_name.split(" ")[0];
  }
  if (profile.email) {
    return profile.email.split("@")[0];
  }

  return "Parent";
}

export default function AppHeader() {
  const router = useRouter();
  const { user, profile, loading, isChild, isParent, activeChildId, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pointsBalance, setPointsBalance] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!user;
  const displayName = getDisplayName(profile, isChild);
  const initials = displayName ? getInitials(displayName) : "?";
  const isProfileLoading = isLoggedIn && !profile;

  const avatarUrl: string | null = profile?.avatar_url ?? null;

  // Fetch points balance for child users
  useEffect(() => {
    async function fetchPoints() {
      if (!isChild || !activeChildId) {
        setPointsBalance(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('child_points')
          .select('points_balance')
          .eq('child_id', activeChildId)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows found, which is fine (0 points)
          console.error('Error fetching points:', error);
        }

        setPointsBalance(data?.points_balance ?? 0);
      } catch (err) {
        console.error('Failed to fetch points:', err);
        setPointsBalance(0);
      }
    }

    fetchPoints();
  }, [isChild, activeChildId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSignOut() {
    setDropdownOpen(false);
    router.replace("/");
    signOut();
  }

  const headerBg = isChild
    ? "bg-primary-50 border-primary-200/40"
    : "bg-neutral-0 border-neutral-200/60";

  const avatarBg = isChild
    ? "bg-gradient-to-br from-primary-500 to-primary-700"
    : "bg-primary-600";

  const AvatarCircle = () => {
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={displayName || "Avatar"}
          className="w-9 h-9 rounded-full object-cover border border-neutral-0 shadow-soft"
        />
      );
    }

    return (
      <div
        className={`w-9 h-9 ${avatarBg} rounded-full flex items-center justify-center text-white text-sm font-semibold`}
      >
        {initials}
      </div>
    );
  };

  return (
    <header className={`${headerBg} border-b sticky top-0 z-50`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-8">
          <Link href="/"
            className="flex items-center gap-3 text-primary-900 hover:opacity-80 transition-opacity"
          >
            {/* Logo - dark version for light mode, light version for dark mode */}
            <img
              src="/images/logo-dark.png"
              alt="Doorslam"
              className="h-14 w-auto dark:hidden"
            />
            <img
              src="/images/logo-light.png"
              alt="Doorslam"
              className="h-14 w-auto hidden dark:block"
            />

            <div>
              <div className="text-xl font-bold leading-tight">
                Doorslam
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Revision without the drama
              </div>
            </div>
          </Link>

          {isLoggedIn && isParent && <ParentNav />}
          {isLoggedIn && isChild && <ChildNav />}
        </div>

        {/* Right side */}
        {loading ? (
          <div className="w-9 h-9 flex items-center justify-center">
            <AppIcon
              name="loader"
              className="w-5 h-5 text-neutral-400 animate-spin"
              aria-hidden
            />
          </div>
        ) : !isLoggedIn ? (
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="px-4 py-2 rounded-xl text-neutral-700 hover:bg-neutral-50 text-sm font-medium"
            >
              Log in
            </Link>
            <Link href="/signup"
              className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign up
            </Link>
          </div>
        ) : isProfileLoading ? (
          <div className="w-9 h-9 flex items-center justify-center">
            <AppIcon
              name="loader"
              className="w-5 h-5 text-neutral-400 animate-spin"
              aria-hidden
            />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Points badge - child only */}
            {isChild && pointsBalance !== null && (
              <Link href="/child/rewards"
                className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1.5 rounded-full transition-colors"
              >
                <AppIcon name="star" className="w-4 h-4" aria-hidden />
                <span className="font-bold text-sm">{pointsBalance}</span>
              </Link>
            )}

            {/* Theme toggle */}
            <ThemeToggle variant="icon" />

            {/* Avatar dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-50"
              >
                <AvatarCircle />

                <span className="text-sm font-medium text-neutral-700 hidden sm:block">
                  {displayName}
                </span>

                <AppIcon
                  name="chevron-down"
                  className={`w-4 h-4 text-neutral-400 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-neutral-0 rounded-xl shadow-card border border-neutral-200/60 py-1 z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push("/account");
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-3"
                  >
                    <AppIcon
                      name="user"
                      className="w-4 h-4 text-neutral-400"
                      aria-hidden
                    />
                    My Account
                  </button>

                  {isParent && (
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/parent/settings");
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-3"
                    >
                      <AppIcon
                        name="settings"
                        className="w-4 h-4 text-neutral-400"
                        aria-hidden
                      />
                      Settings
                    </button>
                  )}

                  <div className="border-t border-neutral-200/60 my-1" />

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full px-4 py-2.5 text-left text-sm text-accent-amber hover:bg-accent-amber/10 flex items-center gap-3"
                  >
                    <AppIcon name="log-out" className="w-4 h-4" aria-hidden />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}