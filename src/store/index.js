import { create } from "zustand";
// import { subscribeWithSelector } from "zustand/middleware";
import { KVStore } from "kvstore-client";
import { devtools } from "zustand/middleware";

const API_BASE_URL = "/api";

export const useAppStore = create(
  devtools((set, get) => ({
    // UI State
    currentView: "front-page",
    sidebarOpen: true,
    darkMode: localStorage.getItem("darkMode") === "true" || true,
    isGetStarted: false,
    showStoreEditor: false,

    // Authentication State
    user: null,
    accessToken: localStorage.getItem("accessToken"),

    // Database State
    databases: [],
    selectedDb: null,
    stores: [],
    selectedStore: null,
    storeData: {},

    // UI Components State
    popup: {
      show: false,
      message: "",
      type: "info",
    },
    confirmDialog: {
      show: false,
      title: "",
      message: "",
      onConfirm: null,
    },
    captcha: "",

    // Actions
    setCurrentView: (view) => {
      set({ currentView: view });
    },

    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    toggleDarkMode: () => {
      const { darkMode } = get();
      const newDarkMode = !darkMode;
      set({ darkMode: newDarkMode });
      localStorage.setItem("darkMode", newDarkMode);
      document.documentElement.classList.toggle("dark", newDarkMode);
    },

    setIsGetStarted: (value) => set({ isGetStarted: value }),

    setShowStoreEditor: (show) => set({ showStoreEditor: show }),

    setCaptcha: (captcha) => set({ captcha }),

    // Popup Actions
    showPopup: (message, type = "info") =>
      set({
        popup: { show: true, message, type },
      }),

    closePopup: () =>
      set({
        popup: { show: false, message: "", type: "info" },
      }),

    // Confirm Dialog Actions
    showConfirm: (title, message, onConfirm) =>
      set({
        confirmDialog: { show: true, title, message, onConfirm },
      }),

    closeConfirm: () =>
      set({
        confirmDialog: { show: false, title: "", message: "", onConfirm: null },
      }),

    // Authentication Actions
    setUser: (user) => set({ user }),

    setAccessToken: (token) => {
      set({ accessToken: token });
      if (token) {
        localStorage.setItem("accessToken", token);
      } else {
        localStorage.removeItem("accessToken");
      }
    },

    // Database Actions
    setDatabases: (databases) => set({ databases }),

    setSelectedDb: (dbName) => set({ selectedDb: dbName }),

    setStores: (stores) => set({ stores }),

    setSelectedStore: (storeName) => set({ selectedStore: storeName }),

    setStoreData: (data) => set({ storeData: data }),

    // Get KVStore instance
    getKVStore: () => {
      const { accessToken, selectedStore, selectedDb } = get();
      return new KVStore(`${API_BASE_URL}/connect`, {
        accessToken,
        storeName: selectedStore,
        dbName: selectedDb,
      });
    },

    // Navigation callback - to be set by App component
    navigate: null,
    setNavigate: (navigateFn) => set({ navigate: navigateFn }),

    // Complex Actions
    handleRegister: async (formData) => {
      const {
        captcha,
        showPopup,
        setUser,
        setAccessToken,
        loadDatabases,
        navigate,
      } = get();
      try {
        const db = get().getKVStore();
        formData.captcha = captcha;
        const result = await db.register(formData);

        setUser(result.user);
        setAccessToken(result.accessToken);
        showPopup("Registration successful!", "success");
        loadDatabases();
        if (navigate) navigate("/dashboard");
      } catch (error) {
        showPopup(`Registration failed: ${error.message}`, "error");
      }
    },

    handleLogin: async (formData) => {
      const { showPopup, setUser, setAccessToken, loadDatabases, navigate } =
        get();
      try {
        const db = get().getKVStore();
        const result = await db.login(formData);

        setUser(result.user);
        setAccessToken(result.accessToken);
        loadDatabases();
        if (navigate) navigate("/dashboard");
      } catch (error) {
        showPopup(`Login failed: ${error.message}`, "error");
      }
    },

    handleLogout: () => {
      const { navigate } = get();
      set({
        user: null,
        accessToken: null,
        databases: [],
        selectedDb: null,
        stores: [],
        selectedStore: null,
        storeData: {},
      });
      localStorage.removeItem("accessToken");
      if (navigate) navigate("/login");
    },

    generateNewToken: async () => {
      const { showPopup, setAccessToken } = get();
      try {
        const db = get().getKVStore();
        const result = await db.generateToken();
        setAccessToken(result.accessToken);
        showPopup("New access token generated!", "success");
      } catch (error) {
        showPopup(`Failed to generate token: ${error.message}`, "error");
      }
    },

    loadDatabases: async () => {
      const { setDatabases } = get();
      try {
        const db = get().getKVStore();
        const result = await db.getDatabases();
        setDatabases(result.databases);
      } catch (error) {
        console.error("Failed to load databases:", error);
      }
    },

    createDatabase: async (name) => {
      const { showPopup, loadDatabases } = get();
      try {
        const db = get().getKVStore();
        await db.createDatabase(name);
        loadDatabases();
        showPopup("Database created successfully!", "success");
      } catch (error) {
        showPopup(`Failed to create database: ${error.message}`, "error");
      }
    },

    loadStores: async (dbName) => {
      const { setStores, setSelectedDb, setSelectedStore, setStoreData } =
        get();
      try {
        const db = get().getKVStore();
        const result = await db.getStores(dbName);
        setStores(result);
        setSelectedDb(dbName);
        setSelectedStore(null);
        setStoreData({});
      } catch (error) {
        console.error("Failed to load stores:", error);
      }
    },

    createStore: async (dbName, storeName) => {
      const { showPopup, loadStores } = get();
      try {
        const db = get().getKVStore();
        await db.createStore(dbName, storeName);
        loadStores(dbName);
        showPopup("Store created successfully!", "success");
      } catch (error) {
        showPopup(`Failed to create store: ${error.message}`, "error");
      }
    },

    loadStoreData: async (dbName, storeName) => {
      const { setStoreData, setSelectedStore } = get();
      try {
        const db = get().getKVStore();
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
    },

    setKeyValue: async (key, value) => {
      const { selectedDb, selectedStore, showPopup, loadStoreData } = get();
      try {
        const db = get().getKVStore();
        await db.set(key, value);
        loadStoreData(selectedDb, selectedStore);
      } catch (error) {
        showPopup(`Failed to set key: ${error.message}`, "error");
      }
    },

    deleteKey: async (key) => {
      const { selectedDb, selectedStore, showPopup, loadStoreData } = get();
      try {
        const db = get().getKVStore();
        await db.delete(key);
        loadStoreData(selectedDb, selectedStore);
      } catch (error) {
        showPopup(`Failed to delete key: ${error.message}`, "error");
      }
    },

    clearStore: async () => {
      const {
        selectedDb,
        selectedStore,
        showPopup,
        showConfirm,
        loadStoreData,
      } = get();
      showConfirm(
        "Clear Store",
        "Are you sure you want to clear all data in this store? This action cannot be undone.",
        async () => {
          try {
            const db = get().getKVStore();
            await db.clear();
            loadStoreData(selectedDb, selectedStore);
            showPopup("Store cleared successfully!", "success");
          } catch (error) {
            showPopup(`Failed to clear store: ${error.message}`, "error");
          }
        },
      );
    },

    deleteStore: async (dbName, storeName) => {
      const {
        selectedStore,
        showPopup,
        loadStores,
        setSelectedStore,
        setStoreData,
      } = get();
      try {
        const db = get().getKVStore();
        await db.deleteStore(dbName, storeName);

        if (selectedStore === storeName) {
          setSelectedStore(null);
          setStoreData({});
        }

        loadStores(dbName);
        showPopup("Store deleted successfully!", "success");
      } catch (error) {
        showPopup(`Failed to delete store: ${error.message}`, "error");
      }
    },

    deleteDatabase: async (dbName) => {
      const {
        selectedDb,
        showPopup,
        loadDatabases,
        setSelectedDb,
        setStores,
        setSelectedStore,
        setStoreData,
      } = get();
      try {
        const db = get().getKVStore();
        await db.deleteDatabase(dbName);

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
    },

    saveStoreData: async (newData) => {
      const { selectedDb, selectedStore, showPopup, loadStoreData } = get();
      try {
        const db = get().getKVStore();
        // Clear the store first
        await db.clear();

        // Set all new key-value pairs
        for (const [key, value] of Object.entries(newData)) {
          await db.set(key, value);
        }

        // Reload the store data
        loadStoreData(selectedDb, selectedStore);
        showPopup("Store updated successfully!", "success");
      } catch (error) {
        showPopup(`Failed to update store: ${error.message}`, "error");
      }
    },

    // Auto-login check
    checkAutoLogin: async () => {
      const { accessToken, setUser, loadDatabases, setAccessToken, navigate } =
        get();

      if (accessToken) {
        try {
          const db = get().getKVStore();
          const result = await db.getUserInfo();
          setUser(result.user);
          loadDatabases();
          if (navigate) navigate("/dashboard");
        } catch (error) {
          console.error("Auto-login failed:", error);
          setAccessToken(null);
          if (navigate) navigate("/login");
        }
      }
    },
  })),
);

// Initialize dark mode on app start
const { darkMode } = useAppStore.getState();
document.documentElement.classList.toggle("dark", darkMode);
