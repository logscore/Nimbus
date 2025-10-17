import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate, useSearch, useParams } from "@tanstack/react-router";
import { ChevronDown, FileText, Folder, PinOff } from "lucide-react";
import { providerToSlug, type DriveProvider } from "@nimbus/shared";
import { usePinnedFiles, useUnpinFile } from "@/hooks/useDriveOps";
import { Skeleton } from "@/components/ui/skeleton";
import type { PinnedFile } from "@nimbus/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Helper to get a custom icon based on file type
function getFileIcon(type: string) {
	switch (type) {
		case "folder":
			return <Folder className="size-4" />;
		default:
			return <FileText className="size-4" />;
	}
}

export default function SidebarPinnedFiles() {
	const searchParams = useSearch({ from: "/_protected/dashboard/$providerSlug/$accountId" });
	const navigate = useNavigate({ from: "/dashboard/$providerSlug/$accountId" });
	const [isOpen, setIsOpen] = useState(true);
	const { data: pinnedFiles, isLoading, error } = usePinnedFiles();
	const unpinFile = useUnpinFile();

	const handleUnpin = (id: string) => {
		unpinFile.mutate(id);
	};

	const handleNavigate = (file: PinnedFile) => {
		if (file.type === "folder") {
			navigate({
				to: "/dashboard/$providerSlug/$accountId",
				params: {
					providerSlug: providerToSlug(file.provider as DriveProvider),
					accountId: file.accountId,
				},
				search: { ...searchParams, folderId: file.fileId },
			});
		}
		// If not a folder, we don't navigate
	};

	const isValidProvider = (provider: string): provider is DriveProvider => {
		return provider === "microsoft" || provider === "google";
	};

	return (
		<SidebarGroup>
			<SidebarGroupLabel asChild>
				<button
					onClick={() => setIsOpen(!isOpen)}
					className="hover:text-accent-foreground flex w-full cursor-pointer items-center justify-between rounded-md py-2 pr-3 text-sm font-medium transition-all duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-700"
				>
					Favorites
					<ChevronDown className={cn("ml-auto transition-transform", isOpen && "rotate-180")} />
				</button>
			</SidebarGroupLabel>
			{isOpen && (
				<SidebarGroupContent>
					<SidebarMenu>
						{error ? (
							<div className="text-muted-foreground px-3 py-2 text-xs">Your Favorites seem empty.</div>
						) : isLoading ? (
							<>
								<Skeleton className="mb-2 h-6 w-full bg-neutral-200 dark:bg-neutral-700" />
								<Skeleton className="mb-2 h-6 w-full bg-neutral-200 dark:bg-neutral-700" />
								<Skeleton className="mb-2 h-6 w-full bg-neutral-200 dark:bg-neutral-700" />
							</>
						) : (
							pinnedFiles &&
							pinnedFiles.length > 0 &&
							pinnedFiles.map(file => {
								return (
									<div key={file.id} className="relative overflow-hidden">
										<SidebarMenuItem className="group/menu-item relative">
											<SidebarMenuButton
												tooltip={file.name}
												onClick={() => handleNavigate(file)}
												className="pr-8 transition-all duration-200 dark:hover:bg-neutral-700" // Add right padding to make space
											>
												<div className="relative flex w-full cursor-pointer items-center gap-2">
													{getFileIcon(file.type)}
													<span className="truncate">{file.name}</span>
												</div>
											</SidebarMenuButton>
											<div className="absolute top-0.75 right-1.5 z-50 flex opacity-0 transition-all group-hover/menu-item:opacity-100">
												<Button
													variant="ghost"
													className="size-6.5 cursor-pointer rounded-lg p-0 hover:bg-neutral-200 dark:hover:bg-neutral-700"
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
									</div>
								);
							})
						)}
					</SidebarMenu>
				</SidebarGroupContent>
			)}
		</SidebarGroup>
	);
}
