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
import type { UploadFileDialogProps } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function UploadFileDialog({ open, onOpenChange, onUpload }: UploadFileDialogProps) {
	const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	// Reset states when dialog closes
	useEffect(() => {
		if (!open) {
			setSelectedFiles(null);
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
					if (selectedFiles) {
						onUpload(selectedFiles);
						toast.success(
							`Successfully uploaded ${selectedFiles.length} ${selectedFiles.length === 1 ? "file" : "files"}`
						);
					}
					onOpenChange(false);
					setIsUploading(false);
					setUploadProgress(0);
				}, 500);
			}
		}, 100);
	};

	const handleUploadFile = (event: FormEvent) => {
		event.preventDefault();
		if (selectedFiles && selectedFiles.length > 0) {
			simulateUploadProgress();
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold">Upload Files</DialogTitle>
					<DialogDescription>Click or drag and drop files below to upload.</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleUploadFile}>
					<UploadZone
						onFilesSelected={files => setSelectedFiles(files as FileList)}
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
										setSelectedFiles(null);
									}}
									className="cursor-pointer"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={!selectedFiles || selectedFiles.length === 0}
									className="cursor-pointer"
								>
									Upload {selectedFiles && selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
								</Button>
							</>
						)}
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
