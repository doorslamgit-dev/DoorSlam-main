// src/components/layout/sidebar/SidebarNav.tsx

'use client';

import { useAuth } from '../../../contexts/AuthContext';
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
  const { isChild } = useAuth();
  const items = isChild ? CHILD_NAV : PARENT_NAV;

  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => (
        <SidebarNavItem key={item.href} {...item} />
      ))}
    </nav>
  );
}
