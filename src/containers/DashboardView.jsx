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
      {/* Header Stats */}
      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-icon databases">
            <Database size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{databases.length}</div>
            <div className="stat-label">Databases</div>
            <div className="stat-limit">{databases.length}/3</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon stores">
            <HardDrive size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalStores}</div>
            <div className="stat-label">Stores</div>
            <div className="stat-status">
              {selectedDb ? selectedDb : "Select database"}
            </div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon keys">
            <Key size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalKeys}</div>
            <div className="stat-label">Keys</div>
            <div className="stat-status">
              {selectedStore ? selectedStore : "Select store"}
            </div>
          </div>
        </div>

        {/* <div className="stat-item">
          <div className="stat-icon status active">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">Active</div>
            <div className="stat-label">Status</div>
            <div className="stat-status connected">Connected</div>
          </div>
        </div> */}
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

                {/* Key-Value List */}
                <div className="kv-list">
                  {Object.entries(storeData).length === 0 ? (
                    <div className="empty-state small">
                      <Key size={32} />
                      <h4>Store is empty</h4>
                      <p>Add your first key-value pair to get started</p>
                    </div>
                  ) : (
                    <div className="kv-items">
                      {Object.entries(storeData).map(([key, value]) => (
                        <div key={key} className="kv-item">
                          <div className="kv-item-content">
                            <div className="kv-key">
                              <Key size={14} />
                              <span>{key}</span>
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
                            className="btn btn-danger-xs"
                            disabled={isLoading}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Management Section */}
      <div className="management-section">
        {/* Databases */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">
              <Database size={18} />
              <span>Databases ({databases.length}/3)</span>
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
                />
                <button type="submit" className="btn btn-primary-sm">
                  <Plus size={14} />
                </button>
              </form>
            )}
          </div>
          <div className="card-content">
            <div className="items-list">
              {databases.map((db) => (
                <div
                  key={db}
                  className={`list-item ${selectedDb === db ? "active" : ""}`}
                  onClick={() => onSelectDatabase(db)}
                >
                  <div className="item-content">
                    <Database size={16} />
                    <span>{db}</span>
                  </div>
                  <div className="item-actions">
                    {selectedDb === db && (
                      <span className="active-badge">●</span>
                    )}
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
                      className="btn btn-danger-xs"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {databases.length === 0 && (
                <div className="empty-state small">
                  <Database size={24} />
                  <p>No databases yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stores */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">
              <HardDrive size={18} />
              <span>Stores {selectedDb && `(${selectedDb})`}</span>
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
                />
                <button type="submit" className="btn btn-primary-sm">
                  <Plus size={14} />
                </button>
              </form>
            )}
          </div>
          <div className="card-content">
            {!selectedDb ? (
              <div className="empty-state small">
                <HardDrive size={24} />
                <p>Select a database first</p>
              </div>
            ) : (
              <div className="items-list">
                {stores.map((store) => (
                  <div
                    key={store}
                    className={`list-item ${selectedStore === store ? "active" : ""}`}
                    onClick={() => onSelectStore(selectedDb, store)}
                  >
                    <div className="item-content">
                      <HardDrive size={16} />
                      <span>{store}</span>
                    </div>
                    <div className="item-actions">
                      {selectedStore === store && (
                        <span className="active-badge">●</span>
                      )}
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
                        className="btn btn-danger-xs"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                {stores.length === 0 && (
                  <div className="empty-state small">
                    <HardDrive size={24} />
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
