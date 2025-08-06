import { useState } from "react";

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
              >
                <div
                  className="list-item-content"
                  onClick={() => onSelectDatabase(db)}
                >
                  {db}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      window.confirm(
                        `Are you sure you want to delete database "${db}"? This will delete all stores and data in this database.`,
                      )
                    ) {
                      onDeleteDatabase(db);
                    }
                  }}
                  className="delete-btn"
                  title="Delete database"
                >
                  x
                </button>
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
                >
                  <div
                    className="list-item-content"
                    onClick={() => onSelectStore(selectedDb, store)}
                  >
                    {store}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          `Are you sure you want to delete store "${store}"? This will delete all data in this store.`,
                        )
                      ) {
                        onDeleteStore(selectedDb, store);
                      }
                    }}
                    className="delete-btn"
                    title="Delete store"
                  >
                    x
                  </button>
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

export default DashboardView;
