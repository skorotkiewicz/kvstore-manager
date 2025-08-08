import {
  Router as WouterRouter,
  Route,
  Switch,
  Redirect,
  useLocation,
} from "wouter";
import { Suspense } from "react";
import { useAppStore } from "../store";
import {
  FrontPageView,
  AuthView,
  DashboardView,
  ApiDocsView,
  SettingsView,
} from "../routes";

const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

const ProtectedRoute = ({ component: Component, ...props }) => {
  const { user, accessToken } = useAppStore();

  if (!user || !accessToken) {
    return <Redirect to="/login" />;
  }

  return <Component {...props} />;
};

const Router = () => {
  const {
    user,
    accessToken,
    isGetStarted,
    setCaptcha,
    handleRegister,
    handleLogin,
    setIsGetStarted,
    databases,
    selectedDb,
    stores,
    selectedStore,
    storeData,
    showConfirm,
    closeConfirm,
    createDatabase,
    loadStores,
    createStore,
    loadStoreData,
    setKeyValue,
    deleteKey,
    clearStore,
    deleteStore,
    deleteDatabase,
    setShowStoreEditor,
    darkMode,
    generateNewToken,
    getKVStore,
    handleLogout,
  } = useAppStore();

  const [, setLocation] = useLocation();

  return (
    <WouterRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          <Route path="/">
            <FrontPageView
              onGetStarted={() => {
                setIsGetStarted(true);
                setLocation("/login");
              }}
              onLogin={() => {
                setIsGetStarted(false);
                setLocation("/login");
              }}
            />
          </Route>

          <Route path="/login">
            <AuthView
              onRegister={handleRegister}
              onLogin={handleLogin}
              onBackToFrontPage={() => {
                setLocation("/");
              }}
              isGetStarted={isGetStarted}
              setCaptcha={setCaptcha}
              currentView="login"
            />
          </Route>

          <Route path="/dashboard">
            <ProtectedRoute
              component={DashboardView}
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
              onEditStore={() => setShowStoreEditor(true)}
              darkMode={darkMode}
            />
          </Route>

          <Route path="/api-docs">
            <ProtectedRoute
              component={ApiDocsView}
              accessToken={accessToken}
              onBack={() => {}}
            />
          </Route>

          <Route path="/settings">
            <ProtectedRoute
              component={SettingsView}
              user={user}
              accessToken={accessToken}
              onGenerateToken={generateNewToken}
              kvStore={getKVStore()}
              onLogout={handleLogout}
              onBack={() => {}}
            />
          </Route>
        </Switch>
      </Suspense>
    </WouterRouter>
  );
};

export default Router;
