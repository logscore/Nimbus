import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useCreateFolder } from "@/hooks/useFileOperations";
import type { CreateFolderDialogProps } from "@/lib/types";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function CreateFolderDialog({ open, onOpenChange, parentId }: CreateFolderDialogProps) {
	const [folderName, setFolderName] = useState("");
	const { mutate: createFolder, isPending } = useCreateFolder();

	const handleCreateFolder = async (event: FormEvent) => {
		event.preventDefault();
		if (!folderName.trim()) return;

		try {
			createFolder(
				{ name: folderName, mimeType: "folder", parent: parentId },
				{
					onSuccess: async () => {
						onOpenChange(false);
						setFolderName("");
					},
				}
			);
		} catch {
			toast.error("Failed to create folder");
		}
	};

	const handleKeyDown = async (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			await handleCreateFolder(e);
		}
	};

	const handleClose = () => {
		if (!isPending) {
			setFolderName("");
			onOpenChange(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Folder</DialogTitle>
					<DialogDescription>
						Enter a name for the new folder.
						{parentId && " It will be created in the current folder."}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-2">
					<Label htmlFor="folderName">Folder Name</Label>
					<Input
						id="folderName"
						value={folderName}
						onChange={e => setFolderName(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Enter folder name"
						disabled={isPending}
						autoFocus
						className="w-full"
					/>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={handleClose} disabled={isPending} className="cursor-pointer">
						Cancel
					</Button>
					<Button onClick={handleCreateFolder} disabled={isPending || !folderName.trim()} className="cursor-pointer">
						{isPending ? "Creating..." : "Create Folder"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
