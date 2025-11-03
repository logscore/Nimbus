import { ReactQueryProvider } from "@/components/providers/query-provider";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { geistSans, geistMono, manrope } from "@/utils/fonts";
import { Toaster } from "sonner";
import { Suspense } from "react";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				name: "Nimbus",
				content: "File storage made simple",
			},
			{
				title: "Nimbus - Better file storage",
			},
		],
		links: [
			{
				rel: "icon",
				href: "../public/favicon.ico",
			},
		],
	}),
	component: RootComponent,
	notFoundComponent: NotFound,
	errorComponent: RootErrorComponent,
});

function RootComponent() {
	return (
		<ReactQueryProvider>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
				<div
					className={`bg-background text-foreground relative min-h-screen ${geistSans.variable} ${geistMono.variable} ${manrope.variable}`}
				>
					<Suspense>
						<Outlet />
					</Suspense>
					<Toaster position="bottom-right" richColors theme="system" />
				</div>
			</ThemeProvider>
			<TanStackRouterDevtools />
			<ReactQueryDevtools />
		</ReactQueryProvider>
	);
}

function RootErrorComponent({ error }: { error: Error }) {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<div className="max-w-md text-center">
				<h1 className="text-2xl font-bold text-red-600">Oops! Something went wrong</h1>
				<p className="text-muted-foreground mt-4">{error.message}</p>
				<div className="mt-4 space-x-2">
					<button
						onClick={() => window.location.reload()}
						className="bg-primary text-primary-foreground rounded px-4 py-2"
					>
						Reload Page
					</button>
					<a href="/" className="text-primary underline">
						Go Home
					</a>
				</div>
			</div>
		</div>
	);
}

function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="text-6xl font-bold">404</h1>
				<p className="text-muted-foreground mt-4 text-xl">Page not found</p>
				<a href="/" className="text-primary mt-6 inline-block text-lg underline">
					Return Home
				</a>
			</div>
		</div>
	);
}
