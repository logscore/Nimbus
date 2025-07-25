/**
 * Format file size to human-readable string
 * @param bytes File size in bytes
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "—";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
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
