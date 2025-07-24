import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreatePinnedFile, DriveInfo, PinnedFile } from "@nimbus/shared";
import { useAccountProvider } from "@/components/providers/account-provider";

export const useDriveInfo = () => {
	const { clientPromise, providerId, accountId } = useAccountProvider();

	return useQuery<DriveInfo>({
		queryKey: ["driveInfo", providerId, accountId],
		queryFn: async () => {
			const client = await clientPromise;
			const response = await client.api.drives.about.$get();

			if (!response.ok) {
				throw new Error("Failed to fetch drive info");
			}

			const data = await response.json();
			return data;
		},
		enabled: !!providerId && !!accountId,
	});
};

const PINNED_FILES_QUERY_KEY = "pinnedFiles";

export const usePinnedFiles = () => {
	const { clientPromise, providerId, accountId } = useAccountProvider();

	return useQuery<PinnedFile[]>({
		queryKey: [PINNED_FILES_QUERY_KEY],
		queryFn: async () => {
			const client = await clientPromise;
			const response = await client.api.drives.pinned.$get();
			if (!response.ok) {
				throw new Error("Failed to fetch pinned files");
			}
			const data = await response.json();
			// Convert the raw data to match the PinnedFile type
			return data.map(file => ({
				...file,
				createdAt: new Date(file.createdAt),
				updatedAt: new Date(file.updatedAt),
			}));
		},
		enabled: !!providerId && !!accountId,
	});
};

export const usePinFile = () => {
	const { clientPromise, accountId } = useAccountProvider();

	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Omit<CreatePinnedFile, "accountId">) => {
			const client = await clientPromise;
			// wait till clientPromise is resolved
			if (!accountId) return false;
			const response = await client.api.drives.pinned.$post({
				query: {
					...data,
					accountId,
				},
			});

			const res = await response.json();
			return res.success;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: [PINNED_FILES_QUERY_KEY] });
		},
	});
};

export const useUnpinFile = () => {
	const { clientPromise } = useAccountProvider();

	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const client = await clientPromise;
			const response = await client.api.drives.pinned[":id"].$delete({
				param: {
					id,
				},
			});

			const res = await response.json();
			return res.success;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: [PINNED_FILES_QUERY_KEY] });
		},
	});
};
