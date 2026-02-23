// src/components/layout/sidebar/SidebarNav.tsx

import { useNavigate, useLocation } from 'react-router-dom';
import AppIcon from '../../ui/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { useSubscription } from '../../../hooks/useSubscription';
import { useSelectedChild } from '../../../contexts/SelectedChildContext';
import { useSidebar } from '../../../contexts/SidebarContext';
import SidebarNavItem from './SidebarNavItem';
import type { IconKey } from '../../ui/AppIcon';

interface NavItem {
  href: string;
  icon: IconKey;
  label: string;
  exact?: boolean;
}

const PARENT_NAV: NavItem[] = [
  { href: '/parent', icon: 'home', label: 'Dashboard', exact: true },
  { href: '/parent/subjects', icon: 'book-open', label: 'Subjects' },
  { href: '/parent/timetable', icon: 'calendar', label: 'Timetable' },
  { href: '/parent/rewards', icon: 'gift', label: 'Rewards' },
  { href: '/parent/insights', icon: 'chart-bar', label: 'Insights' },
];

const CHILD_NAV: NavItem[] = [
  { href: '/child/today', icon: 'calendar', label: 'Today', exact: true },
  { href: '/child/rewards', icon: 'gift', label: 'Rewards' },
];

export default function SidebarNav() {
  const { isChild, isParent } = useAuth();
  const { tier } = useSubscription();
  const { sidebarState } = useSidebar();
  const {
    children: childList,
    selectedChildId,
    selectedChildAvatarUrl,
    selectedChildName,
    setSelectedChildId,
  } = useSelectedChild();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const items = isChild ? CHILD_NAV : PARENT_NAV;
  const isCollapsed = sidebarState === 'collapsed';

  const needsUpgrade = isParent && (tier === "trial" || tier === "expired");
  const hasPlan = isParent && (tier === "family" || tier === "premium");

  const handleChildChange = (childId: string) => {
    setSelectedChildId(childId);
    if (pathname.startsWith('/parent')) {
      navigate(`${pathname}?child=${childId}`);
    }
  };

  const initials = selectedChildName.charAt(0).toUpperCase();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {/* Child selector (parent only) */}
      {isParent && childList.length > 0 && !isCollapsed && (
        <div className="flex items-center gap-2 mb-2 px-1">
          {/* Selected child avatar */}
          {selectedChildAvatarUrl ? (
            <img
              src={selectedChildAvatarUrl}
              alt=""
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {initials}
            </div>
          )}
          {/* Child name select */}
          <div className="relative flex-1 min-w-0">
            <select
              value={selectedChildId || ''}
              onChange={(e) => handleChildChange(e.target.value)}
              className="w-full appearance-none bg-transparent px-2 py-2 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 pr-7 truncate"
            >
              {childList.map((child) => (
                <option key={child.child_id} value={child.child_id}>
                  {child.child_name}
                </option>
              ))}
            </select>
            <AppIcon
              name="chevron-down"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-neutral-400"
            />
          </div>
        </div>
      )}

      {items.map((item) => (
        <SidebarNavItem key={item.href} {...item} />
      ))}
      {needsUpgrade && (
        <SidebarNavItem href="/pricing" icon="sparkles" label="Upgrade" />
      )}
      {hasPlan && (
        <SidebarNavItem href="/pricing" icon="wallet" label="Manage Plan" />
      )}
    </nav>
  );
}
