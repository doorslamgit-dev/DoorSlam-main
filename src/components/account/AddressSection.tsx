import { useState } from "react";
import AppIcon from "../../components/ui/AppIcon";
import { supabase } from "../../lib/supabase";
import { SectionCard } from "./SectionCard";
import { FormField } from "./FormField";
import type { ProfileData } from "../../hooks/useAccountData";
import type { IconKey } from "../../components/ui/AppIcon";

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

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          address_line1: localData.address_line1,
          address_line2: localData.address_line2,
          city: localData.city,
          postcode: localData.postcode,
          timezone: localData.timezone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      onUpdate(localData);
      setEditing(false);
      setBackup(null);
    } catch (err: any) {
      onError(err.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  // SectionCard currently takes an icon prop; keep it compliant without FontAwesome.
  // If SectionCard still expects a FontAwesome IconDefinition, we should refactor SectionCard next
  // to accept `iconKey?: IconKey` or `icon?: ReactNode`.
  const sectionIconKey: IconKey = "map-pin";

  return (
    <SectionCard
      icon={<AppIcon name={sectionIconKey} className="w-5 h-5 text-neutral-700" aria-hidden />}
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
          onChange={(v) =>
            setLocalData({ ...localData, address_line1: v || null })
          }
          disabled={!editing}
        />
        <FormField
          label="Address line 2 (optional)"
          value={localData.address_line2 || ""}
          onChange={(v) =>
            setLocalData({ ...localData, address_line2: v || null })
          }
          disabled={!editing}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="City"
            value={localData.city || ""}
            onChange={(v) => setLocalData({ ...localData, city: v || null })}
            disabled={!editing}
          />
          <FormField
            label="Postcode"
            value={localData.postcode || ""}
            onChange={(v) =>
              setLocalData({ ...localData, postcode: v || null })
            }
            disabled={!editing}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block text-neutral-700">
            Time zone
          </label>
          <select
            value={localData.timezone}
            onChange={(e) =>
              setLocalData({ ...localData, timezone: e.target.value })
            }
            disabled={!editing}
            className={`w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:cursor-not-allowed transition-colors ${
              editing
                ? "bg-neutral-50 text-neutral-700"
                : "bg-neutral-100 text-neutral-500"
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
