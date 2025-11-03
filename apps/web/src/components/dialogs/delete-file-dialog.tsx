import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteFileDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onDelete: () => Promise<void>;
	fileName: string;
	fileType: "file" | "folder";
}

export function DeleteFileDialog({ isOpen, onClose, onDelete, fileName, fileType }: DeleteFileDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await onDelete();
			toast.success(`${fileType === "folder" ? "Folder" : "File"} deleted successfully`);
			onClose();
		} catch (error) {
			console.error("Error deleting file:", error);
			toast.error(`Failed to delete ${fileType}`);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleKeyDown = async (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			await handleDelete();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent onKeyDown={handleKeyDown}>
				<DialogHeader>
					<DialogTitle>Delete {fileType === "folder" ? "Folder" : "File"}</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete &quot;{fileName}&quot;? This action cannot be undone.
						{fileType === "folder" && " All files and subfolders inside this folder will also be deleted."}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={isDeleting}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
