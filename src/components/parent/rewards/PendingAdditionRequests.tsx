// src/components/parent/rewards/PendingAdditionRequests.tsx
// FEAT-013 Phase 3b: Child requests for rewards to be added

import { useState } from 'react';
import AppIcon from '../../ui/AppIcon';

export interface AdditionRequest {
  id: string;
  child_id: string;
  child_name: string;
  template_id: string;
  template_name: string;
  category_name: string;
  suggested_points: number;
  requested_at: string;
}

interface PendingAdditionRequestsProps {
  requests: AdditionRequest[];
  onApprove: (requestId: string, pointsCost?: number) => void;
  onDecline: (requestId: string, note?: string) => void;
  isProcessing: string | null;
}

export function PendingAdditionRequests({
  requests,
  onApprove,
  onDecline,
  isProcessing,
}: PendingAdditionRequestsProps) {
  const [customPoints, setCustomPoints] = useState<Record<string, string>>({});
  const [declineId, setDeclineId] = useState<string | null>(null);
  const [declineNote, setDeclineNote] = useState('');

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const handleApprove = (request: AdditionRequest) => {
    const customPointsValue = customPoints[request.id];
    const points = customPointsValue ? parseInt(customPointsValue, 10) : undefined;
    onApprove(request.id, points);
  };

  const handleDeclineClick = (requestId: string) => {
    if (declineId === requestId) {
      // Submit decline
      onDecline(requestId, declineNote || undefined);
      setDeclineId(null);
      setDeclineNote('');
    } else {
      // Show note input
      setDeclineId(requestId);
      setDeclineNote('');
    }
  };

  if (requests.length === 0) {
    return null; // Don't show section if no pending requests
  }

  return (
    <div className="bg-primary-50 rounded-xl border border-primary-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AppIcon name="send" className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Reward Requests
          </h3>
        </div>
        <span className="bg-primary-200 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
          {requests.length} request{requests.length !== 1 ? 's' : ''}
        </span>
      </div>

      <p className="text-sm text-neutral-600 mb-4">
        Your child has requested these rewards be added to their list.
      </p>

      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-neutral-0 border border-primary-100 rounded-lg p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-neutral-900">
                    {request.child_name}
                  </span>
                  <span className="text-neutral-400">•</span>
                  <span className="text-sm text-neutral-500">
                    {formatTimeAgo(request.requested_at)}
                  </span>
                </div>
                <p className="text-lg font-semibold text-neutral-900">
                  {request.template_name}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                  <span className="text-neutral-500">
                    {request.category_name}
                  </span>
                  <span className="text-primary-600 font-medium">
                    Suggested: {request.suggested_points} pts
                  </span>
                </div>

                {/* Custom points input */}
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-sm text-neutral-600">Set points:</label>
                  <input
                    type="number"
                    value={customPoints[request.id] ?? request.suggested_points}
                    onChange={(e) => setCustomPoints({
                      ...customPoints,
                      [request.id]: e.target.value
                    })}
                    className="w-24 px-3 py-1.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min={1}
                  />
                  <span className="text-sm text-neutral-500">pts</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {isProcessing === request.id ? (
                  <span className="text-neutral-500 flex items-center gap-2">
                    <AppIcon name="loader" className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => handleApprove(request)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <AppIcon name="check" className="w-4 h-4" />
                      Add Reward
                    </button>
                    <button
                      onClick={() => handleDeclineClick(request.id)}
                      className="flex-1 sm:flex-none px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium"
                    >
                      {declineId === request.id ? 'Confirm' : 'Decline'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Decline note input */}
            {declineId === request.id && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={declineNote}
                  onChange={(e) => setDeclineNote(e.target.value)}
                  placeholder="Note to child (optional)"
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={() => {
                    setDeclineId(null);
                    setDeclineNote('');
                  }}
                  className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PendingAdditionRequests;