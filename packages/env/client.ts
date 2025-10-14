import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const env = createEnv({
	runtimeEnv: {
		VITE_PUBLIC_BACKEND_URL: import.meta.env.VITE_PUBLIC_BACKEND_URL,
		VITE_PUBLIC_FRONTEND_URL: import.meta.env.VITE_PUBLIC_FRONTEND_URL,
		VITE_PUBLIC_POSTHOG_KEY: import.meta.env.VITE_PUBLIC_POSTHOG_KEY,
		VITE_PUBLIC_POSTHOG_HOST: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
	},

	clientPrefix: "VITE_PUBLIC_",
	client: {
		// Client-side environment variables
		VITE_PUBLIC_BACKEND_URL: z.url(),
		VITE_PUBLIC_FRONTEND_URL: z.url(),
		VITE_PUBLIC_POSTHOG_KEY: z.string().optional(),
		VITE_PUBLIC_POSTHOG_HOST: z.string().optional(),
	},
});

export default env;
