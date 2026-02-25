

// src/views/Login.tsx

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError((error instanceof Error ? error.message : "Login failed"));
        setSubmitting(false);
        return;
      }

      // signIn now sets user/session state directly
      // Navigate to home gate which will route based on role
      // Use setTimeout to ensure React has processed the state update
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 0);
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : "Login failed"));
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-primary/60 via-primary/80 to-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        <div className="bg-background rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Welcome back</h2>

          {error && (
            <Alert variant="error" className="mb-6" hideIcon>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Email address"
              id="email"
              type="email"
              required
              autoComplete="email"
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={submitting}
            />

            <Button type="submit" size="lg" fullWidth loading={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/signup"
              className="text-primary font-semibold hover:text-primary"
            >
              Sign up
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