import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function fileSize(size: unknown) {
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

export const getBaseUrl = () => {
	return process.env.NEXT_PUBLIC_FRONTEND_URL;
};

export const buildUrl = (path: string) => {
	const baseUrl = getBaseUrl();
	return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};
