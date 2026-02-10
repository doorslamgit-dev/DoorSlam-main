import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export interface ProfileData {
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postcode: string | null;
  timezone: string;
}

export interface ChildProfileData {
  first_name: string;
  preferred_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface UseAccountDataReturn {
  parentData: ProfileData | null;
  childData: ChildProfileData | null;
  childId: string | null;
  loading: boolean;
  error: string | null;
  setParentData: (data: ProfileData | null) => void;
  setChildData: (data: ChildProfileData | null) => void;
  setError: (error: string | null) => void;
  reload: () => Promise<void>;
}

export function useAccountData(
  userId: string | undefined,
  isParent: boolean,
  isChild: boolean
): UseAccountDataReturn {
  const [parentData, setParentData] = useState<ProfileData | null>(null);
  const [childData, setChildData] = useState<ChildProfileData | null>(null);
  const [childId, setChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      if (isParent) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(
            "full_name, email, phone, avatar_url, address_line1, address_line2, city, postcode, timezone"
          )
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        setParentData({
          full_name: profileData.full_name || "",
          email: profileData.email || "",
          phone: profileData.phone || null,
          avatar_url: profileData.avatar_url || null,
          address_line1: profileData.address_line1 || null,
          address_line2: profileData.address_line2 || null,
          city: profileData.city || null,
          postcode: profileData.postcode || null,
          timezone:
            profileData.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      } else if (isChild) {
        const { data: childProfileData, error: childError } = await supabase
          .from("children")
          .select("id, first_name, preferred_name, email, avatar_url")
          .eq("auth_user_id", userId)
          .single();

        if (childError) throw childError;

        setChildId(childProfileData.id);
        setChildData({
          first_name: childProfileData.first_name || "",
          preferred_name: childProfileData.preferred_name || null,
          email: childProfileData.email || null,
          avatar_url: childProfileData.avatar_url || null,
        });
      }
    } catch (err: unknown) {
      console.error("Load error:", err);
      setError((err instanceof Error ? err.message : "Failed to load account data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadData uses current state via closure
  }, [userId, isParent, isChild]);

  return {
    parentData,
    childData,
    childId,
    loading,
    error,
    setParentData,
    setChildData,
    setError,
    reload: loadData,
  };
}
