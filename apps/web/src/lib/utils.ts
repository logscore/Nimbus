import { clientEnv } from "@/lib/env/client-env";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
	return clientEnv.NEXT_PUBLIC_FRONTEND_URL;
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
