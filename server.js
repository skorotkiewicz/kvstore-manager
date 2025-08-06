// biome-ignore assist/source/organizeImports: <>
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { env } from "hono/adapter";
import "dotenv/config";

const app = new Hono();
const PORT = 3001;

// 10 requests per minute
const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
});

// Middleware
app.use(
  cors({
    origin: "*",
  }),
);

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
async function verifyToken(c, next) {
  const body = await c.req.json();
  if (body.action === "register" || body.action === "login") {
    return next();
  }

  const authHeader = c.req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid authorization header" }, 401);
  }

  const token = authHeader.substring(7);
  const users = await readUsers();

  const user = Object.values(users).find((u) =>
    u.accessTokens?.includes(token),
  );
  if (!user) {
    return c.json({ error: "Invalid access token" }, 401);
  }

  c.set("user", user);
  await next();
}

export const verifyCaptcha = async (c, captcha) => {
  const { CAPTCHA_SECRET_KEY, VITE_CAPTCHA_ENABLED } = env(c);

  if (VITE_CAPTCHA_ENABLED !== "true") return true;

  if (!captcha) {
    return c.json({ error: "Please complete the CAPTCHA" }, 400);
  }

  try {
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${CAPTCHA_SECRET_KEY}&response=${captcha}`;
    const response = await fetch(verifyUrl, { method: "POST" });
    const data = await response.json();

    if (data.success) {
      // await next();
      return true;
    } else {
      return c.json({ error: "CAPTCHA verification failed" }, 400);
    }
  } catch (_err) {
    return c.json({ error: "CAPTCHA verification error" }, 500);
  }
};

// Single API endpoint for all operations
app.post("/api/connect", verifyToken, async (c) => {
  try {
    /**
     * Limiter to prevent abuse of the API.
     */
    try {
      const user = c.get("user");
      if (user?.id) await rateLimiter.consume(user.id, 1);
    } catch {
      return c.json(
        {
          error:
            "429 Too Many Requests - your IP is being rate limited, try again in 1 hour",
        },
        429,
      );
    }

    const body = await c.req.json();
    const { action, ...params } = body;

    switch (action) {
      case "register":
        return await handleRegister(c, params);
      case "login":
        return await handleLogin(c, params);
      case "generate-token":
        return await handleGenerateToken(c, params);
      case "get-databases":
        return await handleGetDatabases(c, params);
      case "create-database":
        return await handleCreateDatabase(c, params);
      case "get-stores":
        return await handleGetStores(c, params);
      case "create-store":
        return await handleCreateStore(c, params);
      case "set":
        return await handleSet(c, params);
      case "get":
        return await handleGet(c, params);
      case "setMany":
        return await handleSetMany(c, params);
      case "getMany":
        return await handleGetMany(c, params);
      case "update":
        return await handleUpdate(c, params);
      case "delete":
        return await handleDelete(c, params);
      case "deleteMany":
        return await handleDeleteMany(c, params);
      case "entries":
        return await handleEntries(c, params);
      case "keys":
        return await handleKeys(c, params);
      case "values":
        return await handleValues(c, params);
      case "clear":
        return await handleClear(c, params);
      case "delete-store":
        return await handleDeleteStore(c, params);
      case "delete-database":
        return await handleDeleteDatabase(c, params);
      case "get-user-info":
        return await handleGetUserInfo(c, params);
      default:
        return c.json({ error: "Invalid action" }, 400);
    }
  } catch (error) {
    console.error("API error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Handler functions
async function handleRegister(c, { username, email, password, captcha }) {
  const isCaptcha = await verifyCaptcha(c, captcha);
  if (isCaptcha !== true) {
    return c.json({ error: "CAPTCHA verification failed" }, 400);
  }

  if (!username || !email || !password) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const users = await readUsers();

  if (users[email]) {
    return c.json({ error: "User already exists" }, 400);
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

  return c.json({
    message: "User registered successfully",
    user: { id: userId, username, email },
    accessToken,
  });
}

async function handleLogin(c, { email, password, captcha }) {
  const isCaptcha = await verifyCaptcha(c, captcha);
  if (isCaptcha !== true) {
    return c.json({ error: "CAPTCHA verification failed" }, 400);
  }

  const users = await readUsers();
  const user = users[email];

  if (!user || user.password !== hashPassword(password)) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  return c.json({
    message: "Login successful",
    user: { id: user.id, username: user.username, email: user.email },
    accessToken: user.accessTokens[0],
  });
}

async function handleGenerateToken(c, _params) {
  const authHeader = c.req.header("authorization");
  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   return c.json({ error: "Missing or invalid authorization header" }, 401);
  // }

  const token = authHeader.substring(7);
  const users = await readUsers();

  const userEntry = Object.entries(users).find(([_email, u]) =>
    u.accessTokens?.includes(token),
  );
  if (!userEntry) {
    return c.json({ error: "Invalid access token" }, 401);
  }

  const [_email, user] = userEntry;
  const newToken = generateToken();
  user.accessTokens = [newToken];

  await writeUsers(users);

  return c.json({ accessToken: newToken });
}

async function handleGetDatabases(c, _params) {
  const user = c.get("user");
  const userPath = path.join(DB_PATH, user.id);
  try {
    const databases = await fs.readdir(userPath);
    return c.json({ databases });
  } catch {
    return c.json({ databases: [] });
  }
}

async function handleCreateDatabase(c, { name }) {
  if (!name) {
    return c.json({ error: "Database name is required" }, 400);
  }

  const user = c.get("user");
  const userPath = path.join(DB_PATH, user.id);
  const databases = [];

  try {
    const existing = await fs.readdir(userPath);
    databases.push(...existing);
  } catch {}

  if (databases.length >= 3) {
    return c.json({ error: "Maximum 3 databases allowed" }, 400);
  }

  if (databases.includes(name)) {
    return c.json({ error: "Database already exists" }, 400);
  }

  const dbPath = path.join(userPath, name);
  await fs.mkdir(dbPath, { recursive: true });

  return c.json({ message: "Database created successfully" });
}

async function handleGetStores(c, { dbName }) {
  const user = c.get("user");
  const storePath = path.join(DB_PATH, user.id, dbName);

  try {
    const files = await fs.readdir(storePath);
    const stores = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""));
    return c.json({ stores });
  } catch {
    return c.json({ stores: [] });
  }
}

async function handleCreateStore(c, { dbName, storeName }) {
  if (!storeName) {
    return c.json({ error: "Store name is required" }, 400);
  }

  const user = c.get("user");
  await writeStore(user.id, dbName, storeName, {});

  return c.json({ message: "Store created successfully" });
}

// KV Store operation handlers
async function handleSet(c, { dbName, storeName, key, value }) {
  if (!key) {
    return c.json({ error: "Key is required" }, 400);
  }

  const user = c.get("user");
  const data = await readStore(user.id, dbName, storeName);
  data[key] = value;
  await writeStore(user.id, dbName, storeName, data);

  return c.json({ success: true });
}

async function handleGet(c, { dbName, storeName, key }) {
  const user = c.get("user");
  const data = await readStore(user.id, dbName, storeName);

  if (key in data) {
    return c.json({ value: data[key] });
  } else {
    return c.json({ value: null });
  }
}

async function handleSetMany(c, { dbName, storeName, entries }) {
  const user = c.get("user");
  const data = await readStore(user.id, dbName, storeName);

  for (const [key, value] of entries) {
    data[key] = value;
  }

  await writeStore(user.id, dbName, storeName, data);
  return c.json({ success: true });
}

async function handleGetMany(c, { dbName, storeName, keys }) {
  const user = c.get("user");
  const data = await readStore(user.id, dbName, storeName);
  const result = {};

  for (const key of keys) {
    result[key] = data[key] || null;
  }

  return c.json({ values: result });
}

async function handleUpdate(c, { dbName, storeName, key, value }) {
  const user = c.get("user");
  const data = await readStore(user.id, dbName, storeName);

  if (!(key in data)) {
    return c.json({ error: "Key not found" }, 404);
  }

  data[key] = value;
  await writeStore(user.id, dbName, storeName, data);

  return c.json({ success: true });
}

async function handleDelete(c, { dbName, storeName, key }) {
  const user = c.get("user");
  const data = await readStore(user.id, dbName, storeName);

  if (!(key in data)) {
    return c.json({ error: "Key not found" }, 404);
  }

  delete data[key];
  await writeStore(user.id, dbName, storeName, data);

  return c.json({ success: true });
}

async function handleDeleteMany(c, { dbName, storeName, keys }) {
  const user = c.get("user");
  const data = await readStore(user.id, dbName, storeName);

  for (const key of keys) {
    delete data[key];
  }

  await writeStore(user.id, dbName, storeName, data);
  return c.json({ success: true });
}

async function handleEntries(c, { dbName, storeName }) {
  const user = c.get("user");
  const data = await readStore(user.id, dbName, storeName);
  return c.json({ entries: Object.entries(data) });
}

async function handleKeys(c, { dbName, storeName }) {
  const user = c.get("user");
  const data = await readStore(user.id, dbName, storeName);
  return c.json({ keys: Object.keys(data) });
}

async function handleValues(c, { dbName, storeName }) {
  const user = c.get("user");
  const data = await readStore(user.id, dbName, storeName);
  return c.json({ values: Object.values(data) });
}

async function handleClear(c, { dbName, storeName }) {
  const user = c.get("user");
  await writeStore(user.id, dbName, storeName, {});
  return c.json({ success: true });
}

async function handleDeleteStore(c, { dbName, storeName }) {
  if (!dbName || !storeName) {
    return c.json({ error: "Database name and store name are required" }, 400);
  }

  const user = c.get("user");
  const storePath = path.join(DB_PATH, user.id, dbName, `${storeName}.json`);

  try {
    await fs.unlink(storePath);
    return c.json({ success: true, message: "Store deleted successfully" });
  } catch (error) {
    if (error.code === "ENOENT") {
      return c.json({ error: "Store not found" }, 404);
    }
    throw error;
  }
}

async function handleDeleteDatabase(c, { dbName }) {
  if (!dbName) {
    return c.json({ error: "Database name is required" }, 400);
  }

  const user = c.get("user");
  const dbPath = path.join(DB_PATH, user.id, dbName);

  try {
    await fs.rm(dbPath, { recursive: true, force: true });
    return c.json({ success: true, message: "Database deleted successfully" });
  } catch (error) {
    if (error.code === "ENOENT") {
      return c.json({ error: "Database not found" }, 404);
    }
    throw error;
  }
}

async function handleGetUserInfo(c, _params) {
  const user = c.get("user");
  return c.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
}

// Initialize database and start server
initDB()
  .then(() => {
    console.log(`Server running on http://localhost:${PORT}`);
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
  });

serve({ port: PORT, fetch: app.fetch });

export default { port: PORT, fetch: app.fetch };
