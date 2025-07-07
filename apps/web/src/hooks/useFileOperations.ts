import type { CreateFolderParams, DeleteFileParams, UpdateFileParams, UploadFileParams } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientEnv } from "@/lib/env/client-env";
import axios, { type AxiosError } from "axios";
import { toast } from "sonner";

const API_BASE = `${clientEnv.NEXT_PUBLIC_BACKEND_URL}/api/files`;
const defaultAxiosConfig = {
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
	signal: new AbortController().signal,
};

export function useGetFiles(parentId: string, pageSize: number, returnedValues: string[], nextPageToken?: string) {
	return useQuery({
		queryKey: ["files", parentId, nextPageToken, pageSize],
		queryFn: async () => {
			const response = await axios.get(API_BASE, {
				params: { parentId, pageSize, returnedValues, pageToken: nextPageToken },
				...defaultAxiosConfig,
			});
			return response.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 2,
	});
}

export function useGetFile(fileId: string, returnedValues: string[]) {
	return useQuery({
		queryKey: ["file", fileId, returnedValues],
		queryFn: async () => {
			const response = await axios.get(`${API_BASE}/${fileId}`, {
				params: { returnedValues },
				...defaultAxiosConfig,
			});
			return response.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 2,
	});
}

export function useDeleteFile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ fileId }: DeleteFileParams) => {
			const response = await axios.delete(API_BASE, {
				params: { fileId },
				...defaultAxiosConfig,
			});
			return response.data;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["files"] });
		},
		onError: (error: AxiosError) => {
			console.error("Error deleting file:", error);
			const errorMessage = error.message || "Failed to delete file";
			toast.error(errorMessage);
		},
	});
}

export function useUpdateFile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ fileId, ...dataToUpdate }: UpdateFileParams) => {
			const response = await axios.put(`${API_BASE}`, dataToUpdate, {
				params: { fileId },
				...defaultAxiosConfig,
			});
			return response.data;
		},
		onSuccess: async () => {
			toast.success("File updated successfully");
			await queryClient.invalidateQueries({ queryKey: ["files"] });
		},
		onError: (error: AxiosError) => {
			console.error("Error updating file:", error);
			const errorMessage = error.message || "Failed to update file";
			toast.error(errorMessage);
		},
	});
}

export function useCreateFolder() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ name, parentId }: CreateFolderParams) => {
			const response = await axios.post(API_BASE, null, {
				...defaultAxiosConfig,
				params: {
					name,
					mimeType: "folder",
					parent: parentId,
				},
			});
			return response.data;
		},
		onSuccess: async () => {
			toast.success("Folder created successfully");
			await queryClient.invalidateQueries({ queryKey: ["files"] });
		},
		onError: (error: AxiosError) => {
			console.error("Error creating folder:", error);
			const errorMessage = error.message || "Failed to create folder";
			toast.error(errorMessage);
		},
	});
}

export function useUploadFile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ file, parentId, onProgress }: UploadFileParams) => {
			// ? Maybe look into Tanstack Form for this implementation
			const formData = new FormData();
			formData.append("file", file);

			const response = await axios.post(`${API_BASE}/upload`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				withCredentials: true,
				params: {
					parentId,
				},
				onUploadProgress: progressEvent => {
					if (onProgress && progressEvent.total) {
						const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
						onProgress(percentCompleted);
					}
				},
			});

			return response.data;
		},
		onSuccess: async () => {
			// Invalidate the files query to refetch the updated list
			await queryClient.invalidateQueries({ queryKey: ["files"] });
		},
		onError: (error: AxiosError<{ message?: string }>) => {
			console.error("Error uploading file:", error);
		},
	});
}

export function useUploadFolder() {}
