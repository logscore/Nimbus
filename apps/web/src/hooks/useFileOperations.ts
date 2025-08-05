import type {
	CreateFileSchema,
	DeleteFileSchema,
	File,
	GetFileByIdSchema,
	GetFilesSchema,
	MoveFileSchema,
	UpdateFileSchema,
	UploadFileSchema,
} from "@nimbus/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccountProvider } from "@/components/providers/account-provider";
import type { DriveProviderClient } from "@/utils/client";
import { handleUnauthorizedError } from "@/utils/client";
import { toast } from "sonner";

export function useGetFiles({ parentId, pageSize, pageToken, returnedValues }: GetFilesSchema) {
	const { clientPromise, providerId, accountId } = useAccountProvider();
	return useQuery({
		queryKey: ["files", providerId, accountId, parentId],
		queryFn: async () => {
			const BASE_FILE_CLIENT = await getBaseFileClient(clientPromise);
			const response = await handleUnauthorizedError(
				() =>
					BASE_FILE_CLIENT.$get({
						query: { parentId, pageSize: pageSize.toString(), pageToken, returnedValues },
					}),
				"Failed to fetch files"
			);
			return await response.json();
		},
		enabled: !!providerId && !!accountId,
		retry: 2,
	});
}

export function useGetFile({ fileId, returnedValues }: GetFileByIdSchema) {
	const { clientPromise, providerId, accountId } = useAccountProvider();
	return useQuery({
		queryKey: ["file", providerId, accountId, fileId],
		queryFn: async () => {
			const BASE_FILE_CLIENT = await getBaseFileClient(clientPromise);
			const response = await handleUnauthorizedError(
				() =>
					BASE_FILE_CLIENT[":fileId"].$get({
						param: { fileId: fileId },
						query: { returnedValues },
					}),
				"Failed to fetch file"
			);
			return await response.json();
		},
		enabled: !!providerId && !!accountId,
		retry: 2,
	});
}

export function useDeleteFile() {
	const queryClient = useQueryClient();
	const { clientPromise, providerId, accountId } = useAccountProvider();
	return useMutation({
		mutationFn: async ({ fileId }: DeleteFileSchema) => {
			const BASE_FILE_CLIENT = await getBaseFileClient(clientPromise);
			const response = await handleUnauthorizedError(
				() =>
					BASE_FILE_CLIENT.$delete({
						query: { fileId },
					}),
				"Failed to delete file"
			);
			return await response.json();
		},
		// Handles optimistic updates
		onMutate: async deletedFile => {
			await queryClient.cancelQueries({ queryKey: ["files"] });

			const previousFiles = queryClient.getQueryData<File[]>(["files"]);

			queryClient.setQueryData(["files", providerId, accountId], (old: File[] = []) =>
				old.filter(file => file.id !== deletedFile.fileId)
			);

			return { previousFiles };
		},
		// Handles rollback on error
		onError: (_, __, context) => {
			if (context?.previousFiles) {
				queryClient.setQueryData(["files", providerId, accountId], context.previousFiles);
			}
			toast.error("Failed to delete file");
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: ["files"] });
		},
	});
}

export function useUpdateFile() {
	const queryClient = useQueryClient();
	const { clientPromise, providerId, accountId } = useAccountProvider();
	return useMutation({
		mutationFn: async ({ fileId, name }: UpdateFileSchema) => {
			const BASE_FILE_CLIENT = await getBaseFileClient(clientPromise);
			const response = await handleUnauthorizedError(
				() =>
					BASE_FILE_CLIENT.$put({
						query: { fileId, name },
					}),
				"Failed to update file"
			);
			return await response.json();
		},
		// Handles optimistic updates
		onMutate: async ({ fileId, ...dataToUpdate }) => {
			await queryClient.cancelQueries({ queryKey: ["files"] });

			const previousFiles = queryClient.getQueryData<File[]>(["files"]);

			queryClient.setQueryData(["files", providerId, accountId], (old: File[] = []) =>
				old.map(file => (file.id === fileId ? { ...file, ...dataToUpdate } : file))
			);

			return { previousFiles };
		},
		// Handles rollback on error
		onError: (_, __, context) => {
			if (context?.previousFiles) {
				queryClient.setQueryData(["files", providerId, accountId], context.previousFiles);
			}
			toast.error("Failed to update file");
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: ["files"] });
		},
	});
}

export function useCreateFolder() {
	const queryClient = useQueryClient();
	const { clientPromise } = useAccountProvider();
	return useMutation({
		mutationFn: async ({ name, mimeType, parent }: CreateFileSchema) => {
			const BASE_FILE_CLIENT = await getBaseFileClient(clientPromise);
			const response = await handleUnauthorizedError(
				() =>
					BASE_FILE_CLIENT.$post({
						query: {
							name,
							mimeType,
							parent,
						},
					}),
				"Failed to create folder"
			);
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

export const uploadMutationKey = ["uploadFile"];

export function useUploadFile() {
	const queryClient = useQueryClient();
	const { clientPromise } = useAccountProvider();
	return useMutation({
		// mutationFn: async ({ file, parentId, onProgress }: UploadFileParams) => {
		mutationKey: uploadMutationKey,
		mutationFn: async ({ file, parentId }: UploadFileSchema) => {
			const BASE_FILE_CLIENT = await getBaseFileClient(clientPromise);
			const response = await handleUnauthorizedError(
				() =>
					BASE_FILE_CLIENT.upload.$post({
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
					}),
				"Failed to upload file"
			);

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

// TODO(feat): add upload folder

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
			const response = await handleUnauthorizedError(
				() =>
					BASE_FILE_CLIENT.download.$get({
						query: {
							fileId,
							exportMimeType,
						},
					}),
				"Failed to download file"
			);

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
				const chunks: BlobPart[] = [];

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

export function useMoveFile() {
	const queryClient = useQueryClient();
	const { clientPromise, providerId, accountId } = useAccountProvider();
	return useMutation({
		mutationFn: async ({ sourceId, targetParentId, newName }: MoveFileSchema & { parentId: string }) => {
			const BASE_FILE_CLIENT = await getBaseFileClient(clientPromise);
			const response = await handleUnauthorizedError(
				() =>
					BASE_FILE_CLIENT.move.$post({
						json: {
							sourceId,
							targetParentId,
							newName,
						},
					}),
				"Failed to move file"
			);
			return await response.json();
		},
		onMutate: async ({ sourceId, parentId }) => {
			await queryClient.cancelQueries({ queryKey: ["files", providerId, accountId, parentId] });

			const previousFiles = queryClient.getQueryData<File[]>(["files", providerId, accountId, parentId]);

			queryClient.setQueryData(["files", providerId, accountId, parentId], (old: File[] = []) =>
				old.filter(file => file.id !== sourceId)
			);

			return { previousFiles };
		},
		onSuccess: async () => {
			toast.success("File moved successfully");
		},
		onError: async (error, { parentId }, context) => {
			queryClient.setQueryData(["files", providerId, accountId, parentId], context?.previousFiles);
			console.error("Error moving file:", error);
			toast.error(error.message ?? "Failed to move file");
		},
	});
}

async function getBaseFileClient(clientPromise: Promise<DriveProviderClient>) {
	const client = await clientPromise;
	const BASE_FILE_CLIENT = client.api.files;
	return BASE_FILE_CLIENT;
}
