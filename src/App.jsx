import { useState, useEffect } from "react";
import DashboardView from "./containers/DashboardView";
import AuthView from "./containers/AuthView";
import ApiDocsView from "./containers/ApiDocsView";
import SettingsView from "./containers/SettingsView";
import InfoBox from "./containers/InfoBox";
import { KVStore } from "./KVStore";
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
  const [lastOperation, setLastOperation] = useState(null);
  const [showInfoBox, setShowInfoBox] = useState(false);

  const db = new KVStore(`${API_BASE_URL}/connect`, {
    accessToken,
    storeName: selectedStore,
    dbName: selectedDb,
  });

  const prevAction = (type, data, box = true) => {
    setLastOperation({ type, data });
    setShowInfoBox(box);
  };

  useEffect(() => {
    if (accessToken) {
      setCurrentView("dashboard");
      loadDatabases();
    }
  }, [accessToken]);

  const handleRegister = async (formData) => {
    try {
      const result = await db.register(formData);

      setUser(result.user);
      setAccessToken(result.accessToken);
      localStorage.setItem("accessToken", result.accessToken);
      alert("Registration successful!");
    } catch (error) {
      alert(`Registration failed: ${error.message}`);
    }
  };

  const handleLogin = async (formData) => {
    try {
      const result = await db.login(formData);

      setUser(result.user);
      setAccessToken(result.accessToken);
      localStorage.setItem("accessToken", result.accessToken);
    } catch (error) {
      alert(`Login failed: ${error.message}`);
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
      alert("New access token generated!");
    } catch (error) {
      alert(`Failed to generate token: ${error.message}`);
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
      alert("Database created successfully!");
    } catch (error) {
      alert(`Failed to create database: ${error.message}`);
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
      alert("Store created successfully!");
    } catch (error) {
      alert(`Failed to create store: ${error.message}`);
    }
  };

  const loadStoreData = async (dbName, storeName) => {
    try {
      const result = await db.entries(dbName, storeName);

      const entriesObj = {};
      result.map(([key, value]) => {
        // result.entries.
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
      alert(`Failed to set key: ${error.message}`);
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
      alert(`Failed to delete key: ${error.message}`);
    }
  };

  const clearStore = async () => {
    if (
      window.confirm("Are you sure you want to clear all data in this store?")
    ) {
      try {
        await db.clear();
        prevAction(
          "clear",
          { dbName: selectedDb, storeName: selectedStore },
          true,
        );

        loadStoreData(selectedDb, selectedStore);
      } catch (error) {
        alert(`Failed to clear store: ${error.message}`);
      }
    }
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
      alert("Store deleted successfully!");
    } catch (error) {
      alert(`Failed to delete store: ${error.message}`);
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
      alert("Database deleted successfully!");
    } catch (error) {
      alert(`Failed to delete database: ${error.message}`);
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
              onClick={() => setCurrentView("api-docs")}
              className="btn btn-secondary"
            >
              API Docs
            </button>
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
            onDeleteStore={deleteStore}
            onDeleteDatabase={deleteDatabase}
          />
        )}
      </main>

      {showInfoBox && (
        <InfoBox
          lastOperation={lastOperation}
          selectedDb={selectedDb}
          selectedStore={selectedStore}
          configs={{ baseUrl: API_BASE_URL, accessToken }}
          onClose={() => setShowInfoBox(false)}
        />
      )}
    </div>
  );
}

export default App;
