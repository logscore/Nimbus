import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState, type ReactNode } from "react";
import { FieldError } from "@/components/ui/field-error";
import { createTagSchema } from "@nimbus/shared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Tag } from "@nimbus/shared";

function renderTagOptions(tags: Tag[], level = 0): ReactNode[] {
	return tags.flatMap(tag => [
		<option key={tag.id} value={tag.id}>
			{"\u00A0".repeat(level * 2)}
			{tag.name}
		</option>,
		...(tag.children ? renderTagOptions(tag.children, level + 1) : []),
	]);
}

interface CreateTagDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onCreate: (data: { name: string; color: string; parentId?: string }) => void;
	tags: Tag[];
	initialParentId?: string;
}

export function CreateTagDialog({ isOpen, onClose, onCreate, tags, initialParentId }: CreateTagDialogProps) {
	const [name, setName] = useState("");
	const [color, setColor] = useState("#808080");
	const [parentId, setParentId] = useState<string | undefined>(undefined);
	const [errors, setErrors] = useState<{ name?: string; color?: string }>({});

	useEffect(() => {
		if (isOpen) {
			setParentId(initialParentId);
		} else {
			setName("");
			setColor("#808080");
			setParentId(undefined);
			setErrors({});
		}
	}, [isOpen, initialParentId]);

	// Real-time validation
	useEffect(() => {
		const validationResult = createTagSchema.safeParse({
			name,
			color,
			parentId: parentId === "none" ? undefined : parentId,
		});
		if (!validationResult.success) {
			const newErrors: { name?: string; color?: string } = {};
			validationResult.error.errors.forEach(error => {
				if (error.path.includes("name")) {
					newErrors.name = error.message;
				}
				if (error.path.includes("color")) {
					newErrors.color = error.message;
				}
			});
			setErrors(newErrors);
		} else {
			setErrors({});
		}
	}, [name, color, parentId]);

	const handleSubmit = () => {
		const validationResult = createTagSchema.safeParse({
			name,
			color,
			parentId: parentId === "none" ? undefined : parentId,
		});
		if (validationResult.success) {
			onCreate({
				name: validationResult.data.name,
				color: validationResult.data.color,
				parentId: validationResult.data.parentId ?? undefined,
			});
			onClose();
		} else {
			// Update errors for final validation
			const newErrors: { name?: string; color?: string } = {};
			validationResult.error.errors.forEach(error => {
				if (error.path.includes("name")) {
					newErrors.name = error.message;
				}
				if (error.path.includes("color")) {
					newErrors.color = error.message;
				}
			});
			setErrors(newErrors);
		}
	};

	const isValid = Object.keys(errors).length === 0 && name.trim().length > 0;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Tag</DialogTitle>
					<DialogDescription>Create a new tag to organize your files.</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="new-tag-name" className="text-right">
							Name
						</Label>
						<div className="col-span-3">
							<Input
								id="new-tag-name"
								value={name}
								onChange={e => setName(e.target.value)}
								className={errors.name ? "border-red-500" : ""}
								placeholder="Enter tag name (letters and spaces only)"
							/>
						</div>
					</div>
					<div className="text-xs text-red-500">{errors.name && <FieldError error={errors.name} />}</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="new-tag-color" className="text-right">
							Color
						</Label>
						<div className="col-span-3">
							<Input id="new-tag-color" type="color" value={color} onChange={e => setColor(e.target.value)} />
						</div>
					</div>
					<div className="text-xs text-red-500">{errors.color && <FieldError error={errors.color} />}</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="new-tag-parent" className="text-right">
							Parent Tag
						</Label>
						<select
							id="new-tag-parent"
							value={parentId || "none"}
							onChange={e => setParentId(e.target.value)}
							className="col-span-3"
						>
							<option value="none">None</option>
							{renderTagOptions(tags)}
						</select>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={!isValid}>
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
