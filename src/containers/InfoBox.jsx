function InfoBox({
  lastOperation,
  selectedDb,
  selectedStore,
  configs,
  onClose,
}) {
  if (!lastOperation) return null;
  const { baseUrl, accessToken } = configs;

  const generateCurlExample = () => {
    // const baseUrl = "http://localhost:3001/api";
    const headers = `-H "Content-Type: application/json" -H "Authorization: Bearer ${accessToken}"`;

    switch (lastOperation.type) {
      case "create-database":
        return `curl -X POST ${baseUrl} ${headers} \\
  -d '{"action": "create-database", "name": "${lastOperation.data.name}"}'`;

      case "create-store":
        return `curl -X POST ${baseUrl} ${headers} \\
  -d '{"action": "create-store", "dbName": "${lastOperation.data.dbName}", "storeName": "${lastOperation.data.storeName}"}'`;

      case "set":
        return `curl -X POST ${baseUrl} ${headers} \\
  -d '{"action": "set", "dbName": "${lastOperation.data.dbName}", "storeName": "${lastOperation.data.storeName}", "key": "${lastOperation.data.key}", "value": "${lastOperation.data.value}"}'`;

      case "delete":
        return `curl -X POST ${baseUrl} ${headers} \\
  -d '{"action": "delete", "dbName": "${lastOperation.data.dbName}", "storeName": "${lastOperation.data.storeName}", "key": "${lastOperation.data.key}"}'`;

      case "clear":
        return `curl -X POST ${baseUrl} ${headers} \\
  -d '{"action": "clear", "dbName": "${lastOperation.data.dbName}", "storeName": "${lastOperation.data.storeName}"}'`;

      case "delete-store":
        return `curl -X POST ${baseUrl} ${headers} \\
  -d '{"action": "delete-store", "dbName": "${lastOperation.data.dbName}", "storeName": "${lastOperation.data.storeName}"}'`;

      case "delete-database":
        return `curl -X POST ${baseUrl} ${headers} \\
  -d '{"action": "delete-database", "dbName": "${lastOperation.data.dbName}"}'`;

      default:
        return "No example available";
    }
  };

  const generateKVStoreExample = () => {
    const kvStoreSetup = `import { KVStore } from './KVStore.js';

const kvStore = new KVStore('${baseUrl}', {
  accessToken: '${accessToken}',
  dbName: '${selectedDb || "your-db"}',
  storeName: '${selectedStore || "your-store"}'
});`;

    switch (lastOperation.type) {
      case "create-database":
        return `${kvStoreSetup}

await kvStore.createDatabase('${lastOperation.data.name}');`;

      case "create-store":
        return `${kvStoreSetup}

await kvStore.createStore('${lastOperation.data.dbName}', '${lastOperation.data.storeName}');`;

      case "set":
        return `${kvStoreSetup}

await kvStore.set('${lastOperation.data.key}', '${lastOperation.data.value}');`;

      case "delete":
        return `${kvStoreSetup}

await kvStore.delete('${lastOperation.data.key}');`;

      case "clear":
        return `${kvStoreSetup}

await kvStore.clear();`;

      case "delete-store":
        return `${kvStoreSetup}

await kvStore.deleteStore('${lastOperation.data.dbName}', '${lastOperation.data.storeName}');`;

      case "delete-database":
        return `${kvStoreSetup}

await kvStore.deleteDatabase('${lastOperation.data.dbName}');`;

      default:
        return "No example available";
    }
  };

  return (
    <div className="infobox-container">
      <div className="infobox-header">
        <h3>How to perform this operation:</h3>
        <button
          type="button"
          className="infobox-close-btn"
          onClick={onClose}
          title="Close"
        >
          ×
        </button>
      </div>

      <div className="infobox-section">
        <h4>Using curl:</h4>
        <pre className="code-example">
          <code>{generateCurlExample()}</code>
        </pre>
      </div>

      <div className="infobox-section">
        <h4>Using KVStore class:</h4>
        <pre className="code-example">
          <code>{generateKVStoreExample()}</code>
        </pre>
      </div>
    </div>
  );
}

export default InfoBox;
