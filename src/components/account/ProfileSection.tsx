import { useState } from "react";
import AppIcon from "../../components/ui/AppIcon";
import type { IconKey } from "../../components/ui/AppIcon";
import { supabase } from "../../lib/supabase";
import { SectionCard } from "./SectionCard";
import { FormField } from "./FormField";
import type { ProfileData, ChildProfileData } from "../../hooks/useAccountData";

interface ProfileSectionProps {
  isParent: boolean;
  isChild: boolean;
  parentData: ProfileData | null;
  childData: ChildProfileData | null;
  childId: string | null;
  userId: string;
  onUpdate: (data: ProfileData | ChildProfileData) => void;
  onError: (error: string) => void;
}

export function ProfileSection({
  isParent,
  isChild,
  parentData,
  childData,
  childId,
  userId,
  onUpdate,
  onError,
}: ProfileSectionProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parentBackup, setParentBackup] = useState<Partial<ProfileData> | null>(null);
  const [childBackup, setChildBackup] = useState<Partial<ChildProfileData> | null>(null);
  const [localParentData, setLocalParentData] = useState<ProfileData | null>(parentData);
  const [localChildData, setLocalChildData] = useState<ChildProfileData | null>(childData);

  const startEdit = () => {
    if (parentData) {
      setParentBackup({ full_name: parentData.full_name, phone: parentData.phone });
      setLocalParentData(parentData);
    } else if (childData) {
      setChildBackup({ preferred_name: childData.preferred_name });
      setLocalChildData(childData);
    }
    setEditing(true);
  };

  const cancelEdit = () => {
    if (parentBackup && parentData) {
      setLocalParentData({ ...parentData, ...parentBackup });
    } else if (childBackup && childData) {
      setLocalChildData({ ...childData, ...childBackup });
    }
    setEditing(false);
    setParentBackup(null);
    setChildBackup(null);
  };

  const save = async () => {
    if (!localParentData && !localChildData) return;

    setSaving(true);
    onError("");

    try {
      if (isParent && localParentData) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            full_name: localParentData.full_name,
            phone: localParentData.phone,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (updateError) throw updateError;
        onUpdate(localParentData);
      } else if (isChild && localChildData && childId) {
        const { error: updateError } = await supabase
          .from("children")
          .update({
            preferred_name: localChildData.preferred_name,
            updated_at: new Date().toISOString(),
          })
          .eq("id", childId);

        if (updateError) throw updateError;
        onUpdate(localChildData);
      }

      setEditing(false);
      setParentBackup(null);
      setChildBackup(null);
    } catch (err: any) {
      onError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // SectionCard currently takes an icon prop; keep it compliant without FontAwesome.
  // If SectionCard still expects a FontAwesome IconDefinition, refactor SectionCard next
  // to accept `iconKey?: IconKey` or `icon?: ReactNode`.
  const sectionIconKey: IconKey = "user";

  return (
    <SectionCard
      icon={<AppIcon name={sectionIconKey} className="w-5 h-5 text-neutral-700" aria-hidden />}
      title="Profile"
      editing={editing}
      saving={saving}
      onEdit={startEdit}
      onSave={save}
      onCancel={cancelEdit}
    >
      {isParent && localParentData && (
        <div className="space-y-4">
          <FormField
            label="Full name"
            value={localParentData.full_name}
            onChange={(v) => setLocalParentData({ ...localParentData, full_name: v })}
            disabled={!editing}
          />
          <FormField
            label="Email"
            value={localParentData.email}
            disabled={true}
            hint="Contact support to change your email"
          />
          <FormField
            label="Phone (optional)"
            value={localParentData.phone || ""}
            onChange={(v) => setLocalParentData({ ...localParentData, phone: v || null })}
            disabled={!editing}
            placeholder="+44 7700 900000"
          />
        </div>
      )}

      {isChild && localChildData && (
        <div className="space-y-4">
          <FormField
            label="Display name"
            value={localChildData.preferred_name || localChildData.first_name}
            onChange={(v) => setLocalChildData({ ...localChildData, preferred_name: v })}
            disabled={!editing}
          />
          {localChildData.email && (
            <FormField label="Email" value={localChildData.email} disabled={true} />
          )}
        </div>
      )}
    </SectionCard>
  );
}
