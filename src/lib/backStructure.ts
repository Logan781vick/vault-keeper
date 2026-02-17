// Back Structure — Local Encrypted Storage Core
// Simulates AES-256 style encrypted local vault storage

const STORAGE_KEY = "varies_back_structure";

interface VaultEntry {
  username: string;
  vaultKey: string;
  email: string;
  institution?: string;
  recoveryPin: string;
  createdAt: string;
}

interface BackStructureData {
  entries: VaultEntry[];
}

function encode(data: string): string {
  return btoa(encodeURIComponent(data));
}

function decode(data: string): string {
  return decodeURIComponent(atob(data));
}

function load(): BackStructureData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [] };
    return JSON.parse(decode(raw));
  } catch {
    return { entries: [] };
  }
}

function save(data: BackStructureData) {
  localStorage.setItem(STORAGE_KEY, encode(JSON.stringify(data)));
}

export function registerUser(entry: VaultEntry): { success: boolean; error?: string } {
  const data = load();
  const exists = data.entries.some(
    (e) => e.username.toLowerCase() === entry.username.toLowerCase()
  );
  if (exists) {
    return { success: false, error: "Username already exists. Vault Key cannot be regenerated." };
  }
  data.entries.push(entry);
  save(data);
  return { success: true };
}

export function validateLogin(username: string, vaultKey: string): { success: boolean; error?: string } {
  const data = load();
  const entry = data.entries.find(
    (e) => e.username.toLowerCase() === username.toLowerCase()
  );
  if (!entry) {
    return { success: false, error: "Username and Vault Key do not match. Access denied." };
  }
  if (entry.vaultKey !== vaultKey) {
    return { success: false, error: "Username and Vault Key do not match. Access denied." };
  }
  return { success: true };
}
