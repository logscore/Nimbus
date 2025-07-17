"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronsUpDown, LogOut, Sparkles } from "lucide-react";
import { authClient } from "@nimbus/auth/auth-client";
import Profile from "@/components/user-profile";
import { useSignOut } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function UserAccount() {
	const { data: session, isPending } = authClient.useSession();
	const { signOut, isLoading } = useSignOut();

	const userName = session?.user?.name;
	const userEmail = session?.user?.email;
	// TODO: Cache the user image
	const userImage = session?.user?.image;

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="flex h-10 items-center justify-between self-stretch rounded-lg px-2 py-1 transition-all duration-200 ease-linear hover:bg-neutral-200 dark:hover:bg-neutral-700"
						>
							{isPending ? (
								<div className="flex items-center gap-2">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarFallback className="h-8 w-8 rounded-lg bg-neutral-300 dark:bg-neutral-700" />
									</Avatar>
									<span className="text-sm leading-[normal] font-medium dark:text-neutral-200">Loading...</span>
								</div>
							) : (
								<div className="flex items-center gap-2">
									<Profile url={userImage || null} name={userName || ""} size="default" className="rounded-lg" />

									<span className="text-sm leading-[normal] font-medium dark:text-neutral-200">{userName}</span>
								</div>
							)}
							<ChevronsUpDown className="h-3.5 w-3.5 shrink-0" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56" align="start" side="right" sideOffset={8}>
						<div className="px-2 py-1.5">
							<p className="text-sm font-medium dark:text-neutral-200">{userName}</p>
							<p className="text-muted-foreground truncate text-xs">{userEmail}</p>
						</div>
						<DropdownMenuSeparator />

						<DropdownMenuItem
							// Redirect to Polar page
							className={cn(
								"flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm",
								"text-amber-600 dark:text-amber-400"
							)}
						>
							<Sparkles className="h-4 w-4" />
							Upgrade to Pro
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							onClick={() => signOut()}
							className={cn(
								"flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm",
								"text-red-400 dark:text-red-500"
							)}
							disabled={isLoading}
						>
							<LogOut className="h-4 w-4" />
							<span>{isLoading ? "Signing out..." : "Sign Out"}</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
