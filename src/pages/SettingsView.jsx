import { useState } from "react";
import {
  Settings,
  User,
  Key,
  RefreshCw,
  Lock,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SettingsView({
  user,
  accessToken,
  onGenerateToken,
  kvStore,
  onLogout,
}) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    setIsChangingPassword(true);
    try {
      await kvStore.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      setPasswordSuccess("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordError(error.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteConfirmationChange = (value) => {
    setDeleteConfirmation(value);
    setDeleteError("");
  };

  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    setDeleteError("");

    const expectedText = "DELETE MY ACCOUNT";

    if (deleteConfirmation !== expectedText) {
      setDeleteError(
        `Please type "${expectedText}" exactly in the confirmation field`,
      );
      return;
    }

    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm account deletion");
      return;
    }

    setIsDeletingAccount(true);
    try {
      await kvStore.deleteAccount(deletePassword, deleteConfirmation);
      onLogout();
    } catch (error) {
      setDeleteError(error.message || "Failed to delete account");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };
  return (
    <div className="settings-container">
      {/* Header Section */}
      <div className="header-section">
        <div className="settings-header-content">
          <div className="header-title">
            <Settings size={24} />
            <h1>Settings</h1>
          </div>
          <p className="header-subtitle">Manage your account and API access</p>
        </div>
      </div>
      {/* Main Content */}
      <div className="main-content-area">
        <div className="settings-grid">
          {/* User Information Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <User size={20} />
                <span>User Information</span>
              </div>
            </div>
            <div className="card-content">
              <div className="user-info-grid">
                <div className="info-item">
                  <label className="info-label">Username</label>
                  <div className="info-value">{user.username}</div>
                </div>
                <div className="info-item">
                  <label className="info-label">Email</label>
                  <div className="info-value">{user.email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* API Token Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <Key size={20} />
                <span>API Access Token</span>
              </div>
            </div>
            <div className="card-content">
              <div className="token-section">
                <div className="token-display-container">
                  <code className="token-display">{accessToken}</code>
                </div>
                <button
                  type="button"
                  onClick={onGenerateToken}
                  className="btn btn-primary token-btn"
                >
                  <RefreshCw size={16} />
                  Generate New Token
                </button>
                <p className="token-info">
                  Keep your token secure. It provides full access to your KV
                  Store data.
                </p>
              </div>
            </div>
          </div>

          {/* Password Change Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <Lock size={20} />
                <span>Change Password</span>
              </div>
            </div>
            <div className="card-content">
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-field">
                  <label htmlFor="currentPassword">Current Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("current")}
                    >
                      {showPasswords.current ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password"
                      minLength="6"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("new")}
                    >
                      {showPasswords.new ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                      minLength="6"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("confirm")}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="error-message">
                    <AlertTriangle size={16} />
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="success-message">
                    <Shield size={16} />
                    {passwordSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isChangingPassword}
                >
                  <Lock size={16} />
                  {isChangingPassword
                    ? "Changing Password..."
                    : "Change Password"}
                </button>
              </form>
            </div>
          </div>

          {/* Account Deletion Card */}
          <div className="content-card danger-card">
            <div className="card-header">
              <div className="card-title">
                <AlertTriangle size={20} />
                <span>Danger Zone</span>
              </div>
            </div>
            <div className="card-content">
              <div className="danger-section">
                <h3>Delete Account</h3>
                <p className="danger-warning">
                  This action cannot be undone. This will permanently delete
                  your account, all databases, stores, and data associated with
                  your account.
                </p>

                <form
                  onSubmit={handleDeleteAccountSubmit}
                  className="delete-form"
                >
                  <div className="confirmation-fields">
                    <p className="confirmation-instruction">
                      Type <strong>"DELETE MY ACCOUNT"</strong> in the field
                      below to confirm:
                    </p>

                    <div className="form-field">
                      <label htmlFor="confirmation">Confirmation</label>
                      <input
                        type="text"
                        id="confirmation"
                        value={deleteConfirmation}
                        onChange={(e) =>
                          handleDeleteConfirmationChange(e.target.value)
                        }
                        placeholder="DELETE MY ACCOUNT"
                        className="confirmation-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="deletePassword">Password</label>
                    <div className="input-wrapper">
                      <input
                        type={showDeletePassword ? "text" : "password"}
                        id="deletePassword"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Enter your password to confirm"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowDeletePassword(!showDeletePassword)
                        }
                      >
                        {showDeletePassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {deleteError && (
                    <div className="error-message">
                      <AlertTriangle size={16} />
                      {deleteError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={isDeletingAccount}
                  >
                    <AlertTriangle size={16} />
                    {isDeletingAccount
                      ? "Deleting Account..."
                      : "Delete My Account"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
