"use client";

import type { ReactNode } from "react";

import { DefaultAccountProvider } from "@/components/providers/default-account-provider";
import { UserInfoProvider } from "@/components/providers/user-info-provider";

export default function AppLayout({ children }: { children: ReactNode }) {
	return (
		<UserInfoProvider>
			<DefaultAccountProvider>{children}</DefaultAccountProvider>
		</UserInfoProvider>
	);
}
