

// src/views/child/ChildSignUp.tsx

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import Alert from "../../components/ui/Alert";
import AppIcon from "../../components/ui/AppIcon";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import { rpcGetInvitePreview, rpcAcceptInvite, signUpChild } from "../../services/invitationService";
import { useAuth } from "../../contexts/AuthContext";

type InvitationPreviewState = {
  parent_name: string;
  child_name: string;
};

export default function ChildSignUp() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [searchParams] = useSearchParams();
  const code = (searchParams.get("code") || "").trim();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [invitation, setInvitation] = useState<InvitationPreviewState | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setError("");
      setLoading(true);

      if (!code) {
        if (!mounted) return;
        setError("No invitation code provided");
        setInvitation(null);
        setLoading(false);
        return;
      }

      try {
        const preview = await rpcGetInvitePreview(code);
        if (!preview.ok) {
          setError("Invalid or expired invitation code");
          setInvitation(null);
        } else {
          const previewData = preview as Record<string, unknown>;
          setInvitation({
            parent_name: (previewData.parent_name as string) || "Your parent",
            child_name: (previewData.child_first_name as string) || "Student",
          });
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load invitation");
        setInvitation(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [code]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Please enter your email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      // 1) Create auth account (and ensure we have a session)
      const signUpResult = await signUpChild(trimmedEmail, password);
      if (!signUpResult.ok) {
        setError(signUpResult.error || "Failed to create account");
        setSubmitting(false);
        return;
      }

      // 2) Link this auth user to the child row via invite code
      const accept = await rpcAcceptInvite(code);
      if (!accept.ok) {
        setError(accept.error || "Failed to link invitation");
        setSubmitting(false);
        return;
      }

      // 3) Refresh AuthContext so child flags resolve
      await refresh();

      // 4) Go to child area
      navigate("/child/today", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <AppIcon name="loader" className="w-10 h-10 text-primary animate-spin mb-4 mx-auto" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-6">
        <div className="bg-background rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Invalid Invitation</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button size="lg" onClick={() => navigate("/", { replace: true })}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center p-6">
      <div className="bg-background rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <AppIcon name="book-open" className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to DoorSlam</h1>
          <p className="text-muted-foreground">{invitation.parent_name} has invited you to start your revision journey</p>
        </div>

        <div className="bg-success bg-opacity-10 border border-success rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AppIcon name="check-circle" className="w-6 h-6 text-success mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Account for: {invitation.child_name}</p>
              <p className="text-sm text-muted-foreground">Use your email address to create a login</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Email address"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <FormField
            label="Create password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
            autoComplete="new-password"
          />

          <FormField
            label="Confirm password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            required
            minLength={6}
            autoComplete="new-password"
          />

          {error && (
            <Alert variant="error" hideIcon>
              {error}
            </Alert>
          )}

          <Button type="submit" size="lg" fullWidth loading={submitting}>
            {submitting ? "Creating account..." : "Create account and start"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">By creating an account, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
