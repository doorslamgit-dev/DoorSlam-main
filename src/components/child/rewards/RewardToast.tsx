// src/components/child/rewards/RewardToast.tsx
// FEAT-013 Phase 3: Toast notification for reward redemption success

import React, { useEffect, useState } from 'react';
import AppIcon from '../../ui/AppIcon';

interface RewardToastProps {
  type: 'approved' | 'pending';
  rewardName: string;
  rewardEmoji: string;
  onClose: () => void;
  duration?: number;  // ms before auto-close
}

export function RewardToast({
  type,
  rewardName,
  rewardEmoji,
  onClose,
  duration = 4000,
}: RewardToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Play celebration sound for approved rewards
    if (type === 'approved') {
      playSuccessSound();
    }

    // Auto-close after duration
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [type, duration, onClose]);

  // Play a simple celebration sound (Web Audio API)
  function playSuccessSound() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      
      // Simple ascending arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = ctx.currentTime + (i * 0.1);
        const endTime = startTime + 0.15;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gainNode.gain.linearRampToValueAtTime(0, endTime);
        
        oscillator.start(startTime);
        oscillator.stop(endTime);
      });
    } catch (err) {
      // Audio not available, fail silently
      console.debug('Audio not available:', err);
    }
  }

  const isApproved = type === 'approved';

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible && !isExiting
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4'
      }`}
    >
      <div
        className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg border ${
          isApproved
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
        }`}
      >
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isApproved ? 'bg-green-100' : 'bg-amber-100'
          }`}
        >
          {isApproved ? (
            <AppIcon name="party-popper" className="w-5 h-5 text-green-600" />
          ) : (
            <AppIcon name="clock" className="w-5 h-5 text-amber-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold ${isApproved ? 'text-green-800' : 'text-amber-800'}`}>
            {isApproved ? 'Reward Approved!' : 'Request Sent!'}
          </p>
          <p className="text-sm text-gray-600 truncate">
            {rewardEmoji} {rewardName}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(onClose, 300);
          }}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <AppIcon name="x" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default RewardToast;