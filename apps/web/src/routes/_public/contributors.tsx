import Contributors from "@/components/contributors/contributors";
import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/home/header";

export const Route = createFileRoute("/_public/contributors")({
	component: ContributorsPage,
});

function ContributorsPage() {
	return (
		<div>
			<Header />
			<Contributors />
		</div>
	);
}
