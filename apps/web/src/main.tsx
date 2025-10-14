import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import "./globals.css";

// Create a new router instance
const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
	context: undefined!,
	defaultPendingComponent: () => (
		<div className="flex h-screen w-full items-center justify-center">
			<div className="flex flex-col items-center gap-2">
				<div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
				<p className="text-muted-foreground text-sm">Loading...</p>
			</div>
		</div>
	),
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Render the app
const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element not found. Make sure there is a div with id='root' in your index.html");
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<RouterProvider router={router} />
		</StrictMode>
	);
}
