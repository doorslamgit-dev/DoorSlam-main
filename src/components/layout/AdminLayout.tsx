// src/components/layout/AdminLayout.tsx
// Layout shell for admin routes. Checks admin role and provides sidebar navigation.
// No subscription gate — admins are Doorslam staff, not subscribers.

import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppIcon from '@/components/ui/AppIcon';
import type { IconKey } from '@/components/ui/AppIcon';

interface AdminNavItem {
  href: string;
  icon: IconKey;
  label: string;
  exact?: boolean;
}

const ADMIN_NAV: AdminNavItem[] = [
  { href: '/admin', icon: 'home', label: 'Dashboard', exact: true },
  { href: '/admin/curriculum', icon: 'clipboard-list', label: 'Curriculum' },
];

export default function AdminLayout() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) {
      navigate('/login', { replace: true });
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Admin sidebar */}
      <aside className="fixed top-0 left-0 h-full w-60 bg-background border-r border-border flex flex-col z-40">
        {/* Logo */}
        <div className="flex items-center h-16 border-b border-border px-4">
          <Link to="/admin" className="flex items-center gap-2">
            <img src="/images/doorslam-logo-full.png" alt="Doorslam" className="h-7" />
            <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="flex flex-col gap-1">
            {ADMIN_NAV.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }
                  `}
                >
                  <AppIcon name={item.icon} className="w-4.5 h-4.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-border p-4">
          <div className="text-xs text-muted-foreground truncate">
            {user.email}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 pl-60">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
