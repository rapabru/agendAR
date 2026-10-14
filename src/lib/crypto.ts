/**
 * AgendAR Cryptographic Engine
 * Implementa cifrado cliente de extremo a extremo (E2EE) utilizando la Web Crypto API nativa.
 * Algoritmo: AES-GCM (256 bits) + PBKDF2 (derivación de claves con SHA-256 y 100.000 iteraciones).
 */

export interface EncryptedPayload {
  cipherText: string; // Base64
  iv: string; // Base64
  salt: string; // Base64
}

/**
 * Convierte un ArrayBuffer a string Base64
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convierte un string Base64 a ArrayBuffer
 */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Genera bytes aleatorios criptográficamente seguros
 */
export function generateRandomBytes(length: number = 16): Uint8Array {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

/**
 * Deriva una CryptoKey AES-GCM a partir de una contraseña y un salt usando PBKDF2
 */
export async function deriveKeyFromPassword(
  passphrase: string,
  saltBuffer: ArrayBuffer
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encripta un string de texto o payload JSON con una contraseña
 */
export async function encryptData(
  plainText: string,
  passphrase: string
): Promise<EncryptedPayload> {
  const enc = new TextEncoder();
  const salt = generateRandomBytes(16);
  const iv = generateRandomBytes(12); // IV de 96 bits recomendado para AES-GCM

  const key = await deriveKeyFromPassword(passphrase, salt.buffer as ArrayBuffer);

  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv.buffer as ArrayBuffer,
    },
    key,
    enc.encode(plainText)
  );

  return {
    cipherText: bufferToBase64(encryptedContent),
    iv: bufferToBase64(iv.buffer as ArrayBuffer),
    salt: bufferToBase64(salt.buffer as ArrayBuffer),
  };
}

/**
 * Desencripta un payload cifrado con la contraseña correspondiente
 */
export async function decryptData(
  payload: EncryptedPayload,
  passphrase: string
): Promise<string> {
  const saltBuffer = base64ToBuffer(payload.salt);
  const ivBuffer = base64ToBuffer(payload.iv);
  const cipherBuffer = base64ToBuffer(payload.cipherText);

  const key = await deriveKeyFromPassword(passphrase, saltBuffer);

  const decryptedContent = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer,
    },
    key,
    cipherBuffer
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedContent);
}

/**
 * Calcula el hash SHA-256 de una cadena (para verificaciones de integridad)
 */
export async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return bufferToBase64(hashBuffer);
}

export const VAULT_ENC_PREFIX = "ENC:";
const VAULT_CANARY_MAGIC = "AGENDAR_VAULT_CANARY_V1";

/**
 * Determina si un bloque contiene payload cifrado E2EE
 */
export function isEncryptedContent(content: string): boolean {
  return typeof content === "string" && content.startsWith(VAULT_ENC_PREFIX);
}

/**
 * Cifra el texto plano de un bloque y lo serializa con prefijo seguro
 */
export async function encryptBlockContent(plainText: string, passphrase: string): Promise<string> {
  const payload = await encryptData(plainText, passphrase);
  return `${VAULT_ENC_PREFIX}${JSON.stringify(payload)}`;
}

/**
 * Descifra el contenido de un bloque cifrado. Lanza error si la clave es incorrecta (tag auth AES-GCM inválido)
 */
export async function decryptBlockContent(encString: string, passphrase: string): Promise<string> {
  if (!isEncryptedContent(encString)) return encString;
  try {
    const rawJson = encString.slice(VAULT_ENC_PREFIX.length);
    const payload = JSON.parse(rawJson) as EncryptedPayload;
    return await decryptData(payload, passphrase);
  } catch {
    throw new Error("Contraseña de bóveda incorrecta o datos cifrados corruptos");
  }
}

/**
 * Genera un testigo criptográfico (canary) para validar contraseñas de bóvedas
 */
export async function createVaultCanary(passphrase: string): Promise<string> {
  return await encryptBlockContent(VAULT_CANARY_MAGIC, passphrase);
}

/**
 * Valida criptográficamente una contraseña contra un canary o bloque cifrado existente
 */
export async function verifyVaultPassphrase(passphrase: string, canaryOrEncBlock: string): Promise<boolean> {
  try {
    const decrypted = await decryptBlockContent(canaryOrEncBlock, passphrase);
    if (canaryOrEncBlock.includes(VAULT_CANARY_MAGIC)) {
      return decrypted === VAULT_CANARY_MAGIC;
    }
    return typeof decrypted === "string";
  } catch {
    return false;
  }
}
