"use client";

import { useUserInfoProvider } from "@/components/providers/user-info-provider";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
	// TODO(bug): figure out hydration error useTheme()
	const { theme } = useTheme();
	const { error } = useUserInfoProvider();

	useEffect(() => {
		if (error) {
			toast.error(error.message);
		}
	}, [error]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				{!error ? (
					<>
						<div
							className={`mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 ${theme === "dark" ? "border-white" : "border-black"}`}
						></div>
						<h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
							Loading your dashboard...
						</h2>
						<p className={`mt-2 ${theme === "dark" ? "text-white" : "text-black"}`}>
							Please wait while we fetch your provider and account information.
						</p>
					</>
				) : (
					<>
						<h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
							Error loading your dashboard
						</h2>
						<p className={`mt-2 ${theme === "dark" ? "text-white" : "text-black"}`}>Please try again later.</p>
					</>
				)}
			</div>
		</div>
	);
}
