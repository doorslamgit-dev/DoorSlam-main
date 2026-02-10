'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function SessionRunRedirect() {
  const router = useRouter();
  const params = useParams<{ plannedSessionId: string }>();

  useEffect(() => {
    if (params.plannedSessionId) {
      router.replace(`/child/session/${params.plannedSessionId}`);
    }
  }, [router, params.plannedSessionId]);

  return null;
}
