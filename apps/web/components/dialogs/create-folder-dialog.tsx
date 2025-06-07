import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CreateFolderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreateFolder: (folderName: string) => void;
}

export function CreateFolderDialog({ open, onOpenChange, onCreateFolder }: CreateFolderDialogProps) {
	const [folderName, setFolderName] = useState("");

	const handleCreateFolder = (event: React.FormEvent) => {
		event.preventDefault();
		if (!folderName.trim()) return;

		onCreateFolder(folderName.trim());
		toast.success("Folder created successfully");
		onOpenChange(false);
		setFolderName("");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md rounded-2xl shadow-xl">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold">Create a New Folder</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">
						Give your folder a meaningful name.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleCreateFolder} className="space-y-6">
					<div className="grid gap-2">
						<Label htmlFor="folder-name" className="text-sm font-medium">
							Folder Name
						</Label>
						<Input
							id="folder-name"
							placeholder="e.g., Project Documents"
							value={folderName}
							onChange={e => setFolderName(e.target.value)}
							required
							className="focus-visible:ring-2 focus-visible:ring-ring"
							maxLength={255}
						/>
					</div>

					<DialogFooter className="flex justify-between">
						<Button
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
							className="text-muted-foreground hover:text-foreground"
						>
							Cancel
						</Button>
						<Button type="submit" disabled={!folderName.trim()}>
							Create
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
