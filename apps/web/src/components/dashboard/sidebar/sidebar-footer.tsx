"use client";

import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { useDriveInfo } from "@/hooks/useDriveOps";
import { Moon, Settings, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@nimbus/shared";
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function StorageFooter() {
	const { data, error, isError, isPending } = useDriveInfo();
	const { theme, toggleTheme, isMounted } = useTheme();
	const [usedSpace, setUsedSpace] = useState<number>(0);
	const [totalSpace, setTotalSpace] = useState<number>(0);
	const [usagePercent, setUsagePercent] = useState<number>(0);

	useEffect(() => {
		if (isError && error) {
			toast.error("Failed to load storage details.");
		}
	}, [isError, error]);

	useEffect(() => {
		if (data) {
			setUsedSpace(data.usedSpace);
			setTotalSpace(data.totalSpace);
			console.log("Used Space: ", usedSpace);
			console.log("Total Space: ", totalSpace);
			console.log(usedSpace / totalSpace);
			const percent = Number(totalSpace) > 0 ? Math.floor((Number(usedSpace) / Number(totalSpace)) * 100) : 0;
			console.log(percent);
			setUsagePercent(percent);
		}
	}, [data, totalSpace, usedSpace]);

	return (
		<SidebarFooter className="flex flex-col items-start gap-2 self-stretch p-2 pb-0 transition-all duration-300 ease-linear dark:bg-neutral-800">
			<SidebarMenu>
				<SidebarMenuItem>
					<div className="flex flex-col items-start self-stretch rounded-lg border border-neutral-200 bg-neutral-200 dark:border-0 dark:border-transparent dark:bg-neutral-700">
						<div className="flex flex-col items-start gap-3 self-stretch rounded-lg bg-white p-3 shadow-sm dark:bg-[#0C0A09]">
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
								<div className="flex flex-wrap items-center gap-1 text-sm font-medium text-neutral-500 dark:text-neutral-300">
									{fileSizeText(isError, usedSpace)}
									<span>of</span>
									{fileSizeText(isError, totalSpace)}
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
					{isMounted && (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
					<span>Theme</span>
				</SidebarMenuButton>
				<SidebarMenuButton
					asChild
					className="transition-all duration-200 ease-linear hover:bg-neutral-200 dark:hover:bg-neutral-700"
				>
					<Link href="/dashboard/settings">
						<Settings className="size-4" />
						<span>Settings</span>
					</Link>
				</SidebarMenuButton>
			</SidebarMenu>
		</SidebarFooter>
	);
}

function fileSizeText(isError: boolean, num: number | undefined) {
	return <span>{isError || !num ? "--" : formatFileSize(num)}</span>;
}
