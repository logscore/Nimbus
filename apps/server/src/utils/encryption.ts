import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

const ENCRYPTION_ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

function deriveKey(): Buffer {
	if (!ENCRYPTION_KEY) {
		throw new Error("ENCRYPTION_KEY environment variable is required");
	}
	if (ENCRYPTION_KEY.length < 32) {
		throw new Error("ENCRYPTION_KEY must be at least 32 characters");
	}
	return createHash("sha256").update(ENCRYPTION_KEY).digest();
}

/**
 * Encrypts sensitive data using AES-256-CBC
 */
export function encrypt(text: string): string {
	if (!text) return text;

	try {
		const key = deriveKey();
		const iv = randomBytes(16);
		const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
		let encrypted = cipher.update(text, "utf8", "hex");
		encrypted += cipher.final("hex");
		return iv.toString("hex") + ":" + encrypted;
	} catch (error) {
		console.error("Encryption error:", error);
		throw new Error("Encryption failed - cannot store sensitive data as plaintext");
	}
}

/**
 * Decrypts data encrypted with AES-256-CBC
 */
export function decrypt(encryptedText: string): string {
	if (!encryptedText) return encryptedText;

	if (encryptedText.includes(":")) {
		try {
			const [ivHex, encrypted] = encryptedText.split(":");
			if (!ivHex || !encrypted) {
				throw new Error("Invalid encrypted format");
			}
			const key = deriveKey();
			const iv = Buffer.from(ivHex, "hex");
			const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
			let decrypted = decipher.update(encrypted, "hex", "utf8");
			decrypted += decipher.final("utf8");
			return decrypted;
		} catch (error) {
			console.error("Decryption error:", error);
			throw new Error("Failed to decrypt data - invalid format or corrupted data");
		}
	}

	return encryptedText;
}

// ! THIS IS NEVER USED, FIGURE OUT WHAT TO DO WITH IT OR REMOVE IT
/**
 * Determines if text is in encrypted format
 */
export function isEncrypted(text: string): boolean {
	if (!text) return false;
	const parts = text.split(":");
	return parts.length === 2 && parts[0]?.length === 32 && /^[0-9a-f]+$/i.test(parts[0] || "");
}
