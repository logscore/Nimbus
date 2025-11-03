// TODO: this should be more provider agnostic, especially around the folder logic

"use-client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Download, ExternalLink, FileIcon, FileText, MoreVertical, Pin } from "lucide-react";
import { useDeleteFile, useDownloadFile, useUpdateFile } from "@/hooks/useFileOperations";
import { useDownloadContext } from "@/components/providers/download-provider";
import { useAccountProvider } from "@/components/providers/account-provider";
import { RenameFileDialog } from "@/components/dialogs/rename-file-dialog";
import { DeleteFileDialog } from "@/components/dialogs/delete-file-dialog";
import { usePinFile } from "@/hooks/useDriveOps";
import { Button } from "@/components/ui/button";
import type { File } from "@nimbus/shared";
import { useState } from "react";
import { toast } from "sonner";

export function FileActions({ file, fileType }: { file: File; fileType: "file" | "folder" }) {
	const { mutate: deleteFile } = useDeleteFile();
	const { mutate: renameFile } = useUpdateFile();
	const { mutate: downloadFile } = useDownloadFile();
	const { mutate: pinFile } = usePinFile();
	const { startDownload, updateProgress, completeDownload, errorDownload } = useDownloadContext();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
	const [mimeDownloadType, setMimeDownloadType] = useState<string | null>(null);
	const { providerId } = useAccountProvider();

	const handleDelete = async () => {
		deleteFile({ fileId: file.id });
	};

	const handleRename = async (newName: string) => {
		renameFile({ fileId: file.id, name: newName });
	};

	const handleCopyLink = async () => {
		if (file.webViewLink) {
			await navigator.clipboard.writeText(file.webViewLink);
			toast.success("Link copied to clipboard");
		} else {
			toast.error("No shareable link available");
		}
	};

	const handleOpenInDrive = () => {
		if (file.webViewLink) {
			window.open(file.webViewLink, "_blank");
		} else {
			toast.error("Cannot open file or folder");
		}
	};

	const handlePinFile = async () => {
		if (!providerId) return;
		pinFile({
			fileId: file.id,
			name: file.name,
			type: fileType,
			mimeType: file.mimeType,
			provider: providerId,
		});
	};

	const getGoogleWorkspaceExportMimeType = (mimeType: string): string | undefined => {
		const exportMimeTypes: Record<string, string> = {
			"application/vnd.google-apps.document": "application/pdf",
			"application/vnd.google-apps.spreadsheet": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"application/vnd.google-apps.presentation":
				"application/vnd.openxmlformats-officedocument.presentationml.presentation",
		};

		return exportMimeTypes[mimeType];
	};

	const handleDownloadError = (error: unknown, fileId: string) => {
		const errorMessage = error instanceof Error ? error.message : "Download failed";
		if (errorDownload) {
			errorDownload(fileId, errorMessage);
		} else {
			toast.error(errorMessage);
		}
	};

	const handleDownloadSuccess = (fileId: string) => {
		if (completeDownload) completeDownload(fileId);
	};

	// TODO:(fix): this is just binary data. also downloaded as .txt
	const handleGoogleWorkspaceDownload = async () => {
		if (!file.mimeType?.startsWith("application/vnd.google-apps.") || !downloadFile) {
			return false;
		}

		const exportMimeType = mimeDownloadType || getGoogleWorkspaceExportMimeType(file.mimeType);
		if (!exportMimeType) return false;

		try {
			downloadFile(
				{
					fileId: file.id,
					exportMimeType,
					fileName: file.name,
					onProgress: progress => updateProgress?.(file.id, progress),
				},
				{
					onSuccess: () => handleDownloadSuccess(file.id),
					onError: error => handleDownloadError(error, file.id),
				}
			);
			return true;
		} catch (error) {
			handleDownloadError(error, file.id);
			return false;
		}
	};

	// TODO:(fix): this is just binary data same as the normal download. also downloaded as .txt
	const handleDownloadAsPDF = async () => {
		setMimeDownloadType("application/pdf");
		await handleGoogleWorkspaceDownload();
	};

	// TODO:(fix): this is somehow a PDF??? also downloaded as .txt
	const handleDownloadAsDocx = async () => {
		setMimeDownloadType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
		await handleGoogleWorkspaceDownload();
	};

	const handleDirectDownload = async () => {
		// TODO:(session): get provider from session
		// const isGoogleProvider = provider === "google";

		// TODO:(provider context): figure this out when we implement multiSession / multiProvider support
		// console.log({ isGoogleProvider, provider });

		// if (isGoogleProvider) {
		// 	const success = await handleGoogleWorkspaceDownload();
		// 	if (success) return true;
		// }

		if (!file.webContentLink) return false;

		window.open(file.webContentLink, "_blank");
		handleDownloadSuccess(file.id);
		return true;
	};

	const handleDownload = async () => {
		if (fileType === "folder") {
			return toast.error("Cannot download folders");
		}

		// Start download progress tracking if available
		startDownload?.(file.id, file.name);

		try {
			const isGoogleWorkspaceFile = file.mimeType?.startsWith("application/vnd.google-apps.");

			// Try Google Workspace export first if applicable
			if (isGoogleWorkspaceFile) {
				const success = await handleGoogleWorkspaceDownload();
				if (success) return true;
			}

			// Fallback to direct download
			if (await handleDirectDownload()) return true;

			// If we get here, no download method was successful
			const errorMsg = "Download not available for this file";
			if (errorDownload) {
				errorDownload(file.id, errorMsg);
			} else {
				toast.error(errorMsg);
			}
		} catch (error) {
			handleDownloadError(error, file.id);
		}
	};

	return (
		<>
			<div className="flex w-fit items-center justify-start" onClick={e => e.stopPropagation()}>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="relative h-8 w-8">
							<MoreVertical className="h-4 w-4" />
							<span className="sr-only">Open menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={handlePinFile} className="cursor-pointer">
							<Pin className="mr-2 h-4 w-4" />
							Pin
						</DropdownMenuItem>
						{file.webViewLink && (
							<DropdownMenuItem onClick={handleOpenInDrive} className="cursor-pointer">
								<ExternalLink className="mr-2 h-4 w-4" />
								Open
							</DropdownMenuItem>
						)}
						{file.webViewLink && (
							<DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
								<Copy className="mr-2 h-4 w-4" />
								Copy link
							</DropdownMenuItem>
						)}
						{fileType === "file" && (
							<>
								{file.mimeType?.startsWith("application/vnd.google-apps.") ? (
									<DropdownMenuSub>
										<DropdownMenuSubTrigger className="cursor-pointer">
											<Download className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
											Download As...
										</DropdownMenuSubTrigger>
										<DropdownMenuPortal>
											<DropdownMenuSubContent>
												<DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
													<FileIcon className="mr-2 h-4 w-4" />
													Original Format
												</DropdownMenuItem>
												<DropdownMenuItem onClick={handleDownloadAsPDF} className="cursor-pointer">
													<FileText className="mr-2 h-4 w-4" />
													PDF Document
												</DropdownMenuItem>
												<DropdownMenuItem onClick={handleDownloadAsDocx} className="cursor-pointer">
													<FileText className="mr-2 h-4 w-4" />
													Microsoft Word
												</DropdownMenuItem>
											</DropdownMenuSubContent>
										</DropdownMenuPortal>
									</DropdownMenuSub>
								) : file.webContentLink ? (
									<DropdownMenuItem onClick={handleDirectDownload} className="cursor-pointer">
										<Download className="mr-2 h-4 w-4" />
										Direct Download
									</DropdownMenuItem>
								) : (
									<DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
										<Download className="mr-4 w-4" />
										Download
									</DropdownMenuItem>
								)}
							</>
						)}
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => setIsRenameDialogOpen(true)} className="cursor-pointer">
							Rename
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => setIsDeleteDialogOpen(true)}>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<DeleteFileDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onDelete={handleDelete}
				fileName={file.name}
				fileType={fileType}
			/>

			<RenameFileDialog
				isOpen={isRenameDialogOpen}
				onClose={() => setIsRenameDialogOpen(false)}
				onRename={handleRename}
				currentName={file.name}
				fileType={fileType}
			/>
		</>
	);
}
