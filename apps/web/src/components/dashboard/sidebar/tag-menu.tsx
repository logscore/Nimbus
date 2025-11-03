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
import { UpdateTagDialog } from "@/components/dialogs/update-tag-dialog";
import { DeleteTagDialog } from "@/components/dialogs/delete-tag-dialog";
import { CreateTagDialog } from "@/components/dialogs/create-tag-dialog";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTags } from "@/hooks/useTags";
import type { Tag } from "@nimbus/shared";
import { useState } from "react";

const containerVariants: Variants = {
	open: {
		opacity: 1,
		height: "auto",
		transition: {
			duration: 0.3,
			ease: "easeOut",
			staggerChildren: 0.1,
			delayChildren: 0.1,
		},
	},
	closed: {
		opacity: 0,
		height: 0,
		transition: {
			duration: 0.3,
			ease: "easeIn",
			staggerChildren: 0.05,
			staggerDirection: -1,
		},
	},
};

// TODO: add keyboard shortcuts
export default function TagMenu() {
	const { tags, isLoading, error, createTag, updateTag, deleteTag } = useTags();
	const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
	const [isUpdateDialogOpen, setUpdateDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
	const [initialParentId, setInitialParentId] = useState<string | undefined>(undefined);

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
				<Button
					variant="ghost"
					size="icon"
					className="ml-auto h-6 w-6 hover:bg-neutral-200 dark:hover:bg-neutral-700"
					onClick={() => openCreateDialog()}
				>
					<Plus className="size-3" />
					<span className="sr-only">Add Tag</span>
				</Button>
			</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{error ? (
						<div className="text-muted-foreground px-3 py-2 text-xs">Your tags seem empty.</div>
					) : isLoading ? (
						<>
							<Skeleton className="mb-2 h-6 w-full bg-neutral-200 dark:bg-neutral-700" />
							<Skeleton className="mb-2 h-6 w-full bg-neutral-200 dark:bg-neutral-700" />
							<Skeleton className="mb-2 h-6 w-full bg-neutral-200 dark:bg-neutral-700" />
						</>
					) : (
						<TagTree
							tags={tags}
							openUpdateDialog={openUpdateDialog}
							openDeleteDialog={openDeleteDialog}
							openCreateDialog={openCreateDialog}
						/>
					)}
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
				<SidebarMenuItem key={tag.id} className="group/item">
					<div className="flex w-full items-center rounded-lg transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-700">
						<SidebarMenuButton
							className="peer flex flex-1 cursor-pointer items-center justify-between !bg-transparent pl-3"
							tooltip={`${tag.name} (${tag._count})`}
						>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<div className="flex flex-1 items-center gap-1 bg-transparent">
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
							<Button
								onClick={e => {
									e.stopPropagation();
									toggleTag(tag.id);
								}}
								variant="ghost"
								size="icon"
								className="mr-2 h-6 w-6 shrink-0 cursor-pointer !bg-transparent group-data-[state=collapsed]:hidden hover:!bg-neutral-200 dark:hover:!bg-neutral-700"
							>
								<ChevronDown
									className={`size-4 transition-transform duration-300 ${openTags[tag.id] ? "rotate-180" : ""}`}
								/>
							</Button>
						)}
					</div>

					{tag.children && tag.children.length > 0 && (
						<AnimatePresence>
							{openTags[tag.id] && (
								<motion.div
									key={`tag-children-${tag.id}`}
									initial="closed"
									animate="open"
									exit="closed"
									variants={containerVariants}
									style={{ overflow: "hidden" }}
									className="border-muted-foreground/20 ml-5 border-l pl-2"
								>
									<ul>
										<TagTree
											tags={tag.children}
											openUpdateDialog={openUpdateDialog}
											openDeleteDialog={openDeleteDialog}
											openCreateDialog={openCreateDialog}
										/>
									</ul>
								</motion.div>
							)}
						</AnimatePresence>
					)}
				</SidebarMenuItem>
			))}
		</>
	);
}
