import env from "@nimbus/env/client";

export const siteConfig = {
	name: "Nimbus",
	description: "A better cloud storage solution.",
	url: import.meta.env.VITE_FRONTEND_URL,
	twitterHandle: "@nimbusdotcloud",
} as const;
