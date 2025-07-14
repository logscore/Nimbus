"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { getFileExtension } from "@/lib/file-utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface RenameFileDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onRename: (newName: string) => Promise<void>;
	currentName: string;
	fileType: "file" | "folder";
}

export function RenameFileDialog({ isOpen, onClose, onRename, currentName, fileType }: RenameFileDialogProps) {
	const [newName, setNewName] = useState("");
	const [isRenaming, setIsRenaming] = useState(false);

	// Initialize the input field when dialog opens
	useEffect(() => {
		if (isOpen) {
			if (fileType === "file") {
				// For files, pre-select name without extension
				const extension = getFileExtension(currentName);
				const nameWithoutExtension = extension
					? currentName.slice(0, currentName.lastIndexOf(`.${extension}`))
					: currentName;
				setNewName(nameWithoutExtension);
			} else {
				// For folders, pre-select entire name
				setNewName(currentName);
			}
		}
	}, [isOpen, currentName, fileType]);

	const handleRename = async () => {
		if (!newName.trim()) {
			toast.error("Name cannot be empty");
			return;
		}

		if (newName.trim() === getCurrentNameWithoutExtension()) {
			onClose();
			return;
		}

		setIsRenaming(true);
		try {
			let finalName = newName.trim();

			// For files, preserve the original extension
			if (fileType === "file") {
				const extension = getFileExtension(currentName);
				if (extension) {
					finalName = `${finalName}.${extension}`;
				}
			}

			await onRename(finalName);
			toast.success(`${fileType === "folder" ? "Folder" : "File"} renamed successfully`);
			onClose();
		} catch (error) {
			console.error("Error renaming file:", error);
			toast.error(`Failed to rename ${fileType}`);
		} finally {
			setIsRenaming(false);
		}
	};

	const getCurrentNameWithoutExtension = () => {
		if (fileType === "file") {
			const extension = getFileExtension(currentName);
			return extension ? currentName.slice(0, currentName.lastIndexOf(`.${extension}`)) : currentName;
		}
		return currentName;
	};

	const handleKeyDown = async (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			await handleRename();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Rename {fileType === "folder" ? "Folder" : "File"}</DialogTitle>
					<DialogDescription>
						Enter a new name for &quot;{currentName}&quot;.
						{fileType === "file" && " The file extension will be preserved."}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-2">
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						value={newName}
						onChange={e => setNewName(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={`Enter ${fileType} name`}
						disabled={isRenaming}
						autoFocus
						className="w-full"
					/>
					{fileType === "file" && (
						<p className="text-muted-foreground text-sm">Extension: .{getFileExtension(currentName) || "none"}</p>
					)}
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={isRenaming}>
						Cancel
					</Button>
					<Button onClick={handleRename} disabled={isRenaming || !newName.trim()}>
						{isRenaming ? "Renaming..." : "Rename"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
