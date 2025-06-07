import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Upload, FolderOpen, ChevronDown, File } from "lucide-react";
import { useState } from "react";
import { UploadFileDialog } from "@/components/dialogs/upload-files-dialog";
import { UploadFolderDialog } from "@/components/dialogs/upload-folder-dialog";

export default function UploadButton() {
	const [uploadFileOpen, setUploadFileOpen] = useState(false);
	const [uploadFolderOpen, setUploadFolderOpen] = useState(false);

	const handleFileUpload = (files: FileList) => {
		// TODO: Implement file upload logic
		console.log("Uploading files:", files.length);
	};

	const handleFolderUpload = (files: FileList) => {
		// TODO: Implement folder upload logic
		console.log("Uploading folder with files:", files.length);
	};

	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<div className="space-y-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button className="w-full justify-start group-data-[collapsible=icon]:justify-center" size="sm">
								<Upload className="mr-2 size-4 group-data-[collapsible=icon]:mr-0" />
								<span className="group-data-[collapsible=icon]:hidden">Upload</span>
								<ChevronDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" className="w-48">
							<DropdownMenuItem onClick={() => setUploadFileOpen(true)}>
								<File className="mr-2 size-4" />
								Upload Files
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setUploadFolderOpen(true)}>
								<FolderOpen className="mr-2 size-4" />
								Upload Folder
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<UploadFileDialog open={uploadFileOpen} onOpenChange={setUploadFileOpen} onUpload={handleFileUpload} />

					<UploadFolderDialog
						open={uploadFolderOpen}
						onOpenChange={setUploadFolderOpen}
						onUpload={handleFolderUpload}
					/>
				</div>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
