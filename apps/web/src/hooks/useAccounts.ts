import { authClient } from "@nimbus/auth/auth-client";
import type { DriveProvider } from "@nimbus/shared";
import { useEffect, useState } from "react";

export interface Account {
	id: string;
	provider: DriveProvider;
	createdAt: Date;
	updatedAt: Date;
	accountId: string;
	scopes: string[];
}

export function useAccounts() {
	const [data, setData] = useState<Account[]>([]);
	const [isPending, setIsPending] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchAccounts = async () => {
		try {
			setIsPending(true);
			setError(null);
			const response = await authClient.listAccounts();
			if (response.error) {
				throw new Error(response.error.statusText || "Failed to fetch accounts");
			}
			const accountsData = response.data as Account[];
			setData(accountsData);
		} catch (err) {
			if (!error) {
				const defaultError = new Error("Failed to fetch accounts");
				let error = err instanceof Error ? err : defaultError;
				error = error.message.includes("Failed to fetch") ? defaultError : error;
				setError(error);
			}
		} finally {
			setIsPending(false);
		}
	};

	useEffect(() => {
		void fetchAccounts();
		// Only run the first time
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		data,
		isPending,
		error,
		refetch: fetchAccounts,
	};
}
