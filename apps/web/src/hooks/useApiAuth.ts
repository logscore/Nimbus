"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseApiAuthOptions {
	onUnauthorized?: () => void;
	redirectTo?: string;
}

export function useApiAuth(options: UseApiAuthOptions = {}) {
	const router = useRouter();
	const [isUnauthorized, setIsUnauthorized] = useState(false);

	const { onUnauthorized, redirectTo = "/signin" } = options;

	const handleUnauthorized = useCallback(() => {
		setIsUnauthorized(true);

		if (onUnauthorized) {
			onUnauthorized();
		} else {
			toast.error("Session expired. Please sign in again.");
			const currentPath = window.location.pathname;
			const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
			router.push(redirectUrl);
		}
	}, [onUnauthorized, redirectTo, router]);

	const checkAuthStatus = useCallback(
		async (response: Response) => {
			if (response.status === 401) {
				handleUnauthorized();
				return false;
			}
			return true;
		},
		[handleUnauthorized]
	);

	const fetchWithAuth = useCallback(
		async (url: string, options?: RequestInit) => {
			try {
				const response = await fetch(url, {
					...options,
					credentials: "include",
				});

				await checkAuthStatus(response);
				return response;
			} catch (error) {
				console.error("API request failed:", error);
				throw error;
			}
		},
		[checkAuthStatus]
	);

	return {
		isUnauthorized,
		handleUnauthorized,
		checkAuthStatus,
		fetchWithAuth,
	};
}
