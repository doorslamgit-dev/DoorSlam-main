// src/components/layout/sidebar/SidebarNavItem.tsx


import { Link, useLocation } from 'react-router-dom';
import AppIcon from '../../ui/AppIcon';
import type { IconKey } from '../../ui/AppIcon';
import { useSidebar } from '../../../contexts/SidebarContext';

interface SidebarNavItemProps {
  href: string;
  icon: IconKey;
  label: string;
  exact?: boolean;
}

export default function SidebarNavItem({ href, icon, label, exact = false }: SidebarNavItemProps) {
  const { pathname } = useLocation();
  const { sidebarState, setMobileOpen } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      to={href}
      onClick={() => setMobileOpen(false)}
      title={isCollapsed ? label : undefined}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-colors duration-200
        ${isActive
          ? 'bg-primary-100 text-primary-700'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
        }
        ${isCollapsed ? 'justify-center' : ''}
      `}
    >
      <AppIcon name={icon} className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
}
