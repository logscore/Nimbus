"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useBreadcrumbPath } from "@/hooks/useBreadcrumb";
import { SourceSelector } from "./source-selector";
import { HomeIcon } from "lucide-react";

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
		params.delete("folderId");
		router.push(`?${params.toString()}`);
	}

	return (
		<>
			<div className="flex flex-[1_0_0] items-center gap-1">
				<div className="flex items-center gap-0.5">
					{/* Source Dropdown */}
					<SourceSelector />
					<Breadcrumb>
						<BreadcrumbList className="flex items-center px-1">
							<AnimatePresence mode="popLayout">
								<BreadcrumbItem>
									<BreadcrumbLink
										onClick={handleHomeClick}
										className="flex items-center gap-2 rounded-md p-1 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)]"
									>
										<HomeIcon className="h-4 w-4" />
									</BreadcrumbLink>
								</BreadcrumbItem>

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
									<div key={item.id}>
										<motion.div
											variants={variants}
											initial="hidden"
											animate="visible"
											exit="exit"
											layout
											className="inline-flex items-center"
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
										{index < data.length - 1 && (
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
								))}
							</AnimatePresence>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</div>
		</>
	);
}
