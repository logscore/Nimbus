import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ENCRYPTION_ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.BETTER_AUTH_SECRET || "fallback-key-for-development";

/**
 * Encrypts sensitive data using AES-256-CBC
 */
export function encrypt(text: string): string {
	if (!text) return text;

	try {
		const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32).padEnd(32, "0"), "utf8");
		const iv = randomBytes(16);
		const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
		let encrypted = cipher.update(text, "utf8", "hex");
		encrypted += cipher.final("hex");
		return iv.toString("hex") + ":" + encrypted;
	} catch (error) {
		console.error("Encryption error:", error);
		// Fallback for development; production should throw
		return text;
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
			const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32).padEnd(32, "0"), "utf8");
			const iv = Buffer.from(ivHex, "hex");
			const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
			let decrypted = decipher.update(encrypted, "hex", "utf8");
			decrypted += decipher.final("utf8");
			return decrypted;
		} catch (error) {
			console.error("Decryption error:", error);
			// Migration compatibility: treat as plaintext if decryption fails
			return encryptedText;
		}
	}

	return encryptedText;
}

/**
 * Determines if text is in encrypted format
 */
export function isEncrypted(text: string): boolean {
	if (!text) return false;
	return text.includes(":") && text.split(":").length === 2;
}
