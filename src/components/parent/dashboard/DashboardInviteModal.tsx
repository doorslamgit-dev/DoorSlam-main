// src/components/parent/dashboard/DashboardInviteModal.tsx
// Modal overlay for inviting a child from the dashboard


import { useCallback, useEffect, useState } from 'react';
import { rpcCreateChildInvite } from '../../../services/invitationService';
import type { ChildInviteCreateResult } from '../../../services/invitationService';
import AppIcon from '../../ui/AppIcon';

interface DashboardInviteModalProps {
  childId: string;
  childName: string;
  invitationCode: string | null;
  onClose: () => void;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      return false;
    }
  }
}

export function DashboardInviteModal({
  childId,
  childName,
  invitationCode: existingCode,
  onClose,
}: DashboardInviteModalProps) {
  const [invite, setInvite] = useState<ChildInviteCreateResult | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);

  // Generate invite if one doesn't exist
  useEffect(() => {
    if (existingCode) {
      // Build a synthetic result from existing data
      setInvite({
        child_id: childId,
        invitation_code: existingCode,
        invitation_link: `/invite/${existingCode}`,
        invitation_sent_at: new Date().toISOString(),
      });
      return;
    }

    let cancelled = false;
    setLoadingInvite(true);

    rpcCreateChildInvite(childId).then((result) => {
      if (cancelled) return;
      setLoadingInvite(false);
      if (result.ok && result.invite) {
        setInvite(result.invite);
      } else {
        setInviteError(result.error ?? 'Failed to create invitation');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [childId, existingCode]);

  const inviteUrl = invite
    ? `${window.location.origin}${invite.invitation_link}`
    : '';

  const handleCopyLink = useCallback(async () => {
    if (!inviteUrl) return;
    const ok = await copyToClipboard(inviteUrl);
    if (ok) {
      setCopied('link');
      setTimeout(() => setCopied(null), 3000);
    }
  }, [inviteUrl]);

  const handleCopyCode = useCallback(async () => {
    if (!invite) return;
    const ok = await copyToClipboard(invite.invitation_code);
    if (ok) {
      setCopied('code');
      setTimeout(() => setCopied(null), 3000);
    }
  }, [invite]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-neutral-0 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-neutral-100 rounded-lg transition"
          aria-label="Close"
        >
          <AppIcon name="x" className="w-5 h-5 text-neutral-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AppIcon name="user-plus" className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">
            Invite {childName}
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Share this link or code so {childName} can access their revision sessions.
          </p>
        </div>

        {/* Loading state */}
        {loadingInvite && (
          <div className="text-center py-8">
            <AppIcon name="loader-2" className="w-6 h-6 text-primary-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-neutral-500">Generating invitation...</p>
          </div>
        )}

        {/* Error state */}
        {inviteError && (
          <div className="bg-accent-red/5 border border-accent-red/20 rounded-lg p-4 text-center">
            <p className="text-sm text-accent-red">{inviteError}</p>
            <button
              onClick={onClose}
              className="mt-3 text-sm font-medium text-neutral-600 hover:text-neutral-800"
            >
              Close
            </button>
          </div>
        )}

        {/* Invite options */}
        {invite && !loadingInvite && !inviteError && (
          <div className="space-y-4">
            {/* Invitation link */}
            <div className="border border-neutral-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-neutral-800 mb-2">Share invitation link</h4>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600 font-mono break-all">
                  {inviteUrl}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition text-xs whitespace-nowrap flex items-center gap-1.5"
                >
                  <AppIcon
                    name={copied === 'link' ? 'check' : 'copy'}
                    className="w-3.5 h-3.5"
                  />
                  {copied === 'link' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Invitation code */}
            <div className="border border-neutral-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-neutral-800 mb-2">Share invitation code</h4>
              <div className="flex gap-2 items-center">
                <div className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-center">
                  <span className="text-xl font-bold text-primary-600 font-mono tracking-widest">
                    {invite.invitation_code}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition text-xs whitespace-nowrap flex items-center gap-1.5"
                >
                  <AppIcon
                    name={copied === 'code' ? 'check' : 'copy'}
                    className="w-3.5 h-3.5"
                  />
                  {copied === 'code' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Done button */}
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition font-medium text-sm"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      <div
        className={`fixed top-6 right-6 bg-neutral-900 text-white px-5 py-2.5 rounded-lg shadow-lg transform transition-transform duration-300 z-[60] ${
          copied ? 'translate-x-0' : 'translate-x-[calc(100%+24px)]'
        }`}
      >
        <div className="flex items-center gap-2">
          <AppIcon name="check-circle" className="w-4 h-4 text-accent-green" />
          <span className="text-sm font-medium">Copied to clipboard!</span>
        </div>
      </div>
    </div>
  );
}

export default DashboardInviteModal;
