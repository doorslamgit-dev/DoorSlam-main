import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../../lib/supabase";

export function SecuritySection() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setSavingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordSuccess(true);
      setShowPasswordForm(false);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCancel = () => {
    setShowPasswordForm(false);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <FontAwesomeIcon icon={faLock} className="text-primary-600" />
        <h2 className="text-lg font-semibold text-neutral-700">Security</h2>
      </div>

      {passwordSuccess && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-2 bg-green-100">
          <FontAwesomeIcon icon={faCheck} className="text-accent-green" />
          <p className="text-sm text-green-800">Password changed successfully</p>
        </div>
      )}

      {!showPasswordForm ? (
        <button
          onClick={() => setShowPasswordForm(true)}
          className="text-sm font-medium text-primary-600 hover:underline"
        >
          Change password
        </button>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block text-neutral-700">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-600 bg-neutral-50"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block text-neutral-700">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-600 bg-neutral-50"
            />
          </div>
          {passwordError && (
            <p className="text-sm text-accent-red">{passwordError}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordChange}
              disabled={savingPassword}
              className="px-4 py-2 rounded-xl bg-primary-600 text-white font-medium flex items-center gap-2 hover:bg-primary-700 transition-colors"
            >
              {savingPassword && (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              )}
              Update password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
