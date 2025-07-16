"use client";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ChevronDown, Folder, ImageIcon, Video, Music, Archive, PinOff, FileText } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { usePinnedFiles, useUnpinFile } from "@/hooks/useDriveOps";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
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

const itemVariants: Variants = {
	open: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.2,
			ease: "easeOut",
		},
	},
	closed: {
		opacity: 0,
		y: -10,
		transition: {
			duration: 0.2,
			ease: "easeIn",
		},
	},
};

// Helper to get a custom icon based on file type
function getFileIcon(type: string) {
	switch (type) {
		case "image":
			return ImageIcon;
		case "video":
			return Video;
		case "music":
			return Music;
		case "archive":
			return Archive;
		case "document":
			return FileText;
		case "folder":
		default:
			return Folder;
	}
}

export default function SidebarPinnedFiles() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(true);
	const { data: pinnedFiles, isLoading } = usePinnedFiles();
	const unpinFile = useUnpinFile();

	const handleUnpin = (id: string) => {
		unpinFile.mutate(id);
	};

	const handleNavigate = (fileId: string, type: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (type === "folder") {
			params.set("folderId", fileId);
		} else {
			params.set("id", fileId);
		}
		router.push(`?${params.toString()}`);
	};

	return (
		<SidebarGroup>
			<SidebarGroupLabel asChild>
				<button
					onClick={() => setIsOpen(!isOpen)}
					className="hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm font-medium"
				>
					Favorites
					<ChevronDown className={cn("ml-auto transition-transform", isOpen && "rotate-180")} />
				</button>
			</SidebarGroupLabel>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						key="sidebar-pinned-files"
						initial="closed"
						animate="open"
						exit="closed"
						variants={containerVariants}
						style={{ overflow: "hidden" }}
					>
						<SidebarGroupContent>
							<SidebarMenu>
								<motion.div variants={containerVariants} initial="closed" animate="open" exit="closed">
									{isLoading ? (
										<Loader />
									) : pinnedFiles && pinnedFiles.length > 0 ? (
										pinnedFiles.map(file => {
											const Icon = getFileIcon(file.type);
											return (
												<motion.div key={file.id} className="relative" variants={itemVariants}>
													<SidebarMenuItem className="group/menu-item relative">
														<SidebarMenuButton
															tooltip={file.name}
															onClick={() => handleNavigate(file.fileId, file.type)}
														>
															<div className="relative flex w-full cursor-pointer items-center gap-2">
																<Icon className="size-4" />
																<span>{file.name}</span>
															</div>
														</SidebarMenuButton>
														<div className="absolute top-0 -right-1 z-50 flex translate-x-full transition-transform group-hover/menu-item:translate-x-0">
															<Button
																variant="ghost"
																size="sm"
																className="cursor-pointer rounded-md p-1.5"
																onClick={e => {
																	e.preventDefault();
																	e.stopPropagation();
																	handleUnpin(file.id);
																}}
															>
																<PinOff className="size-3" />
															</Button>
														</div>
													</SidebarMenuItem>
												</motion.div>
											);
										})
									) : (
										<div className="text-muted-foreground px-3 py-2 text-xs">Your Favorites seems empty.</div>
									)}
								</motion.div>
							</SidebarMenu>
						</SidebarGroupContent>
					</motion.div>
				)}
			</AnimatePresence>
		</SidebarGroup>
	);
}
