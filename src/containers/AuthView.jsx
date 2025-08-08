import { useState } from "react";
import {
  Database,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

function AuthView({
  onRegister,
  onLogin,
  onBackToFrontPage,
  isGetStarted,
  setCaptcha,
}) {
  const [isLogin, setIsLogin] = useState(!isGetStarted);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      onLogin({ email: formData.email, password: formData.password });
    } else {
      onRegister(formData);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-pattern"></div>
      </div>

      <div className="auth-content">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            {onBackToFrontPage && (
              <button
                type="button"
                className="back-button"
                onClick={onBackToFrontPage}
              >
                <ArrowLeft size={20} />
                Back to Home
              </button>
            )}

            <div className="auth-brand">
              <div className="brand-icon">
                <Database />
              </div>
              <h1>KV Store Manager</h1>
            </div>

            <div className="auth-title">
              <h2>{isLogin ? "Welcome back" : "Create account"}</h2>
              <p>
                {isLogin
                  ? "Sign in to manage your key-value databases"
                  : "Join thousands of developers using KV Store"}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-field">
                <label htmlFor="username">Username</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isLogin && import.meta.env.VITE_CAPTCHA_ENABLED === "true" && (
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_CAPTCHA_PUBLIC_KEY}
                onChange={setCaptcha}
              />
            )}

            <button type="submit" className="auth-submit-btn">
              <Shield size={20} />
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-switch">
              <span>
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </span>
              <button
                type="button"
                className="switch-btn"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="auth-side-panel">
          <div className="side-content">
            <h3>Professional Key-Value Management</h3>
            <p>
              Manage your databases with confidence. Our platform provides
              enterprise-grade security and intuitive tools for developers.
            </p>

            <div className="features-list">
              <div className="feature-item">
                <Database size={16} />
                <span>Up to 3 databases</span>
              </div>
              <div className="feature-item">
                <Shield size={16} />
                <span>Secure authentication</span>
              </div>
              <div className="feature-item">
                <User size={16} />
                <span>User management</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthView;
