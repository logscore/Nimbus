import type { ApiResponse, UserSchema } from "@nimbus/shared";
import { protectedClient } from "@/utils/client";
import { useEffect, useState } from "react";

export function useGetUser() {
	const [data, setData] = useState<UserSchema | null>(null);
	const [isPending, setIsPending] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchUser = async () => {
		try {
			setIsPending(true);
			setError(null);
			const response = await protectedClient.api.user.$get();

			if (!response.ok) {
				const data = (await response.json()) as unknown as ApiResponse;
				throw new Error(data.message || "Failed to fetch user");
			}

			const userData = await response.json();
			const user = {
				...userData,
				createdAt: new Date(userData.createdAt),
				updatedAt: new Date(userData.updatedAt),
			};
			setData(user);
		} catch (err) {
			if (!error) {
				const defaultError = new Error("Failed to fetch user");
				let error = err instanceof Error ? err : defaultError;
				error = error.message.includes("Failed to fetch") ? defaultError : error;
				setError(error);
			}
		} finally {
			setIsPending(false);
		}
	};

	useEffect(() => {
		void fetchUser();
		// Only run the first time
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		data,
		isPending,
		error,
		refetch: fetchUser,
	};
}
