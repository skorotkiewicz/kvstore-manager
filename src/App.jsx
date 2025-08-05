import { useState, useEffect } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:3001/api";

function App() {
  const [currentView, setCurrentView] = useState("login");
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken"),
  );
  const [databases, setDatabases] = useState([]);
  const [selectedDb, setSelectedDb] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeData, setStoreData] = useState({});

  useEffect(() => {
    if (accessToken) {
      setCurrentView("dashboard");
      loadDatabases();
    }
  }, [accessToken]);

  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API call failed");
    }

    return data;
  };

  const handleRegister = async (formData) => {
    try {
      const result = await apiCall("/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setUser(result.user);
      setAccessToken(result.accessToken);
      localStorage.setItem("accessToken", result.accessToken);
      alert("Registration successful!");
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  };

  const handleLogin = async (formData) => {
    try {
      const result = await apiCall("/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setUser(result.user);
      setAccessToken(result.accessToken);
      localStorage.setItem("accessToken", result.accessToken);
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    setCurrentView("login");
    setDatabases([]);
    setSelectedDb(null);
    setStores([]);
    setSelectedStore(null);
    setStoreData({});
  };

  const generateNewToken = async () => {
    try {
      const result = await apiCall("/generate-token", { method: "POST" });
      setAccessToken(result.accessToken);
      localStorage.setItem("accessToken", result.accessToken);
      alert("New access token generated!");
    } catch (error) {
      alert("Failed to generate token: " + error.message);
    }
  };

  const loadDatabases = async () => {
    try {
      const result = await apiCall("/databases");
      setDatabases(result.databases);
    } catch (error) {
      console.error("Failed to load databases:", error);
    }
  };

  const createDatabase = async (name) => {
    try {
      await apiCall("/databases", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      loadDatabases();
      alert("Database created successfully!");
    } catch (error) {
      alert("Failed to create database: " + error.message);
    }
  };

  const loadStores = async (dbName) => {
    try {
      const result = await apiCall(`/databases/${dbName}/stores`);
      setStores(result.stores);
      setSelectedDb(dbName);
      setSelectedStore(null);
      setStoreData({});
    } catch (error) {
      console.error("Failed to load stores:", error);
    }
  };

  const createStore = async (dbName, storeName) => {
    try {
      await apiCall(`/databases/${dbName}/stores`, {
        method: "POST",
        body: JSON.stringify({ name: storeName }),
      });
      loadStores(dbName);
      alert("Store created successfully!");
    } catch (error) {
      alert("Failed to create store: " + error.message);
    }
  };

  const loadStoreData = async (dbName, storeName) => {
    try {
      const result = await apiCall(
        `/databases/${dbName}/stores/${storeName}/entries`,
      );
      setStoreData(result.entries);
      setSelectedStore(storeName);
    } catch (error) {
      console.error("Failed to load store data:", error);
    }
  };

  const setKeyValue = async (key, value) => {
    try {
      await apiCall(`/databases/${selectedDb}/stores/${selectedStore}/keys`, {
        method: "POST",
        body: JSON.stringify({ key, value }),
      });
      loadStoreData(selectedDb, selectedStore);
    } catch (error) {
      alert("Failed to set key: " + error.message);
    }
  };

  const deleteKey = async (key) => {
    try {
      await apiCall(
        `/databases/${selectedDb}/stores/${selectedStore}/keys/${key}`,
        {
          method: "DELETE",
        },
      );
      loadStoreData(selectedDb, selectedStore);
    } catch (error) {
      alert("Failed to delete key: " + error.message);
    }
  };

  const clearStore = async () => {
    if (
      window.confirm("Are you sure you want to clear all data in this store?")
    ) {
      try {
        await apiCall(
          `/databases/${selectedDb}/stores/${selectedStore}/clear`,
          {
            method: "DELETE",
          },
        );
        loadStoreData(selectedDb, selectedStore);
      } catch (error) {
        alert("Failed to clear store: " + error.message);
      }
    }
  };

  if (currentView === "login") {
    return <AuthView onRegister={handleRegister} onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>KV Store Manager</h1>
          <div className="header-actions">
            <span>Welcome, {user?.username}!</span>
            <button
              type="button"
              onClick={() => setCurrentView("settings")}
              className="btn btn-secondary"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        {currentView === "settings" && (
          <SettingsView
            user={user}
            accessToken={accessToken}
            onGenerateToken={generateNewToken}
            onBack={() => setCurrentView("dashboard")}
          />
        )}

        {currentView === "dashboard" && (
          <DashboardView
            databases={databases}
            selectedDb={selectedDb}
            stores={stores}
            selectedStore={selectedStore}
            storeData={storeData}
            onCreateDatabase={createDatabase}
            onSelectDatabase={loadStores}
            onCreateStore={createStore}
            onSelectStore={loadStoreData}
            onSetKeyValue={setKeyValue}
            onDeleteKey={deleteKey}
            onClearStore={clearStore}
          />
        )}
      </main>
    </div>
  );
}

function AuthView({ onRegister, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
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
      <div className="auth-card">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <p>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="link-btn"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

function SettingsView({ user, accessToken, onGenerateToken, onBack }) {
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

function DashboardView({
  databases,
  selectedDb,
  stores,
  selectedStore,
  storeData,
  onCreateDatabase,
  onSelectDatabase,
  onCreateStore,
  onSelectStore,
  onSetKeyValue,
  onDeleteKey,
  onClearStore,
}) {
  const [newDbName, setNewDbName] = useState("");
  const [newStoreName, setNewStoreName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleCreateDatabase = (e) => {
    e.preventDefault();
    if (newDbName.trim()) {
      onCreateDatabase(newDbName.trim());
      setNewDbName("");
    }
  };

  const handleCreateStore = (e) => {
    e.preventDefault();
    if (newStoreName.trim() && selectedDb) {
      onCreateStore(selectedDb, newStoreName.trim());
      setNewStoreName("");
    }
  };

  const handleSetKeyValue = (e) => {
    e.preventDefault();
    if (newKey.trim()) {
      onSetKeyValue(newKey.trim(), newValue);
      setNewKey("");
      setNewValue("");
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="section">
          <h3>Databases ({databases.length}/3)</h3>
          {databases.length < 3 && (
            <form onSubmit={handleCreateDatabase} className="create-form">
              <input
                type="text"
                value={newDbName}
                onChange={(e) => setNewDbName(e.target.value)}
                placeholder="Database name"
                required
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Create
              </button>
            </form>
          )}
          <div className="list">
            {databases.map((db) => (
              <div
                key={db}
                className={`list-item ${selectedDb === db ? "active" : ""}`}
                onClick={() => onSelectDatabase(db)}
              >
                {db}
              </div>
            ))}
          </div>
        </div>

        {selectedDb && (
          <div className="section">
            <h3>Stores in {selectedDb}</h3>
            <form onSubmit={handleCreateStore} className="create-form">
              <input
                type="text"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                placeholder="Store name"
                required
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Create
              </button>
            </form>
            <div className="list">
              {stores.map((store) => (
                <div
                  key={store}
                  className={`list-item ${selectedStore === store ? "active" : ""}`}
                  onClick={() => onSelectStore(selectedDb, store)}
                >
                  {store}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="content">
        {selectedStore ? (
          <div className="store-view">
            <div className="store-header">
              <h2>
                {selectedDb} / {selectedStore}
              </h2>
              <button
                type="button"
                onClick={onClearStore}
                className="btn btn-danger"
              >
                Clear Store
              </button>
            </div>

            <form onSubmit={handleSetKeyValue} className="key-value-form">
              <div className="form-row">
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Key"
                  required
                />
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Value"
                />
                <button type="submit" className="btn btn-primary">
                  Set
                </button>
              </div>
            </form>

            <div className="key-value-list">
              {Object.entries(storeData).length === 0 ? (
                <p className="empty-state">No data in this store</p>
              ) : (
                Object.entries(storeData).map(([key, value]) => (
                  <div key={key} className="key-value-item">
                    <div className="key-value-content">
                      <strong>{key}:</strong> {JSON.stringify(value)}
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteKey(key)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="empty-content">
            <h2>Select a database and store to view data</h2>
            <p>Create your first database to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
