import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { NotificationToggle } from "./NotificationToggle";
import type { NotificationSettings } from "../../hooks/useSettingsData";
import AppIcon from "../ui/AppIcon";
import Button from "../ui/Button";

interface NotificationsSectionProps {
  notifications: NotificationSettings;
  shareAnalytics: boolean;
  userId: string;
  onUpdate: (notifications: NotificationSettings) => void;
  onError: (error: string) => void;
}

export function NotificationsSection({
  notifications,
  shareAnalytics,
  userId,
  onUpdate,
  onError,
}: NotificationsSectionProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [backup, setBackup] = useState<NotificationSettings | null>(null);
  const [localNotifications, setLocalNotifications] =
    useState<NotificationSettings>(notifications);

  const startEdit = () => {
    setBackup({ ...notifications });
    setLocalNotifications(notifications);
    setEditing(true);
  };

  const cancelEdit = () => {
    if (backup) {
      setLocalNotifications(backup);
    }
    setEditing(false);
    setBackup(null);
  };

  const save = async () => {
    setSaving(true);
    onError("");

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          notification_settings: localNotifications,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      onUpdate(localNotifications);
      setEditing(false);
      setBackup(null);
    } catch (err: unknown) {
      onError((err instanceof Error ? err.message : "Failed to save notifications"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AppIcon name="bell" className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-neutral-700">Notifications</h2>
        </div>

        {!editing ? (
          <Button variant="ghost" size="sm" onClick={startEdit}>
            Edit
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={cancelEdit} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={save}
              loading={saving}
              leftIcon="check"
            >
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <NotificationToggle
          label="Weekly summary email"
          description="Get a summary of your children's progress each Monday"
          enabled={localNotifications.weekly_summary}
          onChange={(enabled) =>
            setLocalNotifications({ ...localNotifications, weekly_summary: enabled })
          }
          disabled={!editing}
        />

        <NotificationToggle
          label="Session reminders"
          description="Reminders when sessions are due"
          enabled={localNotifications.session_reminders}
          onChange={(enabled) =>
            setLocalNotifications({ ...localNotifications, session_reminders: enabled })
          }
          disabled={!editing}
        />

        <NotificationToggle
          label="Achievement alerts"
          description="Celebrate when your children earn achievements"
          enabled={localNotifications.achievement_alerts}
          onChange={(enabled) =>
            setLocalNotifications({
              ...localNotifications,
              achievement_alerts: enabled,
            })
          }
          disabled={!editing}
        />

        <NotificationToggle
          label="Insights available"
          description="Get notified when new insights are ready"
          enabled={localNotifications.insights_available}
          onChange={(enabled) =>
            setLocalNotifications({
              ...localNotifications,
              insights_available: enabled,
            })
          }
          disabled={!editing || !shareAnalytics}
          dimmed={!shareAnalytics}
        />
      </div>
    </div>
  );
}
