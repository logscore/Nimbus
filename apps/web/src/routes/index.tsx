import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/home/hero";
import { Suspense } from "react";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
				</div>
			}
		>
			<Hero />
		</Suspense>
	);
}
