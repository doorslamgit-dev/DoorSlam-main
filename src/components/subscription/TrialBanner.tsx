// src/components/subscription/TrialBanner.tsx
// Banner showing trial status and days remaining

"use client";

import Link from "next/link";
import { useSubscription } from "../../hooks/useSubscription";
import AppIcon from "../ui/AppIcon";

export function TrialBanner() {
  const { tier, isTrialing, trialDaysRemaining, isPastDue } = useSubscription();

  // Don't show for paid users
  if (tier === "family" || tier === "premium") {
    return null;
  }

  // Show expired/past due warning
  if (tier === "expired" || isPastDue) {
    return (
      <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent-red/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AppIcon name="triangle-alert" className="w-5 h-5 text-accent-red" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-accent-red mb-1">
              {isPastDue ? "Payment Issue" : "Trial Expired"}
            </h3>
            <p className="text-sm text-neutral-600 mb-3">
              {isPastDue
                ? "There was a problem with your payment. Please update your payment method to continue."
                : "Your free trial has ended. Subscribe now to continue using Doorslam with your family."}
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              {isPastDue ? "Update Payment" : "View Plans"}
              <AppIcon name="arrow-right" className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show trial countdown
  if (isTrialing && trialDaysRemaining > 0) {
    const urgency =
      trialDaysRemaining <= 2
        ? "high"
        : trialDaysRemaining <= 7
          ? "medium"
          : "low";

    const bgColor = {
      high: "bg-amber-50 border-amber-200",
      medium: "bg-primary-50 border-primary-200",
      low: "bg-neutral-50 border-neutral-200",
    }[urgency];

    const iconBg = {
      high: "bg-amber-100",
      medium: "bg-primary-100",
      low: "bg-neutral-100",
    }[urgency];

    const textColor = {
      high: "text-amber-700",
      medium: "text-primary-700",
      low: "text-neutral-700",
    }[urgency];

    return (
      <div className={`${bgColor} border rounded-xl p-4 mb-6`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center`}
            >
              <AppIcon name="clock" className={`w-5 h-5 ${textColor}`} />
            </div>
            <div>
              <p className={`font-semibold ${textColor}`}>
                {trialDaysRemaining === 1
                  ? "Last day of your free trial!"
                  : `${trialDaysRemaining} days left in your free trial`}
              </p>
              <p className="text-sm text-neutral-600">
                Trial includes 1 child and 1 subject
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Upgrade Now
            <AppIcon name="arrow-right" className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

export default TrialBanner;
