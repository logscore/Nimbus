import type { CreateFolderParams, DeleteFileParams, UpdateFileParams, UploadFileParams } from "@nimbus/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import env from "@nimbus/env/client";
import { toast } from "sonner";

const BASE_FILE_URL = `${env.NEXT_PUBLIC_BACKEND_URL}/api/files`;
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
			const response = await axios.get(BASE_FILE_URL, {
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
			const response = await axios.get(`${BASE_FILE_URL}/${fileId}`, {
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
			const response = await axios.delete(BASE_FILE_URL, {
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
			const response = await axios.put(`${BASE_FILE_URL}`, dataToUpdate, {
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
			const response = await axios.post(BASE_FILE_URL, null, {
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

			const response = await axios.post(`${BASE_FILE_URL}/upload`, formData, {
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

export function useDownloadFile() {
	return useMutation({
		mutationFn: async ({
			fileId,
			exportMimeType,
			fileName,
			onProgress,
		}: {
			fileId: string;
			exportMimeType?: string;
			fileName?: string;
			onProgress?: (progress: number) => void;
		}) => {
			const params = new URLSearchParams();
			if (exportMimeType) {
				params.append("exportMimeType", exportMimeType);
			}

			const response = await fetch(`${BASE_FILE_URL}/download/${fileId}?${params.toString()}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (!response.ok) {
				const errorData = (await response.json().catch(() => ({}))) as { message?: string };
				const errorMessage = errorData?.message || "Failed to download file";
				throw new Error(errorMessage);
			}

			// Get the filename from the Content-Disposition header
			const contentDisposition = response.headers.get("Content-Disposition");
			let filename = fileName || "download";
			if (contentDisposition) {
				const filenameMatch = contentDisposition.match(/filename="(.+)"/);
				if (filenameMatch && filenameMatch[1]) {
					filename = filenameMatch[1];
				}
			}

			// Track download progress if the response supports it
			const contentLength = response.headers.get("Content-Length");
			const total = contentLength ? Number.parseInt(contentLength, 10) : 0;
			let loaded = 0;

			if (response.body && total > 0) {
				const reader = response.body.getReader();
				const chunks: Uint8Array[] = [];

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					chunks.push(value);
					loaded += value.length;

					// Update progress
					if (onProgress && total > 0) {
						const progress = Math.round((loaded / total) * 100);
						onProgress(progress);
					}
				}

				// Combine chunks into blob
				const blob = new Blob(chunks);
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
			} else {
				// Fallback for responses without progress tracking
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
			}

			return { success: true, filename };
		},
		onSuccess: data => {
			toast.success(`${data.filename} downloaded successfully`);
		},
		onError: error => {
			console.error("Download error:", error);
			toast.error(error instanceof Error ? error.message : "Failed to download file");
		},
	});
}
