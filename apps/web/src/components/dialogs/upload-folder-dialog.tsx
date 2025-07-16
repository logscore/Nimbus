import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { UploadZone } from "@/components/upload/upload-zone";
import { useEffect, useState, type FormEvent } from "react";
import { type UploadFileDialogProps } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function UploadFolderDialog({ open, onOpenChange, parentId }: UploadFileDialogProps) {
	const [selectedFolder, setSelectedFolder] = useState<FileList | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	console.log("Uploading folder: ", parentId);

	// Reset states when dialog closes
	useEffect(() => {
		if (!open) {
			setSelectedFolder(null);
			setIsUploading(false);
			setUploadProgress(0);
		}
	}, [open]);

	const simulateUploadProgress = () => {
		setIsUploading(true);
		let progress = 0;
		const interval = setInterval(() => {
			progress += 5;
			setUploadProgress(progress);
			if (progress >= 100) {
				clearInterval(interval);
				setTimeout(() => {
					if (selectedFolder) {
						// Get the folder name from the first file's path
						const folderName = selectedFolder[0]?.webkitRelativePath?.split("/")[0] || "Folder";
						toast.success(
							`Successfully uploaded folder "${folderName}" with ${selectedFolder.length} ${selectedFolder.length === 1 ? "file" : "files"}`
						);
					}
					onOpenChange(false);
					setIsUploading(false);
					setUploadProgress(0);
				}, 500);
			}
		}, 100);
	};

	// TODO: Implement upload folder handler using the mutation hooks in "useFileOperations"

	const handleUploadFolder = (event: FormEvent) => {
		event.preventDefault();
		if (selectedFolder && selectedFolder.length > 0) {
			simulateUploadProgress();
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold">Upload Folder</DialogTitle>
					<DialogDescription>Click or drag and drop a folder below to upload.</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleUploadFolder}>
					<UploadZone
						onFilesSelected={files => setSelectedFolder(files as FileList)}
						isFolder={true}
						isUploading={isUploading}
						uploadProgress={uploadProgress}
					/>
					<DialogFooter>
						{!isUploading && (
							<>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										onOpenChange(false);
										setSelectedFolder(null);
									}}
									className="cursor-pointer"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={!selectedFolder || selectedFolder.length === 0}
									className="cursor-pointer"
								>
									Upload {selectedFolder && selectedFolder.length > 0 ? `(${selectedFolder.length} files)` : ""}
								</Button>
							</>
						)}
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
