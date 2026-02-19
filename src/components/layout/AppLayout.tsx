// src/components/layout/AppLayout.tsx
// Conditional layout: authenticated users get AppShell (sidebar), others get AppHeader
// Subscription gate: parents without an active subscription are redirected to /pricing

import { useEffect } from "react";
import type React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "../../hooks/useSubscription";
import AppHeader from "./AppHeader";
import AppShell from "./AppShell";

// Routes exempt from the subscription gate (user can access without a subscription)
const SUBSCRIPTION_EXEMPT_ROUTES = ["/pricing", "/parent/onboarding", "/account", "/login", "/signup", "/child"];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading, isParent } = useAuth();
  const { loading: subLoading, subscription } = useSubscription();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Subscription gate: redirect parents without a Stripe subscription to /pricing
  useEffect(() => {
    if (loading || subLoading || !user || !isParent) return;

    const isExempt = SUBSCRIPTION_EXEMPT_ROUTES.some((route) => pathname.startsWith(route));
    if (isExempt) return;

    // If parent has no Stripe customer (never subscribed), redirect to pricing
    if (!subscription?.has_stripe_customer) {
      navigate("/pricing", { replace: true });
    }
  }, [loading, subLoading, user, isParent, subscription, pathname, navigate]);

  // Loading: neutral layout (no header, no sidebar) to prevent flash
  if (loading) {
    return (
      <div className="min-h-screen bg-background-secondary flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // Authenticated: sidebar shell
  if (user) {
    return <AppShell>{children}</AppShell>;
  }

  // Unauthenticated: header layout (landing, login, signup)
  return (
    <div className="min-h-screen bg-background-secondary flex flex-col">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
