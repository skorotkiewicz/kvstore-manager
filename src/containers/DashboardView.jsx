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
    <div className="dashboard-container">
      {/* Header Stats & Quick Actions */}
      <div className="header-section">
        <div className="stats-section">
          <div className="stat-item">
            <div className="stat-icon databases">
              <Database size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{databases.length}</div>
              <div className="stat-label">Databases</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon stores">
              <HardDrive size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{totalStores}</div>
              <div className="stat-label">Stores</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon keys">
              <Key size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{totalKeys}</div>
              <div className="stat-label">Keys</div>
            </div>
          </div>
        </div>

        {/* Quick Management Panel */}
        <div className="quick-management">
          {/* Database Selector */}
          <div className="quick-selector">
            <label className="selector-label">
              <Database size={14} />
              Database
            </label>
            <div className="selector-group">
              <select
                value={selectedDb || ""}
                onChange={(e) => onSelectDatabase(e.target.value)}
                className="quick-select"
              >
                <option value="">Select Database</option>
                {databases.map((db) => (
                  <option key={db} value={db}>
                    {db}
                  </option>
                ))}
              </select>
              {databases.length < 3 && (
                <div className="quick-add">
                  <input
                    type="text"
                    value={newDbName}
                    onChange={(e) => setNewDbName(e.target.value)}
                    placeholder="New DB"
                    className="quick-input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateDatabase(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateDatabase}
                    className="quick-btn"
                    disabled={!newDbName.trim() || isLoading}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Store Selector */}
          <div className="quick-selector">
            <label className="selector-label">
              <HardDrive size={14} />
              Store
            </label>
            <div className="selector-group">
              <select
                value={selectedStore || ""}
                onChange={(e) =>
                  selectedDb && onSelectStore(selectedDb, e.target.value)
                }
                className="quick-select"
                disabled={!selectedDb}
              >
                <option value="">Select Store</option>
                {stores.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
              {selectedDb && (
                <div className="quick-add">
                  <input
                    type="text"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    placeholder="New Store"
                    className="quick-input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateStore(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateStore}
                    className="quick-btn"
                    disabled={!newStoreName.trim() || isLoading}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content-area">
        {/* Key-Value Store Section */}
        <div className="content-card main-card">
          <div className="card-header">
            <div className="card-title">
              <Key size={20} />
              <span>
                {selectedStore
                  ? `${selectedDb} / ${selectedStore}`
                  : "Key-Value Store"}
              </span>
            </div>
            {selectedStore && (
              <div className="card-actions">
                <span className="items-count">{totalKeys} items</span>
                <button
                  type="button"
                  onClick={onClearStore}
                  className="btn btn-danger-sm"
                  disabled={isLoading}
                >
                  <Trash2 size={16} />
                  Clear Store
                </button>
              </div>
            )}
          </div>

          <div className="card-content">
            {!selectedStore ? (
              <div className="empty-state">
                <Key size={48} />
                <h3>Select a store to manage your data</h3>
                <p>
                  Choose a database and store from the management panels below
                </p>
              </div>
            ) : (
              <div className="kv-section">
                {/* Add Key-Value Form */}
                <div className="kv-form">
                  <div className="form-header">
                    <h4>Add New Key-Value Pair</h4>
                    <p>Store data in the selected store</p>
                  </div>
                  <form onSubmit={handleSetKeyValue} className="kv-form-grid">
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
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      <Plus size={18} />
                      Add
                    </button>
                  </form>
                </div>

                {/* Key-Value List - JSON Style */}
                <div className="json-viewer">
                  {Object.entries(storeData).length === 0 ? (
                    <div className="empty-state small">
                      <Key size={32} />
                      <h4>Store is empty</h4>
                      <p>Add your first key-value pair to get started</p>
                    </div>
                  ) : (
                    <div className="json-container">
                      <div className="json-brace">{"{"}</div>
                      {Object.entries(storeData).map(
                        ([key, value], index, array) => (
                          <div key={key} className="json-line">
                            <div className="json-entry">
                              <span className="json-key">"{key}"</span>
                              <span className="json-colon">: </span>
                              <span
                                className={`json-value json-${typeof value}`}
                              >
                                {typeof value === "string"
                                  ? `"${value}"`
                                  : JSON.stringify(value)}
                              </span>
                              {index < array.length - 1 && (
                                <span className="json-comma">,</span>
                              )}
                              <span className="json-type-badge">
                                {typeof value}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => onDeleteKey(key)}
                              className="json-delete-btn"
                              disabled={isLoading}
                              title={`Delete ${key}`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ),
                      )}
                      <div className="json-brace">{"}"}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
