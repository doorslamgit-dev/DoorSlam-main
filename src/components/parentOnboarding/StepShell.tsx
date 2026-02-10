// src/components/parentOnboarding/StepShell.tsx

import type { ReactNode } from "react";
import Alert from "../ui/Alert";

type StepShellProps = {
  title: string;
  subtitle?: string;
  error?: string | null;
  children: ReactNode;
};

export default function StepShell({ title, subtitle, error, children }: StepShellProps) {
  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{subtitle}</p>
          ) : null}
        </header>

        {error ? (
          <Alert variant="error" title="Something needs fixing" className="mb-6">
            <span className="whitespace-pre-line">{error}</span>
          </Alert>
        ) : null}

        <section className="rounded-2xl border border-neutral-200 bg-neutral-0 shadow-sm p-6">
          {children}
        </section>
      </div>
    </div>
  );
}
