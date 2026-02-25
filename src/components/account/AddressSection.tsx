import { useState } from "react";
import { SectionCard } from "./SectionCard";
import FormField from "../ui/FormField";
import { updateParentAddress } from "../../services/accountService";
import type { ProfileData } from "../../hooks/useAccountData";

interface AddressSectionProps {
  parentData: ProfileData;
  userId: string;
  onUpdate: (data: ProfileData) => void;
  onError: (error: string) => void;
}

export function AddressSection({
  parentData,
  userId,
  onUpdate,
  onError,
}: AddressSectionProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [backup, setBackup] = useState<Partial<ProfileData> | null>(null);
  const [localData, setLocalData] = useState<ProfileData>(parentData);

  const startEdit = () => {
    setBackup({
      address_line1: parentData.address_line1,
      address_line2: parentData.address_line2,
      city: parentData.city,
      postcode: parentData.postcode,
      timezone: parentData.timezone,
    });
    setLocalData(parentData);
    setEditing(true);
  };

  const cancelEdit = () => {
    if (backup) {
      setLocalData({ ...parentData, ...backup });
    }
    setEditing(false);
    setBackup(null);
  };

  const save = async () => {
    setSaving(true);
    onError("");

    const { success, error } = await updateParentAddress(userId, {
      address_line1: localData.address_line1,
      address_line2: localData.address_line2,
      city: localData.city,
      postcode: localData.postcode,
      timezone: localData.timezone,
    });

    if (!success) {
      onError(error || "Failed to save address");
      setSaving(false);
      return;
    }

    onUpdate(localData);
    setEditing(false);
    setBackup(null);
    setSaving(false);
  };

  return (
    <SectionCard
      icon="map-pin"
      title="Address"
      editing={editing}
      saving={saving}
      onEdit={startEdit}
      onSave={save}
      onCancel={cancelEdit}
    >
      <div className="space-y-4">
        <FormField
          label="Address line 1"
          value={localData.address_line1 || ""}
          onChange={(e) =>
            setLocalData({ ...localData, address_line1: e.target.value || null })
          }
          disabled={!editing}
        />
        <FormField
          label="Address line 2 (optional)"
          value={localData.address_line2 || ""}
          onChange={(e) =>
            setLocalData({ ...localData, address_line2: e.target.value || null })
          }
          disabled={!editing}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="City"
            value={localData.city || ""}
            onChange={(e) => setLocalData({ ...localData, city: e.target.value || null })}
            disabled={!editing}
          />
          <FormField
            label="Postcode"
            value={localData.postcode || ""}
            onChange={(e) =>
              setLocalData({ ...localData, postcode: e.target.value || null })
            }
            disabled={!editing}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block text-foreground">
            Time zone
          </label>
          <select
            value={localData.timezone}
            onChange={(e) =>
              setLocalData({ ...localData, timezone: e.target.value })
            }
            disabled={!editing}
            className={`w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed transition-colors ${
              editing
                ? "bg-muted text-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            <option value="Europe/London">Europe/London (GMT/BST)</option>
            <option value="Europe/Paris">Europe/Paris (CET)</option>
            <option value="America/New_York">America/New York (EST)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
          </select>
        </div>
      </div>
    </SectionCard>
  );
}
