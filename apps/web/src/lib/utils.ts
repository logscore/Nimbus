import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import env from "@nimbus/env/client";

/**
 * Merges class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Gets the base URL for the frontend
 */
export const getBaseUrl = () => {
	return env.NEXT_PUBLIC_FRONTEND_URL;
};

/**
 * Builds a full URL from a path
 * @param path The path to append to the base URL
 * @returns The full URL
 */
export const buildUrl = (path: string) => {
	const baseUrl = getBaseUrl();
	return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

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
