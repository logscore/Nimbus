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
