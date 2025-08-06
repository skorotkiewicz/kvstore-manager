import { useState } from "react";
import { Plus, Database, HardDrive, Key, Trash2, Activity } from "lucide-react";

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
  onDeleteStore,
  onDeleteDatabase,
}) {
  const [newDbName, setNewDbName] = useState("");
  const [newStoreName, setNewStoreName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const totalKeys = Object.keys(storeData).length;
  const totalStores = stores.length;

  return (
    <div className="modern-dashboard fade-in">
      {/* Key-Value Store Content - MAIN FOCUS */}
      <div className="kv-main-section slide-up">
        <div className="dashboard-card primary-card">
          <div className="card-header">
            <div className="card-title">
              <Key size={24} />
              <div className="title-info">
                <span className="title-main">
                  {selectedStore
                    ? `${selectedDb} / ${selectedStore}`
                    : "Key-Value Store"}
                </span>
                {selectedStore && (
                  <span className="title-subtitle">
                    {totalKeys} keys stored
                  </span>
                )}
              </div>
            </div>
            {selectedStore && (
              <div className="header-actions">
                <div className="action-group">
                  <span className="data-count">{totalKeys} items</span>
                  <button
                    type="button"
                    onClick={onClearStore}
                    className="btn-danger-sm hover-scale"
                    title="Clear all data"
                    disabled={isLoading}
                  >
                    <Trash2 size={16} />
                    Clear Store
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="card-content">
            {!selectedStore ? (
              <div className="empty-state large">
                <Key size={64} />
                <h3>Select a store to manage your data</h3>
                <p>
                  Choose a database and store from the controls below to start
                  working with key-value pairs
                </p>
              </div>
            ) : (
              <>
                {/* Add Key-Value Form */}
                <form
                  onSubmit={handleSetKeyValue}
                  className="kv-form primary glass-card"
                >
                  <div className="form-header">
                    <h4>Add New Key-Value Pair</h4>
                    <div className="form-subtitle">
                      Store data in the selected store
                    </div>
                  </div>
                  <div className="form-grid">
                    <input
                      type="text"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="Enter key"
                      className="form-input"
                      required
                    />
                    <input
                      type="text"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="Enter value"
                      className="form-input"
                    />
                    <button
                      type="submit"
                      className={`btn-primary large hover-lift ${isLoading ? "loading" : ""}`}
                      disabled={isLoading}
                    >
                      <Plus size={18} />
                      {isLoading ? "Adding..." : "Add"}
                    </button>
                  </div>
                </form>

                {/* Key-Value List */}
                <div className="kv-list modern-scroll">
                  {Object.entries(storeData).length === 0 ? (
                    <div className="empty-state modern-empty">
                      <div className="empty-icon">
                        <Key size={48} />
                      </div>
                      <h3>Store is empty</h3>
                      <p>Add your first key-value pair to get started</p>
                      <div className="empty-hint">
                        💡 Use the form above to add data
                      </div>
                    </div>
                  ) : (
                    <div className="kv-grid">
                      {Object.entries(storeData).map(([key, value]) => (
                        <div
                          key={key}
                          className="kv-item modern-item hover-lift"
                        >
                          <div className="kv-content">
                            <div className="kv-key-wrapper">
                              <Key size={16} className="key-icon" />
                              <div className="kv-key">{key}</div>
                            </div>
                            <div className="kv-value">
                              <span className="value-type">{typeof value}</span>
                              <span className="value-content">
                                {JSON.stringify(value)}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onDeleteKey(key)}
                            className="delete-btn-sm hover-scale"
                            title="Delete key"
                            disabled={isLoading}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid compact slide-up-delay">
        <div className="stat-card compact modern-stat-card hover-lift">
          <div className="stat-icon pulse">
            <Database />
          </div>
          <div className="stat-content">
            <h3>{databases.length}</h3>
            <p>Databases</p>
            <div className="stat-progress">
              <div
                className="progress-bar"
                style={{ width: `${(databases.length / 3) * 100}%` }}
              ></div>
            </div>
            <span className="stat-limit">/{3} max</span>
          </div>
        </div>

        <div className="stat-card compact modern-stat-card hover-lift">
          <div className="stat-icon pulse-delay-1">
            <HardDrive />
          </div>
          <div className="stat-content">
            <h3>{totalStores}</h3>
            <p>Stores</p>
            <div className="stat-status">
              {selectedDb ? (
                <span className="status-active">📂 {selectedDb}</span>
              ) : (
                <span className="status-inactive">⚪ Select database</span>
              )}
            </div>
          </div>
        </div>

        <div className="stat-card compact modern-stat-card hover-lift">
          <div className="stat-icon pulse-delay-2">
            <Key />
          </div>
          <div className="stat-content">
            <h3 className={totalKeys > 0 ? "text-success" : ""}>{totalKeys}</h3>
            <p>Keys</p>
            <div className="stat-status">
              {selectedStore ? (
                <span className="status-active">🗃️ {selectedStore}</span>
              ) : (
                <span className="status-inactive">⚪ Select store</span>
              )}
            </div>
          </div>
        </div>

        <div className="stat-card compact modern-stat-card hover-lift">
          <div className="stat-icon pulse-delay-3 status-active">
            <Activity />
          </div>
          <div className="stat-content">
            <h3 className="text-success">Active</h3>
            <p>Status</p>
            <div className="connection-status">
              <div className="status-indicator"></div>
              <span className="stat-status">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Management Controls */}
      <div className="management-grid slide-up-delay-2">
        {/* Databases Section */}
        <div className="dashboard-card hover-lift">
          <div className="card-header">
            <div className="card-title">
              <Database size={20} />
              <span>Databases ({databases.length}/3)</span>
              {databases.length >= 3 && (
                <span className="limit-badge">MAX</span>
              )}
            </div>
            {databases.length < 3 && (
              <form onSubmit={handleCreateDatabase} className="inline-form">
                <input
                  type="text"
                  value={newDbName}
                  onChange={(e) => setNewDbName(e.target.value)}
                  placeholder="Database name"
                  className="form-input-sm"
                  required
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`btn-primary-sm hover-scale ${isLoading ? "loading" : ""}`}
                  disabled={isLoading}
                >
                  <Plus size={16} />
                </button>
              </form>
            )}
          </div>
          <div className="card-content">
            <div className="items-grid">
              {databases.map((db) => (
                <div
                  key={db}
                  className={`item-card hover-lift ${selectedDb === db ? "active" : ""}`}
                  onClick={() => onSelectDatabase(db)}
                >
                  <div className="item-content">
                    <Database size={16} />
                    <span className="item-name">{db}</span>
                    {selectedDb === db && (
                      <span className="active-badge">✓</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          `Are you sure you want to delete database "${db}"?`,
                        )
                      ) {
                        onDeleteDatabase(db);
                      }
                    }}
                    className="delete-btn-sm hover-scale"
                    title="Delete database"
                    disabled={isLoading}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {databases.length === 0 && (
                <div className="empty-state">
                  <Database size={32} />
                  <p>No databases yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stores Section */}
        <div className="dashboard-card hover-lift">
          <div className="card-header">
            <div className="card-title">
              <HardDrive size={20} />
              <span>
                Stores{" "}
                {selectedDb && <span className="db-badge">{selectedDb}</span>}
              </span>
            </div>
            {selectedDb && (
              <form onSubmit={handleCreateStore} className="inline-form">
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="Store name"
                  className="form-input-sm"
                  required
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`btn-primary-sm hover-scale ${isLoading ? "loading" : ""}`}
                  disabled={isLoading}
                >
                  <Plus size={16} />
                </button>
              </form>
            )}
          </div>
          <div className="card-content">
            {!selectedDb ? (
              <div className="empty-state">
                <HardDrive size={32} />
                <p>Select a database first</p>
              </div>
            ) : (
              <div className="items-grid">
                {stores.map((store) => (
                  <div
                    key={store}
                    className={`item-card hover-lift ${selectedStore === store ? "active" : ""}`}
                    onClick={() => onSelectStore(selectedDb, store)}
                  >
                    <div className="item-content">
                      <HardDrive size={16} />
                      <span className="item-name">{store}</span>
                      {selectedStore === store && (
                        <span className="active-badge">✓</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `Are you sure you want to delete store "${store}"?`,
                          )
                        ) {
                          onDeleteStore(selectedDb, store);
                        }
                      }}
                      className="delete-btn-sm hover-scale"
                      title="Delete store"
                      disabled={isLoading}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {stores.length === 0 && (
                  <div className="empty-state">
                    <HardDrive size={32} />
                    <p>No stores yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
