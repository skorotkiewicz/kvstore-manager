import { useState } from "react";

function ApiDocsView({ accessToken, onBack }) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="api-docs-container">
      <div className="card">
        <div className="card-header">
          <h2>API Documentation</h2>
          <button type="button" onClick={onBack} className="btn btn-secondary">
            Back to Dashboard
          </button>
        </div>
        <div className="card-content">
          <div className="tabs">
            <button
              type="button"
              className={`tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              type="button"
              className={`tab ${activeTab === "sdk" ? "active" : ""}`}
              onClick={() => setActiveTab("sdk")}
            >
              JavaScript SDK
            </button>
            <button
              type="button"
              className={`tab ${activeTab === "examples" ? "active" : ""}`}
              onClick={() => setActiveTab("examples")}
            >
              Examples
            </button>
          </div>

          {activeTab === "overview" && (
            <div className="tab-content">
              <h3>API Overview</h3>
              <p>Our KV Store API uses a single endpoint for all operations:</p>
              <div className="code-block">
                <code>POST http://localhost:3001/api/connect</code>
              </div>

              <h4>Authentication</h4>
              <p>Include your access token in the Authorization header:</p>
              <div className="code-block">
                <code>Authorization: Bearer your-access-token</code>
              </div>

              <h4>Request Format</h4>
              <div className="code-block">
                <pre>{`{
  "action": "operation-name",
  "param1": "value1",
  "param2": "value2"
}`}</pre>
              </div>

              <h4>Available Operations</h4>
              <ul className="operation-list">
                <li>
                  <strong>set</strong> - Store a key-value pair
                </li>
                <li>
                  <strong>get</strong> - Retrieve a value by key
                </li>
                <li>
                  <strong>setMany</strong> - Store multiple key-value pairs
                </li>
                <li>
                  <strong>getMany</strong> - Retrieve multiple values by keys
                </li>
                <li>
                  <strong>update</strong> - Update an existing key
                </li>
                <li>
                  <strong>delete</strong> - Delete a key
                </li>
                <li>
                  <strong>deleteMany</strong> - Delete multiple keys
                </li>
                <li>
                  <strong>entries</strong> - Get all key-value pairs
                </li>
                <li>
                  <strong>keys</strong> - Get all keys
                </li>
                <li>
                  <strong>values</strong> - Get all values
                </li>
                <li>
                  <strong>clear</strong> - Clear all data in store
                </li>
              </ul>
            </div>
          )}

          {activeTab === "sdk" && (
            <div className="tab-content">
              <h3>JavaScript SDK</h3>
              <p>Use our JavaScript SDK for easy integration:</p>

              <h4>Installation</h4>
              <div className="code-block">
                <pre>{`// Copy this code to your project
class KVStore {
  constructor(apiUrl, options) {
    this.apiUrl = apiUrl;
    this.accessToken = options.accessToken;
    this.storeName = options.storeName;
    this.dbName = options.dbName;
  }

  async _request(action, params = {}) {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer $\{this.accessToken}\`,
      },
      body: JSON.stringify({
        action,
        dbName: this.dbName,
        storeName: this.storeName,
        ...params,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  }
  // const result = await db.generateToken();
  async register(formData) {
    return await this._request("register", formData);
  }

  async login(formData) {
    return await this._request("login", formData);
  }

  async generateToken() {
    return await this._request("generate-token");
  }

  async getUserInfo() {
    return await this._request("get-user-info");
  }

  async getDatabases() {
    return await this._request("get-databases");
  }

  async createDatabase(name) {
    return await this._request("create-database", { name });
  }

  async createStore(dbName, storeName) {
    return await this._request("create-store", { dbName, storeName });
  }

  async set(key, value) {
    return await this._request("set", { key, value });
  }

  async get(key) {
    const result = await this._request("get", { key });
    return result.value;
  }

  async getStores(dbName) {
    const result = await this._request("get-stores", { dbName });
    return result.stores;
  }

  async setMany(entries) {
    return await this._request("setMany", { entries });
  }

  async getMany(keys) {
    const result = await this._request("getMany", { keys });
    return result.values;
  }

  async update(key, value) {
    return await this._request("update", { key, value });
  }

  async delete(key) {
    return await this._request("delete", { key });
  }

  async deleteMany(keys) {
    return await this._request("deleteMany", { keys });
  }

  async entries(dbName, storeName) {
    const result = await this._request("entries", { dbName, storeName });
    return result.entries;
  }

  async keys() {
    const result = await this._request("keys");
    return result.keys;
  }

  async values() {
    const result = await this._request("values");
    return result.values;
  }

  async clear() {
    return await this._request("clear");
  }

  async deleteStore(dbName, storeName) {
    return await this._request("delete-store", { dbName, storeName });
  }

  async deleteDatabase(dbName) {
    return await this._request("delete-database", { dbName });
  }
}

// Factory function
export function store(apiUrl, storeName, options) {
  return new KVStore(apiUrl, storeName, options);
}`}</pre>
              </div>
            </div>
          )}

          {activeTab === "examples" && (
            <div className="tab-content">
              <h3>Usage Examples</h3>

              <h4>Basic Usage</h4>
              <div className="code-block">
                <pre>{`// Initialize the store
const db = store('http://localhost:3001/api/connect', 'myStore', {
  accessToken: '${accessToken}',
  dbName: 'myDatabase'
});

// Set a value
await db.set('user:123', { name: 'John', age: 30 });

// Get a value
const user = await db.get('user:123');
console.log(user); // { name: 'John', age: 30 }

// Set multiple values
await db.setMany([
  ['key1', 'value1'],
  ['key2', 'value2'],
  ['key3', { data: 'complex object' }]
]);

// Get multiple values
const values = await db.getMany(['key1', 'key2']);
console.log(values); // { key1: 'value1', key2: 'value2' }

// Get all entries
const entries = await db.entries();
console.log(entries); // [['key1', 'value1'], ['key2', 'value2'], ...]

// Get all keys
const keys = await db.keys();
console.log(keys); // ['key1', 'key2', 'key3', ...]

// Delete a key
await db.delete('key1');

// Clear all data
await db.clear();`}</pre>
              </div>

              <h4>Error Handling</h4>
              <div className="code-block">
                <pre>{`try {
  await db.set('myKey', 'myValue');
  const value = await db.get('myKey');
  console.log('Success:', value);
} catch (error) {
  console.error('Error:', error.message);
}`}</pre>
              </div>

              <h4>Working with Complex Data</h4>
              <div className="code-block">
                <pre>{`// Store complex objects
await db.set('config', {
  theme: 'dark',
  language: 'en',
  features: ['feature1', 'feature2']
});

// Store arrays
await db.set('users', [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]);

// Update existing data
await db.update('config', {
  theme: 'light',
  language: 'pl',
  features: ['feature1', 'feature2', 'feature3']
});`}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApiDocsView;
