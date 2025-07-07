import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { useDriveInfo } from "@/hooks/useDriveOps";
import { Moon, Settings, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fileSize } from "@/utils/fileSize";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { toast } from "sonner";

export default function StorageFooter() {
	const { data, error, isError, isPending } = useDriveInfo();
	const { theme, setTheme } = useTheme();

	useEffect(() => {
		if (isError && error) {
			toast.error("Failed to load storage details.");
		}
	}, [isError, error]);

	const usagePercent: number =
		data && Number(data.limit) > 0 ? Math.floor((Number(data.usage) / Number(data.limit)) * 100) : 0;

	const toggleTheme = (): void => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<SidebarFooter className="flex flex-col items-start gap-2 self-stretch p-2 pb-0 transition-all duration-300 ease-linear dark:bg-neutral-800">
			<SidebarMenu>
				<SidebarMenuItem>
					<div className="flex flex-col items-start self-stretch rounded-lg border border-neutral-200 bg-neutral-200 dark:border-0 dark:border-transparent dark:bg-neutral-700">
						<div className="flex flex-col items-start gap-3 self-stretch rounded-lg bg-white p-3 shadow-sm dark:bg-black">
							<div className="flex items-center justify-between self-stretch">
								<p className="text-sm font-medium text-neutral-800 dark:text-neutral-300">Storage Used</p>
								{isPending ? (
									<div className="h-4 w-12 animate-pulse rounded bg-neutral-300 dark:bg-neutral-500"></div>
								) : (
									<p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{usagePercent}% Used</p>
								)}
							</div>
							<Progress value={usagePercent} />
						</div>
						<div className="flex h-8 items-center justify-between self-stretch px-3">
							{isPending ? (
								<div className="h-4 w-32 animate-pulse rounded bg-neutral-300 dark:bg-neutral-500"></div>
							) : (
								<p className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
									{isPending || isError ? "--" : fileSize(data.usage)} of{" "}
									{isPending || isError ? "--" : fileSize(data.limit)}
								</p>
							)}
							<Button variant="link" className="text-xs font-medium text-neutral-800 dark:text-neutral-300">
								Upgrade
							</Button>
						</div>
					</div>
				</SidebarMenuItem>
				<SidebarMenuButton
					onClick={() => toggleTheme()}
					className="transition-all duration-200 ease-linear hover:bg-neutral-200 dark:hover:bg-neutral-700"
				>
					{theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
					<span>Theme</span>
				</SidebarMenuButton>
				<SidebarMenuButton className="transition-all duration-200 ease-linear hover:bg-neutral-200 dark:hover:bg-neutral-700">
					<Settings />
					<span>Settings</span>
				</SidebarMenuButton>
			</SidebarMenu>
		</SidebarFooter>
	);
}
