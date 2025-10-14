import env from "@nimbus/env/client";

export const siteConfig = {
	name: "Nimbus",
	description: "A better cloud storage solution.",
	url: env.VITE_PUBLIC_FRONTEND_URL,
	twitterHandle: "@nimbusdotcloud",
} as const;
