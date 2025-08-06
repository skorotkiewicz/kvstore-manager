export class KVStore {
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
        Authorization: `Bearer ${this.accessToken}`,
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
}
