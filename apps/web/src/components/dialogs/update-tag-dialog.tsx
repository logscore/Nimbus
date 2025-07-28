import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useEffect, useState, type ReactNode } from "react";
import { FieldError } from "@/components/ui/field-error";
import { updateTagSchema } from "@nimbus/shared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Tag } from "@nimbus/shared";

function getDescendantIds(tag: Tag): string[] {
	if (!tag.children) return [];
	return tag.children.flatMap(child => [child.id, ...getDescendantIds(child)]);
}

function renderTagSelectItems(tags: Tag[], forbiddenIds: string[], level = 0): ReactNode[] {
	return tags.flatMap(t => {
		if (forbiddenIds.includes(t.id)) {
			return [];
		}
		return [
			<SelectItem key={t.id} value={t.id}>
				<span className="flex items-center">
					{level > 0 && <span className="text-muted-foreground mr-2">{"│\u00A0".repeat(level - 1)}└─</span>}
					{t.name}
				</span>
			</SelectItem>,
			...(t.children ? renderTagSelectItems(t.children, forbiddenIds, level + 1) : []),
		];
	});
}

interface UpdateTagDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onUpdate: (data: { id: string; name?: string; color?: string; parentId?: string | null }) => void;
	tags: Tag[];
	tag: Tag | null;
}

export function UpdateTagDialog({ isOpen, onClose, onUpdate, tags, tag }: UpdateTagDialogProps) {
	const [name, setName] = useState("");
	const [color, setColor] = useState("#808080");
	const [parentId, setParentId] = useState<string | null>(null);
	const [errors, setErrors] = useState<{ name?: string; color?: string }>({});

	useEffect(() => {
		if (tag) {
			setName(tag.name);
			setColor(tag.color);
			setParentId(tag.parentId ?? null);
			setErrors({});
		}
	}, [tag]);

	// Real-time validation
	useEffect(() => {
		if (!tag) return;

		const validationResult = updateTagSchema.safeParse({
			id: tag.id,
			name: name.trim() === tag.name ? undefined : name,
			color: color === tag.color ? undefined : color,
			parentId: parentId === tag.parentId ? undefined : parentId === "none" ? null : parentId,
		});

		if (!validationResult.success) {
			const newErrors: { name?: string; color?: string } = {};
			validationResult.error.issues.forEach(issue => {
				if (issue.path.includes("name")) {
					newErrors.name = issue.message;
				}
				if (issue.path.includes("color")) {
					newErrors.color = issue.message;
				}
			});
			setErrors(newErrors);
		} else {
			setErrors({});
		}
	}, [name, color, parentId, tag]);

	const forbiddenIds = tag ? [tag.id, ...getDescendantIds(tag)] : [];

	const handleSubmit = () => {
		if (!tag) return;

		const validationResult = updateTagSchema.safeParse({
			id: tag.id,
			name: name.trim() === tag.name ? undefined : name,
			color: color === tag.color ? undefined : color,
			parentId: parentId === tag.parentId ? undefined : parentId === "none" ? null : parentId,
		});

		if (validationResult.success) {
			onUpdate({
				id: tag.id,
				name: name.trim() === tag.name ? undefined : name,
				color: color === tag.color ? undefined : color,
				parentId: parentId === tag.parentId ? undefined : parentId === "none" ? null : parentId,
			});
			onClose();
		} else {
			// Update errors for final validation
			const newErrors: { name?: string; color?: string } = {};
			validationResult.error.issues.forEach(issue => {
				if (issue.path.includes("name")) {
					newErrors.name = issue.message;
				}
				if (issue.path.includes("color")) {
					newErrors.color = issue.message;
				}
			});
			setErrors(newErrors);
		}
	};

	const hasChanges =
		tag &&
		(name.trim() !== tag.name ||
			color !== tag.color ||
			(parentId === "none" ? null : parentId) !== (tag.parentId ?? null));
	const isValid = Object.keys(errors).length === 0;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update Tag</DialogTitle>
					<DialogDescription>Update the details of your tag here.</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="update-tag-name" className="text-right">
							Name
						</Label>
						<div className="col-span-3">
							<Input
								id="update-tag-name"
								value={name}
								onChange={e => setName(e.target.value)}
								className={errors.name ? "border-red-500" : ""}
								placeholder="Enter tag name (letters and spaces only)"
							/>
						</div>
					</div>
					<div className="text-xs text-red-500">{errors.name && <FieldError error={errors.name} />}</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="update-tag-color" className="text-right">
							Color
						</Label>
						<div className="col-span-3">
							<Input id="update-tag-color" type="color" value={color} onChange={e => setColor(e.target.value)} />
						</div>
					</div>
					<div className="text-xs text-red-500">{errors.color && <FieldError error={errors.color} />}</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="update-tag-parent" className="text-right">
							Parent Tag
						</Label>
						<Select value={parentId || "none"} onValueChange={value => setParentId(value === "none" ? null : value)}>
							<SelectTrigger className="col-span-3 w-full" id="update-tag-parent">
								<SelectValue placeholder="Select a parent tag" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">None</SelectItem>
								{renderTagSelectItems(tags, forbiddenIds)}
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={!isValid || !hasChanges}>
						Update
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
