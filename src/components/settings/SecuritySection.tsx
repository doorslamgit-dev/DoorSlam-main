import { useState } from "react";
import Alert from "../ui/Alert";
import AppIcon from "../ui/AppIcon";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import { updatePassword } from "../../services/accountService";

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

    const { success, error } = await updatePassword(newPassword);

    if (success) {
      setPasswordSuccess(true);
      setShowPasswordForm(false);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } else {
      setPasswordError(error || "Failed to change password");
    }

    setSavingPassword(false);
  };

  const handleCancel = () => {
    setShowPasswordForm(false);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
  };

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <AppIcon name="lock" className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-neutral-700">Security</h2>
      </div>

      {passwordSuccess && (
        <Alert variant="success" className="mb-4">
          Password changed successfully
        </Alert>
      )}

      {!showPasswordForm ? (
        <Button variant="ghost" size="sm" onClick={() => setShowPasswordForm(true)}>
          Change password
        </Button>
      ) : (
        <div className="space-y-4">
          <FormField
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <FormField
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {passwordError && (
            <Alert variant="error" hideIcon>
              {passwordError}
            </Alert>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} loading={savingPassword}>
              Update password
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
