import {
  Database,
  HardDrive,
  Key,
  Shield,
  Zap,
  Code,
  BarChart3,
  Users,
} from "lucide-react";

function FrontPageView({ onGetStarted, onLogin }) {
  return (
    <div className="front-page">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <Database size={20} />
            <span>Professional KV Management</span>
          </div>
          <h1 className="hero-title">
            Manage your <span className="highlight">Key-Value</span> data
            <br />
            with a modern interface
          </h1>
          <p className="hero-description">
            A powerful platform for managing key-value databases. Perfect for
            developers who need reliable data storage with a clean, intuitive
            interface.
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">3</div>
              <div className="stat-label">Max Databases</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">∞</div>
              <div className="stat-label">Key-Value Pairs</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Secure</div>
            </div>
          </div>

          <div className="hero-actions">
            <button
              type="button"
              onClick={onGetStarted}
              className="btn-modern primary"
            >
              <Key size={20} />
              Get Started
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="btn-modern secondary"
            >
              <Users size={20} />
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features">
        <div className="features-container">
          <div className="features-header">
            <h2>Features & Capabilities</h2>
            <p>Everything you need for professional data management</p>
          </div>

          <div className="features-grid-modern">
            <div className="feature-card-modern primary">
              <div className="feature-icon">
                <Database />
              </div>
              <h3>Database Management</h3>
              <p>
                Create and manage multiple databases with ease. Intuitive
                interface allows for quick operations and seamless workflow.
              </p>
              <div className="feature-highlight">Up to 3 databases</div>
            </div>

            <div className="feature-card-modern">
              <div className="feature-icon">
                <HardDrive />
              </div>
              <h3>Store Operations</h3>
              <p>
                Organize your data with flexible store structures. Easy adding,
                removing, and managing of data stores.
              </p>
            </div>

            <div className="feature-card-modern">
              <div className="feature-icon">
                <Key />
              </div>
              <h3>Key-Value Interface</h3>
              <p>
                Main focus on managing key-value pairs. Fast adding, editing,
                and deleting of data with real-time updates.
              </p>
            </div>

            <div className="feature-card-modern">
              <div className="feature-icon">
                <Code />
              </div>
              <h3>API Integration</h3>
              <p>
                Complete REST API for programmatic access. Full documentation
                and code examples in one place.
              </p>
            </div>

            <div className="feature-card-modern">
              <div className="feature-icon">
                <Shield />
              </div>
              <h3>Secure Access</h3>
              <p>
                Token-based authentication and user management. Your data is
                protected with enterprise-grade security.
              </p>
            </div>

            <div className="feature-card-modern">
              <div className="feature-icon">
                <Zap />
              </div>
              <h3>Performance</h3>
              <p>
                Fast operations and responsive interface. Modern design with
                dark/light mode support.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta">
        <div className="cta-content">
          <div className="cta-icon">
            <BarChart3 size={48} />
          </div>
          <h3>Ready to get started?</h3>
          <p>
            Join thousands of developers who manage their data with KV Store
            Manager
          </p>
          <button
            type="button"
            onClick={onGetStarted}
            className="btn-modern primary large"
          >
            <Database size={20} />
            Start for free
          </button>
        </div>
      </div>
    </div>
  );
}

export default FrontPageView;
