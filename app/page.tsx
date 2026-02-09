'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Landing from '@/views/Landing';

export default function HomePage() {
  const router = useRouter();
  const { loading, user, isParent, isChild, isUnresolved, parentChildCount } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || isUnresolved) return;
    if (isChild) {
      router.replace('/child/today');
      return;
    }
    if (isParent) {
      if (parentChildCount === 0) {
        router.replace('/parent/onboarding');
      } else {
        router.replace('/parent');
      }
    }
  }, [loading, user, isParent, isChild, isUnresolved, parentChildCount, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-600">
        Loading...
      </div>
    );
  }

  if (!user || isUnresolved) return <Landing />;

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-neutral-600">
      Loading...
    </div>
  );
}
