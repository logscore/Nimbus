"use client";
import type React from "react";
import { useState } from "react";
import { Folder, Upload, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UploadFileDialog } from "./dialogs/upload-files-dialog";
import { UploadFolderDialog } from "./dialogs/upload-folder-dialog";
import { CreateFolderDialog } from "./dialogs/create-folder-dialog";

export function UploadButton() {
	const [uploadFileOpen, setUploadFileOpen] = useState(false);
	const [uploadFolderOpen, setUploadFolderOpen] = useState(false);
	const [createFolderOpen, setCreateFolderOpen] = useState(false);

	const handleFileUpload = (files: FileList) => {
		console.log(
			"Uploading files:",
			Array.from(files).map(f => f.name)
		);
		// Handle file upload logic here
	};

	const handleFolderUpload = (files: FileList) => {
		console.log(
			"Uploading folder with files:",
			Array.from(files).map(f => f.webkitRelativePath || f.name)
		);
		// Handle folder upload logic here
	};

	const handleCreateFolder = (folderName: string) => {
		console.log("Creating folder:", folderName);
		// Handle folder creation logic here
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="icon">
						<MoreVertical className="h-4 w-4" />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setUploadFileOpen(true)}>
						<Upload className="h-4 w-4 mr-2" />
						Upload files
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setUploadFolderOpen(true)}>
						<Upload className="h-4 w-4 mr-2" />
						Upload folder
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setCreateFolderOpen(true)}>
						<Folder className="h-4 w-4 mr-2" />
						Create folder
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<UploadFileDialog open={uploadFileOpen} onOpenChange={setUploadFileOpen} onUpload={handleFileUpload} />

			<UploadFolderDialog open={uploadFolderOpen} onOpenChange={setUploadFolderOpen} onUpload={handleFolderUpload} />

			<CreateFolderDialog
				open={createFolderOpen}
				onOpenChange={setCreateFolderOpen}
				onCreateFolder={handleCreateFolder}
			/>
		</>
	);
}
