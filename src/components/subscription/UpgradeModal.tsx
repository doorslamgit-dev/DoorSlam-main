// src/components/subscription/UpgradeModal.tsx
// Modal shown when users hit subscription limits

import { useNavigate } from 'react-router-dom';
import AppIcon from '../ui/AppIcon';

export type UpgradeReason =
  | 'child_limit'
  | 'subject_limit'
  | 'voice_feature'
  | 'ai_tutor'
  | 'benchmarks'
  | 'tokens'
  | 'trial_expired';

interface UpgradeModalProps {
  reason: UpgradeReason;
  isOpen: boolean;
  onClose: () => void;
}

const UPGRADE_MESSAGES: Record<UpgradeReason, { title: string; description: string; icon: string }> = {
  child_limit: {
    title: 'Add more children',
    description: 'Your current plan allows 1 child. Upgrade to Family or Premium to add unlimited children.',
    icon: 'users',
  },
  subject_limit: {
    title: 'Add more subjects',
    description: 'Your current plan allows 1 subject. Upgrade to add unlimited subjects for comprehensive revision.',
    icon: 'book-open',
  },
  voice_feature: {
    title: 'Unlock Voice Features',
    description: 'Voice interactions with Study Buddy are available on Family and Premium plans.',
    icon: 'mic',
  },
  ai_tutor: {
    title: 'Unlock AI Tutor Advice',
    description: 'Get personalised AI-powered insights and advice about your child\'s learning with Premium.',
    icon: 'sparkles',
  },
  benchmarks: {
    title: 'Unlock Benchmarks',
    description: 'Compare your child\'s progress with similar students on the Premium plan.',
    icon: 'bar-chart-2',
  },
  tokens: {
    title: 'Token Top-ups',
    description: 'Purchase additional AI tokens to extend Study Buddy usage. Available on Premium.',
    icon: 'coins',
  },
  trial_expired: {
    title: 'Trial Ended',
    description: 'Your 7-day free trial has ended. Subscribe to continue using Doorslam with your family.',
    icon: 'clock',
  },
};

export function UpgradeModal({ reason, isOpen, onClose }: UpgradeModalProps) {
  const navigate = useNavigate();
  const message = UPGRADE_MESSAGES[reason];

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-neutral-0 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <AppIcon name="x" className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AppIcon name={message.icon} className="w-8 h-8 text-primary-600" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-primary-900 mb-2">
            {message.title}
          </h2>

          {/* Description */}
          <p className="text-neutral-600 mb-6">
            {message.description}
          </p>

          {/* Actions */}
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
