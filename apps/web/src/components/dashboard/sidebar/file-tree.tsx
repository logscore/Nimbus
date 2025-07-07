import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Folder, ImageIcon, Video, Music, Archive } from "lucide-react";

const folders = [
	{
		name: "Documents",
		icon: Folder,
		count: 24,
		subfolders: [
			{ name: "Work", count: 12 },
			{ name: "Personal", count: 8 },
			{ name: "Archive", count: 4 },
		],
	},
	{
		name: "Images",
		icon: ImageIcon,
		count: 156,
		subfolders: [
			{ name: "Screenshots", count: 45 },
			{ name: "Photos", count: 89 },
			{ name: "Graphics", count: 22 },
		],
	},
	{
		name: "Videos",
		icon: Video,
		count: 8,
	},
	{
		name: "Music",
		icon: Music,
		count: 32,
	},
	{
		name: "Archives",
		icon: Archive,
		count: 5,
	},
];

export default function SidebarFolders() {
	return (
		<>
			<SidebarGroup>
				<SidebarGroupLabel>Folders</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						{folders.map(folder => (
							<Collapsible key={folder.name} className="group/collapsible">
								<SidebarMenuItem>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton className="cursor-pointer px-3" tooltip={`${folder.name} (${folder.count})`}>
											<folder.icon className="size-4" />
											<span className="group-data-[collapsible=icon]:sr-only">{folder.name}</span>
											<span className="text-sidebar-foreground/70 ml-1 text-xs group-data-[collapsible=icon]:sr-only">
												{folder.count}
											</span>
											{folder.subfolders && (
												<ChevronDown className="ml-auto size-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-180" />
											)}
										</SidebarMenuButton>
									</CollapsibleTrigger>

									{folder.subfolders && (
										<CollapsibleContent>
											<SidebarMenuSub className="group-data-[collapsible=icon]:hidden">
												{folder.subfolders.map(subfolder => (
													<SidebarMenuSubItem key={subfolder.name}>
														<SidebarMenuSubButton className="w-full cursor-pointer">
															<span>{subfolder.name}</span>
															<span className="text-sidebar-foreground/70 ml-1 text-xs">{subfolder.count}</span>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												))}
											</SidebarMenuSub>
										</CollapsibleContent>
									)}
								</SidebarMenuItem>
							</Collapsible>
						))}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</>
	);
}
