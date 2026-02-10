'use client';

import { Suspense } from 'react';
import InsightsReport from '@/views/parent/InsightsReport';

export default function InsightsReportPage() {
  return (
    <Suspense>
      <InsightsReport />
    </Suspense>
  );
}
