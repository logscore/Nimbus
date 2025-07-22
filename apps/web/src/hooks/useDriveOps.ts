import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccountProvider } from "@/components/providers/account-provider";
import type { DriveInfo } from "@nimbus/shared";
import type { PinnedFile } from "@/lib/types";

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
			return data as DriveInfo; // Assuming the response has a data property
		},
		enabled: !!providerId && !!accountId,
	});
};

const PINNED_FILES_QUERY_KEY = "pinnedFiles";

interface PinnedFileInterface {
	id: string;
	userId: string;
	fileId: string;
	name: string;
	type: string;
	mimeType: string | null;
	provider: string;
	accountId: string;
	createdAt: string;
	updatedAt: string;
}

export const usePinnedFiles = () => {
	const { clientPromise } = useAccountProvider();

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
			const pinnedFiles: PinnedFile[] = Array.isArray(data)
				? data.map((file: PinnedFileInterface) => ({
						...file,
						mimeType: file.mimeType || undefined,
					}))
				: [];

			return pinnedFiles;
		},
	});
};

export const usePinFile = () => {
	const { clientPromise } = useAccountProvider();

	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: { fileId: string; name: string; type: string; mimeType?: string; provider: string }) => {
			const client = await clientPromise;
			const response = await client.api.drives.pinned.$post({
				query: data,
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
