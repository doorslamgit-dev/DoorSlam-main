// src/components/layout/sidebar/SidebarNav.tsx


import { useAuth } from '../../../contexts/AuthContext';
import { useSubscription } from '../../../hooks/useSubscription';
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
  const items = isChild ? CHILD_NAV : PARENT_NAV;

  const showUpgrade =
    isParent && (tier === "trial" || tier === "expired");

  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => (
        <SidebarNavItem key={item.href} {...item} />
      ))}
      {showUpgrade && (
        <SidebarNavItem href="/pricing" icon="sparkles" label="Upgrade" />
      )}
    </nav>
  );
}
