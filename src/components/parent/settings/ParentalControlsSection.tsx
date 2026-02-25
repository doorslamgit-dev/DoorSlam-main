// src/components/parent/settings/ParentalControlsSection.tsx
// Per-child feature access controls + pending approval queue.
// Shown in ParentSettingsPage for Family+ and Premium subscribers.

import { useState } from "react";
import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import AppIcon from "../../ui/AppIcon";
import LoadingSpinner from "../../ui/LoadingSpinner";
import Alert from "../../ui/Alert";
import { useParentalControls } from "../../../hooks/useParentalControls";
import { resolveApprovalRequest } from "../../../services/parentalControlsService";
import {
  FEATURE_LABELS,
  ACCESS_LEVEL_OPTIONS,
  type AccessLevel,
  type FeatureKey,
} from "../../../types/parentalControls";

interface ChildInfo {
  child_id: string;
  child_name: string;
}

interface ParentalControlsSectionProps {
  parentId: string;
  children: ChildInfo[];
  canUse: boolean;
}

export default function ParentalControlsSection({
  parentId,
  children: childrenList,
  canUse,
}: ParentalControlsSectionProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>(
    childrenList[0]?.child_id ?? ""
  );

  const { controls, pendingRequests, loading, error, updateControl, refresh } =
    useParentalControls(parentId, selectedChildId || undefined);

  const [resolving, setResolving] = useState<string | null>(null);

  // Not on Family+ — show upgrade prompt
  if (!canUse) {
    return (
      <Card variant="default">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <AppIcon name="shield" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Parental Controls
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upgrade to Family or Premium to manage what your children can
              edit.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (childrenList.length === 0) return null;

  const getControlLevel = (featureKey: FeatureKey): AccessLevel => {
    const ctrl = controls.find((c) => c.feature_key === featureKey);
    return ctrl?.access_level ?? "none";
  };

  const handleResolve = async (
    requestId: string,
    status: "approved" | "rejected"
  ) => {
    setResolving(requestId);
    const result = await resolveApprovalRequest(requestId, status);
    setResolving(null);
    if (result.success) {
      refresh();
    }
  };

  return (
    <Card variant="default">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <AppIcon name="shield" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Parental Controls
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Control what your children can edit
            </p>
          </div>
        </div>

        {pendingRequests.length > 0 && (
          <Badge variant="warning" badgeStyle="solid" size="sm">
            {pendingRequests.length} pending
          </Badge>
        )}
      </div>

      {/* Child selector (if multiple children) */}
      {childrenList.length > 1 && (
        <div className="flex items-center gap-2 mb-4">
          {childrenList.map((child) => (
            <button
              key={child.child_id}
              onClick={() => setSelectedChildId(child.child_id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedChildId === child.child_id
                  ? "bg-primary text-white"
                  : "bg-secondary text-muted-foreground hover:bg-muted"
              }`}
            >
              {child.child_name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingSpinner size="sm" />
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : (
        <div className="space-y-4">
          {/* Feature toggles */}
          {(Object.keys(FEATURE_LABELS) as FeatureKey[]).map((featureKey) => {
            const currentLevel = getControlLevel(featureKey);

            return (
              <div
                key={featureKey}
                className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {FEATURE_LABELS[featureKey]}
                  </div>
                </div>

                {/* 3-way toggle */}
                <div className="flex items-center gap-1">
                  {ACCESS_LEVEL_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateControl(featureKey, option.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        currentLevel === option.value
                          ? "bg-primary text-white"
                          : "bg-secondary text-muted-foreground hover:bg-muted"
                      }`}
                      title={option.description}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Pending approval requests */}
          {pendingRequests.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Pending Requests
              </h4>
              <div className="space-y-2">
                {pendingRequests.map((req) => {
                  const data = req.request_data as Record<string, string>;
                  return (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <div className="text-sm text-foreground">
                          {req.request_type === "move_topic"
                            ? `Move "${data.topic_name || "topic"}" (${data.subject_name || ""})`
                            : req.request_type}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {new Date(req.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon="check"
                          loading={resolving === req.id}
                          onClick={() => handleResolve(req.id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon="x"
                          loading={resolving === req.id}
                          onClick={() => handleResolve(req.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
