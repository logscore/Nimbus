import type { ClientRequestOptions } from "hono/client";
import type { AppType } from "@nimbus/server";
import env from "@nimbus/env/client";
import { hc } from "hono/client";

const createClient = (options?: ClientRequestOptions) => {
	if (!env.NEXT_PUBLIC_BACKEND_URL) {
		throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
	}
	return hc<AppType>(env.NEXT_PUBLIC_BACKEND_URL, options);
};
export const publicClient = createClient();

export const createProtectedClient = (options?: ClientRequestOptions) =>
	createClient({
		...options,
		init: {
			...options?.init,
			credentials: "include",
		},
	});

export const protectedClient = createProtectedClient();

export type DriveProviderClient = ReturnType<typeof hc<AppType>>;

let authContext: { openSignIn: () => void } | null = null;

// This function allows us to access the auth context outside of React components
export const setAuthContext = (context: { openSignIn: () => void }) => {
	authContext = context;
};

export async function handleUnauthorizedError<T extends () => Promise<Response>>(
	requestFn: T,
	errorMessage: string
): Promise<Awaited<ReturnType<T>>> {
	const response = await requestFn();

	if (!response.ok) {
		const errorDetails = await response.text().catch(() => response.statusText);
		if (response.status === 401) {
			// Check if this is a provider switching related error
			if (errorDetails.includes("re-authenticate") || errorDetails.includes("Authentication expired")) {
				authContext?.openSignIn();
			}
		}
		throw new Error(`${errorMessage}. Status: ${response.status}. ${errorDetails}`);
	}

	return response as Awaited<ReturnType<T>>;
}
