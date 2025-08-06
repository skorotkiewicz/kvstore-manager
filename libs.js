import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "hono/adapter";

// Simple file-based database
export const DB_PATH = "./database";
export const USERS_FILE = path.join(DB_PATH, "users.json");

// Ensure database directory exists
export async function initDB() {
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
export async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function readStore(userId, dbName, storeName) {
  const storePath = path.join(DB_PATH, userId, dbName, `${storeName}.json`);
  try {
    const data = await fs.readFile(storePath, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function writeStore(userId, dbName, storeName, data) {
  const dirPath = path.join(DB_PATH, userId, dbName);
  await fs.mkdir(dirPath, { recursive: true });
  const storePath = path.join(dirPath, `${storeName}.json`);
  await fs.writeFile(storePath, JSON.stringify(data, null, 2));
}

export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Middleware to verify token
export async function verifyToken(c, next) {
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
