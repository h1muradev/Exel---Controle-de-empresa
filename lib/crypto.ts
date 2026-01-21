import { randomBytes } from "crypto";

const key = process.env.FIELD_ENCRYPTION_KEY ?? "";

export async function encryptSensitive(value: string) {
  if (!key) return value;
  const iv = randomBytes(12);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    Buffer.from(key, "base64"),
    "AES-GCM",
    false,
    ["encrypt"]
  );
  const encoded = new TextEncoder().encode(value);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, encoded);
  return `${iv.toString("base64")}:${Buffer.from(cipher).toString("base64")}`;
}

export async function decryptSensitive(value: string) {
  if (!key) return value;
  const [ivBase64, dataBase64] = value.split(":");
  if (!ivBase64 || !dataBase64) return value;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    Buffer.from(key, "base64"),
    "AES-GCM",
    false,
    ["decrypt"]
  );
  const iv = Buffer.from(ivBase64, "base64");
  const data = Buffer.from(dataBase64, "base64");
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, data);
  return new TextDecoder().decode(plain);
}
