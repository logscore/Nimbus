import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientEnv } from "@/lib/env/client-env";
import type { PinnedFile } from "@/lib/types";
import type { DriveInfo } from "@/lib/types";
import axios from "axios";

export const useDriveInfo = () => {
	return useQuery<DriveInfo>({
		queryKey: ["driveInfo"],
		queryFn: async () => {
			const response = await axios.get(`${clientEnv.NEXT_PUBLIC_BACKEND_URL}/api/drives/about`, {
				withCredentials: true,
				signal: new AbortController().signal,
			});
			return response.data;
		},
	});
};

const PINNED_FILES_QUERY_KEY = "pinnedFiles";

export const usePinnedFiles = () => {
	return useQuery<PinnedFile[]>({
		queryKey: [PINNED_FILES_QUERY_KEY],
		queryFn: async () => {
			const response = await axios.get(`${clientEnv.NEXT_PUBLIC_BACKEND_URL}/api/drives/pinned`, {
				withCredentials: true,
			});
			// The backend returns files as a JSON string in the message field
			const files = JSON.parse(response.data.message) as PinnedFile[];
			return files;
		},
	});
};

export const usePinFile = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: { fileId: string; name: string; type: string; mimeType?: string; provider: string }) => {
			const response = await axios.post(`${clientEnv.NEXT_PUBLIC_BACKEND_URL}/api/drives/pinned`, data, {
				withCredentials: true,
			});
			return response.data.message as string;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: [PINNED_FILES_QUERY_KEY] });
		},
	});
};

export const useUnpinFile = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const response = await axios.delete(`${clientEnv.NEXT_PUBLIC_BACKEND_URL}/api/drives/pinned/${id}`, {
				withCredentials: true,
			});
			return response.data.message as string;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: [PINNED_FILES_QUERY_KEY] });
		},
	});
};
