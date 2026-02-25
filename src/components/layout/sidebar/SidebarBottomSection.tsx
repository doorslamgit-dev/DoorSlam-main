// src/components/layout/sidebar/SidebarBottomSection.tsx


import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import AppIcon from '../../ui/AppIcon';
import ThemeToggle from '../../ui/ThemeToggle';
import { useAuth } from '../../../contexts/AuthContext';
import { useSidebar } from '../../../contexts/SidebarContext';
import { useSubscription } from '../../../hooks/useSubscription';
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

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  trial: { label: 'Trial', color: 'bg-amber-100 text-amber-700' },
  family: { label: 'Family', color: 'bg-primary/10 text-primary' },
  premium: { label: 'Premium', color: 'bg-purple-100 text-purple-700' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700' },
};

export default function SidebarBottomSection() {
  const { profile, isParent, isChild, signOut } = useAuth();
  const { sidebarState } = useSidebar();
  const { tier } = useSubscription();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const isCollapsed = sidebarState === 'collapsed';
  const tierInfo = isParent ? TIER_LABELS[tier] : null;

  const displayName = isChild
    ? profile?.preferred_name || profile?.first_name || 'Student'
    : profile?.full_name?.split(' ')[0] || 'Parent';

  const avatarUrl = profile?.avatar_url;
  const initials = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setShowMenu(false);
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="mt-auto border-t border-border">
      {/* Help links (parent only, expanded sidebar only) */}
      {isParent && !isCollapsed && (
        <div className="px-3 py-3 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Help
          </p>
          {HELP_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
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
            hover:bg-accent transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} width={32} height={32} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0">
              {initials}
            </div>
          )}
          {!isCollapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                {tierInfo && (
                  <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${tierInfo.color}`}>
                    {tierInfo.label}
                  </span>
                )}
              </div>
              <AppIcon name="chevron-up" className="w-4 h-4 text-muted-foreground flex-shrink-0" />
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
                absolute bottom-full mb-2 bg-background rounded-xl shadow-sm
                border border-border py-1 z-50
                ${isCollapsed ? 'left-full ml-2 w-48' : 'left-3 right-3'}
              `}
            >
              <button
                type="button"
                onClick={() => { setShowMenu(false); navigate('/account'); }}
                className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent flex items-center gap-3"
              >
                <AppIcon name="user" className="w-4 h-4 text-muted-foreground" />
                My Account
              </button>
              {isParent && (
                <button
                  type="button"
                  onClick={() => { setShowMenu(false); navigate('/parent/settings'); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent flex items-center gap-3"
                >
                  <AppIcon name="settings" className="w-4 h-4 text-muted-foreground" />
                  Settings
                </button>
              )}
              <div className="border-t border-border my-1" />
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/5 flex items-center gap-3"
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
