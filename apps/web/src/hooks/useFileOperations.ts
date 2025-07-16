import type {
	CreateFileSchema,
	DeleteFileSchema,
	GetFileByIdSchema,
	GetFilesSchema,
	UpdateFileSchema,
	UploadFileSchema,
} from "@nimbus/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccountProvider } from "@/components/providers/account-provider";
import type { DriveProviderClient } from "@/utils/client";
import { toast } from "sonner";

export function useGetFiles({ parentId, pageSize, pageToken, returnedValues }: GetFilesSchema) {
	const { clientPromise } = useAccountProvider();
	return useQuery({
		queryKey: ["files", parentId, pageSize, pageToken],
		queryFn: async () => {
			const BASE_FILE_CLIENT = await getBaseFileClient(clientPromise);
			const response = await BASE_FILE_CLIENT.$get({
				query: { parentId, pageSize: pageSize.toString(), pageToken, returnedValues },
			});
			return await response.json();
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 2,
	});
}

export function useGetFile({ fileId, returnedValues }: GetFileByIdSchema) {
	const { clientPromise } = useAccountProvider();
	return useQuery({
		queryKey: ["file", fileId, returnedValues],
		queryFn: async () => {
			const BASE_FILE_CLIENT = await getBaseFileClient(clientPromise);
			const response = await BASE_FILE_CLIENT[":id"].$get({
				param: { fileId },
				query: { returnedValues },
			});
			return await response.json();
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 2,
	});
}

export function useDeleteFile() {
	const queryClient = useQueryClient();
	const { clientPromise } = useAccountProvider();
	return useMutation({
		mutationFn: async ({ fileId }: DeleteFileSchema) => {
			const BASE_FILE_CLIENT = await getBaseFileClient(clientPromise);
			const response = await BASE_FILE_CLIENT.$delete({
				query: { fileId },
			});
			return await response.json();
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["files"] });
		},
		onError: error => {
			console.error("Error deleting file:", error);
			const errorMessage = error.message || "Failed to delete file";
			toast.error(errorMessage);
		},
	});
}

export function useUpdateFile() {
	const queryClient = useQueryClient();
	const { clientPromise } = useAccountProvider();
	return useMutation({
		mutationFn: async ({ fileId, name }: UpdateFileSchema) => {
			const BASE_FILE_CLIENT = await getBaseFileClient(clientPromise);
			const response = await BASE_FILE_CLIENT.$put({
				query: { fileId, name },
			});
			return await response.json();
		},
		onSuccess: async () => {
			toast.success("File updated successfully");
			await queryClient.invalidateQueries({ queryKey: ["files"] });
		},
		onError: error => {
			console.error("Error updating file:", error);
			const errorMessage = error.message || "Failed to update file";
			toast.error(errorMessage);
		},
	});
}

export function useCreateFolder() {
	const queryClient = useQueryClient();
	const { clientPromise } = useAccountProvider();
	return useMutation({
		mutationFn: async ({ name, mimeType, parent }: CreateFileSchema) => {
			const BASE_FILE_CLIENT = await getBaseFileClient(clientPromise);
			const response = await BASE_FILE_CLIENT.$post({
				query: {
					name,
					mimeType,
					parent,
				},
			});
			return await response.json();
		},
		onSuccess: async () => {
			toast.success("Folder created successfully");
			await queryClient.invalidateQueries({ queryKey: ["files"] });
		},
		onError: error => {
			console.error("Error creating folder:", error);
			const errorMessage = error.message || "Failed to create folder";
			toast.error(errorMessage);
		},
	});
}

export function useUploadFile() {
	const queryClient = useQueryClient();
	const { clientPromise } = useAccountProvider();
	return useMutation({
		// mutationFn: async ({ file, parentId, onProgress }: UploadFileParams) => {
		mutationFn: async ({ file, parentId }: UploadFileSchema) => {
			const BASE_FILE_CLIENT = await getBaseFileClient(clientPromise);
			const response = await BASE_FILE_CLIENT.upload.$post({
				form: {
					file,
				},
				query: {
					parentId,
				},
				// onUploadProgress: progressEvent => {
				// 	if (onProgress && progressEvent.total) {
				// 		const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
				// 		onProgress(percentCompleted);
				// 	}
				// },
			});

			return await response.json();
		},
		onSuccess: async () => {
			// Invalidate the files query to refetch the updated list
			await queryClient.invalidateQueries({ queryKey: ["files"] });
		},
		onError: error => {
			console.error("Error uploading file:", error);
			const errorMessage = error.message || "Failed to upload file";
			toast.error(errorMessage);
		},
	});
}

export function useUploadFolder() {}

export function useDownloadFile() {
	const { clientPromise } = useAccountProvider();
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
			const BASE_FILE_CLIENT = await getBaseFileClient(clientPromise);
			const response = await BASE_FILE_CLIENT.download.$get({
				query: {
					fileId,
					exportMimeType,
				},
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

async function getBaseFileClient(clientPromise: Promise<DriveProviderClient>) {
	const client = await clientPromise;
	const BASE_FILE_CLIENT = client.api.files;
	return BASE_FILE_CLIENT;
}
