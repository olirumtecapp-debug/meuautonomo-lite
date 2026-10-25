import fs from "fs";
import path from "path";

const CONFIG_FILE = path.resolve(process.cwd(), "server", "data", "admin-config.json");

interface AdminConfig {
  demoMode: boolean;
  adminEmail: string;
  adminUsername?: string;
  adminPasswordHash?: string;
}

let _config: AdminConfig = {
  demoMode: false,
  adminEmail: process.env.ADMIN_EMAIL || "",
  adminUsername: process.env.ADMIN_USERNAME || "",
};

// Load saved config if exists
try {
  if (fs.existsSync(CONFIG_FILE)) {
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    _config = { ..._config, ...JSON.parse(raw) };
  }
} catch (e) {
  console.warn("[AdminConfig] Could not load config file:", e);
}

function saveConfig() {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(_config, null, 2), "utf-8");
  } catch (e) {
    console.warn("[AdminConfig] Could not save config file:", e);
  }
}

export function isDemoMode(): boolean {
  return _config.demoMode;
}

export function setDemoMode(value: boolean): void {
  _config.demoMode = value;
  saveConfig();
}

export const DEFAULT_ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "meuatonomomaster@creativeam.com.br";

export const DEFAULT_ADMIN_USERNAME =
  process.env.ADMIN_USERNAME || "meuatonomomaster";

export const DEFAULT_ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "";

export function getAdminEmail(): string {
  return _config.adminEmail || process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
}

export function getAdminUsername(): string {
  return _config.adminUsername || process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME;
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}
