import { useState } from "react";
import { SectionCard } from "./SectionCard";
import FormField from "../ui/FormField";
import { updateParentProfile, updateChildProfile } from "../../services/accountService";
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

    if (isParent && localParentData) {
      const { success, error } = await updateParentProfile(userId, {
        full_name: localParentData.full_name,
        phone: localParentData.phone,
      });

      if (!success) {
        onError(error || "Failed to save profile");
        setSaving(false);
        return;
      }
      onUpdate(localParentData);
    } else if (isChild && localChildData && childId) {
      const { success, error } = await updateChildProfile(childId, {
        preferred_name: localChildData.preferred_name,
      });

      if (!success) {
        onError(error || "Failed to save profile");
        setSaving(false);
        return;
      }
      onUpdate(localChildData);
    }

    setEditing(false);
    setParentBackup(null);
    setChildBackup(null);
    setSaving(false);
  };

  return (
    <SectionCard
      icon="user"
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
            onChange={(e) => setLocalParentData({ ...localParentData, full_name: e.target.value })}
            disabled={!editing}
          />
          <FormField
            label="Email"
            value={localParentData.email}
            disabled={true}
            helperText="Contact support to change your email"
          />
          <FormField
            label="Phone (optional)"
            value={localParentData.phone || ""}
            onChange={(e) => setLocalParentData({ ...localParentData, phone: e.target.value || null })}
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
            onChange={(e) => setLocalChildData({ ...localChildData, preferred_name: e.target.value })}
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
