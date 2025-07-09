import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Bell, MessageCircleQuestion, Settings } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import Link from "next/link";

import { UserProfileDropdown } from "./user-profile-dropdown";

export interface HeaderActionsProps {
	showNotifications?: boolean;
	showHelp?: boolean;
	showSettings?: boolean;
	showThemeToggle?: boolean;
	className?: string;
	children?: ReactNode;
}

export function HeaderActions({
	showNotifications = true,
	showHelp = true,
	showSettings = true,
	showThemeToggle = true,
	className = "",
	children,
}: HeaderActionsProps) {
	return (
		<div className={cn("flex items-center gap-1", className)}>
			{showThemeToggle && <ModeToggle />}

			{showHelp && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" className="h-9 w-9">
							<MessageCircleQuestion className="h-5 w-5" />
							<span className="sr-only">Help</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">Help & Support</TooltipContent>
				</Tooltip>
			)}

			{showSettings && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" className="h-9 w-9" asChild>
							<Link href="/app/settings">
								<Settings className="h-5 w-5" />
								<span className="sr-only">Settings</span>
							</Link>
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">Settings</TooltipContent>
				</Tooltip>
			)}

			{showNotifications && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" className="h-9 w-9">
							<Bell className="h-5 w-5" />
							<span className="sr-only">Notifications</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">Notifications</TooltipContent>
				</Tooltip>
			)}

			<UserProfileDropdown />
			{children}
		</div>
	);
}

function cn(...classes: (string | undefined)[]) {
	return classes.filter(Boolean).join(" ");
}
