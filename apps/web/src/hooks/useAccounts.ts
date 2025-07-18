import type { ApiResponse, LimitedAccessAccount } from "@nimbus/shared";
import { protectedClient } from "@/utils/client";
import { useEffect, useState } from "react";

export function useAccounts() {
	const [data, setData] = useState<LimitedAccessAccount[]>([]);
	const [isPending, setIsPending] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchAccounts = async () => {
		try {
			setIsPending(true);
			setError(null);
			const response = await protectedClient.api.account.$get();

			if (!response.ok) {
				const data = (await response.json()) as unknown as ApiResponse;
				throw new Error(data.message || "Failed to fetch accounts");
			}

			const accountsData = await response.json();
			const accountsDataParsed: LimitedAccessAccount[] = accountsData.map(account => ({
				...account,
				createdAt: new Date(account.createdAt),
				updatedAt: new Date(account.updatedAt),
			}));
			setData(accountsDataParsed);
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
