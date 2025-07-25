/**
 * Format file size to human-readable string
 * @param bytes File size in bytes
 * @returns Formatted size string (e.g., "1.5 MB")
 */
// export function formatFileSize(bytes: number): string {
// 	if (bytes === 0) return "—";

// 	const k = 1024;
// 	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
// 	const i = Math.floor(Math.log(bytes) / Math.log(k));

// 	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
// }

/**
 * Format file size in bytes to a human-readable string (alternative implementation)
 * @param size File size in bytes or string representation of bytes
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export function formatFileSize(size: unknown): string {
	let num = typeof size === "number" ? size : Number(size);
	if (typeof num !== "number" || isNaN(num) || num < 0) {
		return "Invalid size";
	}

	const units = ["B", "KB", "MB", "GB", "TB"];
	let idx = 0;

	while (num >= 1024 && idx < units.length - 1) {
		num /= 1024;
		idx++;
	}

	return `${num.toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
}

/**
 * Extract file extension from filename
 * @param filename Name of the file
 * @returns File extension without the dot (e.g., "pdf")
 */
export function getFileExtension(filename: string): string {
	const lastDotIndex = filename.lastIndexOf(".");
	if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
		return "";
	}
	return filename.slice(lastDotIndex + 1).toLowerCase();
}

// Convert MIME type to internal file type
export function mimeTypeToFileType(mimeType: string): string {
	if (mimeType === "application/vnd.google-apps.folder") {
		return "folder";
	}

	if (mimeType.startsWith("image/")) {
		return "image";
	}

	if (mimeType.startsWith("video/")) {
		return "video";
	}

	if (mimeType.startsWith("audio/")) {
		return "music";
	}

	if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar") || mimeType.includes("7z")) {
		return "archive";
	}

	if (
		mimeType.includes("document") ||
		mimeType.includes("pdf") ||
		mimeType.includes("text") ||
		mimeType.includes("spreadsheet") ||
		mimeType.includes("presentation")
	) {
		return "document";
	}

	return "document";
}
