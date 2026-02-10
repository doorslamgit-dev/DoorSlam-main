'use client';

// src/views/SignUp.tsx

import { useState, type FormEvent } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Alert from "../components/ui/Alert";
import AppIcon from "../components/ui/AppIcon";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { useAuth } from "../contexts/AuthContext";

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Sign up timed out")), ms)
    ),
  ]);
}

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await withTimeout(
        signUp(email.trim().toLowerCase(), password, fullName.trim()),
        8000
      );

      if (result?.error) {
        setError(result.error.message || "Sign up failed");
        setSubmitting(false);
        return;
      }

      // signUp now updates auth state immediately, so we can navigate directly
      router.replace("/parent/onboarding");
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : "Sign up failed"));
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-400 via-primary-600 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-neutral-0 rounded-2xl items-center justify-center mb-4 shadow-lg">
            <AppIcon name="book-open" className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Doorslam</h1>
          <p className="text-primary-100">
            Calm, confidence-building revision for your children
          </p>
        </div>

        <div className="bg-neutral-0 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Create your parent account
          </h2>

          {error && (
            <Alert variant="error" className="mb-6" hideIcon>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Full name"
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
              disabled={submitting}
            />

            <FormField
              label="Email address"
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={submitting}
            />

            <FormField
              label="Password"
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              disabled={submitting}
              minLength={6}
            />

            <Button type="submit" size="lg" fullWidth loading={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Already have an account?{" "}
            <Link href="/login"
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-primary-100 text-sm mt-6">
          Parent-led, child-used revision planning
        </p>
      </div>
    </div>
  );
}