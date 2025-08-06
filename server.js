// biome-ignore assist/source/organizeImports: <>
import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple file-based database
const DB_PATH = "./database";
const USERS_FILE = path.join(DB_PATH, "users.json");

// Ensure database directory exists
async function initDB() {
  try {
    await fs.mkdir(DB_PATH, { recursive: true });
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify({}));
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

// Helper functions
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function readStore(userId, dbName, storeName) {
  const storePath = path.join(DB_PATH, userId, dbName, `${storeName}.json`);
  try {
    const data = await fs.readFile(storePath, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeStore(userId, dbName, storeName, data) {
  const dirPath = path.join(DB_PATH, userId, dbName);
  await fs.mkdir(dirPath, { recursive: true });
  const storePath = path.join(dirPath, `${storeName}.json`);
  await fs.writeFile(storePath, JSON.stringify(data, null, 2));
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Middleware to verify token
async function verifyToken(req, res, next) {
  if (req.body.action === "register" || req.body.action === "login") {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.substring(7);
  const users = await readUsers();

  const user = Object.values(users).find((u) =>
    u.accessTokens?.includes(token),
  );
  if (!user) {
    return res.status(401).json({ error: "Invalid access token" });
  }

  req.user = user;
  next();
}

// Single API endpoint for all operations
app.post("/api/connect", verifyToken, async (req, res) => {
  try {
    const { action, ...params } = req.body;

    switch (action) {
      case "register":
        return await handleRegister(req, res, params);
      case "login":
        return await handleLogin(req, res, params);
      case "generate-token":
        return await handleGenerateToken(req, res, params);
      case "get-databases":
        return await handleGetDatabases(req, res, params);
      case "create-database":
        return await handleCreateDatabase(req, res, params);
      case "get-stores":
        return await handleGetStores(req, res, params);
      case "create-store":
        return await handleCreateStore(req, res, params);
      case "set":
        return await handleSet(req, res, params);
      case "get":
        return await handleGet(req, res, params);
      case "setMany":
        return await handleSetMany(req, res, params);
      case "getMany":
        return await handleGetMany(req, res, params);
      case "update":
        return await handleUpdate(req, res, params);
      case "delete":
        return await handleDelete(req, res, params);
      case "deleteMany":
        return await handleDeleteMany(req, res, params);
      case "entries":
        return await handleEntries(req, res, params);
      case "keys":
        return await handleKeys(req, res, params);
      case "values":
        return await handleValues(req, res, params);
      case "clear":
        return await handleClear(req, res, params);
      case "delete-store":
        return await handleDeleteStore(req, res, params);
      case "delete-database":
        return await handleDeleteDatabase(req, res, params);
      case "get-user-info":
        return await handleGetUserInfo(req, res, params);
      default:
        return res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Handler functions
async function handleRegister(_req, res, { username, email, password }) {
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const users = await readUsers();

  if (users[email]) {
    return res.status(400).json({ error: "User already exists" });
  }

  const userId = crypto.randomUUID();
  const accessToken = generateToken();

  users[email] = {
    id: userId,
    username,
    email,
    password: hashPassword(password),
    accessTokens: [accessToken],
    databases: [],
    createdAt: new Date().toISOString(),
  };

  await writeUsers(users);

  res.json({
    message: "User registered successfully",
    user: { id: userId, username, email },
    accessToken,
  });
}

async function handleLogin(_req, res, { email, password }) {
  const users = await readUsers();
  const user = users[email];

  if (!user || user.password !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({
    message: "Login successful",
    user: { id: user.id, username: user.username, email: user.email },
    accessToken: user.accessTokens[0],
  });
}

async function handleGenerateToken(req, res, _params) {
  const authHeader = req.headers.authorization;
  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   return res
  //     .status(401)
  //     .json({ error: "Missing or invalid authorization header" });
  // }

  const token = authHeader.substring(7);
  const users = await readUsers();

  const userEntry = Object.entries(users).find(([_email, u]) =>
    u.accessTokens?.includes(token),
  );
  if (!userEntry) {
    return res.status(401).json({ error: "Invalid access token" });
  }

  const [_email, user] = userEntry;
  const newToken = generateToken();
  user.accessTokens = [newToken];

  await writeUsers(users);

  res.json({ accessToken: newToken });
}

async function handleGetDatabases(req, res, _params) {
  const userPath = path.join(DB_PATH, req.user.id);
  try {
    const databases = await fs.readdir(userPath);
    res.json({ databases });
  } catch {
    res.json({ databases: [] });
  }
}

async function handleCreateDatabase(req, res, { name }) {
  if (!name) {
    return res.status(400).json({ error: "Database name is required" });
  }

  const userPath = path.join(DB_PATH, req.user.id);
  const databases = [];

  try {
    const existing = await fs.readdir(userPath);
    databases.push(...existing);
  } catch {}

  if (databases.length >= 3) {
    return res.status(400).json({ error: "Maximum 3 databases allowed" });
  }

  if (databases.includes(name)) {
    return res.status(400).json({ error: "Database already exists" });
  }

  const dbPath = path.join(userPath, name);
  await fs.mkdir(dbPath, { recursive: true });

  res.json({ message: "Database created successfully" });
}

async function handleGetStores(req, res, { dbName }) {
  const storePath = path.join(DB_PATH, req.user.id, dbName);

  try {
    const files = await fs.readdir(storePath);
    const stores = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""));
    res.json({ stores });
  } catch {
    res.json({ stores: [] });
  }
}

async function handleCreateStore(req, res, { dbName, storeName }) {
  if (!storeName) {
    return res.status(400).json({ error: "Store name is required" });
  }

  await writeStore(req.user.id, dbName, storeName, {});

  res.json({ message: "Store created successfully" });
}

// KV Store operation handlers
async function handleSet(req, res, { dbName, storeName, key, value }) {
  if (!key) {
    return res.status(400).json({ error: "Key is required" });
  }

  const data = await readStore(req.user.id, dbName, storeName);
  data[key] = value;
  await writeStore(req.user.id, dbName, storeName, data);

  res.json({ success: true });
}

async function handleGet(req, res, { dbName, storeName, key }) {
  const data = await readStore(req.user.id, dbName, storeName);

  if (key in data) {
    res.json({ value: data[key] });
  } else {
    res.json({ value: null });
  }
}

async function handleSetMany(req, res, { dbName, storeName, entries }) {
  const data = await readStore(req.user.id, dbName, storeName);

  for (const [key, value] of entries) {
    data[key] = value;
  }

  await writeStore(req.user.id, dbName, storeName, data);
  res.json({ success: true });
}

async function handleGetMany(req, res, { dbName, storeName, keys }) {
  const data = await readStore(req.user.id, dbName, storeName);
  const result = {};

  for (const key of keys) {
    result[key] = data[key] || null;
  }

  res.json({ values: result });
}

async function handleUpdate(req, res, { dbName, storeName, key, value }) {
  const data = await readStore(req.user.id, dbName, storeName);

  if (!(key in data)) {
    return res.status(404).json({ error: "Key not found" });
  }

  data[key] = value;
  await writeStore(req.user.id, dbName, storeName, data);

  res.json({ success: true });
}

async function handleDelete(req, res, { dbName, storeName, key }) {
  const data = await readStore(req.user.id, dbName, storeName);

  if (!(key in data)) {
    return res.status(404).json({ error: "Key not found" });
  }

  delete data[key];
  await writeStore(req.user.id, dbName, storeName, data);

  res.json({ success: true });
}

async function handleDeleteMany(req, res, { dbName, storeName, keys }) {
  const data = await readStore(req.user.id, dbName, storeName);

  for (const key of keys) {
    delete data[key];
  }

  await writeStore(req.user.id, dbName, storeName, data);
  res.json({ success: true });
}

async function handleEntries(req, res, { dbName, storeName }) {
  const data = await readStore(req.user.id, dbName, storeName);
  res.json({ entries: Object.entries(data) });
}

async function handleKeys(req, res, { dbName, storeName }) {
  const data = await readStore(req.user.id, dbName, storeName);
  res.json({ keys: Object.keys(data) });
}

async function handleValues(req, res, { dbName, storeName }) {
  const data = await readStore(req.user.id, dbName, storeName);
  res.json({ values: Object.values(data) });
}

async function handleClear(req, res, { dbName, storeName }) {
  await writeStore(req.user.id, dbName, storeName, {});
  res.json({ success: true });
}

async function handleDeleteStore(req, res, { dbName, storeName }) {
  if (!dbName || !storeName) {
    return res
      .status(400)
      .json({ error: "Database name and store name are required" });
  }

  const storePath = path.join(
    DB_PATH,
    req.user.id,
    dbName,
    `${storeName}.json`,
  );

  try {
    await fs.unlink(storePath);
    res.json({ success: true, message: "Store deleted successfully" });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ error: "Store not found" });
    }
    throw error;
  }
}

async function handleDeleteDatabase(req, res, { dbName }) {
  if (!dbName) {
    return res.status(400).json({ error: "Database name is required" });
  }

  const dbPath = path.join(DB_PATH, req.user.id, dbName);

  try {
    await fs.rm(dbPath, { recursive: true, force: true });
    res.json({ success: true, message: "Database deleted successfully" });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ error: "Database not found" });
    }
    throw error;
  }
}

async function handleGetUserInfo(req, res, _params) {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    },
  });
}

// Initialize database and start server
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
  });
