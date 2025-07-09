import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HeaderActions } from "../header/components/header-actions";
import { HeaderSearch } from "../header/components/header-search";
import { HeaderTitle } from "../header/components/header-title";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
	title: string;
	description?: string;
	showBackButton?: boolean;
	showSearch?: boolean;
	showNotifications?: boolean;
	showHelp?: boolean;
	showSettings?: boolean;
	showThemeToggle?: boolean;
	className?: string;
	children?: ReactNode;
}

export function AppHeader({
	title,
	description,
	showBackButton = false,
	showSearch = false,
	showNotifications = true,
	showHelp = true,
	showSettings = true,
	showThemeToggle = true,
	className,
	children,
}: AppHeaderProps) {
	const router = useRouter();
	return (
		<header className={cn("bg-background flex h-16 items-center border-b px-4", className)}>
			<div className="flex items-center gap-2">
				<SidebarTrigger className="h-9 w-9" />
				{showBackButton && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.back()}>
								<ArrowLeft className="h-5 w-5" />
								<span className="sr-only">Back</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">Go back</TooltipContent>
					</Tooltip>
				)}
				<HeaderTitle title={title} description={description} />
			</div>

			<div className="flex flex-1 justify-center">
				{showSearch && <HeaderSearch placeholder="Search..." onSearch={query => console.log("Search:", query)} />}
			</div>

			<HeaderActions
				showNotifications={showNotifications}
				showHelp={showHelp}
				showSettings={showSettings}
				showThemeToggle={showThemeToggle}
			>
				{children}
			</HeaderActions>
		</header>
	);
}
