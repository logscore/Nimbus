import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import env from "@nimbus/env/client";

/**
 * Merges class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
