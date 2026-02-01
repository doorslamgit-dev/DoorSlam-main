import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { NotificationToggle } from "./NotificationToggle";
import type { NotificationSettings } from "../../hooks/useSettingsData";
import AppIcon from "../ui/AppIcon";

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
    } catch (err: any) {
      onError(err.message || "Failed to save notifications");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AppIcon name="bell" className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-neutral-700">Notifications</h2>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={startEdit}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-neutral-50 transition-colors"
          >
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-neutral-200 text-neutral-600 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-accent-green disabled:opacity-50"
            >
              {saving ? (
                <AppIcon name="loader" className="w-4 h-4 animate-spin" />
              ) : (
                <AppIcon name="check" className="w-4 h-4" />
              )}
              Save
            </button>
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
