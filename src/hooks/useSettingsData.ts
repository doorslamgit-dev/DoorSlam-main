import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export interface NotificationSettings {
  weekly_summary: boolean;
  session_reminders: boolean;
  achievement_alerts: boolean;
  insights_available: boolean;
}

export interface Child {
  id: string;
  first_name: string;
  preferred_name: string | null;
  school_name: string | null;
  school_town: string | null;
  school_postcode_prefix: string | null;
}

interface UseSettingsDataReturn {
  shareAnalytics: boolean;
  notifications: NotificationSettings;
  children: Child[];
  loading: boolean;
  error: string | null;
  setShareAnalytics: (value: boolean) => void;
  setNotifications: (value: NotificationSettings) => void;
  setChildren: (value: Child[]) => void;
  setError: (error: string | null) => void;
  reload: () => Promise<void>;
}

export function useSettingsData(
  userId: string | undefined,
  isParent: boolean
): UseSettingsDataReturn {
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    weekly_summary: true,
    session_reminders: true,
    achievement_alerts: true,
    insights_available: true,
  });
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!userId || !isParent) return;

    setLoading(true);
    setError(null);

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("share_anonymised_data, notification_settings")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      setShareAnalytics(profileData?.share_anonymised_data ?? false);
      setNotifications(
        profileData?.notification_settings ?? {
          weekly_summary: true,
          session_reminders: true,
          achievement_alerts: true,
          insights_available: true,
        }
      );

      const { data: childrenData, error: childrenError } = await supabase
        .from("children")
        .select(
          "id, first_name, preferred_name, school_name, school_town, school_postcode_prefix"
        )
        .eq("parent_id", userId)
        .order("first_name");

      if (childrenError) throw childrenError;

      setChildren(childrenData || []);
    } catch (err: any) {
      console.error("Load error:", err);
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId, isParent]);

  return {
    shareAnalytics,
    notifications,
    children,
    loading,
    error,
    setShareAnalytics,
    setNotifications,
    setChildren,
    setError,
    reload: loadData,
  };
}
