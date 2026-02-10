import { useState } from "react";
import AppIcon from "../ui/AppIcon";
import Button from "../ui/Button";

export function DangerZoneSection() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
  };

  return (
    <div className="rounded-2xl p-6 border-2 border-accent-red bg-danger-bg">
      <div className="flex items-center gap-3 mb-4">
        <AppIcon name="trash" className="w-5 h-5 text-accent-red" />
        <h2 className="text-lg font-semibold text-accent-red">Danger Zone</h2>
      </div>

      <p className="text-sm text-neutral-600 mb-4">
        Once you delete your account, there is no going back. All your data will be
        permanently removed.
      </p>

      {!showDeleteConfirm ? (
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 rounded-xl border-2 border-accent-red text-accent-red font-medium hover:bg-danger-bg transition-colors"
        >
          Delete my account
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-medium text-accent-red">
            Type "DELETE" to confirm:
          </p>

          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-accent-red focus:outline-none"
          />

          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="danger" disabled={deleteConfirmText !== "DELETE"}>
              Permanently delete account
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
