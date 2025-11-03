import { type ComponentProps } from "react";

import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import SidebarPinnedFiles from "@/components/dashboard/sidebar/sidebar-folders";
import StorageFooter from "@/components/dashboard/sidebar/sidebar-footer";
import UserAccount from "@/components/dashboard/sidebar/user-account";
// import { SearchBar } from "@/components/dashboard/sidebar/search-bar";
import TagMenu from "@/components/dashboard/sidebar/tag-menu";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar {...props} className="px-0 py-2 dark:bg-neutral-800">
			<SidebarHeader className="gap-4 p-2 pt-0 dark:bg-neutral-800">
				<UserAccount />
				{/* <SearchBar /> */}
			</SidebarHeader>

			<SidebarContent className="dark:bg-neutral-800">
				{/* Notification button
				Starred Button */}

				{/* Pinned files */}
				<SidebarPinnedFiles />

				{/* Tags */}
				<TagMenu />
			</SidebarContent>

			<StorageFooter />
		</Sidebar>
	);
}
