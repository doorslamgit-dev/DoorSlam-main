// src/views/BetaLanding.tsx
// Public-facing holding page for doorslam.io with beta signup form.

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import AppIcon from '@/components/ui/AppIcon';
import BrandWordmark from '@/components/ui/BrandWordmark';

type SignupRole = 'parent' | 'student' | 'teacher';

export default function BetaLanding() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<SignupRole>('parent');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('beta_signups')
        .insert({ email: email.trim().toLowerCase(), role });

      if (insertError) {
        if (insertError.code === '23505') {
          // Unique constraint — already signed up
          setSubmitted(true);
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-4 border-b border-border/50">
        <div className="max-w-4xl mx-auto">
          <BrandWordmark size="md" />
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
              Revision{' '}
              <span className="text-primary">without the drama</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              AI-powered GCSE revision that adapts to how your child learns.
              Personalised plans, real-time progress tracking, and an AI tutor
              that makes revision feel less like a chore.
            </p>
          </div>

          {/* Features strip */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <AppIcon name="brain" className="w-4 h-4 text-primary" />
              <span>AI-powered learning</span>
            </div>
            <div className="flex items-center gap-2">
              <AppIcon name="calendar" className="w-4 h-4 text-primary" />
              <span>Smart revision plans</span>
            </div>
            <div className="flex items-center gap-2">
              <AppIcon name="bar-chart-3" className="w-4 h-4 text-primary" />
              <span>Progress insights</span>
            </div>
          </div>

          {/* Signup form */}
          <div className="bg-muted/50 border border-border rounded-2xl p-6 sm:p-8 max-w-md mx-auto">
            {submitted ? (
              <div className="space-y-3 py-4">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <AppIcon name="check" className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">You're on the list!</h3>
                <p className="text-sm text-muted-foreground">
                  We'll be in touch when beta access is ready. Keep an eye on your inbox.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  Join the beta
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Be among the first to try DoorSlam. Free during beta.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  </div>

                  <div className="flex gap-2">
                    {([
                      { value: 'parent', label: 'Parent', icon: 'heart' },
                      { value: 'student', label: 'Student', icon: 'graduation-cap' },
                      { value: 'teacher', label: 'Teacher', icon: 'user' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRole(opt.value)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          role === opt.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                        }`}
                      >
                        <AppIcon name={opt.icon} className="w-3.5 h-3.5" />
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Signing up...' : 'Get early access'}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            No spam, ever. We'll only email you about your beta access.
          </p>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-border/50 px-6 py-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <BrandWordmark size="sm" />
          <p>&copy; 2026 DoorSlam. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
