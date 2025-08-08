import { useEffect } from "react";
import { useLocation } from "wouter";

import { useAppStore } from "./store";
import Router from "./components/Router";
import SidebarLayout from "./layouts/SidebarLayout";
import StoreEditor from "./components/StoreEditor";
import PopUp from "./components/PopUp";
import ConfirmDialog from "./components/ConfirmDialog";
import "./App.css";

function App() {
  const {
    user,
    accessToken,
    darkMode,
    showStoreEditor,
    setShowStoreEditor,
    selectedDb,
    selectedStore,
    storeData,
    popup,
    closePopup,
    confirmDialog,
    closeConfirm,
    saveStoreData,
    checkAutoLogin,
    setNavigate,
  } = useAppStore();

  const [location, setLocation] = useLocation();

  // Set navigate function for store and auto-login check
  useEffect(() => {
    setNavigate(setLocation);
    checkAutoLogin();
  }, [checkAutoLogin, setNavigate, setLocation]);

  // Show Sidebar Layout only for authenticated routes
  const isAuthenticatedRoute = [
    "/dashboard",
    "/api-docs",
    "/settings",
  ].includes(location);
  const showSidebarLayout = user && accessToken && isAuthenticatedRoute;

  return (
    <>
      {showSidebarLayout ? (
        <SidebarLayout>
          <Router />
        </SidebarLayout>
      ) : (
        <Router />
      )}

      {/* Modals */}
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
    </>
  );
}

export default App;
