// src/components/layout/AppHeader.tsx
// Unauthenticated header: logo + login/signup buttons
// Used on landing, login, and signup pages only



import { Link } from 'react-router-dom';
import BrandWordmark from '../ui/BrandWordmark';

export default function AppHeader() {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div>
            <BrandWordmark size="md" />
            <div className="text-sm text-muted-foreground">
              Slam your GCSEs.
            </div>
          </div>
        </Link>

        {/* Navigation + Auth buttons */}
        <div className="flex items-center gap-2">
          <Link
            to="/pricing"
            className="px-4 py-2 rounded-xl text-foreground hover:bg-accent text-sm font-medium"
          >
            Pricing
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-foreground hover:bg-accent text-sm font-medium"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
