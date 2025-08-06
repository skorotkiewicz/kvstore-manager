export default function SettingsView({
  user,
  accessToken,
  onGenerateToken,
  onBack,
}) {
  return (
    <div className="settings-container">
      <div className="card">
        <div className="card-header">
          <h2>Settings</h2>
          <button type="button" onClick={onBack} className="btn btn-secondary">
            Back to Dashboard
          </button>
        </div>
        <div className="card-content">
          <div className="setting-group">
            <h3>User Information</h3>
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </div>
          <div className="setting-group">
            <h3>Access Token</h3>
            <div className="token-container">
              <code className="token-display">{accessToken}</code>
              <button
                type="button"
                onClick={onGenerateToken}
                className="btn btn-primary"
              >
                Generate New Token
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
