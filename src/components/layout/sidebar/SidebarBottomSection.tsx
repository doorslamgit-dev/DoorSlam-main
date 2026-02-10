// src/components/layout/sidebar/SidebarBottomSection.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppIcon from '../../ui/AppIcon';
import ThemeToggle from '../../ui/ThemeToggle';
import { useAuth } from '../../../contexts/AuthContext';
import { useSidebar } from '../../../contexts/SidebarContext';
import type { IconKey } from '../../ui/AppIcon';

interface HelpLink {
  href: string;
  icon: IconKey;
  label: string;
}

const HELP_LINKS: HelpLink[] = [
  { href: '/help/getting-started', icon: 'rocket', label: 'Getting started' },
  { href: '/help/supporting-your-child', icon: 'heart', label: 'Supporting your child' },
  { href: '/help/understanding-progress', icon: 'chart-line', label: 'Understanding progress' },
  { href: '/parent/settings', icon: 'settings', label: 'Settings' },
];

export default function SidebarBottomSection() {
  const { profile, isParent, isChild, signOut } = useAuth();
  const { sidebarState } = useSidebar();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const isCollapsed = sidebarState === 'collapsed';

  const displayName = isChild
    ? profile?.preferred_name || profile?.first_name || 'Student'
    : profile?.full_name?.split(' ')[0] || 'Parent';

  const avatarUrl = profile?.avatar_url;
  const initials = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setShowMenu(false);
    await signOut();
    router.replace('/');
  };

  return (
    <div className="mt-auto border-t border-neutral-200/60">
      {/* Help links (parent only, expanded sidebar only) */}
      {isParent && !isCollapsed && (
        <div className="px-3 py-3 space-y-1">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">
            Help
          </p>
          {HELP_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <AppIcon name={link.icon} className="w-4 h-4 flex-shrink-0" />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Theme toggle */}
      <div className={`px-3 py-2 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <ThemeToggle variant="icon" />
      </div>

      {/* User identity section */}
      <div className="px-3 py-3 relative">
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            hover:bg-neutral-100 transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {initials}
            </div>
          )}
          {!isCollapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-neutral-700 truncate">{displayName}</p>
                <p className="text-xs text-neutral-400">{isParent ? 'Parent' : 'Student'}</p>
              </div>
              <AppIcon name="chevron-up" className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            </>
          )}
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <>
            {/* Backdrop to close menu */}
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />

            <div
              className={`
                absolute bottom-full mb-2 bg-neutral-0 rounded-xl shadow-card
                border border-neutral-200/60 py-1 z-50
                ${isCollapsed ? 'left-full ml-2 w-48' : 'left-3 right-3'}
              `}
            >
              <button
                type="button"
                onClick={() => { setShowMenu(false); router.push('/account'); }}
                className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-3"
              >
                <AppIcon name="user" className="w-4 h-4 text-neutral-400" />
                My Account
              </button>
              {isParent && (
                <button
                  type="button"
                  onClick={() => { setShowMenu(false); router.push('/parent/settings'); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-3"
                >
                  <AppIcon name="settings" className="w-4 h-4 text-neutral-400" />
                  Settings
                </button>
              )}
              <div className="border-t border-neutral-200/60 my-1" />
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full px-4 py-2.5 text-left text-sm text-danger hover:bg-danger/5 flex items-center gap-3"
              >
                <AppIcon name="log-out" className="w-4 h-4" />
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
