// src/views/parent/Pricing.tsx
// Subscription pricing page with tier comparison

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "../../hooks/useSubscription";
import {
  createCheckoutSession,
  updateSubscription,
  openCustomerPortal,
  getSubscriptionStatus,
} from "../../services/subscriptionService";
import {
  getDisplayPrice,
  lookupPriceId,
  canUpgradePlanLength,
  planLengthLabel,
  type PlanLength,
} from "../../types/subscription";
import AppIcon from "../../components/ui/AppIcon";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";

export default function Pricing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    tier,
    isActive,
    isTrialing,
    hasStripeCustomer,
    planLength: subscriberPlanLength,
    billingMethod: subscriberBillingMethod,
    trialDaysRemaining,
    refresh,
  } = useSubscription();

  // UI state — initialise from subscriber data when available
  const [selectedPlanLength, setSelectedPlanLength] = useState<PlanLength>(
    subscriberPlanLength ?? "12_months"
  );
  const [payUpfront, setPayUpfront] = useState(
    subscriberBillingMethod === "upfront"
  );
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync selectedPlanLength when subscription data loads (async)
  useEffect(() => {
    if (subscriberPlanLength) setSelectedPlanLength(subscriberPlanLength);
  }, [subscriberPlanLength]);

  useEffect(() => {
    if (subscriberBillingMethod) setPayUpfront(subscriberBillingMethod === "upfront");
  }, [subscriberBillingMethod]);

  // Confirmation modal state
  const [confirmAction, setConfirmAction] = useState<{
    targetTier: "family" | "premium";
    targetPlanLength: PlanLength;
    priceLabel: string;
    actionLabel: string;
  } | null>(null);

  // Is this user an existing subscriber?
  const isSubscriber =
    (isActive || isTrialing) && (tier === "family" || tier === "premium");

  // The effective plan length for display (subscriber's locked length or user selection)
  const effectivePlanLength = isSubscriber && subscriberPlanLength
    ? selectedPlanLength // subscribers can browse longer lengths
    : selectedPlanLength;

  // The effective billing method (subscribers locked, new users toggle)
  const effectiveBillingMethod = isSubscriber && subscriberBillingMethod
    ? subscriberBillingMethod
    : payUpfront ? "upfront" : "monthly";

  // After Stripe Checkout success, refresh subscription and redirect
  useEffect(() => {
    if (searchParams.get("subscription") === "success" && user) {
      refresh().then(() => {
        navigate("/parent", { replace: true });
      });
    }
  }, [searchParams, user, refresh, navigate]);

  // ---------------------------------------------------------------------------
  // Price display logic
  // ---------------------------------------------------------------------------

  /** Get the price to show on a card for a given tier */
  function getCardPrice(cardTier: "family" | "premium") {
    const pl = effectivePlanLength;
    const bm = effectiveBillingMethod;
    return getDisplayPrice(cardTier, pl, bm);
  }

  /** Get the Stripe price ID for a given tier + current selections */
  function getCardPriceId(cardTier: "family" | "premium"): string | null {
    return lookupPriceId(cardTier, effectivePlanLength, effectiveBillingMethod);
  }

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /** New user checkout */
  const handleSubscribe = async (tierType: "family" | "premium") => {
    if (!user) {
      navigate("/signup?redirect=/pricing");
      return;
    }

    const priceId = getCardPriceId(tierType);
    if (!priceId) {
      setError("Stripe is not configured yet. Please try again later.");
      return;
    }

    setLoadingTier(tierType);
    setError(null);
    setSuccessMessage(null);

    try {
      const checkoutUrl = await createCheckoutSession(priceId);
      window.location.href = checkoutUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setLoadingTier(null);
    }
  };

  /** Open the confirmation modal before changing plan */
  const promptPlanChange = (
    targetTier: "family" | "premium",
    targetPlanLength: PlanLength
  ) => {
    setError(null);
    setSuccessMessage(null);

    const price = getDisplayPrice(targetTier, targetPlanLength, effectiveBillingMethod);
    let priceLabel = "";
    if (price) {
      priceLabel = price.monthlyRate != null
        ? `£${price.monthlyRate.toFixed(2)}/month`
        : `£${price.total.toFixed(2)} upfront`;
    }

    // Determine action label
    const isTierChange = targetTier !== tier;
    const isLengthChange = targetPlanLength !== subscriberPlanLength;
    let actionLabel: string;

    if (isTierChange && isLengthChange) {
      actionLabel = targetTier === "premium"
        ? `Upgrade to Premium ${planLengthLabel(targetPlanLength)}`
        : `Switch to Family ${planLengthLabel(targetPlanLength)}`;
    } else if (isTierChange) {
      actionLabel = targetTier === "premium" ? "Upgrade to Premium" : "Switch to Family";
    } else {
      actionLabel = `Extend to ${planLengthLabel(targetPlanLength)}`;
    }

    setConfirmAction({ targetTier, targetPlanLength, priceLabel, actionLabel });
  };

  /** Execute the plan change after user confirms */
  const handlePlanChange = async () => {
    if (!confirmAction) return;
    const { targetTier, targetPlanLength, actionLabel } = confirmAction;
    setConfirmAction(null);
    setLoadingTier(targetTier);
    setError(null);
    setSuccessMessage(null);

    try {
      // Only send plan length if it's changing
      const planLengthParam =
        targetPlanLength !== subscriberPlanLength ? targetPlanLength : undefined;
      await updateSubscription(targetTier, planLengthParam);

      // Poll until the webhook has synced (up to ~5 seconds)
      const maxAttempts = 10;
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, 500));
        const status = await getSubscriptionStatus();
        if (status.tier === targetTier) {
          await refresh();
          break;
        }
        if (i === maxAttempts - 1) await refresh();
      }

      setSuccessMessage(`${actionLabel} — done!`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to change plan");
    } finally {
      setLoadingTier(null);
    }
  };

  const handleManageBilling = async () => {
    setLoadingTier("manage");
    setError(null);

    try {
      const portalUrl = await openCustomerPortal();
      window.location.href = portalUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to open billing portal");
      setLoadingTier(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Plan length tabs + upfront toggle config
  // ---------------------------------------------------------------------------

  const planLengths: { value: PlanLength; label: string }[] = [
    { value: "1_month", label: "1 Month" },
    { value: "3_months", label: "3 Months" },
    { value: "12_months", label: "12 Months" },
  ];

  const showUpfrontToggle = effectivePlanLength !== "1_month";

  // ---------------------------------------------------------------------------
  // Feature lists
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  /** Render the price display for a card */
  function renderPrice(cardTier: "family" | "premium") {
    const price = getCardPrice(cardTier);
    if (!price) return null;

    return (
      <div className="text-center mb-6">
        {price.monthlyRate != null ? (
          <>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-primary-900">
                £{price.monthlyRate.toFixed(2)}
              </span>
              <span className="text-neutral-600">/month</span>
            </div>
            {effectivePlanLength !== "1_month" && (
              <p className="text-sm text-neutral-500 mt-1">
                £{price.total.toFixed(2)} total
              </p>
            )}
          </>
        ) : (
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-primary-900">
              £{price.total.toFixed(2)}
            </span>
            <span className="text-neutral-600">one-off</span>
          </div>
        )}
        {price.savings && (
          <span className="inline-block mt-2 px-3 py-1 bg-accent-green/10 text-accent-green text-sm font-medium rounded-full">
            {price.savings}
          </span>
        )}
      </div>
    );
  }

  /** Render the action button for a tier card */
  function renderButton(cardTier: "family" | "premium") {
    // If plan length is unknown, treat the subscriber's own tier as "current"
    const isCurrent =
      tier === cardTier &&
      (isActive || isTrialing) &&
      (subscriberPlanLength == null || subscriberPlanLength === effectivePlanLength);
    const isOnSameTierDifferentLength =
      tier === cardTier &&
      (isActive || isTrialing) &&
      subscriberPlanLength != null &&
      subscriberPlanLength !== effectivePlanLength;
    const isOnOtherTier =
      tier !== cardTier && (isActive || isTrialing) && (tier === "family" || tier === "premium");

    // Current plan at current length
    if (isCurrent) {
      return (
        <button
          disabled
          className="w-full py-3 border-2 border-primary-600 text-primary-600 rounded-xl font-semibold bg-primary-50 cursor-default"
        >
          Current Plan
        </button>
      );
    }

    // Same tier, longer plan length → "Extend to X Months"
    if (isOnSameTierDifferentLength) {
      return (
        <button
          onClick={() => promptPlanChange(cardTier, effectivePlanLength)}
          disabled={loadingTier === cardTier}
          className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {loadingTier === cardTier
            ? "Switching..."
            : `Extend to ${planLengthLabel(effectivePlanLength)}`}
        </button>
      );
    }

    // Different tier (subscriber)
    if (isOnOtherTier) {
      const isUpgrade = cardTier === "premium";
      const isAlsoLonger = subscriberPlanLength && effectivePlanLength !== subscriberPlanLength;
      const tierLabel = cardTier === "premium" ? "Premium" : "Family";
      const lengthSuffix = isAlsoLonger ? ` ${planLengthLabel(effectivePlanLength)}` : "";
      return (
        <button
          onClick={() => promptPlanChange(cardTier, effectivePlanLength)}
          disabled={loadingTier === cardTier}
          className={`w-full py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
            isUpgrade
              ? "bg-primary-600 text-white hover:bg-primary-700"
              : "border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          {loadingTier === cardTier
            ? "Switching..."
            : isUpgrade
              ? `Upgrade to ${tierLabel}${lengthSuffix}`
              : `Switch to ${tierLabel}${lengthSuffix}`}
        </button>
      );
    }

    // Not subscribed
    return (
      <button
        onClick={() => handleSubscribe(cardTier)}
        disabled={!!loadingTier}
        className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        {loadingTier === cardTier
          ? "Loading..."
          : cardTier === "family" && !hasStripeCustomer
            ? "Start Free Trial"
            : hasStripeCustomer
              ? "Resubscribe"
              : "Subscribe"}
      </button>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header — subscribers see their current plan; non-subscribers see CTA */}
      {isSubscriber ? (
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary-900 mb-3">
            You are on the{subscriberPlanLength ? ` ${planLengthLabel(subscriberPlanLength)}` : ""}{" "}
            {tier === "premium" ? "Premium" : "Family"} plan
          </h1>
          {isTrialing && trialDaysRemaining > 0 && (
            <p className="text-sm text-amber-700 font-medium mb-3">
              Free trial — {trialDaysRemaining} day{trialDaysRemaining === 1 ? "" : "s"} remaining
            </p>
          )}
          {(() => {
            // Build list of available upgrade lengths
            const longerOptions = subscriberPlanLength
              ? planLengths
                  .filter(({ value }) => canUpgradePlanLength(subscriberPlanLength, value) && value !== subscriberPlanLength)
                  .map(({ label }) => label)
              : [];

            if (longerOptions.length > 0) {
              return (
                <p className="text-neutral-600 max-w-xl mx-auto">
                  You can upgrade your plan to a{" "}
                  <span className="font-medium text-primary-700">
                    {longerOptions.join(" or ")}
                  </span>{" "}
                  plan. To shorten your plan, cancel first via{" "}
                  <button
                    onClick={handleManageBilling}
                    className="text-primary-600 hover:underline font-medium"
                  >
                    Manage Billing
                  </button>.
                </p>
              );
            }

            // Already on longest plan
            return (
              <p className="text-neutral-600 max-w-xl mx-auto">
                You&apos;re on the longest plan available. To change plans, visit{" "}
                <button
                  onClick={handleManageBilling}
                  className="text-primary-600 hover:underline font-medium"
                >
                  Manage Billing
                </button>.
              </p>
            );
          })()}
        </div>
      ) : (
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {hasStripeCustomer
              ? "Choose a plan to reactivate your subscription."
              : "Start with a 14-day free trial on Family. Cancel anytime."}
          </p>
        </div>
      )}

      {/* Plan length tabs */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-neutral-100 rounded-xl p-1">
          {planLengths.map(({ value, label }) => {
            // Subscribers: disable shorter plan lengths, allow same + longer
            // If subscriberPlanLength is unknown, lock all tabs to prevent changes
            const isDisabled = isSubscriber && (
              subscriberPlanLength == null ||
              !canUpgradePlanLength(subscriberPlanLength, value)
            );

            const isSelected = value === selectedPlanLength;
            const isCurrent = isSubscriber && value === subscriberPlanLength;

            return (
              <button
                key={value}
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    setSelectedPlanLength(value);
                    if (value === "1_month") setPayUpfront(false);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-neutral-0 text-primary-600 shadow-sm"
                    : isDisabled
                      ? "text-neutral-400 cursor-not-allowed"
                      : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {label}
                {isCurrent && (
                  <span className="block text-[10px] font-normal text-primary-500 leading-tight">
                    Current
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pay monthly / Pay in full toggle */}
      {showUpfrontToggle ? (
        <div className="flex justify-center mb-8">
          {isSubscriber ? (
            // Locked for subscribers — show their billing method (or default to monthly if unknown)
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium ${(subscriberBillingMethod ?? "monthly") === "monthly" ? "text-primary-600" : "text-neutral-400"}`}
              >
                Pay monthly
              </span>
              <div
                className={`relative w-11 h-6 rounded-full cursor-not-allowed ${
                  (subscriberBillingMethod ?? "monthly") === "upfront" ? "bg-primary-400" : "bg-neutral-300"
                }`}
                title="Billing method is locked for your current subscription"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    (subscriberBillingMethod ?? "monthly") === "upfront" ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
              <span
                className={`text-sm font-medium ${(subscriberBillingMethod ?? "monthly") === "upfront" ? "text-primary-600" : "text-neutral-400"}`}
              >
                Pay in full
              </span>
              <span className="text-xs text-neutral-400 ml-1">
                (locked)
              </span>
            </div>
          ) : (
            // Interactive for new users
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
                Pay in full (save more)
              </span>
            </label>
          )}
        </div>
      ) : (
        <div className="mb-8" />
      )}

      {/* Success message */}
      {successMessage && (
        <div className="max-w-md mx-auto mb-8">
          <Alert variant="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="max-w-md mx-auto mb-8">
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
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

          {renderPrice("family")}

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

          {renderButton("family")}
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

          {renderPrice("premium")}

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

          {renderButton("premium")}
        </div>
      </div>

      {/* Manage Billing */}
      {(isActive || isTrialing) && (
        <div className="mt-8 text-center">
          <button
            onClick={handleManageBilling}
            disabled={loadingTier === "manage"}
            className="text-sm text-primary-600 hover:underline disabled:opacity-50"
          >
            {loadingTier === "manage" ? "Loading..." : "Manage Billing & Payment Methods"}
          </button>
        </div>
      )}

      {/* FAQ */}
      <div className="mt-8 text-center">
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

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.actionLabel ?? "Change Plan"}
        subtitle="This will change your subscription immediately."
        maxWidth="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setConfirmAction(null)}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePlanChange}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              Confirm
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            {confirmAction?.actionLabel}
            {confirmAction?.priceLabel ? ` at ${confirmAction.priceLabel}` : ""}.
          </p>
          {isTrialing && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Your free trial will end immediately and billing will start.
              </p>
            </div>
          )}
          {!isTrialing && (
            <p className="text-sm text-neutral-500">
              Your subscription will be prorated — you&apos;ll only pay the difference.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
