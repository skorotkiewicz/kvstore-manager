function FrontPageView({ onGetStarted, onLogin }) {
  return (
    <div className="front-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">KV Store Manager</h1>
          <p className="hero-subtitle">
            A powerful and intuitive key-value database management platform
          </p>
          <p className="hero-description">
            Manage your databases, stores, and data with ease. Built for
            developers who need reliable key-value storage with a clean, modern
            interface.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              onClick={onGetStarted}
              className="btn btn-primary btn-large"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="btn btn-secondary btn-large"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="features-content">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Database Management</h3>
              <p>Create and manage multiple databases with ease</p>
            </div>
            <div className="feature-card">
              <h3>Store Operations</h3>
              <p>Organize your data with flexible store structures</p>
            </div>
            <div className="feature-card">
              <h3>API Integration</h3>
              <p>Complete REST API for programmatic access</p>
            </div>
            <div className="feature-card">
              <h3>Secure Access</h3>
              <p>Token-based authentication and user management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FrontPageView;
