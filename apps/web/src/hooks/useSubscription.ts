"use client";

import { type Subscription } from "@nimbus/shared";
import { useEffect, useState } from "react";
import env from "@nimbus/env/client";

interface SubscriptionStats {
	subscription: Subscription;
	connectionCount: number;
	maxConnections: number | null;
	canAddConnection: boolean;
	isActive: boolean;
}

interface UseSubscriptionReturn {
	subscription: Subscription | null;
	connectionCount: number;
	maxConnections: number | null;
	canAddConnection: boolean;
	isActive: boolean;
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
	const [data, setData] = useState<SubscriptionStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchSubscription = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/subscription`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch subscription");
			}

			const result = await response.json();

			if (result.data) {
				setData(result.data);
			}
		} catch (err) {
			console.error("Error fetching subscription:", err);
			setError(err instanceof Error ? err : new Error("Unknown error"));
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchSubscription();
	}, []);

	return {
		subscription: data?.subscription || null,
		connectionCount: data?.connectionCount || 0,
		maxConnections: data?.maxConnections || null,
		canAddConnection: data?.canAddConnection || false,
		isActive: data?.isActive || false,
		isLoading,
		error,
		refetch: fetchSubscription,
	};
}
