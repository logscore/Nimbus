import type { ReactNode } from "react";
import "@/web/app/globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/main-sidebar/app-sidebar";

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar variant="inset" />
			<SidebarInset className="md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-0">
				<main className="flex-1 p-1">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
