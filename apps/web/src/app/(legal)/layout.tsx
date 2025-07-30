import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import type { ReactNode } from "react";

// this is a copy of Analogs legal layout component with some changes
// https://github.com/analogdotnow/Analog/blob/main/apps/web/src/app/(legal)/layout.tsx

export default function LegalLayout({ children }: { children: ReactNode }) {
	return (
		// <div className="bg-background min-h-screen">
		<div className="font-manrope flex w-full flex-1 flex-col items-center justify-center gap-12 overflow-hidden px-4 py-20 md:gap-12">
			<Header />
			{children}
			<Footer />
		</div>
	);
}
