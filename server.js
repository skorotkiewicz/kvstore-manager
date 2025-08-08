// biome-ignore assist/source/organizeImports: <>
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { RateLimiterMemory } from "rate-limiter-flexible";
import "dotenv/config";
import { fileURLToPath } from "node:url";
import {
  initDB,
  DB_PATH,
  readUsers,
  writeUsers,
  readStore,
  writeStore,
  generateToken,
  hashPassword,
  verifyToken,
  verifyCaptcha,
} from "./libs.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = new Hono();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === "production";
const isBun = typeof process !== "undefined" && process.isBun;

// 120 requests per minute
const rateLimiter = new RateLimiterMemory({
  points: 120,
  duration: 60,
});

// Middleware
app.use(
  cors({
    origin: "*",
  }),
);

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
      case "change-password":
        return await handleChangePassword(c, params);
      case "delete-account":
        return await handleDeleteAccount(c, params);
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

async function handleLogin(c, { email, password }) {
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

async function handleChangePassword(c, { currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    return c.json(
      { error: "Current password and new password are required" },
      400,
    );
  }

  if (newPassword.length < 6) {
    return c.json(
      { error: "New password must be at least 6 characters long" },
      400,
    );
  }

  const user = c.get("user");
  const users = await readUsers();

  const userEmail = Object.keys(users).find(
    (email) => users[email].id === user.id,
  );
  if (!userEmail) {
    return c.json({ error: "User not found" }, 404);
  }

  const userData = users[userEmail];

  if (userData.password !== hashPassword(currentPassword)) {
    return c.json({ error: "Current password is incorrect" }, 400);
  }

  userData.password = hashPassword(newPassword);
  userData.updatedAt = new Date().toISOString();

  await writeUsers(users);

  return c.json({
    success: true,
    message: "Password changed successfully",
  });
}

async function handleDeleteAccount(c, { password, confirmation }) {
  if (!password) {
    return c.json({ error: "Password is required to delete account" }, 400);
  }

  if (!confirmation) {
    return c.json({ error: "Confirmation field is required" }, 400);
  }

  const expectedText = "DELETE MY ACCOUNT";

  if (confirmation !== expectedText) {
    return c.json(
      {
        error: `Confirmation field must contain exactly: "${expectedText}"`,
      },
      400,
    );
  }

  const user = c.get("user");
  const users = await readUsers();

  const userEmail = Object.keys(users).find(
    (email) => users[email].id === user.id,
  );
  if (!userEmail) {
    return c.json({ error: "User not found" }, 404);
  }

  const userData = users[userEmail];

  if (userData.password !== hashPassword(password)) {
    return c.json({ error: "Password is incorrect" }, 400);
  }

  try {
    const userDataPath = path.join(DB_PATH, user.id);
    await fs.rm(userDataPath, { recursive: true, force: true });
  } catch (error) {
    console.warn(`Failed to delete user data directory: ${error.message}`);
  }

  delete users[userEmail];
  await writeUsers(users);

  return c.json({
    success: true,
    message: "Account deleted successfully",
  });
}

// Static file serving middleware for production
app.use("/*", async (c, next) => {
  const url = new URL(c.req.url).pathname;

  // Skip API routes
  if (url.startsWith("/api/")) {
    return next();
  }

  if (isProd) {
    // Production: serve built files
    const distPath = path.join(__dirname, "dist");

    try {
      const filePath = path.join(distPath, url === "/" ? "index.html" : url);
      const stat = await fs.stat(filePath);

      if (stat.isFile()) {
        const content = await fs.readFile(filePath);
        const ext = path.extname(filePath);
        const contentType = getContentType(ext);
        c.header("Content-Type", contentType);
        return c.body(content);
      }
    } catch {}

    // Fallback to index.html for SPA
    try {
      const indexPath = path.join(distPath, "index.html");
      const indexContent = await fs.readFile(indexPath, "utf-8");
      c.header("Content-Type", "text/html");
      return c.html(indexContent);
    } catch {
      return c.text("Application not built", 500);
    }
  }

  return next();
});

// Initialize database and start server
async function startServer() {
  try {
    await initDB();

    if (!isProd) {
      // Development: start Vite dev server
      console.log("Starting Vite dev server...");
      const { spawn } = await import("node:child_process");
      const viteProcess = spawn("bunx", ["vite"], {
        stdio: "inherit",
        cwd: __dirname,
      });

      process.on("SIGINT", () => {
        viteProcess.kill("SIGINT");
        process.exit(0);
      });
    }

    console.log(`API Server running on http://localhost:${PORT}`);
    console.log(`Mode: ${isProd ? "production" : "development"}`);

    if (!isProd) {
      console.log("Vite dev server will run on http://localhost:5173");
      console.log(
        "Make sure to access the app through Vite dev server in development",
      );
    }
    if (!isBun) {
      serve({ port: PORT, fetch: app.fetch });
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

function getContentType(ext) {
  const types = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
  };
  return types[ext] || "text/plain";
}

startServer();

export default { port: PORT, fetch: app.fetch };
