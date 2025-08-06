import { useState } from "react";
import KVStoreSource from "../KVStore.js?raw";
import { CodeBlock } from "./CodeBlock";
import { Book, ArrowLeft, FileText, Package, Lightbulb } from "lucide-react";

function ApiDocsView({ accessToken, onBack }) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="api-docs-container">
      {/* Header Section */}
      <div className="header-section">
        <div className="docs-header-content">
          <div className="header-title">
            <Book size={24} />
            <h1>API Documentation</h1>
          </div>
          <p className="header-subtitle">Complete guide to using the KV Store API</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="btn btn-secondary"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>
      {/* Main Content */}
      <div className="main-content-area">
        <div className="content-card main-card">
          <div className="docs-navigation">
            <button
              type="button"
              className={`nav-tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <FileText size={16} />
              Overview
            </button>
            <button
              type="button"
              className={`nav-tab ${activeTab === "sdk" ? "active" : ""}`}
              onClick={() => setActiveTab("sdk")}
            >
              <Package size={16} />
              JavaScript SDK
            </button>
            <button
              type="button"
              className={`nav-tab ${activeTab === "examples" ? "active" : ""}`}
              onClick={() => setActiveTab("examples")}
            >
              <Lightbulb size={16} />
              Examples
            </button>
          </div>

          <div className="docs-content">

            {activeTab === "overview" && (
              <div className="docs-section">
                <h3>API Overview</h3>
              <p>Our KV Store API uses a single endpoint for all operations:</p>
              <CodeBlock id="endpoint" language="http">
                POST http://localhost:3001/api/connect
              </CodeBlock>

              <h4>Authentication</h4>
              <p>Include your access token in the Authorization header:</p>
              <CodeBlock id="auth" language="http">
                Authorization: Bearer your-access-token
              </CodeBlock>

              <h4>Request Format</h4>
              <CodeBlock id="request-format" language="json">
                {`{
  "action": "operation-name",
  "param1": "value1",
  "param2": "value2"
}`}
              </CodeBlock>

              <h4>Available Operations</h4>
              <div className="operations-grid">
                <div className="operation-category">
                  <h5>Authentication & User Management</h5>
                  <ul className="operation-list">
                    <li>
                      <strong>register</strong> - Register a new user
                    </li>
                    <li>
                      <strong>login</strong> - Authenticate user
                    </li>
                    <li>
                      <strong>generate-token</strong> - Generate access token
                    </li>
                    <li>
                      <strong>get-user-info</strong> - Get current user
                      information
                    </li>
                  </ul>
                </div>
                <div className="operation-category">
                  <h5>Database & Store Management</h5>
                  <ul className="operation-list">
                    <li>
                      <strong>get-databases</strong> - List all databases
                    </li>
                    <li>
                      <strong>create-database</strong> - Create a new database
                    </li>
                    <li>
                      <strong>delete-database</strong> - Delete a database
                    </li>
                    <li>
                      <strong>get-stores</strong> - List stores in a database
                    </li>
                    <li>
                      <strong>create-store</strong> - Create a new store
                    </li>
                    <li>
                      <strong>delete-store</strong> - Delete a store
                    </li>
                  </ul>
                </div>
                <div className="operation-category">
                  <h5>Key-Value Operations</h5>
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
                      <strong>getMany</strong> - Retrieve multiple values by
                      keys
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
              </div>
              </div>
            )}

            {activeTab === "sdk" && (
              <div className="docs-section">
                <h3>JavaScript SDK</h3>
              <p>Use our JavaScript SDK for easy integration:</p>

              <h4>Installation</h4>
              <CodeBlock id="sdk-class" language="javascript">
                {KVStoreSource}
              </CodeBlock>
              </div>
            )}

            {activeTab === "examples" && (
              <div className="docs-section">
                <h3>Usage Examples</h3>

              <h4>Basic Operations</h4>
              <CodeBlock id="basic-usage" language="javascript">
                {`// Initialize the store
const db = new KVStore('http://localhost:3001/api/connect', {
  accessToken: '${accessToken}',
  dbName: 'myDatabase',
  storeName: 'myStore'
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
await db.clear();`}
              </CodeBlock>

              <h4>Error Handling</h4>
              <CodeBlock id="error-handling" language="javascript">
                {`try {
  await db.set('myKey', 'myValue');
  const value = await db.get('myKey');
  console.log('Success:', value);
} catch (error) {
  console.error('Error:', error.message);
}`}
              </CodeBlock>

              <h4>Database & Store Management</h4>
              <CodeBlock id="db-management" language="javascript">
                {`// Get all databases
const databases = await db.getDatabases();
console.log(databases);

// Create a new database
await db.createDatabase('newDatabase');

// Get stores in a database
const stores = await db.getStores('myDatabase');
console.log(stores);

// Create a new store
await db.createStore('myDatabase', 'newStore');

// Delete a store
await db.deleteStore('myDatabase', 'oldStore');

// Delete a database
await db.deleteDatabase('oldDatabase');`}
              </CodeBlock>

              <h4>Authentication Examples</h4>
              <CodeBlock id="auth-examples" language="javascript">
                {`// Register new user
const userData = {
  username: 'john_doe',
  password: 'secure_password',
  email: 'john@example.com'
};
await db.register(userData);

// Login user
const loginData = {
  username: 'john_doe',
  password: 'secure_password'
};
const loginResult = await db.login(loginData);

// Generate access token
const tokenResult = await db.generateToken();
console.log('New token:', tokenResult.token);

// Get user information
const userInfo = await db.getUserInfo();
console.log('User:', userInfo);`}
              </CodeBlock>

              <h4>Working with Complex Data</h4>
              <CodeBlock id="complex-data" language="javascript">
                {`// Store complex objects
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
});`}
              </CodeBlock>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiDocsView;
