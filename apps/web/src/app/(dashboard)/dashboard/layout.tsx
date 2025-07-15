"use client";

import type { ReactNode } from "react";

import { UserInfoProvider } from "@/components/providers/user-info-provider";

export default function AppLayout({ children }: { children: ReactNode }) {
	return <UserInfoProvider>{children}</UserInfoProvider>;
}
