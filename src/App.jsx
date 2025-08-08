import { useState, useEffect } from "react";
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
import DashboardView from "./containers/DashboardView";
import AuthView from "./containers/AuthView";
import ApiDocsView from "./containers/ApiDocsView";
import SettingsView from "./containers/SettingsView";
import FrontPageView from "./containers/FrontPageView";
// import InfoBox from "./containers/InfoBox";
import StoreEditor from "./containers/StoreEditor";
import PopUp from "./containers/PopUp";
import ConfirmDialog from "./containers/ConfirmDialog";
// import { KVStore } from "./KVStore";
import { KVStore } from "kvstore-client";
import "./App.css";

const API_BASE_URL = "/api";

function App() {
  const [currentView, setCurrentView] = useState("front-page");
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken"),
  );
  const [databases, setDatabases] = useState([]);
  const [selectedDb, setSelectedDb] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeData, setStoreData] = useState({});
  // const [lastOperation, setLastOperation] = useState(null);
  // const [showInfoBox, setShowInfoBox] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" || true,
  );
  const [isGetStarted, setIsGetStarted] = useState(false);
  const [showStoreEditor, setShowStoreEditor] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const showPopup = (message, type = "info") => {
    setPopup({ show: true, message, type });
  };

  const closePopup = () => {
    setPopup({ show: false, message: "", type: "info" });
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmDialog({ show: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmDialog({ show: false, title: "", message: "", onConfirm: null });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", !darkMode);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const db = new KVStore(`${API_BASE_URL}/connect`, {
    accessToken,
    storeName: selectedStore,
    dbName: selectedDb,
  });

  const prevAction = (_type, _data, _box = true) => {
    // setLastOperation({ type, data });
    // setShowInfoBox(box);
    return;
  };

  useEffect(() => {
    if (accessToken) {
      (async () => {
        try {
          const result = await db.getUserInfo();
          setUser(result.user);
          setCurrentView("dashboard");
          loadDatabases();
        } catch (error) {
          console.error("Auto-login failed:", error);
          localStorage.removeItem("accessToken");
          setAccessToken(null);
          setCurrentView("login");
        }
      })();
    }
  }, [accessToken]);

  const handleRegister = async (formData) => {
    try {
      formData.captcha = captcha;
      const result = await db.register(formData);

      setUser(result.user);
      setAccessToken(result.accessToken);
      localStorage.setItem("accessToken", result.accessToken);
      showPopup("Registration successful!", "success");
    } catch (error) {
      showPopup(`Registration failed: ${error.message}`, "error");
    }
  };

  const handleLogin = async (formData) => {
    try {
      const result = await db.login(formData);

      setUser(result.user);
      setAccessToken(result.accessToken);
      localStorage.setItem("accessToken", result.accessToken);
    } catch (error) {
      showPopup(`Login failed: ${error.message}`, "error");
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
      const result = await db.generateToken();
      setAccessToken(result.accessToken);
      localStorage.setItem("accessToken", result.accessToken);
      showPopup("New access token generated!", "success");
    } catch (error) {
      showPopup(`Failed to generate token: ${error.message}`, "error");
    }
  };

  const loadDatabases = async () => {
    try {
      const result = await db.getDatabases();

      setDatabases(result.databases);
    } catch (error) {
      console.error("Failed to load databases:", error);
    }
  };

  const createDatabase = async (name) => {
    try {
      await db.createDatabase(name);
      prevAction("create-database", { name }, true);

      loadDatabases();
      showPopup("Database created successfully!", "success");
    } catch (error) {
      showPopup(`Failed to create database: ${error.message}`, "error");
    }
  };

  const loadStores = async (dbName) => {
    try {
      const result = await db.getStores(dbName);
      // setStores(result.stores);
      setStores(result);
      setSelectedDb(dbName);
      setSelectedStore(null);
      setStoreData({});
    } catch (error) {
      console.error("Failed to load stores:", error);
    }
  };

  const createStore = async (dbName, storeName) => {
    try {
      await db.createStore(dbName, storeName);
      prevAction("create-store", { dbName, storeName }, true);

      loadStores(dbName);
      showPopup("Store created successfully!", "success");
    } catch (error) {
      showPopup(`Failed to create store: ${error.message}`, "error");
    }
  };

  const loadStoreData = async (dbName, storeName) => {
    try {
      const result = await db.entries(dbName, storeName);
      const entriesObj = {};

      result.map(([key, value]) => {
        entriesObj[key] = value;
      });

      setStoreData(entriesObj);
      setSelectedStore(storeName);
    } catch (error) {
      console.error("Failed to load store data:", error);
    }
  };

  const setKeyValue = async (key, value) => {
    try {
      await db.set(key, value);
      prevAction(
        "set",
        { dbName: selectedDb, storeName: selectedStore, key, value },
        true,
      );

      loadStoreData(selectedDb, selectedStore);
    } catch (error) {
      showPopup(`Failed to set key: ${error.message}`, "error");
    }
  };

  const deleteKey = async (key) => {
    try {
      await db.delete(key);
      prevAction(
        "delete",
        { dbName: selectedDb, storeName: selectedStore, key },
        true,
      );

      loadStoreData(selectedDb, selectedStore);
    } catch (error) {
      showPopup(`Failed to delete key: ${error.message}`, "error");
    }
  };

  const clearStore = async () => {
    showConfirm(
      "Clear Store",
      "Are you sure you want to clear all data in this store? This action cannot be undone.",
      async () => {
        try {
          await db.clear();
          prevAction(
            "clear",
            { dbName: selectedDb, storeName: selectedStore },
            true,
          );

          loadStoreData(selectedDb, selectedStore);
          showPopup("Store cleared successfully!", "success");
        } catch (error) {
          showPopup(`Failed to clear store: ${error.message}`, "error");
        }
      },
    );
  };

  const deleteStore = async (dbName, storeName) => {
    try {
      await db.deleteStore(dbName, storeName);
      prevAction("delete-store", { dbName, storeName }, true);

      if (selectedStore === storeName) {
        setSelectedStore(null);
        setStoreData({});
      }

      loadStores(dbName);
      showPopup("Store deleted successfully!", "success");
    } catch (error) {
      showPopup(`Failed to delete store: ${error.message}`, "error");
    }
  };

  const deleteDatabase = async (dbName) => {
    try {
      await db.deleteDatabase(dbName);
      prevAction("delete-database", { dbName }, true);

      if (selectedDb === dbName) {
        setSelectedDb(null);
        setStores([]);
        setSelectedStore(null);
        setStoreData({});
      }

      loadDatabases();
      showPopup("Database deleted successfully!", "success");
    } catch (error) {
      showPopup(`Failed to delete database: ${error.message}`, "error");
    }
  };

  const openStoreEditor = () => {
    setShowStoreEditor(true);
  };

  const saveStoreData = async (newData) => {
    try {
      // Clear the store first
      await db.clear();

      // Set all new key-value pairs
      for (const [key, value] of Object.entries(newData)) {
        await db.set(key, value);
      }

      prevAction(
        "edit-store",
        { dbName: selectedDb, storeName: selectedStore, data: newData },
        true,
      );

      // Reload the store data
      loadStoreData(selectedDb, selectedStore);
      showPopup("Store updated successfully!", "success");
    } catch (error) {
      showPopup(`Failed to update store: ${error.message}`, "error");
    }
  };

  if (currentView === "front-page") {
    return (
      <FrontPageView
        onGetStarted={() => {
          setIsGetStarted(true);
          setCurrentView("login");
        }}
        onLogin={() => {
          setIsGetStarted(false);
          setCurrentView("login");
        }}
      />
    );
  }

  if (currentView === "login") {
    return (
      <AuthView
        onRegister={handleRegister}
        onLogin={handleLogin}
        onBackToFrontPage={() => setCurrentView("front-page")}
        isGetStarted={isGetStarted}
        setCaptcha={setCaptcha}
        currentView={currentView}
      />
    );
  }

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
            <button
              type="button"
              onClick={() => setCurrentView("dashboard")}
              className={`menu-item ${currentView === "dashboard" ? "active" : ""}`}
            >
              <Database size={20} />
              {sidebarOpen && <span>Dashboard</span>}
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("api-docs")}
              className={`menu-item ${currentView === "api-docs" ? "active" : ""}`}
            >
              <FileText size={20} />
              {sidebarOpen && <span>API Docs</span>}
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("settings")}
              className={`menu-item ${currentView === "settings" ? "active" : ""}`}
            >
              <Settings size={20} />
              {sidebarOpen && <span>Settings</span>}
            </button>
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
                {/* <span className="user-role">Admin</span> */}
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
        <div className="content-wrapper">
          {currentView === "api-docs" && (
            <ApiDocsView
              accessToken={accessToken}
              onBack={() => setCurrentView("dashboard")}
            />
          )}
          {currentView === "settings" && (
            <SettingsView
              user={user}
              accessToken={accessToken}
              onGenerateToken={generateNewToken}
              kvStore={db}
              onLogout={handleLogout}
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
              showConfirm={showConfirm}
              closeConfirm={closeConfirm}
              onCreateDatabase={createDatabase}
              onSelectDatabase={loadStores}
              onCreateStore={createStore}
              onSelectStore={loadStoreData}
              onSetKeyValue={setKeyValue}
              onDeleteKey={deleteKey}
              onClearStore={clearStore}
              onDeleteStore={deleteStore}
              onDeleteDatabase={deleteDatabase}
              onEditStore={openStoreEditor}
              darkMode={darkMode}
            />
          )}
        </div>
      </main>

      {/* {showInfoBox && (
        <InfoBox
          lastOperation={lastOperation}
          selectedDb={selectedDb}
          selectedStore={selectedStore}
          configs={{ baseUrl: `${API_BASE_URL}/connect`, accessToken }}
          onClose={() => setShowInfoBox(false)}
        />
      )} */}

      {showStoreEditor && selectedStore && (
        <StoreEditor
          isOpen={showStoreEditor}
          onClose={() => setShowStoreEditor(false)}
          storeData={storeData}
          selectedDb={selectedDb}
          selectedStore={selectedStore}
          onSave={saveStoreData}
          darkMode={darkMode}
        />
      )}

      <PopUp
        show={popup.show}
        message={popup.message}
        type={popup.type}
        onClose={closePopup}
      />

      <ConfirmDialog
        show={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm?.();
          closeConfirm();
        }}
        onCancel={closeConfirm}
        type="danger"
      />
    </div>
  );
}

export default App;
