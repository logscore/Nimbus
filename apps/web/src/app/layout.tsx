// TODO:(analytics): add posthog

import { DownloadProvider } from "@/components/providers/download-provider";
import { ReactQueryProvider } from "@/components/providers/query-provider";
import { SocialProvider } from "@/components/providers/social-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Geist, Geist_Mono } from "next/font/google";
import { siteConfig } from "@/utils/site-config";
import OGImage from "@/public/images/og.png";
import { manrope } from "@/utils/fonts";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@/app/globals.css";

export const metadata: Metadata = {
	keywords: ["nimbus", "cloud", "storage", "file", "sharing", "upload", "download", "sync", "backup"],
	title: {
		default: siteConfig.name,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,
	metadataBase: new URL(siteConfig.url as string),
	openGraph: {
		title: siteConfig.name,
		description: siteConfig.description,
		url: siteConfig.url,
		siteName: siteConfig.name,
		images: [
			{
				url: OGImage.src,
				width: OGImage.width,
				height: OGImage.height,
				alt: siteConfig.name,
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		title: siteConfig.name,
		description: siteConfig.description,
		site: siteConfig.twitterHandle,
		card: "summary_large_image",
		images: [
			{
				url: OGImage.src,
				width: OGImage.width,
				height: OGImage.height,
				alt: siteConfig.name,
			},
		],
	},
	robots: {
		index: true,
		follow: true,
		nocache: false,
		googleBot: {
			index: true,
			follow: true,
			noimageindex: false,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning className="bg-sidebar">
			<body className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} antialiased`}>
				<ReactQueryProvider>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
						<SocialProvider>
							<DownloadProvider>
								<div className="relative min-h-screen">
									<main className="flex flex-1 justify-center">{children}</main>
									<Toaster position="top-center" richColors theme="system" />
								</div>
							</DownloadProvider>
						</SocialProvider>
					</ThemeProvider>
				</ReactQueryProvider>
			</body>
		</html>
	);
}
