import type { ApiResponse, UserSchema } from "@nimbus/shared";
import { useQuery } from "@tanstack/react-query";
import { protectedClient } from "@/utils/client";

const fetchUser = async (): Promise<UserSchema> => {
	const response = await protectedClient.api.user.$get();

	if (!response.ok) {
		const data = (await response.json()) as unknown as ApiResponse;
		throw new Error(data.message || "Failed to fetch user");
	}

	const userData = await response.json();
	return {
		...userData,
		createdAt: new Date(userData.createdAt),
		updatedAt: new Date(userData.updatedAt),
	};
};

export function useGetUser() {
	return useQuery({
		queryKey: ["user"],
		queryFn: fetchUser,
		retry: (failureCount, error) => {
			// Don't retry on 401 (unauthorized) errors
			if (error.message.includes("401")) return false;
			return failureCount < 3; // Retry up to 3 times for other errors
		},
	});
}
