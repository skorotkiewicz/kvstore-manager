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

// Auth routes
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

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
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/generate-token", verifyToken, async (req, res) => {
  try {
    const users = await readUsers();
    const newToken = generateToken();

    const user = users[req.user.email];
    user.accessTokens.push(newToken);

    await writeUsers(users);

    res.json({ accessToken: newToken });
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Database routes
app.get("/api/databases", verifyToken, async (req, res) => {
  try {
    const userPath = path.join(DB_PATH, req.user.id);
    try {
      const databases = await fs.readdir(userPath);
      res.json({ databases });
    } catch {
      res.json({ databases: [] });
    }
  } catch (error) {
    console.error("Database list error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/databases", verifyToken, async (req, res) => {
  try {
    const { name } = req.body;

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
  } catch (error) {
    console.error("Database creation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Store routes
app.get("/api/databases/:dbName/stores", verifyToken, async (req, res) => {
  try {
    const { dbName } = req.params;
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
  } catch (error) {
    console.error("Store list error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/databases/:dbName/stores", verifyToken, async (req, res) => {
  try {
    const { dbName } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Store name is required" });
    }

    await writeStore(req.user.id, dbName, name, {});

    res.json({ message: "Store created successfully" });
  } catch (error) {
    console.error("Store creation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Key-Value routes
app.get(
  "/api/databases/:dbName/stores/:storeName/keys",
  verifyToken,
  async (req, res) => {
    try {
      const { dbName, storeName } = req.params;
      const data = await readStore(req.user.id, dbName, storeName);
      res.json({ keys: Object.keys(data) });
    } catch (error) {
      console.error("Keys list error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

app.get(
  "/api/databases/:dbName/stores/:storeName/entries",
  verifyToken,
  async (req, res) => {
    try {
      const { dbName, storeName } = req.params;
      const data = await readStore(req.user.id, dbName, storeName);
      res.json({ entries: data });
    } catch (error) {
      console.error("Entries list error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

app.get(
  "/api/databases/:dbName/stores/:storeName/keys/:key",
  verifyToken,
  async (req, res) => {
    try {
      const { dbName, storeName, key } = req.params;
      const data = await readStore(req.user.id, dbName, storeName);

      if (key in data) {
        res.json({ value: data[key] });
      } else {
        res.status(404).json({ error: "Key not found" });
      }
    } catch (error) {
      console.error("Get key error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

app.post(
  "/api/databases/:dbName/stores/:storeName/keys",
  verifyToken,
  async (req, res) => {
    try {
      const { dbName, storeName } = req.params;
      const { key, value } = req.body;

      if (!key) {
        return res.status(400).json({ error: "Key is required" });
      }

      const data = await readStore(req.user.id, dbName, storeName);
      data[key] = value;
      await writeStore(req.user.id, dbName, storeName, data);

      res.json({ message: "Key set successfully" });
    } catch (error) {
      console.error("Set key error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

app.put(
  "/api/databases/:dbName/stores/:storeName/keys/:key",
  verifyToken,
  async (req, res) => {
    try {
      const { dbName, storeName, key } = req.params;
      const { value } = req.body;

      const data = await readStore(req.user.id, dbName, storeName);

      if (!(key in data)) {
        return res.status(404).json({ error: "Key not found" });
      }

      data[key] = value;
      await writeStore(req.user.id, dbName, storeName, data);

      res.json({ message: "Key updated successfully" });
    } catch (error) {
      console.error("Update key error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

app.delete(
  "/api/databases/:dbName/stores/:storeName/keys/:key",
  verifyToken,
  async (req, res) => {
    try {
      const { dbName, storeName, key } = req.params;
      const data = await readStore(req.user.id, dbName, storeName);

      if (!(key in data)) {
        return res.status(404).json({ error: "Key not found" });
      }

      delete data[key];
      await writeStore(req.user.id, dbName, storeName, data);

      res.json({ message: "Key deleted successfully" });
    } catch (error) {
      console.error("Delete key error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

app.delete(
  "/api/databases/:dbName/stores/:storeName/clear",
  verifyToken,
  async (req, res) => {
    try {
      const { dbName, storeName } = req.params;
      await writeStore(req.user.id, dbName, storeName, {});

      res.json({ message: "Store cleared successfully" });
    } catch (error) {
      console.error("Clear store error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

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
