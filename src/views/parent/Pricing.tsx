// src/views/parent/Pricing.tsx
// Subscription pricing page with tier comparison


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "../../hooks/useSubscription";
import {
  createCheckoutSession,
  openCustomerPortal,
} from "../../services/subscriptionService";
import {
  FAMILY_PRICES,
  PREMIUM_PRICES,
  FAMILY_ANNUAL_UPFRONT,
  PREMIUM_ANNUAL_UPFRONT,
  type PriceDuration,
} from "../../types/subscription";
import AppIcon from "../../components/ui/AppIcon";

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier, isActive } = useSubscription();
  const [selectedDuration, setSelectedDuration] =
    useState<PriceDuration>("annual");
  const [payUpfront, setPayUpfront] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const familyPrice = FAMILY_PRICES.find(
    (p) => p.duration === selectedDuration
  )!;
  const premiumPrice = PREMIUM_PRICES.find(
    (p) => p.duration === selectedDuration
  )!;

  // For annual duration, allow upfront toggle
  const showUpfrontToggle = selectedDuration === "annual";
  const familyDisplay =
    showUpfrontToggle && payUpfront
      ? {
          monthlyRate: null,
          total: FAMILY_ANNUAL_UPFRONT.total,
          savings: FAMILY_ANNUAL_UPFRONT.savings,
          stripePriceId: FAMILY_ANNUAL_UPFRONT.stripePriceId,
        }
      : {
          monthlyRate: familyPrice.monthlyRate,
          total: familyPrice.total,
          savings: familyPrice.savings,
          stripePriceId: familyPrice.stripePriceId,
        };
  const premiumDisplay =
    showUpfrontToggle && payUpfront
      ? {
          monthlyRate: null,
          total: PREMIUM_ANNUAL_UPFRONT.total,
          savings: PREMIUM_ANNUAL_UPFRONT.savings,
          stripePriceId: PREMIUM_ANNUAL_UPFRONT.stripePriceId,
        }
      : {
          monthlyRate: premiumPrice.monthlyRate,
          total: premiumPrice.total,
          savings: premiumPrice.savings,
          stripePriceId: premiumPrice.stripePriceId,
        };

  const handleSubscribe = async (tierType: "family" | "premium") => {
    if (!user) {
      navigate("/signup?redirect=/pricing");
      return;
    }

    const priceId =
      tierType === "family"
        ? familyDisplay.stripePriceId
        : premiumDisplay.stripePriceId;

    if (!priceId) {
      setError("Stripe is not configured yet. Please try again later.");
      return;
    }

    setLoadingTier(tierType);
    setError(null);

    try {
      const checkoutUrl = await createCheckoutSession(priceId);
      window.location.href = checkoutUrl;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to start checkout"
      );
      setLoadingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingTier("manage");
    setError(null);

    try {
      const portalUrl = await openCustomerPortal();
      window.location.href = portalUrl;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to open billing portal"
      );
      setLoadingTier(null);
    }
  };

  const durations: { value: PriceDuration; label: string }[] = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "annual", label: "Annual" },
  ];

  const FAMILY_FEATURES = [
    "Unlimited children",
    "Unlimited subjects",
    "Full parent dashboard",
    "Study Buddy (text)",
    "AI Tutor for parents (text)",
    "Choose from mnemonic library",
    "Progress tracking & rewards",
  ];

  const PREMIUM_FEATURES = [
    "Everything in Family, plus:",
    "Voice AI (parents + children)",
    "Create custom AI mnemonics",
    "Advanced analytics",
    "Benchmark comparisons",
    "Token top-ups",
    "Priority support",
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-primary-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Start with a 14-day free trial. No credit card required. Cancel
          anytime.
        </p>
      </div>

      {/* Duration selector */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-neutral-100 rounded-xl p-1">
          {durations.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => {
                setSelectedDuration(value);
                if (value !== "annual") setPayUpfront(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDuration === value
                  ? "bg-neutral-0 text-primary-600 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Upfront toggle (annual only) */}
      {showUpfrontToggle && (
        <div className="flex justify-center mb-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <span
              className={`text-sm font-medium ${!payUpfront ? "text-primary-600" : "text-neutral-500"}`}
            >
              Pay monthly
            </span>
            <button
              role="switch"
              aria-checked={payUpfront}
              onClick={() => setPayUpfront((prev) => !prev)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                payUpfront ? "bg-primary-600" : "bg-neutral-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  payUpfront ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${payUpfront ? "text-primary-600" : "text-neutral-500"}`}
            >
              Pay upfront (save more)
            </span>
          </label>
        </div>
      )}

      {!showUpfrontToggle && <div className="mb-8" />}

      {/* Error message */}
      {error && (
        <div className="max-w-md mx-auto mb-8 p-4 bg-accent-red/10 border border-accent-red/20 rounded-xl text-accent-red text-center">
          {error}
        </div>
      )}

      {/* Pricing cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Family Plan */}
        <div className="bg-neutral-0 rounded-2xl shadow-card border border-neutral-200/50 p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-primary-900 mb-2">Family</h2>
            <p className="text-neutral-600 text-sm">
              Everything you need for your family&apos;s revision
            </p>
          </div>

          <div className="text-center mb-6">
            {familyDisplay.monthlyRate != null ? (
              <>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-primary-900">
                    £{familyDisplay.monthlyRate.toFixed(2)}
                  </span>
                  <span className="text-neutral-600">/month</span>
                </div>
                {selectedDuration !== "monthly" && (
                  <p className="text-sm text-neutral-500 mt-1">
                    £{familyDisplay.total.toFixed(2)} total
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-primary-900">
                  £{familyDisplay.total.toFixed(2)}
                </span>
                <span className="text-neutral-600">one-off</span>
              </div>
            )}
            {familyDisplay.savings && (
              <span className="inline-block mt-2 px-3 py-1 bg-accent-green/10 text-accent-green text-sm font-medium rounded-full">
                {familyDisplay.savings}
              </span>
            )}
          </div>

          <ul className="space-y-3 mb-8">
            {FAMILY_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-neutral-700"
              >
                <AppIcon
                  name="check"
                  className="w-5 h-5 text-accent-green flex-shrink-0"
                />
                {feature}
              </li>
            ))}
          </ul>

          {tier === "family" && isActive ? (
            <button
              onClick={handleManageSubscription}
              disabled={loadingTier === "manage"}
              className="w-full py-3 border border-primary-600 text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors disabled:opacity-50"
            >
              {loadingTier === "manage" ? "Loading..." : "Manage Subscription"}
            </button>
          ) : (
            <button
              onClick={() => handleSubscribe("family")}
              disabled={!!loadingTier}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loadingTier === "family" ? "Loading..." : "Start Free Trial"}
            </button>
          )}
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl shadow-card border-2 border-primary-200 p-8 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1 bg-primary-600 text-white text-sm font-semibold rounded-full">
              Most Popular
            </span>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-primary-900 mb-2">
              Premium
            </h2>
            <p className="text-neutral-600 text-sm">
              Advanced insights and AI-powered guidance
            </p>
          </div>

          <div className="text-center mb-6">
            {premiumDisplay.monthlyRate != null ? (
              <>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-primary-900">
                    £{premiumDisplay.monthlyRate.toFixed(2)}
                  </span>
                  <span className="text-neutral-600">/month</span>
                </div>
                {selectedDuration !== "monthly" && (
                  <p className="text-sm text-neutral-500 mt-1">
                    £{premiumDisplay.total.toFixed(2)} total
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-primary-900">
                  £{premiumDisplay.total.toFixed(2)}
                </span>
                <span className="text-neutral-600">one-off</span>
              </div>
            )}
            {premiumDisplay.savings && (
              <span className="inline-block mt-2 px-3 py-1 bg-accent-green/10 text-accent-green text-sm font-medium rounded-full">
                {premiumDisplay.savings}
              </span>
            )}
          </div>

          <ul className="space-y-3 mb-8">
            {PREMIUM_FEATURES.map((feature, i) => (
              <li
                key={feature}
                className={`flex items-center gap-3 ${
                  i === 0
                    ? "text-primary-700 font-medium"
                    : "text-neutral-700"
                }`}
              >
                <AppIcon
                  name={i === 0 ? "sparkles" : "check"}
                  className={`w-5 h-5 flex-shrink-0 ${
                    i === 0 ? "text-primary-600" : "text-accent-green"
                  }`}
                />
                {feature}
              </li>
            ))}
          </ul>

          {tier === "premium" && isActive ? (
            <button
              onClick={handleManageSubscription}
              disabled={loadingTier === "manage"}
              className="w-full py-3 border border-primary-600 text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors disabled:opacity-50"
            >
              {loadingTier === "manage" ? "Loading..." : "Manage Subscription"}
            </button>
          ) : (
            <button
              onClick={() => handleSubscribe("premium")}
              disabled={!!loadingTier}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loadingTier === "premium" ? "Loading..." : "Start Free Trial"}
            </button>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12 text-center">
        <p className="text-neutral-600">
          Questions?{" "}
          <a
            href="mailto:support@doorslam.app"
            className="text-primary-600 hover:underline"
          >
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}
