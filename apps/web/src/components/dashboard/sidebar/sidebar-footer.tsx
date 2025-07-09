"use client";

import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { useDriveInfo } from "@/hooks/useDriveOps";
import { Moon, Settings, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@nimbus/shared";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import Link from "next/link";

export default function StorageFooter() {
	const [mounted, setMounted] = useState(false);
	const { data, error, isError, isPending } = useDriveInfo();
	const { theme, setTheme } = useTheme();
	const [usedSpace, setUsedSpace] = useState<number>(0);
	const [totalSpace, setTotalSpace] = useState<number>(0);
	const [usagePercent, setUsagePercent] = useState<number>(0);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (isError && error) {
			toast.error("Failed to load storage details.");
		}
	}, [isError, error]);

	useEffect(() => {
		if (data) {
			setUsedSpace(data.usedSpace);
			setTotalSpace(data.totalSpace);
			const percent =
				Number(data.totalSpace) > 0 ? Math.floor((Number(data.usedSpace) / Number(data.totalSpace)) * 100) : 0;
			setUsagePercent(percent);
		}
	}, [data]);

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
						<div className="flex min-h-[2rem] items-center justify-between self-stretch px-3 py-1">
							{isPending ? (
								<div className="h-4 w-32 animate-pulse rounded bg-neutral-300 dark:bg-neutral-500"></div>
							) : (
								<div className="flex flex-wrap items-center gap-1 text-sm font-medium text-neutral-500 dark:text-neutral-300">
									<span>{isPending || isError ? "--" : formatFileSize(usedSpace)}</span>
									<span>of</span>
									<span>{isPending || isError ? "--" : formatFileSize(totalSpace)}</span>
								</div>
							)}
							<Button
								variant="link"
								className="ml-2 px-2 text-xs font-medium text-neutral-800 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
							>
								Upgrade
							</Button>
						</div>
					</div>
				</SidebarMenuItem>
				<SidebarMenuButton
					onClick={() => toggleTheme()}
					className="transition-all duration-200 ease-linear hover:bg-neutral-200 dark:hover:bg-neutral-700"
				>
					{mounted && (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
					<span>Theme</span>
				</SidebarMenuButton>
				<SidebarMenuButton asChild>
					<Link href="/app/settings">
						<Settings className="size-4" />
						<span>Settings</span>
					</Link>
				</SidebarMenuButton>
			</SidebarMenu>
		</SidebarFooter>
	);
}
