"use client";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UpdateTagDialog } from "@/components/dialogs/update-tag-dialog";
import { DeleteTagDialog } from "@/components/dialogs/delete-tag-dialog";
import { CreateTagDialog } from "@/components/dialogs/create-tag-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTags } from "@/hooks/useTags";
import type { Tag } from "@nimbus/shared";
import { useState } from "react";

// TODO: add keyboard shortcuts
export default function TagMenu() {
	const { tags, isLoading, error, createTag, updateTag, deleteTag } = useTags();
	const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
	const [isUpdateDialogOpen, setUpdateDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
	const [initialParentId, setInitialParentId] = useState<string | undefined>(undefined);

	if (error) {
		return <div>Error loading tags</div>;
	}

	const openCreateDialog = (parentId?: string) => {
		setInitialParentId(parentId);
		setCreateDialogOpen(true);
	};

	const openUpdateDialog = (tag: Tag) => {
		setSelectedTag(tag);
		setUpdateDialogOpen(true);
	};

	const openDeleteDialog = (tag: Tag) => {
		setSelectedTag(tag);
		setDeleteDialogOpen(true);
	};

	return (
		<SidebarGroup>
			<SidebarGroupLabel>
				Tags
				<Button variant="ghost" size="icon" className="ml-auto h-6 w-6" onClick={() => openCreateDialog()}>
					<Plus className="size-3" />
					<span className="sr-only">Add Tag</span>
				</Button>
			</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{isLoading && (
						<>
							<Skeleton className="mb-2 h-6 w-full" />
							<Skeleton className="mb-2 h-6 w-full" />
							<Skeleton className="mb-2 h-6 w-full" />
						</>
					)}
					<TagTree
						tags={tags}
						openUpdateDialog={openUpdateDialog}
						openDeleteDialog={openDeleteDialog}
						openCreateDialog={openCreateDialog}
					/>
				</SidebarMenu>
			</SidebarGroupContent>
			<CreateTagDialog
				isOpen={isCreateDialogOpen}
				onClose={() => setCreateDialogOpen(false)}
				onCreate={createTag}
				tags={tags}
				initialParentId={initialParentId}
			/>
			<UpdateTagDialog
				isOpen={isUpdateDialogOpen}
				onClose={() => setUpdateDialogOpen(false)}
				onUpdate={updateTag}
				tags={tags}
				tag={selectedTag}
			/>
			<DeleteTagDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				onDelete={deleteTag}
				tag={selectedTag}
			/>
		</SidebarGroup>
	);
}

interface TagTreeProps {
	tags: Tag[];
	openUpdateDialog: (tag: Tag) => void;
	openDeleteDialog: (tag: Tag) => void;
	openCreateDialog: (parentId?: string) => void;
}

function TagTree({ tags, openUpdateDialog, openDeleteDialog, openCreateDialog }: TagTreeProps) {
	const [openTags, setOpenTags] = useState<Record<string, boolean>>({});

	const toggleTag = (tagId: string) => {
		setOpenTags(prev => ({
			...prev,
			[tagId]: !prev[tagId],
		}));
	};

	return (
		<>
			{tags.map(tag => (
				<Collapsible key={tag.id} asChild>
					<SidebarMenuItem className="group/item pr-2">
						<div className="flex w-full items-center">
							<SidebarMenuButton
								className="peer flex flex-1 cursor-pointer items-center justify-between pl-3"
								tooltip={`${tag.name} (${tag._count})`}
							>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<div className="flex flex-1 items-center gap-1">
											<span className="size-3 rounded-full" style={{ backgroundColor: tag.color }} />
											<span className="ml-2 group-data-[state=collapsed]:hidden">{tag.name}</span>
											<span className="text-sidebar-foreground/70 ml-2 text-xs group-data-[state=collapsed]:hidden">
												{tag._count}
											</span>
										</div>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => openUpdateDialog(tag)}>Edit Tag</DropdownMenuItem>
										<DropdownMenuItem onClick={() => openCreateDialog(tag.id)}>Add nested Tag</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(tag)}>
											Delete Tag
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuButton>

							{tag.children && tag.children.length > 0 && (
								<CollapsibleTrigger asChild>
									<Button
										onClick={e => {
											e.stopPropagation();
											toggleTag(tag.id);
										}}
										variant="ghost"
										size="icon"
										className="h-6 w-6 shrink-0 cursor-pointer group-data-[state=collapsed]:hidden"
									>
										{openTags[tag.id] ? (
											<ChevronDown className="size-4 rotate-180 transition-transform duration-300" />
										) : (
											<ChevronDown className="size-4 transition-transform duration-300" />
										)}
									</Button>
								</CollapsibleTrigger>
							)}
						</div>
						{tag.children && tag.children.length > 0 && (
							<CollapsibleContent asChild>
								<div className="border-muted-foreground/20 ml-5 border-l pl-2">
									<ul>
										<TagTree
											tags={tag.children}
											openUpdateDialog={openUpdateDialog}
											openDeleteDialog={openDeleteDialog}
											openCreateDialog={openCreateDialog}
										/>
									</ul>
								</div>
							</CollapsibleContent>
						)}
					</SidebarMenuItem>
				</Collapsible>
			))}
		</>
	);
}
