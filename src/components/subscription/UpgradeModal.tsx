// src/components/subscription/UpgradeModal.tsx
// Modal shown when users hit subscription limits

"use client";

import { useRouter } from "next/navigation";
import AppIcon from "../ui/AppIcon";

export type UpgradeReason =
  | "child_limit"
  | "subject_limit"
  | "voice_feature"
  | "ai_tutor"
  | "mnemonics"
  | "analytics"
  | "benchmarks"
  | "tokens"
  | "trial_expired";

interface UpgradeModalProps {
  reason: UpgradeReason;
  isOpen: boolean;
  onClose: () => void;
}

const UPGRADE_MESSAGES: Record<
  UpgradeReason,
  { title: string; description: string; icon: string }
> = {
  child_limit: {
    title: "Add more children",
    description:
      "Your trial allows 1 child. Upgrade to Family or Premium to add unlimited children.",
    icon: "users",
  },
  subject_limit: {
    title: "Add more subjects",
    description:
      "Your trial allows 1 subject. Upgrade to add unlimited subjects for comprehensive revision.",
    icon: "book-open",
  },
  voice_feature: {
    title: "Unlock Voice Features",
    description:
      "Voice interactions with Study Buddy and AI Tutor are available on the Premium plan.",
    icon: "mic",
  },
  ai_tutor: {
    title: "Unlock AI Tutor",
    description:
      "Get personalised AI-powered insights and advice about your child's learning with Family or Premium.",
    icon: "sparkles",
  },
  mnemonics: {
    title: "Create Custom Mnemonics",
    description:
      "Premium users can create personalised AI-generated mnemonics. Family users can choose from the library.",
    icon: "brain",
  },
  analytics: {
    title: "Unlock Advanced Analytics",
    description:
      "Access detailed trends, predictions, and exam readiness insights on the Premium plan.",
    icon: "bar-chart-2",
  },
  benchmarks: {
    title: "Unlock Benchmarks",
    description:
      "Compare your child's progress with similar students on the Premium plan.",
    icon: "bar-chart-2",
  },
  tokens: {
    title: "Token Top-ups",
    description:
      "Purchase additional AI tokens to extend Study Buddy usage. Available on Premium.",
    icon: "coins",
  },
  trial_expired: {
    title: "Trial Ended",
    description:
      "Your 14-day free trial has ended. Subscribe to continue using Doorslam with your family.",
    icon: "clock",
  },
};

export function UpgradeModal({ reason, isOpen, onClose }: UpgradeModalProps) {
  const router = useRouter();
  const message = UPGRADE_MESSAGES[reason];

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    router.push("/pricing");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative bg-neutral-0 rounded-2xl shadow-xl max-w-md w-full p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <AppIcon name="x" className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AppIcon name={message.icon} className="w-8 h-8 text-primary-600" />
          </div>

          <h2 className="text-xl font-bold text-primary-900 mb-2">
            {message.title}
          </h2>

          <p className="text-neutral-600 mb-6">{message.description}</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              View Plans
              <AppIcon name="arrow-right" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpgradeModal;
