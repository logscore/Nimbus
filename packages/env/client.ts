import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const env = createEnv({
	runtimeEnv: {
		NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
		NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
		NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
		NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
		NEXT_PUBLIC_STRIPE_PRO_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
	},

	clientPrefix: "NEXT_PUBLIC_",
	client: {
		// Client-side environment variables
		NEXT_PUBLIC_BACKEND_URL: z.url(),
		NEXT_PUBLIC_FRONTEND_URL: z.url(),
		NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
		NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
		NEXT_PUBLIC_STRIPE_PRO_PRICE_ID: z.string(),
	},
});

export default env;
