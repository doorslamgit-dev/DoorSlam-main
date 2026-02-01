// src/components/parentOnboarding/StepShell.tsx

import type { ReactNode } from "react";

type StepShellProps = {
  title: string;
  subtitle?: string;
  error?: string | null;
  children: ReactNode;
};

export default function StepShell({ title, subtitle, error, children }: StepShellProps) {
  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{subtitle}</p>
          ) : null}
        </header>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-medium text-red-800">Something needs fixing</p>
            <p className="mt-1 text-sm text-red-700 whitespace-pre-line">{error}</p>
          </div>
        ) : null}

        <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6">
          {children}
        </section>
      </div>
    </div>
  );
}
