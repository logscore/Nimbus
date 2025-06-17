import type { CreateRequestOptions } from "@/lib/types";
import { clientEnv } from "@/lib/env/client-env";

/**
 * Creates a request function that can be used to fetch data from an API.
 * @param options - The options for the request.
 * @param options.path - The URL to fetch data from (without the base URL).
 * @param options.pathParams - The path parameters to replace in the URL.
 * @param options.queryParams - The query parameters to append to the URL.
 * @returns A function that can be used to fetch data from an API.
 */
export function createRequest({ path, pathParams = {}, queryParams = {} }: CreateRequestOptions) {
	return (signal: AbortSignal) => {
		// Replace path params in the URL
		let currentPath = path;
		for (const [key, value] of Object.entries(pathParams)) {
			currentPath = currentPath.replace(`:${key}`, encodeURIComponent(String(value)));
		}

		// Append query string
		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(queryParams)) {
			if (value !== null && value !== undefined && value !== "") {
				searchParams.append(key, String(value));
			}
		}
		const queryString = searchParams.toString();
		const query = queryString ? `?${queryString}` : "";

		// Construct the full URL
		const fullUrl = `${clientEnv.NEXT_PUBLIC_BACKEND_URL}/api${currentPath}${query}`;

		return fetch(fullUrl, { signal, credentials: "include" });
	};
}
