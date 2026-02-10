'use client';

import { Suspense } from 'react';
import ChildSignUp from '@/views/child/ChildSignUp';

export default function ChildSignUpPage() {
  return (
    <Suspense>
      <ChildSignUp />
    </Suspense>
  );
}
