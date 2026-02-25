

// src/views/SignUp.tsx

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Alert from "../components/ui/Alert";
import BrandWordmark from "../components/ui/BrandWordmark";
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
  const navigate = useNavigate();

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
      navigate("/parent/onboarding", { replace: true });
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : "Sign up failed"));
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/60 via-primary/80 to-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BrandWordmark size="lg" light className="mb-2" />
          <p className="text-primary-foreground/80">
            Slam your GCSEs.
          </p>
        </div>

        <div className="bg-background rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
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

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login"
              className="text-primary font-semibold hover:text-primary"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-primary-foreground/80 text-sm mt-6">
          Confident revision planning for your children
        </p>
      </div>
    </div>
  );
}