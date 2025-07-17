"use-client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RenameFileDialog } from "@/components/dialogs/rename-file-dialog";
import { DeleteFileDialog } from "@/components/dialogs/delete-file-dialog";
import { useDeleteFile, useUpdateFile } from "@/hooks/useFileOperations";
import { Copy, ExternalLink, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { _File } from "@/lib/types";
import { useState } from "react";
import { toast } from "sonner";

export function FileActions({ file }: { file: _File }) {
	const { mutate: deleteFile } = useDeleteFile();
	const { mutate: renameFile } = useUpdateFile();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

	//TODO: Build a utility class or function in the providers to standardize folder types from "application/vnd.google-apps.folder" to "folder"
	const fileType =
		file.mimeType === "application/vnd.google-apps.folder" || file.mimeType === "folder" ? "folder" : "file";

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

	// const handleDownload = () => {
	// 	if (file.webContentLink) {
	// 		window.open(file.webContentLink, "_blank");
	// 	} else {
	// 		toast.error("Download not available");
	// 	}
	// };

	return (
		<>
			<div className="flex items-center justify-start" onClick={e => e.stopPropagation()}>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="relative h-8 w-8">
							<MoreHorizontal className="h-4 w-4" />
							<span className="sr-only">Open menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{file.webViewLink && (
							<DropdownMenuItem onClick={handleOpenInDrive} className="cursor-pointer">
								<ExternalLink className="mr-2 h-4 w-4" />
								Open
							</DropdownMenuItem>
						)}
						{/* {file.webContentLink && fileType === "file" && (
							<DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
								<Download className="mr-2 h-4 w-4" />
								Download
							</DropdownMenuItem>
						)} */}
						{file.webViewLink && (
							<DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
								<Copy className="mr-2 h-4 w-4" />
								Copy link
							</DropdownMenuItem>
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
