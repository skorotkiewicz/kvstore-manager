import { Settings, ArrowLeft, User, Key, RefreshCw } from "lucide-react";

export default function SettingsView({
  user,
  accessToken,
  onGenerateToken,
  onBack,
}) {
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
        <button type="button" onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
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
                  Keep your token secure. It provides full access to your KV Store data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
