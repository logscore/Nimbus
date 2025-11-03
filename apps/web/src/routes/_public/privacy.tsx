import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPageContent } from "./-privacy-content";

export const Route = createFileRoute("/_public/privacy")({
	component: PrivacyPage,
});

function PrivacyPage() {
	return <PrivacyPageContent />;
}
