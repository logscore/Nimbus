"use client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UploadFolderDialog } from "@/components/dialogs/upload-folder-dialog";
import { CreateFolderDialog } from "@/components/dialogs/create-folder-dialog";
import { UploadFileDialog } from "@/components/dialogs/upload-files-dialog";
import { FolderPlus, Plus, Upload } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function UploadButton() {
	const [uploadFileOpen, setUploadFileOpen] = useState(false);
	const [uploadFolderOpen, setUploadFolderOpen] = useState(false);
	const [createFolderOpen, setCreateFolderOpen] = useState(false);
	const searchParams = useSearchParams();
	const folderId = searchParams.get("folderId") ?? "root";

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="default"
						size="lg"
						className="flex h-8 w-20 cursor-pointer items-center gap-2 rounded-lg bg-neutral-100 font-medium"
					>
						<Plus className="h-4 w-4" />
						New
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setUploadFileOpen(true)} className="cursor-pointer">
						<Upload className="mr-2 h-4 w-4" />
						Upload files
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setUploadFolderOpen(true)} className="cursor-pointer">
						<Upload className="mr-2 h-4 w-4" />
						Upload folder
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setCreateFolderOpen(true)} className="cursor-pointer">
						<FolderPlus className="mr-2 h-4 w-4" />
						Create folder
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<UploadFileDialog open={uploadFileOpen} onOpenChange={setUploadFileOpen} parentId={folderId} />

			<UploadFolderDialog open={uploadFolderOpen} onOpenChange={setUploadFolderOpen} parentId={folderId} />

			<CreateFolderDialog open={createFolderOpen} onOpenChange={setCreateFolderOpen} parentId={folderId} />
		</>
	);
}
