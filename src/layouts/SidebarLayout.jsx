import {
  Menu,
  X,
  Database,
  Settings,
  FileText,
  LogOut,
  User,
  Moon,
  Sun,
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAppStore } from "../store";

function SidebarLayout({ children }) {
  const {
    user,
    sidebarOpen,
    setSidebarOpen,
    darkMode,
    toggleDarkMode,
    handleLogout,
  } = useAppStore();

  const [location] = useLocation();

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      {/* Sidebar */}

      <aside className={`sidebar-nav ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Database className="brand-icon" />
            {sidebarOpen && <span className="brand-text">KV Store</span>}
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-toggle"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-section">
            <Link
              href="/dashboard"
              className={`menu-item ${location === "/dashboard" ? "active" : ""}`}
            >
              <Database size={20} />
              {sidebarOpen && <span>Dashboard</span>}
            </Link>
            <Link
              href="/api-docs"
              className={`menu-item ${location === "/api-docs" ? "active" : ""}`}
            >
              <FileText size={20} />
              {sidebarOpen && <span>API Docs</span>}
            </Link>
            <Link
              href="/settings"
              className={`menu-item ${location === "/settings" ? "active" : ""}`}
            >
              <Settings size={20} />
              {sidebarOpen && <span>Settings</span>}
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <User size={16} />
            </div>
            {sidebarOpen && (
              <div className="user-details">
                <span className="username">{user?.username}</span>
                <span className="user-role">Member</span>
              </div>
            )}
          </div>

          <div className="footer-actions">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="action-btn"
              title="Toggle theme"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="action-btn logout"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`main-content ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="content-wrapper">{children}</div>
      </main>
    </div>
  );
}

export default SidebarLayout;
