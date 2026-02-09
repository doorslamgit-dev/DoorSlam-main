'use client';

// src/components/session/SessionHeader.tsx

import { useMemo } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "../../contexts/AuthContext";

interface SessionHeaderProps {
  subjectName: string;
  subjectIcon?: string;
  sessionInfo?: string;
  showBack?: boolean;
  showExit?: boolean;
  onExit?: () => void;
  onHelp?: () => void;
}

function getDisplayName(profile: any): string {
  const raw =
    profile?.preferred_name ||
    profile?.first_name ||
    profile?.full_name ||
    (typeof profile?.email === "string" ? profile.email.split("@")[0] : null) ||
    "Student";

  return String(raw).trim() || "Student";
}

export default function SessionHeader({
  subjectName,
  subjectIcon,
  sessionInfo,
  showBack = false,
  showExit = false,
  onExit,
  onHelp,
}: SessionHeaderProps) {
  const router = useRouter();
  const { profile } = useAuth();

  const childName = useMemo(() => getDisplayName(profile), [profile]);
  const avatarUrl = profile?.avatar_url ? String(profile.avatar_url) : null;
  const initial = childName.charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Left */}
        <div className="flex items-center gap-4 min-w-0">
          {showBack ? (
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <svg
                className="w-5 h-5 text-neutral-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          ) : null}

          {subjectIcon ? (
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl" aria-hidden="true">
                {subjectIcon}
              </span>
            </div>
          ) : null}

          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-neutral-900 truncate">
              {subjectName}
            </h1>
            {sessionInfo ? (
              <p className="text-sm text-neutral-600 truncate">{sessionInfo}</p>
            ) : null}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button
            type="button"
            onClick={onHelp}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="Help"
          >
            <svg
              className="w-5 h-5 text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {showExit ? (
            <button
              type="button"
              onClick={onExit ?? (() => router.push("/child/today"))}
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Exit session
            </button>
          ) : null}

          <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={childName}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                {initial}
              </div>
            )}
            <span className="text-sm font-medium text-neutral-900">{childName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
