// src/components/layout/AppHeader.tsx
// Unauthenticated header: logo + login/signup buttons
// Used on landing, login, and signup pages only

'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function AppHeader() {
  return (
    <header className="bg-neutral-0 border-b border-neutral-200/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/images/logo-dark.png"
            alt="Doorslam"
            width={120}
            height={56}
            className="h-14 w-auto dark:hidden"
          />
          <Image
            src="/images/logo-light.png"
            alt="Doorslam"
            width={120}
            height={56}
            className="h-14 w-auto hidden dark:block"
          />
          <div>
            <div className="text-xl font-bold text-primary-900 leading-tight">Doorslam</div>
            <div className="text-sm text-neutral-500">
              Revision without the drama
            </div>
          </div>
        </Link>

        {/* Navigation + Auth buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/pricing"
            className="px-4 py-2 rounded-xl text-neutral-700 hover:bg-neutral-50 text-sm font-medium"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-neutral-700 hover:bg-neutral-50 text-sm font-medium"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
