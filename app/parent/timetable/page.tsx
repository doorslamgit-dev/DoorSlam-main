'use client';

import { Suspense } from 'react';
import Timetable from '@/views/parent/Timetable';

export default function TimetablePage() {
  return (
    <Suspense>
      <Timetable />
    </Suspense>
  );
}
