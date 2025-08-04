"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { type BreadcrumbItem as BreadcrumbItemType } from "@/hooks/useBreadcrumb";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useBreadcrumbPath } from "@/hooks/useBreadcrumb";
import { pointerIntersection } from "@dnd-kit/collision";
import { SourceSelector } from "./source-selector";
import { useDroppable } from "@dnd-kit/react";
import { HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Define animation variants for slide-in/slide-out
const variants: Variants = {
	hidden: { opacity: 0, x: -10 }, // Starts hidden, slightly to the right
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			type: "spring", // Use a spring animation for a natural feel
			stiffness: 250,
			damping: 30,
		},
	},
	exit: {
		opacity: 0,
		x: -20,
		transition: {
			ease: "easeInOut",
			duration: 0.2, // Faster exit
		},
	},
};

export function FileBreadcrumb() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const currentFileId = searchParams.get("folderId") || "";
	const { data } = useBreadcrumbPath(currentFileId);

	// Handle clicking a folder navigation
	async function handleFolderClick(id: string) {
		const params = new URLSearchParams(searchParams);
		params.set("folderId", id);
		router.push(`?${params.toString()}`);
	}

	// Handle clicking the home icon to remove folderId
	async function handleHomeClick() {
		const params = new URLSearchParams(searchParams);
		const folderId = params.get("folderId");
		if (!folderId) return;
		params.delete("folderId");
		router.push(`?${params.toString()}`);
	}

	const { ref: droppableRef, isDropTarget } = useDroppable({
		id: `droppable-root`,
		accept: "files",
		data: { id: "root" },
		collisionDetector: pointerIntersection,
	});

	return (
		<>
			<div className="flex flex-[1_0_0] items-center gap-1">
				<div className="flex items-center gap-0.5">
					{/* Source Dropdown */}
					<SourceSelector />
					<Breadcrumb>
						<AnimatePresence mode="popLayout">
							<BreadcrumbList className="flex items-center px-1">
								<div ref={droppableRef}>
									<BreadcrumbItem
										className={cn(
											"flex items-center justify-center",
											isDropTarget && "rounded-md bg-blue-500/20 text-blue-500 ring-2 ring-blue-500"
										)}
									>
										<BreadcrumbLink
											onClick={handleHomeClick}
											className="flex items-center gap-2 rounded-md p-1 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)]"
										>
											<HomeIcon className="h-4 w-4" />
										</BreadcrumbLink>
									</BreadcrumbItem>
								</div>

								{/* Separator after home if there are breadcrumb items */}
								{data && data.length > 0 && (
									<motion.span
										key="home-separator"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.2 }}
										className="text-neutral-200"
									>
										/
									</motion.span>
								)}

								{/* Breadcrumb items */}
								{data?.map((item, index) => (
									<FileBreadcrumbItem
										key={`${item.id}-${index < data.length - 1}`} // (index < data.length - 1) to make sure the last two item re-render on changes - this also affect the animation
										item={item}
										handleFolderClick={handleFolderClick}
										showSeparator={index < data.length - 1}
									/>
								))}
							</BreadcrumbList>
						</AnimatePresence>
					</Breadcrumb>
				</div>
			</div>
		</>
	);
}

function FileBreadcrumbItem({
	item,
	handleFolderClick,
	showSeparator,
}: {
	item: BreadcrumbItemType;
	handleFolderClick: (id: string) => void;
	showSeparator: boolean;
}) {
	const { ref: droppableRef, isDropTarget } = useDroppable({
		id: `droppable-${item.id}`,
		accept: "files",
		data: { id: item.id },
		collisionDetector: pointerIntersection,
	});

	return (
		<div>
			{showSeparator ? (
				<FileBreadcrumbItemLink
					isDropTarget={isDropTarget}
					item={item}
					handleFolderClick={handleFolderClick}
					ref={droppableRef}
				/>
			) : (
				<FileBreadcrumbItemLink item={item} handleFolderClick={handleFolderClick} />
			)}
			{showSeparator && (
				<motion.span
					key={`separator-${item.id}`}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="pl-3 text-neutral-200"
				>
					/
				</motion.span>
			)}
		</div>
	);
}

type FileBreadcrumbItemProps = {
	isDropTarget?: boolean;
	item: BreadcrumbItemType;
	handleFolderClick: (id: string) => void;
	ref?: React.Ref<HTMLDivElement>;
};

function FileBreadcrumbItemLink({ isDropTarget, item, handleFolderClick, ref }: FileBreadcrumbItemProps) {
	return (
		<motion.div
			variants={variants}
			initial="hidden"
			animate="visible"
			exit="exit"
			layout
			className={cn(
				"inline-flex items-center",
				isDropTarget && "rounded-md bg-blue-500/20 text-blue-500 ring-2 ring-blue-500"
			)}
			ref={ref}
		>
			<BreadcrumbItem>
				<BreadcrumbLink
					onClick={() => handleFolderClick(item.id)}
					className="flex items-center gap-2 rounded-md p-1 text-nowrap"
				>
					<span>{item.name}</span>
				</BreadcrumbLink>
			</BreadcrumbItem>
		</motion.div>
	);
}
